"use client"

import Link from "next/link";
import { ReactNode, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function OperationsLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ctx = searchParams.get('ctx')
  
  const ctxQuery = ctx ? `?ctx=${ctx}` : ""
  
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0">
        <div className="px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight">Operations</h1>
        </div>
        <div className="px-6 flex gap-6 text-sm font-medium">
          <TabLink href={`/dashboard/operations/tasks${ctxQuery}`} label="Tasks Inbox" pathname={pathname} />
          <TabLink href={`/dashboard/collections${ctxQuery}`} label="Collections" pathname={pathname} />
          <TabLink href={`/dashboard/operations/payments${ctxQuery}`} label="Payment Links" pathname={pathname} />
          <TabLink href={`/dashboard/operations/dedupe${ctxQuery}`} label="Duplicates" pathname={pathname} />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default function OperationsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <OperationsLayoutContent>{children}</OperationsLayoutContent>
    </Suspense>
  )
}

function TabLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const hrefPathname = href.split('?')[0];
  const isActive = pathname.startsWith(hrefPathname)
  
  return (
    <Link 
      href={href} 
      className={`pb-3 border-b-2 transition-colors ${
        isActive 
          ? 'border-black dark:border-white text-black dark:text-white' 
          : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
      }`}
    >
      {label}
    </Link>
  )
}
