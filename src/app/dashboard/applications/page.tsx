"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Plus, FileDown, ArrowLeft, AlertCircle, RefreshCw, Filter, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getCompanyApplications } from "@/app/actions/loan-applications";

interface Application {
  id: string;
  accountNo: string;
  clientId: string;
  loanProductName: string;
  principal: number;
  status: string;
  submittedOnDate: string;
}

const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "accountNo",
    header: "Loan #",
    cell: ({ row }) => (
      <Link href={`/dashboard/applications/${row.original.id}/underwriting`}>
        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          {row.getValue("accountNo")}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "clientId",
    header: "Client ID",
    cell: ({ row }) => (
      <span className="text-[11px] text-gray-600 dark:text-slate-400">
        #{row.getValue("clientId")}
      </span>
    ),
  },
  {
    accessorKey: "loanProductName",
    header: "Product",
    cell: ({ row }) => (
      <span className="text-[11px] text-gray-600 dark:text-slate-400">
        {row.getValue("loanProductName")}
      </span>
    ),
  },
  {
    accessorKey: "principal",
    header: "Amount (₹)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("principal"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-mono text-[11px] font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "submittedOnDate",
    header: "Submitted",
    cell: ({ row }) => <span className="text-[11px]">{row.getValue("submittedOnDate")}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap: Record<string, string> = {
        DRAFT: "Draft",
        SUBMITTED: "Submitted",
        UNDER_REVIEW: "Under Review",
        CREDIT_APPROVED: "Approved",
        APPROVED_WITH_CONDITIONS: "Approved (Conditions)",
        REJECTED: "Rejected",
        DISBURSED: "Disbursed",
      };

      let colorClass = "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300";
      if (status === "CREDIT_APPROVED" || status === "DISBURSED") colorClass = "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      if (status === "APPROVED_WITH_CONDITIONS") colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      if (status === "SUBMITTED" || status === "UNDER_REVIEW") colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      if (status === "REJECTED") colorClass = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";

      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>
          {statusMap[status] || status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/applications/${row.original.id}/review`}
          className="flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded transition-colors"
          title="Review filled application form"
        >
          <FileText className="w-3 h-3" />
          Review Form
        </Link>
        <Link
          href={`/dashboard/applications/${row.original.id}/underwriting`}
          className="flex items-center gap-1 text-[11px] text-purple-700 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 px-2 py-1 rounded transition-colors"
          title="Underwriting & CAM"
        >
          <Eye className="w-3 h-3" />
          Underwriting
        </Link>
      </div>
    ),
  },
];

const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "CREDIT_APPROVED", label: "Approved" },
  { key: "DISBURSED", label: "Disbursed" },
]

export default function ApplicationsPage() {
  const [allData, setAllData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLoans = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const res = await getCompanyApplications();
      if (res.error) throw new Error(res.error);
      
      const mappedData: Application[] = (res.data || []).map((app: any) => ({
        id: app.id,
        accountNo: app.application_number || app.id.split("-")[0].toUpperCase(),
        clientId: app.applicant_id,
        loanProductName: app.loan_type,
        principal: app.proposed_facilities?.[0]?.amount || 0,
        status: app.status.toUpperCase(),
        submittedOnDate: app.submitted_at || app.created_at,
      }));

      setAllData(mappedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loans");
      setAllData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
    // Poll every 10 seconds so status changes from other tabs are reflected
    const interval = setInterval(() => fetchLoans(true), 10000);
    return () => clearInterval(interval);
  }, [fetchLoans]);

  // Filter by status tab and search string
  const data = allData.filter((loan) => {
    const matchStatus = activeStatus === "ALL" || loan.status === activeStatus
    const matchSearch = search === "" ||
      loan.accountNo.toLowerCase().includes(search.toLowerCase()) ||
      loan.loanProductName.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  // Counts per status for tab badges
  const counts: Record<string, number> = {}
  allData.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1 })

  return (
    <div className="flex flex-col sm:flex-row w-full h-full bg-white dark:bg-slate-950">
      {/* Center Data Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden sm:border-r border-gray-200 dark:border-slate-800">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight">Loan Applications</h1>
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium hidden sm:inline-block">
                Total: {allData.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Loan # or Product..."
                className="w-full sm:w-56 h-7 pl-8 pr-3 text-[11px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
            <button
              onClick={() => fetchLoans(true)}
              title="Refresh"
              className="h-7 w-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              className="h-7 w-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              title="Export CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>
            <Link href="/dashboard/applications/new" className="h-7 px-3 bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium rounded flex items-center gap-1.5 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors whitespace-nowrap">
              <Plus className="w-3.5 h-3.5" /> New Application
            </Link>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 shrink-0 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const count = tab.key === "ALL" ? allData.length : (counts[tab.key] || 0)
            return (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold border-b-2 whitespace-nowrap transition-colors ${
                  activeStatus === tab.key
                    ? "border-black dark:border-white text-black dark:text-white"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    activeStatus === tab.key ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                  }`}>{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3 m-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">Loading loans...</p>
            </div>
          </div>
        )}

        {/* Table Area */}
        {!loading && data.length > 0 && (
          <div className="flex-1 overflow-x-auto bg-gray-50/20 dark:bg-slate-950/20">
            <DataTable columns={columns} data={data} />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && data.length === 0 && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-slate-400">No loans found</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar (Filters) */}
      <div className="w-full sm:w-72 bg-gray-50 dark:bg-slate-900 flex flex-col h-full shrink-0 border-t sm:border-t-0 border-gray-200 dark:border-slate-800">
        <div className="h-12 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
            <Filter className="w-4 h-4" /> Filters
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">
              Product Type
            </label>
            <select className="h-8 px-2 text-[11px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-gray-400 dark:focus:border-slate-500 w-full">
              <option>All Products</option>
              <option>Term Loan (Secured)</option>
              <option>Working Capital</option>
              <option>Personal Loan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">
              Status
            </label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                  defaultChecked
                />{" "}
                Pending
              </label>
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                  defaultChecked
                />{" "}
                Approved
              </label>
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" />{" "}
                Active
              </label>
            </div>
          </div>

          <button className="h-8 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-[11px] font-medium rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
