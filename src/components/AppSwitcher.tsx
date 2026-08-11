"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronsUpDown, Check, FileText, Shield, BookOpen, Settings, BarChart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AppSwitcher({ currentContext = "Overview" }: { currentContext?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>("loan_officer")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
          const rawRole = data?.role || user.user_metadata?.role || (user.email === 'lawdocs-finbyx@gmail.com' ? 'super_admin' : 'loan_officer')
          setUserRole(rawRole)
        }
      } catch (err) {
        console.error("Failed to fetch role", err)
      }
    }
    fetchRole()

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const apps = [
    { name: "Loan Origination", href: "/dashboard/applications", icon: FileText },
    { name: "Loan Management", href: "/dashboard/accounts", icon: Shield },
    { name: "Accounting", href: "/dashboard/accounting", icon: BookOpen },
    { name: "Administration", href: "/dashboard/settings", icon: Settings, adminOnly: true },
    { name: "Analytics & Reports", href: "/dashboard/reports", icon: BarChart },
  ]

  const isAdmin = userRole === "tenant_admin" || userRole === "super_admin" || userRole === "platform_admin"

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm"
        title="Switch Environment"
      >
        {/* Dynamic mini-avatar based on context */}
        <div className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded shrink-0 shadow-inner">
          <span className="text-[10px] font-black tracking-tighter">{currentContext.charAt(0)}</span>
        </div>
        <span className="hidden sm:inline-block">{currentContext}</span>
        <span className="sm:hidden">{currentContext.split(' ')[0]}</span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden font-normal ring-1 ring-black/5 dark:ring-white/10">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 mb-1">
              Select Module
            </div>
            {apps.map((app) => {
              if (app.adminOnly && !isAdmin) return null;
              
              const isActive = currentContext === app.name
              return (
                <Link 
                  key={app.name}
                  href={app.href}
                  target="_blank"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 mx-1 text-sm rounded-md transition-colors ${
                    isActive 
                      ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-semibold" 
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${isActive ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-slate-800'}`}>
                      <app.icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`} />
                    </div>
                    {app.name}
                  </div>
                  {isActive && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
