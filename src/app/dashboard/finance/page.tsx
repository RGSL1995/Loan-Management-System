"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

interface Loan {
  id: number;
  principal: number;
  status: string;
  disbursed?: boolean;
  interestRatePerPeriod?: number;
}

export default function FinancePage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fineract/loans")
      .then((res) => res.json())
      .then((json) => {
        setLoans(json.pageItems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.principal || 0), 0);
  const estimatedInterestIncome = activeLoans.reduce(
    (sum, l) => sum + (l.principal || 0) * ((l.interestRatePerPeriod || 0) / 100) / 12,
    0
  );
  const eclProvisioning = totalOutstanding * 0.005; // 0.5% standard-asset provisioning placeholder

  const formatInr = (amount: number) =>
    `₹${Math.round(amount).toLocaleString("en-IN")}`;

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 p-4 md:p-8 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Financial Ledger & Regulatory Reports</h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Post General Ledger (GL) entries, generate Trial Balance, P&L Statements, and export RBI compliance reports.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">Loading portfolio figures...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-gray-400">Total Outstanding Portfolio</span>
            <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-2">{formatInr(totalOutstanding)}</p>
            <p className="text-[10px] text-gray-400 mt-1">{activeLoans.length} active loan accounts</p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-gray-400">Est. Monthly Interest Income</span>
            <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-2">{formatInr(estimatedInterestIncome)}</p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-gray-400">ECL Provisioning (IndAS 109)</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{formatInr(eclProvisioning)}</p>
          </div>
        </div>
      )}

      <div className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs text-xs text-gray-600 dark:text-slate-400">
        <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100 mb-2">General Ledger Accounting & RBI Exports</h2>
        <p>Use the navigation menu or Accounting module to post manual journals, review GL chart of accounts, or execute month-end closure.</p>
      </div>
    </div>
  );
}
