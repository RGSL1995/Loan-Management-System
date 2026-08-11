import { createClient } from '@supabase/supabase-js'

// Note: This client uses the Service Role key and bypasses Row Level Security (RLS).
// NEVER expose this client to the browser. It should only be used in secure Server Actions or API routes.
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
