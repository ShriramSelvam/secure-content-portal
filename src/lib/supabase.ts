import { createClient } from "@supabase/supabase-js";

// Service-role client - only ever imported from server-side code (API routes).
// The service role key must never be sent to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Bucket name isn't a secret (it's just an identifier), so it's fine to expose it as a
// NEXT_PUBLIC_ var too - the browser needs the same name to redeem a signed upload URL.
export const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "content";

// How long a signed URL for viewing content stays valid. Short-lived on purpose -
// see the README "Content protection" section for the reasoning.
export const VIEW_URL_TTL_SECONDS = 5 * 60;

// How long an admin has to finish uploading a file after requesting a signed upload URL.
export const UPLOAD_URL_TTL_SECONDS = 10 * 60;
