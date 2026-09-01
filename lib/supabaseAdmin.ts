import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key, which bypasses RLS. Never import this
// from a "use client" component — it must only run in Route Handlers / server code.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
