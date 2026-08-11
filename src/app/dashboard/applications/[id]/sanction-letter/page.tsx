"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, AlertCircle } from "lucide-react";

// Dynamically import the PDFViewerClient with SSR disabled
const PDFViewerClient = dynamic(() => import("@/components/pdf/PDFViewerClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-800">
      <FileText className="w-8 h-8 text-gray-400 mb-2 animate-pulse" />
      <p className="text-sm text-gray-500">Loading PDF Document...</p>
    </div>
  ),
});

interface LoanData {
  loanId: string;
  date: string;
  borrowerName: string;
  borrowerAddress: string;
  borrowerPan: string;
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  emiAmount: string;
}

// Compute EMI from principal, rate %, and months
function computeEmi(principal: number, annualRate: number, months: number): string {
  if (months === 0) return "0";
  const r = annualRate / 12 / 100;
  if (r === 0) return (principal / months).toFixed(2);
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return emi.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function SanctionLetterPreviewPage({ params }: { params: { id: string } }) {
  const [letterData, setLetterData] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the actual loan from our Fineract mock proxy
    fetch(`/api/fineract/loans/${params.id}`)
      .then((r) => r.json())
      .then((loan) => {
        if (!loan || !loan.id) throw new Error("Loan not found");

        // Fetch borrower name from client ID
        return fetch(`/api/fineract/clients/${loan.clientId}`).then((cr) =>
          cr.json().then((client) => ({ loan, client }))
        );
      })
      .then(({ loan, client }) => {
        const emi = computeEmi(
          loan.approvedPrincipal || loan.principal,
          loan.interestRatePerPeriod || 10,
          loan.numberOfRepayments || 12
        );

        setLetterData({
          loanId: loan.accountNo || params.id.toUpperCase(),
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
          borrowerName: client?.displayName || `Borrower #${loan.clientId}`,
          borrowerAddress: client?.emailAddress ? `Email: ${client.emailAddress}` : "Address on file",
          borrowerPan: client?.externalId || "PAN on file",
          loanAmount: (loan.approvedPrincipal || loan.principal || 0).toLocaleString("en-IN"),
          interestRate: String(loan.interestRatePerPeriod || 10),
          loanTerm: String(loan.numberOfRepayments || 12),
          emiAmount: emi,
        });
      })
      .catch((err) => setError(err.message || "Failed to load loan data"))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/applications" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Sanction Letter Preview</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">
              {loading ? "Loading loan data..." : `Loan: ${letterData?.loanId || params.id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 hidden sm:inline-block mr-2">
            Use the PDF toolbar to print or download
          </span>
          <button className="h-8 px-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
            Email to Client
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 bg-gray-100 dark:bg-slate-950">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
              <p className="text-xs text-gray-500">Loading loan data from Fineract...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          </div>
        )}

        {letterData && !loading && (
          <div className="max-w-5xl mx-auto h-[80vh] shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 bg-white">
            <PDFViewerClient data={letterData} />
          </div>
        )}
      </div>
    </div>
  );
}
