"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react"
import { logout } from "@/app/actions/auth"
import Link from "next/link"

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Platform Super Admin",
  platform_admin: "Platform Admin",
  tenant_admin: "Tenant Admin",
  loan_officer: "Loan Officer",
  credit_manager: "Credit Manager",
  operations_officer: "Operations Officer",
  collections_officer: "Collections Officer",
  recovery_officer: "Recovery Officer",
  finance_officer: "Finance Officer",
  compliance_officer: "Compliance Officer",
  auditor: "Auditor",
  borrower: "Borrower",
}

// One-line summaries sourced from the "Who Can Access" role hierarchy doc.
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Full access to all companies, LAS configurations, and system-wide reporting.",
  platform_admin: "Manages global platform settings, monitors the system, and onboards new companies.",
  tenant_admin: "Full access to configure LAS products, business rules, approval hierarchy, and the team.",
  loan_officer: "Creates loan applications, captures client KYC, and submits them for approval. Cannot approve loans.",
  credit_manager: "Reviews applications, pulls credit bureau reports, validates collateral, and approves loans within limit.",
  operations_officer: "Disburses approved loans, registers security pledges, and sets up repayment schedules & NACH mandates.",
  collections_officer: "Tracks payments, follows up on overdue accounts, and logs collection activities.",
  recovery_officer: "Manages defaults, liquidates pledged securities, and executes settlements on written-off loans.",
  finance_officer: "Posts GL entries, records transactions, and prepares financial & RBI compliance reports.",
  compliance_officer: "Audits all decisions, monitors compliance, and handles RBI & credit bureau regulatory reporting.",
  auditor: "Read-only access to view all transactions, export records, and the audit trail. No editing rights.",
  borrower: "Self-service access to view their own loan details, statements, and repayment progress.",
}

export function ProfileDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<{ role?: string; email?: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
          // Resolve role: profiles table > user_metadata > email-based super_admin detection
          const SUPER_ADMIN_EMAIL = 'lawdocs-finbyx@gmail.com'
          const rawRole = data?.role ||
            user.user_metadata?.role ||
            (user.email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'loan_officer')
          setProfile({ role: rawRole, email: user.email })
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }
    fetchProfile()
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Derive initials from email
  const initials = profile?.email?.substring(0, 2).toUpperCase() ?? "U"
  const roleLabel = profile?.role ? (ROLE_LABELS[profile.role] || profile.role.replace(/_/g, " ")) : "User"
  const roleDescription = profile?.role ? ROLE_DESCRIPTIONS[profile.role] : undefined
  const canReachSettings = profile?.role !== "borrower"

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar trigger button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-700 to-brand-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
          {initials}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl bg-white border border-gray-200 shadow-xl shadow-gray-200/60 z-[60] overflow-hidden">

          {/* User info header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-700 to-brand-900 text-white flex items-center justify-center text-base font-bold shadow-sm flex-shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{profile?.email ?? "Loading…"}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-brand-700/10 text-brand-700 text-[11px] font-bold capitalize">
                  {roleLabel}
                </span>
              </div>
            </div>
            {roleDescription && (
              <p className="text-xs text-gray-500 leading-snug mt-3">{roleDescription}</p>
            )}
          </div>

          {/* Navigation links */}
          <div className="p-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-gray-400" />
              Dashboard
            </Link>

            {canReachSettings && (
              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="p-1 border-t border-gray-100">
            <form action={async () => { setIsOpen(false); await logout(); }}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
