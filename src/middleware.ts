import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

    if (isAdminRoute && token?.role !== "ADMIN") {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/signin" },
    callbacks: {
      // Just requiring a token here; the function above does the finer-grained role check.
      // This alone stops an unauthenticated request from ever reaching a route handler.
      authorized: ({ token }) => !!token,
    },
  }
);

// Everything a Viewer or Admin can reach requires a session; everything under /admin
// additionally requires the ADMIN role, enforced above (server-side, not just hidden UI).
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*", "/content/:path*", "/api/content/:path*"],
};
