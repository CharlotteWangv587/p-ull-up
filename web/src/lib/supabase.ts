import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL_RAW = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY_RAW = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL_RAW || !SUPABASE_ANON_KEY_RAW) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local"
  );
}

const SUPABASE_URL = SUPABASE_URL_RAW;
const SUPABASE_ANON_KEY = SUPABASE_ANON_KEY_RAW;

/**
 * Public (anon) client.
 * Use for endpoints that do not require a user session.
 */
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
});

/**
 * Authed client that forwards the user's access token.
 * This is the default for user-specific reads/writes so Supabase RLS policies apply.
 */
export function supabaseAuthed(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

/**
 * Service-role client that bypasses RLS entirely.
 * Use ONLY in server-side API routes after you have already verified
 * the caller's identity and confirmed they are authorised to perform
 * the operation (e.g. event creator / admin deleting a comment).
 * Requires SUPABASE_SERVICE_ROLE_KEY in the server environment.
 */
export function supabaseService() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in environment. " +
        "Add it to web/.env.local (never expose to the browser)."
    );
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}