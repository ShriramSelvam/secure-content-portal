import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  // Google OAuth only - no credentials/username-password provider.
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // JWT session strategy. NextAuth stores this in an HttpOnly, SameSite=Lax cookie
  // (and marks it Secure automatically once NEXTAUTH_URL is https, e.g. on Vercel).
  // The token itself never touches localStorage or client JS.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // Runs on every sign-in. Creates the user record on first login, defaulting to VIEWER
    // unless their email is on the ADMIN_EMAILS allow-list (seeded via env var, not a UI).
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            email,
            name: user.name,
            image: user.image,
            role: ADMIN_EMAILS.includes(email) ? "ADMIN" : "VIEWER",
          },
        });
      }
      return true;
    },
    // Attach the DB role + id onto the JWT so middleware/API routes can check it
    // without a DB round trip on every request... we still re-check the DB here so
    // a role change (e.g. promoting a user via ADMIN_EMAILS or directly in the DB)
    // takes effect the next time the token refreshes rather than being stuck forever.
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email.toLowerCase() } });
        if (dbUser) {
          token.role = dbUser.role;
          token.uid = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.uid;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
