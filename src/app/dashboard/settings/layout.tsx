"use client"

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Users, Building, Settings as SettingsIcon, Box, ArrowLeft } from "lucide-react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <div className="flex-1 flex h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Settings Inner Sidebar */}
      <div className="w-56 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shrink-0 flex flex-col p-4 gap-2">
        <div className="mb-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[11px] font-medium text-gray-500 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
        {pathname.startsWith("/dashboard/settings/team") || pathname.startsWith("/dashboard/settings/users") ? (
          <>
            <h2 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">User Management</h2>
            <SidebarLink href="/dashboard/settings/team" icon={<Users className="w-4 h-4" />} label="Users & Roles" pathname={pathname} />
          </>
        ) : (
          <>
            <h2 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">General Settings</h2>
            <SidebarLink href="/dashboard/settings/organization" icon={<Building className="w-4 h-4" />} label="Organization" pathname={pathname} />
            <SidebarLink href="/dashboard/settings/system" icon={<SettingsIcon className="w-4 h-4" />} label="System" pathname={pathname} />
            <SidebarLink href="/dashboard/settings/products" icon={<Box className="w-4 h-4" />} label="Products" pathname={pathname} />
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

function SidebarLink({ href, icon, label, pathname }: { href: string; icon: ReactNode; label: string; pathname: string }) {
  const isActive = pathname.startsWith(href)
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-gray-100 dark:bg-slate-800 text-black dark:text-white' 
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-black dark:hover:text-white'
      }`}
    >
      {icon} {label}
    </Link>
  )
}
