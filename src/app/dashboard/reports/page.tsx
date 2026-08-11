"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Layers, AlertOctagon, CheckCircle2,
  Clock, IndianRupee, FileDown, RefreshCw, BarChart2, Play, Search, Filter
} from "lucide-react";

// --- Types ---
interface Loan {
  id: number;
  accountNo: string;
  loanProductName: string;
  principal: number;
  approvedPrincipal: number | null;
  status: string;
  disbursed: boolean;
  submittedOnDate: string;
}

interface KpiCard {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}

type ReportCategory = "All" | "Financial" | "Operational" | "Compliance";

// Static report catalogue — runs against live KPIs
const REPORT_CATALOGUE = [
  { id: "1", name: "Portfolio Outstanding Report",    category: "Financial",    format: "Excel", description: "Total loan book, outstanding, and principal breakdown by product." },
  { id: "2", name: "Disbursement Register",          category: "Operational",  format: "CSV",   description: "All disbursed loans with dates, amounts, and borrower IDs." },
  { id: "3", name: "NPA & Arrears Aging",            category: "Compliance",   format: "Excel", description: "Accounts overdue by DPD buckets: 1-30, 31-60, 60+ days." },
  { id: "4", name: "Pending Applications Summary",   category: "Operational",  format: "CSV",   description: "All applications awaiting underwriting or maker-checker approval." },
  { id: "5", name: "RBI Regulatory Filing (MSME)",  category: "Compliance",   format: "PDF",   description: "Quarterly MSME portfolio disclosures as per RBI circular." },
  { id: "6", name: "Trial Balance",                  category: "Financial",    format: "PDF",   description: "Double-entry ledger trial balance from Fineract GL module." },
  { id: "7", name: "Interest Income Statement",      category: "Financial",    format: "Excel", description: "Accrued and collected interest income by product and period." },
  { id: "8", name: "Maker-Checker Audit Log",        category: "Compliance",   format: "CSV",   description: "Full audit trail of all 4-eye approval actions with timestamps." },
];

const FORMAT_COLORS: Record<string, string> = {
  Excel: "text-green-700 dark:text-green-400",
  CSV: "text-blue-700 dark:text-blue-400",
  PDF: "text-red-700 dark:text-red-400",
};

const CATEGORY_COLORS: Record<string, string> = {
  Financial: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Operational: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  Compliance: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
};

export default function ReportsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ReportCategory>("All");

  const fetchData = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/fineract/loans?t=" + Date.now());
      const json = await res.json();
      setLoans(json.pageItems || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Aggregations from live mock data ---
  const totalLoans = loans.length;
  const active = loans.filter((l) => l.status === "ACTIVE");
  const pending = loans.filter((l) => l.status === "SUBMITTED_AND_PENDING_APPROVAL");
  const approved = loans.filter((l) => l.status === "APPROVED");
  const disbursed = loans.filter((l) => l.disbursed);

  const totalBook = loans.reduce((s, l) => s + (l.approvedPrincipal || l.principal || 0), 0);
  const disbursedAmt = disbursed.reduce((s, l) => s + (l.principal || 0), 0);
  const pendingAmt = pending.reduce((s, l) => s + (l.principal || 0), 0);

  const fmt = (n: number) =>
    n >= 10000000
      ? `₹${(n / 10000000).toFixed(2)} Cr`
      : n >= 100000
      ? `₹${(n / 100000).toFixed(1)} L`
      : `₹${n.toLocaleString("en-IN")}`;

  const kpis: KpiCard[] = [
    {
      label: "Total Loan Book",
      value: loading ? "—" : fmt(totalBook),
      sub: `${totalLoans} accounts`,
      icon: <IndianRupee className="w-4 h-4" />,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Disbursed",
      value: loading ? "—" : fmt(disbursedAmt),
      sub: `${disbursed.length} loans active`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Pending Approval",
      value: loading ? "—" : fmt(pendingAmt),
      sub: `${pending.length + approved.length} applications`,
      icon: <Clock className="w-4 h-4" />,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "NPA (Flagged)",
      value: "₹1.82 Cr",
      sub: "2 accounts",
      icon: <AlertOctagon className="w-4 h-4" />,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  const handleRunReport = (id: string) => {
    setRunningId(id);
    setTimeout(() => setRunningId(null), 2000);
  };

  // Filtered catalogue
  const filtered = REPORT_CATALOGUE.filter((r) => {
    const matchCat = category === "All" || r.category === category;
    const matchSearch = search === "" || r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100">Reports & Analytics</h1>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-slate-400">
            Live aggregations from Apache Fineract mock. Data updates every run.
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          className="h-7 px-3 text-[10px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md flex items-center gap-1.5 hover:bg-gray-50 text-gray-700 dark:text-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* === KPI Tiles === */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4"
            >
              <div className={`flex items-center gap-1.5 mb-2 ${kpi.color}`}>
                {kpi.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  {kpi.label}
                </span>
              </div>
              <p className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* === Portfolio Breakdown === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Status distribution */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
            <h3 className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 mb-3">Loan Status Distribution</h3>
            {[
              { label: "Active", count: active.length, color: "bg-green-500", pct: totalLoans > 0 ? (active.length / totalLoans) * 100 : 0 },
              { label: "Approved", count: approved.length, color: "bg-blue-500", pct: totalLoans > 0 ? (approved.length / totalLoans) * 100 : 0 },
              { label: "Pending", count: pending.length, color: "bg-amber-500", pct: totalLoans > 0 ? (pending.length / totalLoans) * 100 : 0 },
            ].map((bar) => (
              <div key={bar.label} className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-600 dark:text-slate-400">{bar.label}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{bar.count}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full">
                  <div className={`h-1.5 rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Product mix */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
            <h3 className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 mb-3">Product Mix</h3>
            {loading ? (
              <p className="text-[11px] text-gray-400">Loading...</p>
            ) : (
              (() => {
                const grouped: Record<string, number> = {};
                loans.forEach((l) => { grouped[l.loanProductName] = (grouped[l.loanProductName] || 0) + 1; });
                return Object.entries(grouped).map(([product, count]) => (
                  <div key={product} className="flex items-center justify-between mb-2 text-[11px]">
                    <span className="text-gray-600 dark:text-slate-400 truncate">{product}</span>
                    <span className="font-bold text-gray-900 dark:text-white ml-2 shrink-0">{count}</span>
                  </div>
                ));
              })()
            )}
          </div>

          {/* Quick stats */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
            <h3 className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 mb-3">Quick Stats</h3>
            {[
              { label: "Avg. Loan Size", value: loading || totalLoans === 0 ? "—" : fmt(Math.round(totalBook / totalLoans)) },
              { label: "Disbursement Rate", value: loading || totalLoans === 0 ? "—" : `${Math.round((disbursed.length / totalLoans) * 100)}%` },
              { label: "Maker-Checker Tasks", value: "3" },
              { label: "Approvals Pending", value: String(approved.length + pending.length) },
            ].map((stat) => (
              <div key={stat.label} className="flex justify-between text-[11px] mb-2">
                <span className="text-gray-500 dark:text-slate-400">{stat.label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === Report Catalogue === */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Report Catalogue
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="h-6 pl-6 pr-2 text-[10px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded outline-none w-40"
                />
              </div>
              {(["All", "Financial", "Operational", "Compliance"] as ReportCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`h-6 px-2 text-[10px] font-bold rounded transition-colors ${
                    category === cat
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Report rows */}
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${CATEGORY_COLORS[report.category]}`}>
                      {report.category}
                    </span>
                    <span className={`text-[9px] font-bold font-mono ${FORMAT_COLORS[report.format] || "text-gray-500"}`}>
                      {report.format}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-900 dark:text-slate-100">{report.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{report.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleRunReport(report.id)}
                    disabled={runningId === report.id}
                    className="h-7 px-2.5 text-[10px] font-bold flex items-center gap-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 text-gray-700 dark:text-slate-300 disabled:opacity-50"
                  >
                    {runningId === report.id ? (
                      <><RefreshCw className="w-3 h-3 animate-spin" /> Running...</>
                    ) : (
                      <><Play className="w-3 h-3" /> Run</>
                    )}
                  </button>
                  <button className="h-7 px-2.5 text-[10px] font-bold flex items-center gap-1 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200">
                    <FileDown className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance badges */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 mb-3">Regulatory Compliance Status</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "IRAC Norms", ok: true },
              { label: "RBI PCF Reporting", ok: true },
              { label: "MSME Disclosure", ok: false },
              { label: "CERSAI Charges", ok: true },
              { label: "KYC AML Check", ok: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${
                  item.ok
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                }`}
              >
                {item.ok ? <CheckCircle2 className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {item.label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
