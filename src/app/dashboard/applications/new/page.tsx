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
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Step 1: Borrower Selection</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Borrower Option */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black dark:hover:border-white transition-colors cursor-pointer group flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">New Borrower Onboarding</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
              Start the KYC wizard for a brand new applicant. This will capture PAN, Aadhaar, Income, and fetch Bureau records before selecting a product.
            </p>
            <Link 
              href="/dashboard/clients/new"
              className="inline-flex items-center justify-between w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Start Onboarding <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Existing Borrower Option */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black dark:hover:border-white transition-colors cursor-pointer group flex flex-col h-full">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Existing Client</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
              Select a client that has already completed KYC to immediately start a product-specific application (e.g. Working Capital Loan).
            </p>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by PAN, Name or Client ID..." 
                className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
            {/* Direct link to new loan origination form */}
            <div className="flex flex-col gap-2">
              <Link 
                href="/dashboard/applications/new/las"
                className="inline-flex items-center justify-between w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Start Loan Against Securities (LAS) <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/applications/new/lap"
                className="inline-flex items-center justify-between w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Start Loan Against Property (LAP) <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/applications/new/scl"
                className="inline-flex items-center justify-between w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Start Smart Credit Line (SCL) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Step 2: Application Type Selection */}
        <div className="mt-12">
          <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Step 2: Application Type</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* General Loan Application */}
            <Link
              href="/dashboard/applications/new/general"
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black dark:hover:border-white hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">General Application</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
                Fill out a comprehensive multi-section loan application form with support for all loan types and detailed financial information.
              </p>
              <span className="inline-flex items-center justify-between w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-md text-sm font-medium group-hover:bg-gray-800 dark:group-hover:bg-gray-200 transition-colors">
                Start Application <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* LAS Application */}
            <Link
              href="/dashboard/applications/new/las"
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black dark:hover:border-white hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Loan Against Securities</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
                Apply for a loan using securities (stocks, mutual funds, bonds) as collateral with LTV-based valuation.
              </p>
              <span className="inline-flex items-center justify-between w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                Start LAS <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* LAP Application */}
            <Link
              href="/dashboard/applications/new/lap"
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black dark:hover:border-white hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Loan Against Property</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
                Borrow against residential or commercial property with property valuation and legal verification.
              </p>
              <span className="inline-flex items-center justify-between w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                Start LAP <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
