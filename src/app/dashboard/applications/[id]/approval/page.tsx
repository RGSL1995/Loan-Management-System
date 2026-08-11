"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileSignature, CheckCircle2, XCircle, Loader2, Send, AlertCircle } from "lucide-react";
import Link from "next/link";
import { approveMakerCheckerTask, rejectMakerCheckerTask } from "@/app/actions/maker-checker";

type Decision = "approve" | "decline" | "info" | null;

export default function ApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = String(params.id);

  const [decision, setDecision] = useState<Decision>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedDecision, setSubmittedDecision] = useState<Decision>(null);
  const [isPending, startTransition] = useTransition();

  // The Maker-Checker task ID is the same as the applicationId in our mock
  const taskId = parseInt(applicationId) || 1;

  const handleConfirm = () => {
    if (!decision) return;
    if (decision === "decline" && !notes.trim()) {
      alert("Please provide a reason for declining.");
      return;
    }

    startTransition(async () => {
      if (decision === "approve") {
        await approveMakerCheckerTask(taskId);
      } else if (decision === "decline") {
        await rejectMakerCheckerTask(taskId, notes);
      }
      // "info" just saves notes without an action
      setSubmittedDecision(decision);
      setSubmitted(true);
      setTimeout(() => {
        router.push("/dashboard/maker-checker?ctx=lms");
      }, 2500);
    });
  };

  // --- Success State ---
  if (submitted) {
    const isApproved = submittedDecision === "approve";
    return (
      <div className="flex flex-col w-full h-full items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center max-w-sm space-y-4 p-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isApproved ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/20"}`}>
            {isApproved
              ? <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              : <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            }
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isApproved ? "Loan Approved" : submittedDecision === "decline" ? "Loan Declined" : "Sent for Clarification"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {isApproved
              ? `Application #${applicationId} has been sanctioned. The Operations team can now proceed with disbursement.`
              : `Application #${applicationId} has been declined. A rejection letter will be generated.`
            }
          </p>
          <p className="text-xs text-gray-400">Redirecting to Approvals queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/maker-checker" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">Credit Approval</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Application #{applicationId} — Checker Review</p>
          </div>
        </div>
        <Link href={`/dashboard/applications/${applicationId}/sanction-letter`}>
          <button className="h-8 px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-[11px] font-bold rounded flex items-center gap-1.5 hover:bg-gray-50">
            <FileSignature className="w-3.5 h-3.5" /> View Sanction Letter
          </button>
        </Link>
      </div>

      <div className="p-4 max-w-3xl mx-auto w-full space-y-4">

        {/* CAM Summary */}
        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
          <h2 className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileSignature className="w-3.5 h-3.5" /> Appraisal Summary (From Maker)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Requested Amount", value: "₹25,00,000", color: "" },
              { label: "CIBIL Score", value: "745", color: "text-green-600" },
              { label: "LTV", value: "50%", color: "text-green-600" },
              { label: "DTI Ratio", value: "32%", color: "text-green-600" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white dark:bg-slate-950 p-3 rounded border border-gray-200 dark:border-slate-800">
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mb-0.5 uppercase font-bold">{kpi.label}</p>
                <p className={`text-sm font-bold ${kpi.color || "text-gray-900 dark:text-white"}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded border border-gray-200 dark:border-slate-800 text-[11px] text-gray-700 dark:text-slate-300">
            <strong className="text-gray-900 dark:text-white">Underwriter Recommendation:</strong> Client meets all standard criteria. Property valuation confirms ₹50L market value. Recommended for standard sanction at 10.5% p.a. for 60 months.
          </div>
        </div>

        {/* Decision Selector */}
        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
          <h2 className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-3">Sanction Decision</h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {([
              { key: "approve", label: "Approve Loan", sub: "Sanction within limits", icon: <CheckCircle2 className="w-4 h-4" />, activeClass: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" },
              { key: "info", label: "Request Info", sub: "Send back to underwriter", icon: <AlertCircle className="w-4 h-4" />, activeClass: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" },
              { key: "decline", label: "Decline Loan", sub: "Generate rejection letter", icon: <XCircle className="w-4 h-4" />, activeClass: "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" },
            ] as const).map((opt) => (
              <label
                key={opt.key}
                className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${decision === opt.key ? opt.activeClass : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-400 hover:border-gray-300"}`}
              >
                <input type="radio" name="decision" className="sr-only" onChange={() => setDecision(opt.key)} />
                {opt.icon}
                <span className="text-[11px] font-bold mt-1.5">{opt.label}</span>
                <span className="text-[10px] text-center opacity-70 mt-0.5">{opt.sub}</span>
              </label>
            ))}
          </div>

          {decision && (
            <div className="mb-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                Decision Notes {decision === "decline" && <span className="text-red-500 normal-case">* Required</span>}
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none text-gray-900 dark:text-slate-100 placeholder:text-gray-400"
                placeholder={`Enter reasoning for ${decision === "approve" ? "approval" : decision === "decline" ? "declining (required)" : "requesting more information"}...`}
              />
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={handleConfirm}
              disabled={!decision || isPending || (decision === "decline" && !notes.trim())}
              className="h-8 px-5 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Confirm Decision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
