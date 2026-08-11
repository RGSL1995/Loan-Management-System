"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, FileArchive } from "lucide-react";
import Link from "next/link";

export default function LoanClosurePage() {
  const params = useParams();
  const loanId = params.id;
  
  const [closureStatus, setClosureStatus] = useState<"pending" | "processing" | "closed">("pending");

  const processClosure = () => {
    setClosureStatus("processing");
    setTimeout(() => {
      setClosureStatus("closed");
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/operations" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Loan Closure</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Account #{loanId}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-8">
        
        {/* Account Status Check */}
        <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> Account Cleared
           </h2>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Principal Due</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">₹ 0.00</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Interest Due</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">₹ 0.00</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Penalties Due</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">₹ 0.00</p>
              </div>
               <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Status</p>
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  Ready for Closure
                </span>
              </div>
           </div>
        </div>

        {/* Security Release */}
        <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Security & Mandate Release
           </h2>
           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">CERSAI Charge Satisfaction (Form IV)</span>
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
             </div>
             <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">NACH Mandate Cancellation</span>
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
             </div>
             <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Original Property Documents Handover</span>
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
             </div>
           </div>
        </div>

        {/* Final Closure */}
        <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileArchive className="w-5 h-5" /> Final Closure
           </h2>
           <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
             Confirming closure will formally close this account in Fineract and generate the No Objection Certificate (NOC) for the client. This action cannot be undone.
           </p>

           <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-800">
              {closureStatus === "closed" ? (
                 <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-semibold rounded-lg">
                   <CheckCircle2 className="w-5 h-5" /> Account Closed (NOC Generated)
                 </span>
              ) : (
                <button 
                  onClick={processClosure}
                  disabled={closureStatus === "processing"}
                  className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {closureStatus === "processing" && <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>}
                  {closureStatus === "processing" ? "Closing Account..." : "Confirm Closure & Generate NOC"}
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
