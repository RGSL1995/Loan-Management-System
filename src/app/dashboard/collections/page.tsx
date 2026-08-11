"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PhoneCall, MapPin, AlertTriangle, Filter, Search, CheckCircle, Clock } from "lucide-react";

interface OverdueLoan {
  id: number;
  accountNo: string;
  clientId: number;
  loanProductName: string;
  principal: number;
  status: string;
  dpd?: number;
}

// Hardcoded overdue notes per loan for the mock interaction log
const MOCK_HISTORY: Record<number, { date: string; note: string; agent: string }[]> = {
  1: [],
  2: [],
  3: [{ date: "2026-07-20", note: "Borrower promised to pay by month end.", agent: "Ravi K." }],
};

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<"calls" | "field">("calls");
  const [loans, setLoans] = useState<OverdueLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<OverdueLoan | null>(null);
  const [interactionNote, setInteractionNote] = useState("");
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch all loans and filter those in ARREARS (simulated as DPD > 0)
    fetch("/api/fineract/loans")
      .then((r) => r.json())
      .then((json) => {
        // In mock data, loan status ACTIVE with no disbursedDate treated as overdue
        const allLoans: OverdueLoan[] = json.pageItems || [];
        // Add a mock DPD value to simulate overdue accounts
        const overdue = allLoans.map((l, i) => ({
          ...l,
          dpd: i === 0 ? 45 : i === 1 ? 12 : 0,
        })).filter((l) => l.dpd > 0);
        setLoans(overdue);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredLoans = loans.filter(
    (l) =>
      l.accountNo.toLowerCase().includes(search.toLowerCase()) ||
      String(l.clientId).includes(search)
  );

  const logInteraction = () => {
    if (!selectedLoan || !interactionNote.trim()) return;
    setHistory((prev) => ({
      ...prev,
      [selectedLoan.id]: [
        ...(prev[selectedLoan.id] || []),
        {
          date: new Date().toISOString().split("T")[0],
          note: interactionNote,
          agent: "You",
        },
      ],
    }));
    setInteractionNote("");
  };

  const getDpdColor = (dpd: number) =>
    dpd >= 30 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounts" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">Collections Inbox</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">{filteredLoans.length} overdue accounts from Fineract</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Client or Loan #..."
              className="w-56 h-7 pl-8 pr-3 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <button className="h-7 px-2.5 flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-medium rounded-md hover:bg-gray-50 dark:hover:bg-slate-700">
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — type selector */}
        <div className="w-44 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 p-3 gap-1">
          <button
            onClick={() => setActiveTab("calls")}
            className={`flex items-center gap-2.5 p-2.5 rounded-md text-[11px] font-bold transition-colors ${activeTab === "calls" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call Queue
            <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
              {filteredLoans.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("field")}
            className={`flex items-center gap-2.5 p-2.5 rounded-md text-[11px] font-bold transition-colors ${activeTab === "field" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
          >
            <MapPin className="w-3.5 h-3.5" /> Field Visits
          </button>

          {/* DPD summary */}
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1">
            <p className="text-[9px] uppercase font-bold text-gray-400 dark:text-slate-500">DPD Buckets</p>
            {[{ label: "1-30 days", count: filteredLoans.filter((l) => (l.dpd || 0) <= 30 && (l.dpd || 0) > 0).length, color: "text-amber-600" },
              { label: "31-60 days", count: filteredLoans.filter((l) => (l.dpd || 0) > 30 && (l.dpd || 0) <= 60).length, color: "text-red-600" },
              { label: "60+ days", count: filteredLoans.filter((l) => (l.dpd || 0) > 60).length, color: "text-red-800" },
            ].map((bucket) => (
              <div key={bucket.label} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-500 dark:text-slate-400">{bucket.label}</span>
                <span className={`font-bold ${bucket.color}`}>{bucket.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center — Account cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">Loading overdue accounts...</div>
          ) : filteredLoans.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">No overdue accounts found. 🎉</div>
          ) : (
            filteredLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => setSelectedLoan(selectedLoan?.id === loan.id ? null : loan)}
                className={`bg-white dark:bg-slate-900 p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedLoan?.id === loan.id
                    ? "border-blue-400 dark:border-blue-600 shadow-md"
                    : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getDpdColor(loan.dpd || 0)}`}>
                        DPD: {loan.dpd} Days
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400">#{loan.accountNo}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Borrower #{loan.clientId}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">{loan.loanProductName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Outstanding</p>
                    <p className="text-base font-bold text-red-600 dark:text-red-400">₹{loan.principal.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Expanded interaction panel */}
                {selectedLoan?.id === loan.id && (
                  <div
                    className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-2 space-y-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Previous interactions */}
                    {(history[loan.id] || []).length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase text-gray-400">Interaction History</p>
                        {(history[loan.id] || []).map((h, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-950 rounded-md">
                            <Clock className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] text-gray-700 dark:text-slate-300">{h.note}</p>
                              <p className="text-[9px] text-gray-400">{h.date} · {h.agent}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Log new interaction */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-slate-400 mb-1 block">Log Interaction</label>
                      <textarea
                        rows={2}
                        value={interactionNote}
                        onChange={(e) => setInteractionNote(e.target.value)}
                        className="w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none text-gray-900 dark:text-slate-100 placeholder:text-gray-400"
                        placeholder="Enter call notes, Promise-to-Pay date, field visit outcome..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={logInteraction}
                        disabled={!interactionNote.trim()}
                        className="h-7 px-3 text-[10px] font-bold bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Save Note
                      </button>
                      <button className="h-7 px-3 text-[10px] font-bold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Mark PTP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
