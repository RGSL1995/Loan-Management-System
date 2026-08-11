"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, Search, Gavel, X, FileText, CheckCircle2, Clock, ChevronDown, ChevronRight } from "lucide-react";

interface NPAAccount {
  id: number;
  accountNo: string;
  clientId: number;
  loanProductName: string;
  principal: number;
  status: string;
  dpd: number;
  npaCategory: "Substandard" | "Doubtful" | "Loss";
  securityType: "Property" | "Gold" | "Shares" | "None";
  lastContactDate: string;
  assignedAgent: string;
}

// Recovery action types
type RecoveryAction = "LEGAL_NOTICE" | "ASSET_VALUATION" | "LIQUIDATION" | "SETTLEMENT" | "WRITE_OFF"

const RECOVERY_STAGE_LABELS: Record<RecoveryAction, string> = {
  LEGAL_NOTICE: "Legal Notice Issued",
  ASSET_VALUATION: "Asset Valuation Ordered",
  LIQUIDATION: "Security Liquidation",
  SETTLEMENT: "OTS / Settlement",
  WRITE_OFF: "Write-off",
}

const NPA_CATEGORY_COLORS: Record<string, string> = {
  Substandard: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300",
  Doubtful: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300",
  Loss: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300",
}

// Mock NPA accounts with enriched data
const MOCK_NPA_ACCOUNTS: NPAAccount[] = [
  {
    id: 3,
    accountNo: "LN-000982",
    clientId: 401,
    loanProductName: "Term Loan (Secured)",
    principal: 15000000,
    status: "ARREARS",
    dpd: 92,
    npaCategory: "Doubtful",
    securityType: "Property",
    lastContactDate: "2026-07-10",
    assignedAgent: "Vikram S.",
  },
  {
    id: 4,
    accountNo: "LN-000541",
    clientId: 318,
    loanProductName: "Working Capital",
    principal: 3200000,
    status: "ARREARS",
    dpd: 180,
    npaCategory: "Loss",
    securityType: "Shares",
    lastContactDate: "2026-06-25",
    assignedAgent: "Priya M.",
  },
]

export default function RecoveryPage() {
  const [data, setData] = useState<NPAAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [actionModal, setActionModal] = useState<{ account: NPAAccount; action: RecoveryAction } | null>(null)
  const [actionLog, setActionLog] = useState<Record<number, { action: RecoveryAction; date: string }[]>>({})
  const [filterCategory, setFilterCategory] = useState<string>("All")

  useEffect(() => {
    // Use our enriched mock data instead of raw Fineract data for Recovery
    setData(MOCK_NPA_ACCOUNTS)
    setLoading(false)
  }, [])

  const filtered = data.filter((a) => {
    const matchSearch = a.accountNo.toLowerCase().includes(search.toLowerCase()) || String(a.clientId).includes(search)
    const matchCat = filterCategory === "All" || a.npaCategory === filterCategory
    return matchSearch && matchCat
  })

  const confirmAction = () => {
    if (!actionModal) return
    const { account, action } = actionModal
    setActionLog((prev) => ({
      ...prev,
      [account.id]: [...(prev[account.id] || []), { action, date: new Date().toISOString().split("T")[0] }],
    }))
    setActionModal(null)
  }

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 })

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400" />
            <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100">NPA Recovery & Liquidation</h1>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-slate-400">
            Manage defaulted accounts, execute pledged security liquidations, and log legal settlements.
          </p>
        </div>
        {/* NPA Summary KPIs */}
        <div className="hidden sm:flex gap-4">
          {[
            { label: "Substandard", count: data.filter((d) => d.npaCategory === "Substandard").length, color: "text-amber-600" },
            { label: "Doubtful", count: data.filter((d) => d.npaCategory === "Doubtful").length, color: "text-orange-600" },
            { label: "Loss", count: data.filter((d) => d.npaCategory === "Loss").length, color: "text-red-600" },
          ].map((kpi) => (
            <div key={kpi.label} className="text-center">
              <p className={`text-lg font-bold font-mono ${kpi.color}`}>{kpi.count}</p>
              <p className="text-[9px] text-gray-400 uppercase font-bold">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shrink-0">
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search NPA account..."
            className="w-full h-7 pl-8 pr-3 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>
        {["All", "Substandard", "Doubtful", "Loss"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`h-7 px-3 text-[10px] font-bold rounded-md border transition-colors ${filterCategory === cat ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"}`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-bold text-red-600 dark:text-red-400">{filtered.length} NPA Cases</span>
      </div>

      {/* Account Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading NPA accounts...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">No NPA accounts found.</div>
        ) : (
          filtered.map((account) => (
            <div
              key={account.id}
              className={`bg-white dark:bg-slate-900 rounded-lg border overflow-hidden transition-all ${expandedId === account.id ? "border-red-300 dark:border-red-800 shadow-md" : "border-gray-200 dark:border-slate-800"}`}
            >
              {/* Card Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === account.id ? null : account.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${account.npaCategory === "Loss" ? "bg-red-600" : account.npaCategory === "Doubtful" ? "bg-orange-500" : "bg-amber-500"}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${NPA_CATEGORY_COLORS[account.npaCategory]}`}>{account.npaCategory}</span>
                      <span className="font-mono text-[11px] text-gray-500 dark:text-slate-400">{account.accountNo}</span>
                      <span className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded font-bold">DPD: {account.dpd}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-900 dark:text-white">{account.loanProductName} • Borrower #{account.clientId}</p>
                    <p className="text-[10px] text-gray-400">Security: {account.securityType} • Agent: {account.assignedAgent}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Outstanding</p>
                    <p className="text-base font-bold font-mono text-red-600 dark:text-red-400">{fmt(account.principal)}</p>
                  </div>
                  {expandedId === account.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Expanded Panel */}
              {expandedId === account.id && (
                <div className="border-t border-gray-100 dark:border-slate-800 p-4 space-y-3">

                  {/* Action history */}
                  {(actionLog[account.id] || []).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Recovery Actions Taken</p>
                      <div className="space-y-1.5">
                        {(actionLog[account.id] || []).map((log, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-950 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                            <span className="text-gray-700 dark:text-slate-300">{RECOVERY_STAGE_LABELS[log.action]}</span>
                            <span className="ml-auto text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{log.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Initiate Recovery Action</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(RECOVERY_STAGE_LABELS) as [RecoveryAction, string][]).map(([action, label]) => (
                        <button
                          key={action}
                          onClick={() => setActionModal({ account, action })}
                          className={`h-7 px-3 text-[10px] font-bold rounded-md border transition-colors flex items-center gap-1 ${
                            action === "WRITE_OFF"
                              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100"
                              : action === "LIQUIDATION"
                              ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100"
                              : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50"
                          }`}
                        >
                          {action === "LIQUIDATION" && <Gavel className="w-3 h-3" />}
                          {action === "WRITE_OFF" && <FileText className="w-3 h-3" />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Confirm: {RECOVERY_STAGE_LABELS[actionModal.action]}
              </h3>
              <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-gray-600 dark:text-slate-400 mb-3">
                You are initiating <strong>{RECOVERY_STAGE_LABELS[actionModal.action]}</strong> on account <strong>{actionModal.account.accountNo}</strong> (Outstanding: {fmt(actionModal.account.principal)}).
              </p>
              {actionModal.action === "WRITE_OFF" && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-3">
                  <p className="text-[11px] text-red-700 dark:text-red-400 font-semibold">⚠ Write-off is irreversible. The debt will be removed from the balance sheet and moved to Off-Balance Sheet tracking.</p>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={() => setActionModal(null)} className="h-8 px-4 text-[11px] font-bold border border-gray-200 dark:border-slate-700 rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
                <button
                  onClick={confirmAction}
                  className={`h-8 px-4 text-[11px] font-bold rounded-md text-white transition-colors ${actionModal.action === "WRITE_OFF" ? "bg-red-700 hover:bg-red-800" : "bg-black dark:bg-white dark:text-black hover:bg-gray-800"}`}
                >
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
