"use client"

import Link from "next/link"
import { UserPlus, Search, ArrowRight, FileText } from "lucide-react"

export default function NewApplicationPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">New Loan Application</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Initiate a new loan origination workflow.</p>
        </div>
      </div>
      
      <div className="p-6 max-w-4xl mx-auto w-full mt-6">
        <div className="max-w-2xl">
          {/* General Loan Application */}
          <Link
            href="/dashboard/applications/new/general"
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black dark:hover:border-white hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">General Loan Application</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
              Complete RGSL loan application form with support for individual, corporate and other applicants, collateral details, and customer declaration.
            </p>
            <span className="inline-flex items-center justify-between w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-md text-sm font-medium group-hover:bg-gray-800 dark:group-hover:bg-gray-200 transition-colors">
              Start Application <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
