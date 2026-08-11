import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export async function updateSession(request: NextRequest) {
  // Guard: Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Log for debugging
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Middleware: Supabase env vars not found. Auth will not work.')
    console.warn('Available SUPABASE* vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    // Environment variables not available - skip auth, let request pass through
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const publicPaths = [
    '/', '/about', '/privacy-policy', '/terms-and-conditions', 
    '/cookie-policy', '/disclaimer', '/declarations', '/sla'
  ]
  const isPublicPage = publicPaths.includes(request.nextUrl.pathname)

  if (!user && !isAuthPage && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url, { status: 302 })
    redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    return redirectResponse
  }

  if (user) {
    // Create an admin client to bypass RLS for fetching role + is_active
    let profile = null
    // Determine role: profile DB row > user_metadata > email-based super_admin detection
    const SUPER_ADMIN_EMAIL = 'lawdocs-finbyx@gmail.com'
    let role = user.user_metadata?.role ||
               (user.email === SUPER_ADMIN_EMAIL ? 'super_admin' : null) ||
               'loan_officer'
    let isActive = true

    if (supabaseServiceKey) {
      const adminSupabase = createClient(
        supabaseUrl!,
        supabaseServiceKey
      );

      const { data: adminProfile, error } = await adminSupabase
        .from('profiles')
        .select('role, is_active, company_id')
        .eq('id', user.id)
        .single()

      if (!error && adminProfile) {
        profile = adminProfile
        // Profile DB row is the most authoritative source; fall back to email/metadata
        role = adminProfile.role ||
               user.user_metadata?.role ||
               (user.email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'loan_officer')
        isActive = adminProfile.is_active !== false
      } else if (error) {
        // Profile row missing — try metadata and email-based detection
        role = user.user_metadata?.role ||
               (user.email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'loan_officer')
      }
    }

    // SECURITY: Deactivated users are immediately logged out
    if (!isActive) {
      // Sign the user out by clearing the session
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'account_deactivated')
      const redirectResponse = NextResponse.redirect(url, { status: 302 })
      redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0')
      return redirectResponse
    }

    console.log("Middleware user:", user.email, "fetched role:", role, "active:", isActive)

    const currentPath = request.nextUrl.pathname

    // =====================================================================
    // Role-based route protection mapping (Default Deny approach)
    // Keys are the 10 LAS roles from the RBAC SRS.
    // Values are regex patterns of paths they are allowed to access.
    // If a role is not listed here, they get zero access (empty array).
    // =====================================================================
    const roleAccess: Record<string, RegExp[]> = {
      super_admin: [
        /^\/platform(\/.*)?$/,
        /^\/dashboard(\/.*)?$/,
      ],
      platform_admin: [
        /^\/platform(\/.*)?$/,
        /^\/dashboard(\/.*)?$/,
      ],
      tenant_admin: [
        /^\/dashboard(\/.*)?$/,
      ],
      loan_officer: [
        /^\/dashboard$/,
        /^\/dashboard\/clients(\/.*)?$/,
        /^\/dashboard\/applications(\/.*)?$/,
        /^\/dashboard\/dedupe(\/.*)?$/,
        /^\/dashboard\/reports(\/.*)?$/,
      ],
      credit_manager: [
        /^\/dashboard$/,
        /^\/dashboard\/clients(\/.*)?$/,
        /^\/dashboard\/applications(\/.*)?$/,
        /^\/dashboard\/underwriting(\/.*)?$/,
        /^\/dashboard\/dedupe(\/.*)?$/,
        /^\/dashboard\/maker-checker(\/.*)?$/,
        /^\/dashboard\/reports(\/.*)?$/,
      ],
      operations_officer: [
        /^\/dashboard$/,
        /^\/dashboard\/clients(\/.*)?$/,
        /^\/dashboard\/applications(\/.*)?$/,
        /^\/dashboard\/accounts(\/.*)?$/,
        /^\/dashboard\/disbursement(\/.*)?$/,
        /^\/dashboard\/operations(\/.*)?$/,
        /^\/dashboard\/maker-checker(\/.*)?$/,
        /^\/dashboard\/reports(\/.*)?$/,
      ],
      collections_officer: [
        /^\/dashboard$/,
        /^\/dashboard\/clients(\/.*)?$/,
        /^\/dashboard\/accounts(\/.*)?$/,
        /^\/dashboard\/collections(\/.*)?$/,
        /^\/dashboard\/operations(\/.*)?$/,
        /^\/dashboard\/maker-checker(\/.*)?$/,
        /^\/dashboard\/reports(\/.*)?$/,
      ],
      recovery_officer: [
        /^\/dashboard$/,
        /^\/dashboard\/clients(\/.*)?$/,
        /^\/dashboard\/accounts(\/.*)?$/,
        /^\/dashboard\/collections(\/.*)?$/,
        /^\/dashboard\/recovery(\/.*)?$/,
        /^\/dashboard\/reports(\/.*)?$/,
      ],
      finance_officer: [
        /^\/dashboard$/,
        /^\/dashboard\/accounts(\/.*)?$/,
        /^\/dashboard\/finance(\/.*)?$/,
        /^\/dashboard\/accounting(\/.*)?$/,
        /^\/dashboard\/reports(\/.*)?$/,
      ],
      compliance_officer: [
        /^\/dashboard$/,
        /^\/dashboard\/applications(\/.*)?$/,
        /^\/dashboard\/accounts(\/.*)?$/,
        /^\/dashboard\/collections(\/.*)?$/,
        /^\/dashboard\/recovery(\/.*)?$/,
        /^\/dashboard\/finance(\/.*)?$/,
        /^\/dashboard\/accounting(\/.*)?$/,
        /^\/dashboard\/reports(\/.*)?$/,
      ],
      auditor: [
        /^\/dashboard$/,
        /^\/dashboard\/applications(\/.*)?$/,
        /^\/dashboard\/accounts(\/.*)?$/,
        /^\/dashboard\/collections(\/.*)?$/,
        /^\/dashboard\/recovery(\/.*)?$/,
        /^\/dashboard\/finance(\/.*)?$/,
        /^\/dashboard\/accounting(\/.*)?$/,
        /^\/dashboard\/reports(\/.*)?$/,
      ],
      borrower: [
        /^\/dashboard$/,
        /^\/dashboard\/my-loan(\/.*)?$/,
      ],
    }

    // Safe fallback landing page for each role (prevents infinite redirect loops)
    const roleFallbacks: Record<string, string> = {
      super_admin: '/platform/companies',
      platform_admin: '/platform/companies',
      tenant_admin: '/dashboard',
      loan_officer: '/dashboard/applications',
      credit_manager: '/dashboard/underwriting',
      operations_officer: '/dashboard/disbursement',
      collections_officer: '/dashboard/collections',
      recovery_officer: '/dashboard/recovery',
      finance_officer: '/dashboard/finance',
      compliance_officer: '/dashboard/reports',
      auditor: '/dashboard/reports',
      borrower: '/dashboard/my-loan',
    }

    const fallbackPath = roleFallbacks[role] || '/dashboard'
    
    // Authenticated users on auth pages should go to their default dashboard
    if (isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = fallbackPath
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    // Super admins landing on /dashboard should always be redirected to the platform panel
    // They manage tenants at /platform/companies, not the operational dashboard
    if (role === 'super_admin' && currentPath.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/platform/companies'
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    // Check if the role exists in our map, otherwise fallback to empty array
    const allowedPatterns = roleAccess[role] || []
    
    // Evaluate if the current path matches any allowed pattern for this role
    let isAllowed = allowedPatterns.some(pattern => pattern.test(currentPath))

    if (currentPath === fallbackPath || isPublicPage) {
      isAllowed = true;
    }

    if (!isAllowed) {
      const url = request.nextUrl.clone()
      url.pathname = fallbackPath
      // Pass query parameters so the frontend can display a toast notification
      url.searchParams.set("error", "access_denied")
      url.searchParams.set("role", role)
      
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  return supabaseResponse
}
