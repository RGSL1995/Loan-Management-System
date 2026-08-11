"use client"

import { useState, useMemo, useEffect, useTransition } from "react"
import { ArrowLeft, CreditCard, CalendarDays, History, AlertTriangle, CheckCircle2, Loader2, Receipt, TrendingDown } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// --- Types ---
interface Loan {
  id: number;
  accountNo: string;
  clientId: number;
  loanProductName: string;
  principal: number;
  approvedPrincipal: number;
  interestRatePerPeriod: number;
  numberOfRepayments: number;
  status: string;
  disbursed: boolean;
  actualDisbursementDate: string | null;
}

// Mock ledger entries (simulating posted repayments for the session)
const INITIAL_LEDGER: { date: string; amount: number; type: string; balance: number }[] = []

type TabKey = "schedule" | "repayments" | "overview"

export default function LoanAccountDetailPage() {
  const params = useParams()
  const accountId = params.id as string

  const [activeTab, setActiveTab] = useState<TabKey>("schedule")
  const [loan, setLoan] = useState<Loan | null>(null)
  const [loading, setLoading] = useState(true)

  // Repayment form state
  const [repayAmount, setRepayAmount] = useState("")
  const [repayDate, setRepayDate] = useState(new Date().toISOString().split("T")[0])
  const [ledger, setLedger] = useState(INITIAL_LEDGER)
  const [isPosting, startTransition] = useTransition()
  const [npaModalOpen, setNpaModalOpen] = useState(false)

  useEffect(() => {
    // Fetch specific loan by ID from the mock proxy
    fetch(`/api/fineract/loans/${accountId}`)
      .then((r) => r.json())
      .then((data) => {
        // If the API returns a single loan object (not wrapped in pageItems)
        if (data && data.id) {
          setLoan(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [accountId])

  // Use actual loan data or fallback to defaults for calculations
  const principal = loan?.approvedPrincipal || loan?.principal || 2000000
  const rate = loan?.interestRatePerPeriod || 10.5
  const tenure = loan?.numberOfRepayments || 60

  const fmt = (x: number) => '₹' + x.toLocaleString('en-IN', { maximumFractionDigits: 0 })
  const round2 = (x: number) => Math.round(x * 100) / 100

  // Full amortization schedule
  const scheduleData = useMemo(() => {
    const rm = rate / 12 / 100
    let emi = 0
    if (rm > 0) {
      emi = round2(principal * rm * Math.pow(1 + rm, tenure) / (Math.pow(1 + rm, tenure) - 1))
    } else {
      emi = round2(principal / tenure)
    }
    let bal = principal
    let ti = 0
    const rows = []
    for (let i = 1; i <= tenure; i++) {
      const interest = round2(bal * rm)
      let pr, pay
      if (i === tenure) { pr = round2(bal); pay = round2(pr + interest) }
      else { pr = round2(emi - interest); pay = emi }
      bal = round2(bal - pr)
      ti += interest
      rows.push({ installment: i, emi: pay, principal: pr, interest, balance: Math.max(bal, 0) })
    }
    return { emi, totalInterest: round2(ti), totalPayment: round2(principal + ti), rows }
  }, [principal, rate, tenure])

  // Truncated display rows
  const displayRows = useMemo(() => {
    if (scheduleData.rows.length <= 10) return scheduleData.rows
    return [
      ...scheduleData.rows.slice(0, 6),
      { installment: "…", emi: null, principal: null, interest: null, balance: null },
      ...scheduleData.rows.slice(-2),
    ]
  }, [scheduleData.rows])

  // Outstanding balance after ledger repayments
  const totalRepaid = ledger.reduce((s, e) => s + e.amount, 0)
  const outstandingBalance = Math.max(0, principal - totalRepaid)

  const handlePostRepayment = () => {
    const amt = parseFloat(repayAmount)
    if (isNaN(amt) || amt <= 0) return
    startTransition(() => {
      setLedger((prev) => [
        ...prev,
        {
          date: repayDate,
          amount: amt,
          type: "EMI Payment",
          balance: Math.max(0, outstandingBalance - amt),
        },
      ])
      setRepayAmount("")
    })
  }

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <TrendingDown className="w-3.5 h-3.5" /> },
    { key: "schedule", label: "EMI Schedule", icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { key: "repayments", label: "Post Repayment", icon: <Receipt className="w-3.5 h-3.5" /> },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounts" className="text-gray-400 dark:text-slate-500 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">
                {loan?.accountNo || `LN-00${accountId}`}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${loan?.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-amber-100 text-amber-700"}`}>
                {loan?.status || "Active"}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-mono">
              {loan?.loanProductName || "Term Loan"} • Borrower #{loan?.clientId || accountId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/loans/${accountId}/closure`}>
            <button className="h-7 px-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-[10px] font-bold rounded flex items-center gap-1 hover:bg-gray-50">
              <CheckCircle2 className="w-3 h-3" /> Close Loan
            </button>
          </Link>
          <button
            onClick={() => setNpaModalOpen(true)}
            className="h-7 px-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-[10px] font-bold rounded flex items-center gap-1 hover:bg-red-100"
          >
            <AlertTriangle className="w-3 h-3" /> Mark NPA
          </button>
        </div>
      </div>

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        {[
          { label: "Principal", value: fmt(principal), color: "text-gray-900 dark:text-slate-100" },
          { label: "Monthly EMI", value: fmt(scheduleData.emi), color: "text-blue-700 dark:text-blue-400" },
          { label: "Outstanding", value: fmt(outstandingBalance), color: outstandingBalance > 0 ? "text-amber-700 dark:text-amber-400" : "text-green-600" },
          { label: "Total Repaid", value: fmt(totalRepaid), color: "text-green-700 dark:text-green-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-3 border-r border-gray-100 dark:border-slate-800 last:border-r-0">
            <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">{kpi.label}</p>
            <p className={`text-sm font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">

        {/* === OVERVIEW TAB === */}
        {activeTab === "overview" && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400">Loan Details</h3>
              {[
                { label: "Account No.", value: loan?.accountNo || `LN-00${accountId}` },
                { label: "Product", value: loan?.loanProductName || "Term Loan" },
                { label: "Sanctioned Amount", value: fmt(principal) },
                { label: "Interest Rate", value: `${rate}% p.a.` },
                { label: "Tenure", value: `${tenure} months` },
                { label: "Disbursement Date", value: loan?.actualDisbursementDate || "—" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[11px]">
                  <span className="text-gray-500 dark:text-slate-400">{row.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400">Repayment Summary</h3>
              {[
                { label: "Total Payable", value: fmt(scheduleData.totalPayment), color: "" },
                { label: "Total Interest", value: fmt(scheduleData.totalInterest), color: "text-amber-600" },
                { label: "Total Repaid", value: fmt(totalRepaid), color: "text-green-600" },
                { label: "Outstanding Balance", value: fmt(outstandingBalance), color: "text-red-600" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[11px]">
                  <span className="text-gray-500 dark:text-slate-400">{row.label}</span>
                  <span className={`font-bold font-mono ${row.color || "text-gray-900 dark:text-slate-100"}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === EMI SCHEDULE TAB === */}
        {activeTab === "schedule" && (
          <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-slate-900 sticky top-0 border-b border-gray-200 dark:border-slate-800 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-16 text-center">#</th>
                <th className="px-4 py-3 text-right">EMI (₹)</th>
                <th className="px-4 py-3 text-right">Principal (₹)</th>
                <th className="px-4 py-3 text-right">Interest (₹)</th>
                <th className="px-4 py-3 text-right bg-blue-50/30 dark:bg-slate-800">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {displayRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-2 text-center font-mono text-[11px] text-gray-400">{row.installment}</td>
                  <td className="px-4 py-2 text-right font-mono text-[11px] font-medium text-gray-900 dark:text-slate-100">{row.emi !== null ? fmt(row.emi as number) : ''}</td>
                  <td className="px-4 py-2 text-right font-mono text-[11px] text-gray-600 dark:text-slate-300">{row.principal !== null ? fmt(row.principal as number) : ''}</td>
                  <td className="px-4 py-2 text-right font-mono text-[11px] text-gray-600 dark:text-slate-300">{row.interest !== null ? fmt(row.interest as number) : ''}</td>
                  <td className="px-4 py-2 text-right font-mono text-[11px] font-bold text-gray-900 dark:text-slate-100 bg-blue-50/30 dark:bg-slate-800">{row.balance !== null ? fmt(row.balance as number) : ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                <td colSpan={4} className="px-4 py-2 text-[11px] font-bold text-gray-700 dark:text-slate-300">Total Payment</td>
                <td className="px-4 py-2 text-right font-mono text-[11px] font-bold text-blue-700 dark:text-blue-400">{fmt(scheduleData.totalPayment)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* === POST REPAYMENT TAB === */}
        {activeTab === "repayments" && (
          <div className="p-4 max-w-2xl space-y-4">

            {/* Repayment entry form */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
              <h3 className="text-[11px] font-bold uppercase text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Post a Repayment
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder={`e.g. ${Math.round(scheduleData.emi)}`}
                    className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={repayDate}
                    onChange={(e) => setRepayDate(e.target.value)}
                    className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400">Outstanding: <span className="font-bold text-amber-600">{fmt(outstandingBalance)}</span></p>
                <button
                  onClick={handlePostRepayment}
                  disabled={isPosting || !repayAmount}
                  className="h-7 px-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded flex items-center gap-1.5 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {isPosting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  Post Repayment
                </button>
              </div>
            </div>

            {/* Ledger history */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-[11px] font-bold uppercase text-gray-700 dark:text-slate-300">Transaction Ledger</h3>
              </div>
              {ledger.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-gray-400">No repayments posted yet for this session.</div>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                      <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase text-[10px]">Date</th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase text-[10px]">Type</th>
                      <th className="px-3 py-2 text-right font-bold text-gray-500 uppercase text-[10px]">Amount (₹)</th>
                      <th className="px-3 py-2 text-right font-bold text-gray-500 uppercase text-[10px]">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                    {ledger.map((entry, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 text-gray-600 dark:text-slate-400">{entry.date}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-slate-300">{entry.type}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-green-700 dark:text-green-400">{fmt(entry.amount)}</td>
                        <td className="px-3 py-2 text-right font-mono text-gray-600 dark:text-slate-400">{fmt(entry.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NPA Confirmation Modal */}
      {npaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden">
            <div className="p-4 border-b border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
              <h3 className="text-sm font-bold text-red-900 dark:text-red-300">Mark as NPA?</h3>
              <p className="text-[11px] text-red-700 dark:text-red-400 mt-1">
                This will flag the account as a Non-Performing Asset and move it to the Recovery queue. This action cannot be undone from this screen.
              </p>
            </div>
            <div className="p-4 flex gap-2 justify-end">
              <button onClick={() => setNpaModalOpen(false)} className="h-8 px-4 text-[11px] font-bold border border-gray-200 dark:border-slate-700 rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => setNpaModalOpen(false)} className="h-8 px-4 text-[11px] font-bold bg-red-700 hover:bg-red-800 text-white rounded-md transition-colors">Confirm NPA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
