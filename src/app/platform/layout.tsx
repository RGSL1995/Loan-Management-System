"use client"

import { useState, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Users, Settings, LogOut, ShieldAlert, Menu, X } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white flex items-center justify-between px-4 shrink-0 z-20">
        <Link href="/" className="flex items-center">
          <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <span className="font-bold tracking-wider text-sm">RGSL PLATFORM</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Platform Left Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shrink-0
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0 mt-14 md:mt-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <Link href="/" className="hidden md:flex h-16 items-center px-6 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <span className="font-bold tracking-wider text-sm text-gray-900 dark:text-slate-100">RGSL PLATFORM</span>
        </Link>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
          <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mb-2 uppercase tracking-wider px-2">Management</div>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <PlatformNavLink href="/platform/companies" icon={<Building2 className="w-4 h-4" />} label="Companies (Tenants)" pathname={pathname} />
          </div>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <PlatformNavLink href="/platform/platform-users" icon={<Users className="w-4 h-4" />} label="Platform Admins" pathname={pathname} />
          </div>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <PlatformNavLink href="/platform/settings" icon={<Settings className="w-4 h-4" />} label="Global Settings" pathname={pathname} />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <form action={async () => { await logout(); }}>
            <button type="submit" className="flex items-center gap-3 px-2 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
          <ThemeToggle />
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden mt-14"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Pane */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950 relative z-10 w-full text-gray-900 dark:text-slate-100">
        {children}
      </main>
    </div>
  )
}

function PlatformNavLink({ href, icon, label, pathname }: { href: string; icon: ReactNode; label: string; pathname: string }) {
  const isActive = pathname.startsWith(href)
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-black text-white dark:bg-white dark:text-black font-bold' 
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white'
      }`}
    >
      {icon} {label}
    </Link>
  )
}
