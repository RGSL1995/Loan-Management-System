"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck, Search, Filter, ArrowLeft, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Application {
  id: number;
  accountNo: string;
  clientId: number;
  loanProductName: string;
  principal: number;
  status: string;
  submittedOnDate: string;
}

const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "accountNo",
    header: "Application #",
    cell: ({ row }) => (
      <Link href={`/dashboard/applications/${row.original.id}/underwriting`}>
        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
          {row.getValue("accountNo")} <ArrowRight className="w-3 h-3 inline" />
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "clientId",
    header: "Borrower ID",
    cell: ({ row }) => (
      <span className="text-[11px] font-medium text-gray-600 dark:text-slate-400">
        #{row.getValue("clientId")}
      </span>
    ),
  },
  {
    accessorKey: "loanProductName",
    header: "Loan Facility",
    cell: ({ row }) => (
      <span className="text-[11px] font-semibold text-gray-900 dark:text-slate-100">
        {row.getValue("loanProductName")}
      </span>
    ),
  },
  {
    accessorKey: "principal",
    header: "Loan Amount (₹)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("principal"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="font-mono text-xs font-bold text-gray-900 dark:text-slate-100">{formatted}</div>;
    },
  },
  {
    accessorKey: "submittedOnDate",
    header: "Submission Date",
    cell: ({ row }) => <span className="text-[11px] text-gray-500 dark:text-slate-400">{row.getValue("submittedOnDate")}</span>,
  },
  {
    accessorKey: "status",
    header: "Risk Stage",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 w-max">
          <Clock className="w-3 h-3" /> Underwriting Assessment
        </span>
      );
    },
  },
  {
    id: "action",
    header: "Decision",
    cell: ({ row }) => (
      <Link href={`/dashboard/applications/${row.original.id}/underwriting`}>
        <button className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded text-[10px] font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs">
          Review CAM
        </button>
      </Link>
    ),
  },
];

export default function UnderwritingDashboardPage() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingUnderwriting = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/fineract/loans");
        if (!res.ok) throw new Error("Failed to fetch underwriting queue");

        const json = await res.json();
        const loans = json.pageItems || [];
        // Filter or display applications requiring underwriting assessment
        setData(loans);
        setError(null);
      } catch (err: any) {
        console.error("Underwriting fetch error:", err);
        setError(err.message || "Failed to load underwriting queue");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUnderwriting();
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 p-4 md:p-8 overflow-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              Credit Underwriting Queue
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Review LTV ratios, collateral valuation, CIBIL reports, and approve Credit Assessment Memos (CAM).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/applications">
            <button className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              View All Applications
            </button>
          </Link>
        </div>
      </div>

      {/* Underwriting Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-slate-500">Pending Review</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{data.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-slate-500">Max LTV Threshold</span>
          <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-1">50.0%</p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-slate-500">Avg Credit Score</span>
          <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">782 CIBIL</p>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by loan # or product..."
              className="w-64 h-8 pl-9 pr-3 text-xs bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
            {data.length} Queue Items
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500 dark:text-slate-400">
              Loading credit underwriting queue...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </div>
      </div>
    </div>
  );
}
