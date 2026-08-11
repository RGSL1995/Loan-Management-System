"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, User, Briefcase } from "lucide-react";

export default function LAPApplicationSelectorPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <Link href="/dashboard/applications/new" className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Loan Against Property (LAP)</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Select the customer profile type for the property collateralized loan.</p>
        </div>
      </div>
      
      <div className="p-6 max-w-4xl mx-auto w-full mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LAP Personal */}
          <Link 
            href="/dashboard/applications/new/lap/personal"
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black dark:hover:border-white hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">LAP Personal</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
              Apply for a loan against residential, commercial, or plot property owned by an individual applicant.
            </p>
            <span className="inline-flex items-center justify-between w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Start LAP Personal <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* LAP Business */}
          <Link 
            href="/dashboard/applications/new/lap/business"
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black dark:hover:border-white hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">LAP Business</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1">
              Apply for business expansion / working capital loans against property collateral owned by a corporate entity.
            </p>
            <span className="inline-flex items-center justify-between w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              Start LAP Business <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
