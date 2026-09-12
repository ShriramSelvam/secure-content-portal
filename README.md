# Secure Content Portal

A small internal portal for sharing training videos, PDFs, and HTML pages. Admins upload and manage
content; everyone else can browse and view it inline, without a working path to download the original file.

Built with Next.js (App Router), NextAuth.js (Google OAuth), Prisma + Postgres, and Supabase Storage.

## 1. How it works, in short

- **Sign in** is Google OAuth only. On first login a user is created as `VIEWER`. If their email is in the
  `ADMIN_EMAILS` env var, they're created as `ADMIN` instead. There's no invite UI - promoting someone later
  means editing their `role` in the database directly (this is deliberate - see Section 11 of the brief).
- **Sessions** are JWTs in an HttpOnly cookie, managed by NextAuth. Nothing touches `localStorage`.
- **Access control is enforced in `src/middleware.ts`**, server-side, on every request - not just by hiding
  buttons in the UI. `/admin` and `/api/admin/*` return a 403/redirect for anyone whose token role isn't
  `ADMIN`, even if they guess the URL directly. Every admin API route also re-checks the session itself, so
  it's not relying on the middleware alone.
- **Files never sit at a public, guessable path.** They're stored in a *private* Supabase Storage bucket.
  Viewing a video/PDF/HTML page requests a signed URL, minted server-side, that expires in 5 minutes.
- **Admin uploads go straight from the browser to Supabase Storage** using a signed *upload* URL, not through
  a Next.js API route. See Section 4 for why.

## 2. Local setup

**Prerequisites:** Node 18+, a free [Supabase](https://supabase.com) account, and a
[Google Cloud](https://console.cloud.google.com) account for OAuth credentials.

```bash
npm install
cp .env.example .env   # then fill it in - see Section 3 below
npm run db:push        # creates the User/Content tables from prisma/schema.prisma
npm run dev
```

Visit `http://localhost:3000` and sign in with Google. If your email is in `ADMIN_EMAILS`, you'll land as
an Admin; otherwise you're a Viewer.

## 3. Environment variables

All of these are listed in `.env.example` with inline comments. None are committed to the repo.

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → **Transaction pooler** connection string (port 6543) |
| `DIRECT_URL` | Same page → **Direct connection** string (port 5432). Only used by `prisma db push`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web application) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` locally; your production URL once deployed |
| `ADMIN_EMAILS` | Comma-separated list of emails to auto-promote to Admin on first login |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page - **server-only, never expose this** |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | Name of the Storage bucket you create (see below), e.g. `content` |

**In Supabase**, also create a Storage bucket (Storage → New bucket) named to match
`NEXT_PUBLIC_SUPABASE_BUCKET`, and leave it set to **Private**. Nothing else needs configuring on the bucket -
all access goes through signed URLs minted by the server.

**In Google Cloud**, when creating the OAuth client, add these Authorized redirect URIs:
- `http://localhost:3000/api/auth/callback/google` (local dev)
- `https://YOUR-VERCEL-DOMAIN/api/auth/callback/google` (add this once you know your Vercel URL - you can
  edit the OAuth client and add it after your first deploy)

## 4. Deploying (GitHub + Vercel, free tier)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Then, on [vercel.com](https://vercel.com):
1. **Add New Project** → import that GitHub repo.
2. In **Environment Variables**, paste in everything from your `.env` (all of Section 3 above), with
   `NEXTAUTH_URL` set to `https://<your-project-name>.vercel.app`.
3. Deploy.
4. Go back to Google Cloud Console and add the production redirect URI (see Section 3), or Google sign-in
   will fail in production with a `redirect_uri_mismatch` error.
5. Open the live URL and sign in.

Supabase's free tier can pause a project after a week of inactivity, and Vercel Hobby functions cold-start
after idling - the first request after a while may be slow. That's expected.

## 5. Architecture

```
Browser
  │
  ├─ Sign-in ──────────► NextAuth (Google OAuth) ──► Postgres (User table: role)
  │
  ├─ Browse/view pages ─► Next.js Server Components ──► Prisma ──► Postgres (Content metadata)
  │
  ├─ Admin upload ──────► POST /api/admin/content/upload-url  (validates type/size, mints a
  │                        Supabase signed *upload* URL)
  │        │
  │        └─ PUT file bytes directly to Supabase Storage using that signed URL
  │        │
  │        └─ POST /api/admin/content  (writes the metadata row - never touches file bytes)
  │
  └─ View video/PDF/HTML ► GET /api/content/[id]/signed-url (auth-checked) ──► Supabase Storage
                            returns a 5-minute signed *view* URL, used as the <video>/<Document>/<iframe> src
```

`src/middleware.ts` sits in front of everything under `/admin`, `/api/admin`, `/dashboard`, and
`/content`, checking the session and role before a request reaches any page or route handler.

## 6. Content protection: what's real, what's a deterrent

The brief specifically asks for this distinction, so to be explicit:

**Real security boundaries:**
- The storage bucket is private; there is no public URL for any file, ever.
- Every view goes through a fresh signed URL that expires in 5 minutes and requires an authenticated
  session to obtain. A link copied out of dev tools stops working shortly after.
- Role checks happen server-side (middleware + each API route), so a Viewer cannot reach admin
  endpoints by guessing URLs or editing client-side state.
- The uploaded-HTML iframe uses `sandbox="allow-scripts"` only - no `allow-same-origin`, so it can't read
  the parent app's cookies or storage, and no `allow-downloads` / `allow-top-navigation`.

**Deterrents, not real boundaries** (a technical user can still get around these):
- `controlsList="nodownload"` on the `<video>` tag and disabling right-click. Browser dev tools can still
  find the signed URL in the Network tab while it's valid.
- Rendering PDF pages as flat canvas images (no text/annotation layer) discourages copy-paste, but the
  underlying PDF bytes are still fetchable via the signed URL for the few minutes it's valid.
- None of this is DRM. Anyone with the signed URL during its ~5-minute window can fetch the raw file once.

**What I'd add with more time:** watermarking each view with the viewer's email (bonus item in the brief),
much shorter-lived tokens tied to a specific session/IP, HLS-based video with per-segment tokens instead of
a single signed MP4 URL, and an audit log of who viewed what and when.

## 7. Other trade-offs and assumptions

- **Large uploads bypass Vercel's serverless functions entirely.** Vercel's Hobby plan caps a serverless
  function's request body around 4.5MB, which a 100MB+ video would blow straight through. So the admin's
  browser uploads directly to Supabase Storage with a signed upload URL, and the Next.js API only ever
  handles small JSON payloads (metadata, tokens). This adds one extra network hop but is the standard
  pattern for this constraint rather than a workaround to avoid.
- **File size limits** (200MB video / 25MB PDF / 2MB HTML) are set in `src/lib/validation.ts`, checked on
  both the client (fast feedback) and every server route (the real enforcement) - a limit only checked in
  the browser isn't a limit.
- **Admin promotion is manual/seeded**, per the brief: set `ADMIN_EMAILS` before someone's first sign-in, or
  edit their `role` column directly in Supabase's Table Editor afterwards. There's no invite UI.
- **Not built:** usage/view tracking, search/filter, watermarking, an audit log, and automated tests. All are
  listed as optional bonus items in the brief; I prioritized the required core (auth, RBAC, CRUD, and
  genuine content protection) over the stretch goals.
- `npm audit` flags some advisories inherited from the Next.js 14.x dependency tree (fixed in Next 15+).
  Upgrading major versions was out of scope for this pass; worth revisiting given more time.

## 8. Tech stack

Next.js 14 (App Router, TypeScript) · NextAuth.js v4 (Google provider) · Prisma + Postgres (via Supabase) ·
Supabase Storage (signed URLs) · Tailwind CSS · react-pdf (PDF.js) for inline PDF rendering.
