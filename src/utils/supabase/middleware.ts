import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection logic
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  const isHomeRoute = request.nextUrl.pathname === '/';

  if (!user && (isDashboardRoute || isHomeRoute)) {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user) {
    // If we have a user, check their role in the database to redirect properly
    // We fetch the profile to determine the role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'user';

    // Redirect authenticated users away from login page
    if (isAuthRoute || isHomeRoute) {
      const url = request.nextUrl.clone();
      url.pathname = role === 'superadmin' ? '/dashboard/admin' : '/dashboard/user';
      return NextResponse.redirect(url);
    }

    // Protect admin dashboard from regular users
    if (request.nextUrl.pathname.startsWith('/dashboard/admin') && role !== 'superadmin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/user';
      return NextResponse.redirect(url);
    }

    // Protect user dashboard from admins (optional, but good for separation)
    if (request.nextUrl.pathname.startsWith('/dashboard/user') && role === 'superadmin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/admin';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
