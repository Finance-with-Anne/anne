import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS, used only in server-side API routes.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
