"use client"

import { ReactNode, Suspense, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LayoutDashboard, Users, FileText, CreditCard, Layers, BookOpen, BarChart, Settings, Bell, LogOut, Search, ShieldCheck, ShieldAlert, ArrowLeft, DollarSign } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AppSwitcher } from "@/components/AppSwitcher"
import { ProfileDrawer } from "@/components/ProfileDrawer"
import { useAppStore } from "@/lib/store"

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const ctx = searchParams.get('ctx')
  const addToast = useAppStore((state) => state.addToast)

  // Handle unauthorized access redirects from middleware
  useEffect(() => {
    if (searchParams.get("error") === "access_denied") {
      const role = searchParams.get("role") || "your role"
      
      // Clean up the URL query params without reloading the page
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.delete("error")
      currentUrl.searchParams.delete("role")
      window.history.replaceState({}, "", currentUrl.toString())

      addToast({
        title: "Access Restricted",
        description: `Users with the ${role.replace("_", " ")} role cannot access this module.`,
        type: "error"
      })
    }
  }, [searchParams, addToast])
  
  // Determine App Context
  const isLosContext = pathname.startsWith("/dashboard/applications") || pathname.startsWith("/dashboard/dedupe") || ((pathname.startsWith("/dashboard/clients") || pathname.startsWith("/dashboard/reports")) && ctx === "los")
  const isLmsContext = pathname.startsWith("/dashboard/accounts") || pathname.startsWith("/dashboard/collections") || pathname.startsWith("/dashboard/disbursement") || pathname.startsWith("/dashboard/recovery") || pathname.startsWith("/dashboard/underwriting") || ((pathname.startsWith("/dashboard/clients") || pathname.startsWith("/dashboard/maker-checker") || pathname.startsWith("/dashboard/operations") || pathname.startsWith("/dashboard/reports")) && ctx === "lms")
  const isAdminContext = pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/admin")
  const isAccountingContext = pathname.startsWith("/dashboard/accounting") || pathname.startsWith("/dashboard/finance") || (pathname.startsWith("/dashboard/reports") && ctx === "acc")
  const isBorrowerContext = pathname.startsWith("/dashboard/my-loan")

  // The sidebar is pinned on every dashboard page — the only screen without
  // one is the literal Overview / App Switcher root at exactly "/dashboard".
  const isOverviewRoot = pathname === "/dashboard"

  let currentContextName = "Overview"
  if (isLosContext) currentContextName = "Loan Origination"
  else if (isLmsContext) currentContextName = "Loan Management"
  else if (isAdminContext) currentContextName = "Administration"
  else if (isAccountingContext) currentContextName = "Accounting"
  else if (isBorrowerContext) currentContextName = "My Loan"
  else if (pathname.startsWith("/dashboard/reports")) currentContextName = "Analytics & Reports"

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="h-12 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Link href="/" className="hover:opacity-80 transition-opacity">RGSL</Link>
            <div className="h-4 w-px bg-gray-300 dark:bg-slate-700"></div>
            <AppSwitcher currentContext={currentContextName} />
          </div>
          <div className="relative w-full max-w-[200px] md:w-64 ml-4 hidden sm:block">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full h-8 pl-9 pr-3 text-xs text-gray-900 dark:text-slate-100 bg-gray-100 dark:bg-slate-800 border-none rounded-md focus:ring-1 focus:ring-black dark:focus:ring-slate-500 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button className="text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <ProfileDrawer />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (w-20) */}
        {!isOverviewRoot && (
          <aside className="w-16 md:w-20 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col items-center py-4 gap-4 shrink-0 z-10 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_8px_-4px_rgba(0,0,0,0.5)] overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Dynamic Sidebar Rendering based on Context */}
          {isLosContext ? (
            <>
              <NavItem href="/dashboard/clients?ctx=los" icon={<Users className="h-5 w-5" />} label="Clients" pathname={pathname} />
              <NavItem href="/dashboard/applications" icon={<FileText className="h-5 w-5" />} label="Apps" pathname={pathname} />
              <NavItem href="/dashboard/dedupe" icon={<Layers className="h-5 w-5" />} label="Duplicates" pathname={pathname} />
              <NavItem href="/dashboard/reports?ctx=los" icon={<BarChart className="h-5 w-5" />} label="Reports" pathname={pathname} />
            </>
          ) : isLmsContext ? (
            <>
              <NavItem href="/dashboard/clients?ctx=lms" icon={<Users className="h-5 w-5" />} label="Clients" pathname={pathname} />
              <NavItem href="/dashboard/accounts" icon={<CreditCard className="h-5 w-5" />} label="Accounts" pathname={pathname} />
              <NavItem href="/dashboard/underwriting" icon={<ShieldCheck className="h-5 w-5" />} label="Review" pathname={pathname} />
              <NavItem href="/dashboard/maker-checker?ctx=lms" icon={<ShieldCheck className="h-5 w-5" />} label="Approvals" pathname={pathname} />
              <NavItem href="/dashboard/disbursement" icon={<DollarSign className="h-5 w-5" />} label="Disburse" pathname={pathname} />
              <NavItem href="/dashboard/collections" icon={<Layers className="h-5 w-5" />} label="Collections" pathname={pathname} />
              <NavItem href="/dashboard/recovery" icon={<ShieldAlert className="h-5 w-5" />} label="Recovery" pathname={pathname} />
              <NavItem href="/dashboard/operations?ctx=lms" icon={<Layers className="h-5 w-5" />} label="Operations" pathname={pathname} />
              <NavItem href="/dashboard/reports?ctx=lms" icon={<BarChart className="h-5 w-5" />} label="Reports" pathname={pathname} />
            </>
          ) : isAdminContext ? (
            <>
              <NavItem href="/dashboard/admin/las" icon={<BookOpen className="h-5 w-5" />} label="LAS Admin" pathname={pathname} />
              <NavItem href="/dashboard/settings/team" icon={<Users className="h-5 w-5" />} label="Users" pathname={pathname} />
              <NavItem
                href="/dashboard/settings/organization"
                icon={<Settings className="h-5 w-5" />}
                label="General"
                pathname={pathname}
                isActiveOverride={pathname.startsWith("/dashboard/settings") && !pathname.startsWith("/dashboard/settings/team") && !pathname.startsWith("/dashboard/settings/users")}
              />
            </>
          ) : isAccountingContext ? (
            <>
              <NavItem href="/dashboard/accounting" icon={<BookOpen className="h-5 w-5" />} label="Ledger" pathname={pathname} />
              <NavItem href="/dashboard/finance" icon={<DollarSign className="h-5 w-5" />} label="Finance" pathname={pathname} />
              <NavItem href="/dashboard/reports?ctx=acc" icon={<BarChart className="h-5 w-5" />} label="Reports" pathname={pathname} />
            </>
          ) : isBorrowerContext ? (
            <>
              <NavItem href="/dashboard/my-loan" icon={<CreditCard className="h-5 w-5" />} label="My Loan" pathname={pathname} exact />
            </>
          ) : (
            <>
              <NavItem href="/dashboard/applications" icon={<FileText className="h-5 w-5" />} label="Apps" pathname={pathname} />
              <NavItem href="/dashboard/underwriting" icon={<ShieldCheck className="h-5 w-5" />} label="Review" pathname={pathname} />
              <NavItem href="/dashboard/accounts" icon={<CreditCard className="h-5 w-5" />} label="Accounts" pathname={pathname} />
              <NavItem href="/dashboard/operations" icon={<Layers className="h-5 w-5" />} label="Ops" pathname={pathname} />
              <NavItem href="/dashboard/reports" icon={<BarChart className="h-5 w-5" />} label="Reports" pathname={pathname} />
            </>
          )}

          <div className="flex-1"></div>

          {!isAdminContext && !isBorrowerContext && (
            <NavItem href="/dashboard/settings" icon={<Settings className="h-5 w-5" />} label="Settings" pathname={pathname} />
          )}
          </aside>
        )}

        {/* Center Data Pane */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center text-sm font-bold text-gray-400">Loading...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}

function NavItem({ href, icon, label, pathname, exact = false, isActiveOverride }: { href: string; icon: ReactNode; label: string; pathname: string; exact?: boolean; isActiveOverride?: boolean }) {
  const hrefPathname = href.split('?')[0];
  const isActive = isActiveOverride !== undefined ? isActiveOverride : (exact ? pathname === hrefPathname : pathname.startsWith(hrefPathname))
  
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 transition-colors group ${isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}>
      <div className={`p-2 rounded-lg ${isActive ? 'bg-black dark:bg-slate-700 text-white group-hover:bg-gray-900 dark:group-hover:bg-slate-600' : 'group-hover:bg-gray-100 dark:group-hover:bg-slate-800'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium hidden md:block">{label}</span>
    </Link>
  )
}
