"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import LasLoanApplicationForm from "@/components/LasLoanApplicationForm";
import { ArrowLeft, CheckCircle2, FileText, LayoutDashboard, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LASPersonalApplicationPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  if (isSubmitted) {
    // Generate a display reference number (use real id if available)
    const refNumber = submittedAppId
      ? `LAS-${new Date().toISOString().slice(0, 7).replace("-", "")}-${submittedAppId.slice(-6).toUpperCase()}`
      : `LAS-${new Date().toISOString().slice(0, 7).replace("-", "")}-001001`;

    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg">

            {/* Success card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">

              {/* Green header banner */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 ring-4 ring-white/30">
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Application Submitted!</h1>
                <p className="text-emerald-100 text-sm mt-1">
                  Your LAS application is under review
                </p>
              </div>

              {/* Body */}
              <div className="px-8 py-6">
                {/* Reference number */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Application Reference</p>
                    <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 mt-0.5">{refNumber}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-semibold uppercase tracking-wide">
                    <Clock className="w-3 h-3" /> Under Review
                  </span>
                </div>

                {/* What happens next */}
                <div className="mb-6">
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">What happens next</p>
                  <div className="space-y-2.5">
                    {[
                      { icon: ShieldCheck, text: "Credit team will verify your documents", color: "text-blue-500" },
                      { icon: FileText, text: "You'll receive a sanction letter within 3–5 business days", color: "text-purple-500" },
                      { icon: CheckCircle2, text: "Pledge your securities to activate the facility", color: "text-emerald-500" },
                    ].map(({ icon: Icon, text, color }, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2.5">
                  <Link
                    href="/dashboard/applications"
                    className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View All Applications
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-4">
              A confirmation has been saved. Track your application under <span className="font-semibold">Applications → LAS</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-2 shrink-0 flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/applications/new"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-slate-100">
            Loan Against Securities
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Complete all steps to apply for a personal loan against your securities collateral.
          </p>
        </div>
        <div>
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded bg-black text-white dark:bg-slate-800 dark:text-slate-200 tracking-wider">
            Personal Loan
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <LasLoanApplicationForm
          applicationId={applicationId || undefined}
          initialLoanType="PERSONAL_LOAN"
          onSuccess={(id?: string) => {
            setSubmittedAppId(id || null);
            setIsSubmitted(true);
          }}
        />
      </div>
    </div>
  );
}
