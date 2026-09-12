import { createClient } from "@supabase/supabase-js";

// Anon key is safe to ship to the browser - the storage bucket is private, and this
// client is only ever used to redeem a short-lived signed upload URL minted server-side
// by an admin-only API route. It cannot read or list anything on its own.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
