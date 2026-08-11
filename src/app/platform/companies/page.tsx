import { createAdminClient } from "@/lib/supabase/admin"
import { PlatformCompaniesClient } from "./client"

export const dynamic = 'force-dynamic'

export default async function PlatformCompaniesPage() {
  const supabase = createAdminClient()

  // Fetch companies and their associated super admin (we'll join or just fetch companies for now)
  // To get the admin email, we would normally query auth.users, but we can't join that easily in SQL.
  // For the sake of this UI, we will just fetch the companies.
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching companies:", error)
  }

  // Map database rows to the expected frontend type
  const formattedData = await Promise.all((companies || []).map(async (c: any) => {
    let adminEmail = "Not Assigned"
    
    // Find the tenant admin profile for this company
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('company_id', c.id)
      .in('role', ['tenant_admin', 'super_admin'])
      .limit(1)
      .single()
      
    if (profile?.id) {
      // Fetch their actual email from Auth
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
      if (authUser?.user?.email) {
        adminEmail = authUser.user.email
      }
    }

    return {
      id: c.id,
      name: c.name,
      status: c.status,
      createdAt: new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      adminEmail
    }
  }))

  return (
    <PlatformCompaniesClient data={formattedData} />
  )
}
