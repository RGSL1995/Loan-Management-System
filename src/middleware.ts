import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /test-fineract (test page - no auth needed)
     * - /simple-test (simple test page - no auth needed)
     * - /api/fineract (Fineract proxy - handled separately)
     * - /api/documents (Document parsing API - open to all authenticated users)
     * - /api/surepass (Surepass company search - authenticated users only)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|test-fineract|simple-test|api/fineract|api/documents|api/surepass|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
