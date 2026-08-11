"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FinbyxRole } from "@/lib/supabase/rbac";

interface RoleGateProps {
  children: React.ReactNode;
  /** Array of roles that are allowed to see the gated content */
  allowedRoles: FinbyxRole[];
  /** Fallback UI shown when the user's role is not in the allowed list */
  fallback?: React.ReactNode;
}

/**
 * Client-side role gate component.
 * Conditionally renders children based on the current user's role.
 *
 * NOTE: This is a UI-level gate only. Server Actions MUST also call
 * requireRole() from '@/lib/supabase/rbac' for true security.
 */
export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsAllowed(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', user.id)
          .single();

        const userRole = (profile?.role || 'loan_officer') as FinbyxRole;
        const isActive = profile?.is_active !== false;

        // Deactivated users cannot see any gated content
        if (!isActive) {
          setIsAllowed(false);
          return;
        }

        // Super Admins and Tenant Admins bypass all role gates
        if (userRole === 'super_admin' || userRole === 'tenant_admin') {
          setIsAllowed(true);
          return;
        }

        setIsAllowed(allowedRoles.includes(userRole));
      } catch (err) {
        console.error('Error checking role:', err);
        setIsAllowed(false);
      }
    }

    checkRole();
  }, [allowedRoles]);

  // Return null during loading to prevent layout shift
  if (isAllowed === null) {
    return null; 
  }

  return isAllowed ? <>{children}</> : <>{fallback}</>;
}

