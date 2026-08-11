"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Upload, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

// Each required document with its status
interface DocItem {
  key: string;
  label: string;
  required: boolean;
  status: "pending" | "uploading" | "verified";
  file?: File;
}

const INITIAL_DOCS: DocItem[] = [
  { key: "aadhaar", label: "Aadhaar Card (PDF/Image)", required: true, status: "pending" },
  { key: "pan", label: "PAN Card (PDF/Image)", required: true, status: "pending" },
  { key: "bankStatement", label: "Last 6 Months Bank Statement", required: true, status: "pending" },
  { key: "itr", label: "ITR / Salary Slip", required: true, status: "pending" },
  { key: "propertyDoc", label: "Property Title / Demat Holding", required: false, status: "pending" },
];

export default function KycCollateralPage() {
  const params = useParams();
  const applicationId = params.id;

  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [assetType, setAssetType] = useState("Property (LAP)");
  const [assetValue, setAssetValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [kycComplete, setKycComplete] = useState(false);

  const verifiedCount = docs.filter((d) => d.status === "verified").length;
  const requiredCount = docs.filter((d) => d.required).length;
  const allRequiredVerified = docs.filter((d) => d.required).every((d) => d.status === "verified");

  const handleFileSelect = (key: string, file: File | undefined) => {
    if (!file) return;
    // Mark as uploading then verified after a simulated delay
    setDocs((prev) =>
      prev.map((d) => (d.key === key ? { ...d, status: "uploading", file } : d))
    );
    setTimeout(() => {
      setDocs((prev) =>
        prev.map((d) => (d.key === key ? { ...d, status: "verified" } : d))
      );
    }, 1200);
  };

  const handleSubmitKyc = async () => {
    if (!allRequiredVerified) return;
    setSubmitting(true);

    // Simulate a PATCH to update application KYC status in Fineract mock
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setKycComplete(true);
  };

  // --- Completion State ---
  if (kycComplete) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center max-w-sm space-y-4 p-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">KYC Verified</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            All required documents for application <strong>#{applicationId}</strong> have been verified. The application is now ready for Underwriting.
          </p>
          <Link href={`/dashboard/applications/${applicationId}/underwriting`}>
            <button className="h-9 px-5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Proceed to Underwriting →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/applications" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">KYC & Collateral</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Application #{applicationId}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500">
          <span className={`font-bold ${allRequiredVerified ? "text-green-600" : "text-gray-700 dark:text-slate-300"}`}>
            {verifiedCount}/{requiredCount} Required Docs Verified
          </span>
          <div className="w-24 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(verifiedCount / requiredCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto w-full space-y-4">

        {/* Document list */}
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Required Documents
            </h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {docs.map((doc) => (
              <div key={doc.key} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status icon */}
                  {doc.status === "verified" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : doc.status === "uploading" ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 shrink-0" />
                  )}
                  <div>
                    <p className={`text-[11px] font-semibold ${doc.status === "verified" ? "text-green-700 dark:text-green-400" : "text-gray-800 dark:text-slate-200"}`}>
                      {doc.label}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {doc.required ? "Required" : "Optional"}
                      {doc.status === "verified" && ` • ${doc.file?.name}`}
                    </p>
                  </div>
                </div>

                {doc.status !== "verified" && (
                  <label className="shrink-0">
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => handleFileSelect(doc.key, e.target.files?.[0])}
                    />
                    <span className="h-7 px-3 text-[10px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md cursor-pointer flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-slate-300">
                      <Upload className="w-3 h-3" /> Upload
                    </span>
                  </label>
                )}
                {doc.status === "verified" && (
                  <span className="shrink-0 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Collateral Section */}
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4">
          <h2 className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Collateral Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Asset Type</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="h-8 w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white"
              >
                <option>Property (LAP)</option>
                <option>Securities (LAS)</option>
                <option>Gold</option>
                <option>FD / Insurance</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Estimated Value (₹)</label>
              <input
                type="number"
                value={assetValue}
                onChange={(e) => setAssetValue(e.target.value)}
                placeholder="e.g. 5000000"
                className="h-8 w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Warning if not all docs uploaded */}
        {!allRequiredVerified && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Upload and verify all required documents before marking KYC complete.
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSubmitKyc}
            disabled={!allRequiredVerified || submitting}
            className="h-8 px-5 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {submitting ? "Verifying..." : "Mark KYC Complete & Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}
