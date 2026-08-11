"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertTriangle, Send, Loader2, FileText, Building2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { submitCamToMakerChecker } from "@/app/actions/maker-checker";
import { createClient } from "@/lib/supabase/client";

type Recommendation = "RECOMMEND" | "CONDITIONAL" | "DECLINE";

export default function UnderwritingPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = String(params.id);

  const [bureauStatus, setBureauStatus] = useState<"pending" | "pulled">("pending");
  const [bureauLoading, setBureauLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // CAM Form state
  const [cibilScore, setCibilScore] = useState<number>(745);
  const [assetValue, setAssetValue] = useState<number>(5000000);
  const [loanAmount] = useState<number>(2500000); // From application
  const [dti, setDti] = useState<number>(32);
  const [recommendation, setRecommendation] = useState<Recommendation>("RECOMMEND");
  const [notes, setNotes] = useState("");

  // Calculated LTV
  const ltv = assetValue > 0 ? Math.round((loanAmount / assetValue) * 100) : 0;

  const pullBureauReport = async () => {
    setBureauLoading(true);
    setTimeout(() => {
      setBureauStatus("pulled");
      setBureauLoading(false);
    }, 1500);
  };

  const handleSubmitCam = () => {
    if (!notes.trim()) {
      alert("Please enter your appraisal notes before submitting.");
      return;
    }

    startTransition(async () => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const makerEmail = user?.email || "unknown@finbyx.com";

      const res = await submitCamToMakerChecker({
        applicationId,
        cibilScore,
        assetValue,
        ltv,
        dti,
        recommendation,
        notes,
        makerEmail,
      });

      if (res.success) {
        setSubmitted(true);
        // Redirect to maker-checker queue after a short delay
        setTimeout(() => {
          router.push("/dashboard/maker-checker?ctx=lms");
        }, 2500);
      }
    });
  };

  // --- Submitted Success State ---
  if (submitted) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center max-w-sm space-y-4 p-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">CAM Submitted</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Your Credit Assessment Memo for application <strong>#{applicationId}</strong> has been queued for approval. Redirecting to the Approvals queue...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/underwriting" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">Credit Assessment Memo (CAM)</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Application #{applicationId} — Complete the assessment to submit for approval</p>
          </div>
        </div>
        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
          <span className="w-5 h-5 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-[10px]">1</span>
          Bureau Check
          <span className="w-12 h-px bg-gray-300 dark:bg-slate-700" />
          <span className="w-5 h-5 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-[10px]">2</span>
          Collateral
          <span className="w-12 h-px bg-gray-300 dark:bg-slate-700" />
          <span className="w-5 h-5 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-[10px]">3</span>
          CAM Submission
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto w-full space-y-4">

        {/* === SECTION 1: Credit Bureau === */}
        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> 1. Bureau Report (CIBIL / Experian)
            </h2>
            {bureauStatus === "pulled" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Retrieved
              </span>
            )}
          </div>

          {bureauStatus === "pending" ? (
            <button
              onClick={pullBureauReport}
              disabled={bureauLoading}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {bureauLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting to Bureau API...</> : "Pull Credit Report"}
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">CIBIL Score</label>
                <input
                  type="number"
                  value={cibilScore}
                  onChange={(e) => setCibilScore(Number(e.target.value))}
                  className="mt-1 w-full h-8 px-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950 text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">DTI Ratio (%)</label>
                <input
                  type="number"
                  value={dti}
                  onChange={(e) => setDti(Number(e.target.value))}
                  className="mt-1 w-full h-8 px-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">Active Loans</label>
                <div className="mt-1 w-full h-8 px-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white flex items-center">2</div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">Flags</label>
                <div className="mt-1 w-full h-8 px-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded bg-gray-100 dark:bg-slate-800 text-green-600 dark:text-green-400 flex items-center">None</div>
              </div>
            </div>
          )}
        </div>

        {/* === SECTION 2: Collateral & LTV === */}
        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
          <h2 className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" /> 2. Collateral Verification (LTV Check)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">Verified Asset Value (₹)</label>
              <input
                type="number"
                value={assetValue}
                onChange={(e) => setAssetValue(Number(e.target.value))}
                className="mt-1 w-full h-8 px-2 text-sm border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">Loan Amount (₹)</label>
              <div className="mt-1 w-full h-8 px-2 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white flex items-center">
                ₹{loanAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold flex items-center gap-1">
                Calculated LTV
                <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${ltv <= 50 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ltv <= 75 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                  {ltv <= 50 ? "Safe" : ltv <= 75 ? "Caution" : "High Risk"}
                </span>
              </label>
              <div className={`mt-1 w-full h-8 px-2 text-sm font-bold border rounded flex items-center ${ltv <= 50 ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400" : "border-red-300 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"}`}>
                {ltv}%
              </div>
            </div>
          </div>
        </div>

        {/* === SECTION 3: CAM Recommendation === */}
        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
          <h2 className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" /> 3. Appraisal Note & Recommendation
          </h2>

          {/* Recommendation selector */}
          <div className="flex gap-2 mb-3">
            {(["RECOMMEND", "CONDITIONAL", "DECLINE"] as Recommendation[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setRecommendation(opt)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-md border transition-colors ${
                  recommendation === opt
                    ? opt === "RECOMMEND"
                      ? "bg-green-600 text-white border-green-600"
                      : opt === "CONDITIONAL"
                      ? "bg-yellow-500 text-white border-yellow-500"
                      : "bg-red-600 text-white border-red-600"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-400"
                }`}
              >
                {opt === "RECOMMEND" ? "✓ Recommend" : opt === "CONDITIONAL" ? "⚠ Conditional" : "✗ Decline"}
              </button>
            ))}
          </div>

          {recommendation === "DECLINE" && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700 dark:text-red-400">
                Selecting Decline will send this application to the rejection queue. Provide a detailed reason below.
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1 block">Underwriter Comments & CAM Notes *</label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none text-gray-900 dark:text-slate-100 placeholder:text-gray-400"
              placeholder="Enter detailed appraisal notes: risk analysis, collateral assessment, income verification findings, and your final recommendation rationale..."
            />
          </div>

          {/* Summary before submit */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-white dark:bg-slate-950 rounded-md border border-gray-200 dark:border-slate-800 mb-4">
            <div className="text-center">
              <p className="text-[9px] text-gray-500 uppercase font-bold">CIBIL</p>
              <p className={`text-sm font-bold ${cibilScore >= 700 ? "text-green-600" : "text-red-600"}`}>{bureauStatus === "pulled" ? cibilScore : "—"}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-500 uppercase font-bold">LTV</p>
              <p className={`text-sm font-bold ${ltv <= 50 ? "text-green-600" : "text-red-600"}`}>{ltv}%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-500 uppercase font-bold">DTI</p>
              <p className={`text-sm font-bold ${dti <= 40 ? "text-green-600" : "text-red-600"}`}>{dti}%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-500 uppercase font-bold">Decision</p>
              <p className={`text-[11px] font-bold ${recommendation === "RECOMMEND" ? "text-green-600" : recommendation === "CONDITIONAL" ? "text-yellow-600" : "text-red-600"}`}>{recommendation}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              disabled={isPending}
              className="h-8 px-4 text-[11px] font-bold border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmitCam}
              disabled={isPending || !notes.trim()}
              className="h-8 px-5 text-[11px] font-bold bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit CAM for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
