"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import SclLoanApplicationForm from "@/components/SclLoanApplicationForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SCLBusinessApplicationPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-955 overflow-y-auto">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">SCL Application Submitted!</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">Your Smart Credit Line (Business) application has been submitted and is under review.</p>
            <div className="space-y-3">
              <Link href="/dashboard/applications" className="inline-flex items-center justify-center w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">View All Applications</Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-2 shrink-0 flex justify-between items-center">
        <div>
          <Link href="/dashboard/applications/new/scl" className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-slate-100">Smart Credit Line</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Complete all steps to apply for a business Smart Credit Line.</p>
        </div>
        <div>
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded bg-black text-white dark:bg-slate-800 dark:text-slate-200 tracking-wider">
            Business Loan
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <SclLoanApplicationForm 
          applicationId={applicationId || undefined} 
          initialLoanType="BUSINESS_LOAN"
          onSuccess={() => setIsSubmitted(true)} 
        />
      </div>
    </div>
  );
}
