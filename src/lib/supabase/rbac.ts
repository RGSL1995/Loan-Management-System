import { createClient } from "./server";

/**
 * Valid roles in the Finbyx LAS 10-role RBAC system.
 * Must stay in sync with the CHECK constraint in supabase_las_rbac_upgrade.sql.
 */
export const VALID_ROLES = [
  'super_admin',
  'platform_admin',
  'tenant_admin',
  'loan_officer',
  'credit_manager',
  'operations_officer',
  'collections_officer',
  'recovery_officer',
  'finance_officer',
  'compliance_officer',
  'auditor',
  'borrower',
] as const;

export type FinbyxRole = (typeof VALID_ROLES)[number];

/**
 * User context returned after successful authorization.
 * Contains everything downstream Server Actions need to scope their queries.
 */
export interface UserContext {
  userId: string;
  role: FinbyxRole;
  companyId: string | null;
  email: string;
}

/**
 * Ensures the currently authenticated user has one of the required roles.
 * Must be called inside a Server Action or API Route.
 *
 * @param allowedRoles - An array of role strings that are permitted to perform the action.
 * @returns The authenticated user's context (userId, role, companyId, email).
 * @throws Error if the user is not authenticated, deactivated, or lacks a required role.
 *
 * @example
 * ```typescript
 * // Only Credit Managers can approve loans
 * const user = await requireRole(['credit_manager']);
 * // user.companyId is available for tenant-scoped queries
 * ```
 */
export async function requireRole(allowedRoles: FinbyxRole[]): Promise<UserContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Guard: user must be authenticated
  if (!user) {
    throw new Error("Unauthorized: User not authenticated.");
  }

  // Fetch the user's profile (role, company_id, is_active)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id, is_active, email')
    .eq('id', user.id)
    .single();

  // Resolve role: profiles table > user_metadata > email-based super_admin detection
  const SUPER_ADMIN_EMAIL = 'lawdocs-finbyx@gmail.com'
  const userRole = (profile?.role ||
    user.user_metadata?.role ||
    (user.email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'loan_officer')) as FinbyxRole;
  const companyId = profile?.company_id || user.user_metadata?.company_id || null;
  const isActive = profile?.is_active !== false;

  // Guard: deactivated users cannot perform any action
  if (!isActive) {
    throw new Error("Forbidden: Your account has been deactivated. Please contact your administrator.");
  }

  // Super Admins and Tenant Admins bypass standard role checks
  // (they have full access within their scope)
  if (userRole === 'super_admin' || userRole === 'tenant_admin') {
    return {
      userId: user.id,
      role: userRole,
      companyId,
      email: profile?.email || user.email || '',
    };
  }

  // Check if the user's role is in the allowed list
  if (!allowedRoles.includes(userRole)) {
    throw new Error(
      `Forbidden: Your role (${userRole}) does not have permission for this action. Required: ${allowedRoles.join(', ')}`
    );
  }

  return {
    userId: user.id,
    role: userRole,
    companyId,
    email: profile?.email || user.email || '',
  };
}

/**
 * Lightweight helper — fetches the current user's profile without enforcing any role.
 * Useful for reading the user's role/company in layouts and UI rendering.
 *
 * @returns The user's context or null if not authenticated.
 */
export async function getCurrentUser(): Promise<UserContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id, is_active, email')
    .eq('id', user.id)
    .single();

  // Resolve role: profiles table > user_metadata > email-based super_admin detection
  const SUPER_ADMIN_EMAIL = 'lawdocs-finbyx@gmail.com'
  const userRole = (profile?.role ||
    user.user_metadata?.role ||
    (user.email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'loan_officer')) as FinbyxRole;
  const companyId = profile?.company_id || user.user_metadata?.company_id || null;

  return {
    userId: user.id,
    role: userRole,
    companyId,
    email: profile?.email || user.email || '',
  };
}

