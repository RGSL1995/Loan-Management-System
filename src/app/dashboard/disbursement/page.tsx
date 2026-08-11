"use client";

import { useEffect, useState, useTransition } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Layers, Search, Loader2, X, CheckCircle2, Calendar, CreditCard, Building } from "lucide-react";
import { disburseLoan } from "@/app/actions/loans";

interface Application {
  id: number;
  accountNo: string;
  clientId: number;
  loanProductName: string;
  principal: number;
  status: string;
  disbursed?: boolean;
  submittedOnDate: string;
}

// Generates a mock EMI schedule for preview
function generateEmiSchedule(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 12 / 100;
  const emi = monthlyRate > 0
    ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : principal / months;

  const schedule = [];
  let balance = principal;
  const startDate = new Date();

  for (let i = 1; i <= Math.min(months, 6); i++) {
    const interest = balance * monthlyRate;
    const principalPart = emi - interest;
    balance -= principalPart;
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i);

    schedule.push({
      period: i,
      dueDate: dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      principal: Math.max(0, principalPart),
      interest,
      emi,
      balance: Math.max(0, balance),
    });
  }
  return { schedule, emi };
}

const STATUS_BADGES: Record<string, { label: string; classes: string }> = {
  APPROVED: { label: "Pledge Verified — Ready for Payout", classes: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
  ACTIVE: { label: "Disbursed", classes: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  SUBMITTED_AND_PENDING_APPROVAL: { label: "Pending Approval", classes: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  REJECTED: { label: "Rejected", classes: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
};

function buildColumns(
  disbursingId: number | null,
  onOpenDrawer: (loan: Application) => void
): ColumnDef<Application>[] {
  return [
    {
      accessorKey: "accountNo",
      header: "Loan Account #",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-gray-900 dark:text-slate-100">
          {row.getValue("accountNo")}
        </span>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Borrower ID",
      cell: ({ row }) => <span className="text-[11px] text-gray-500">#{row.getValue("clientId")}</span>,
    },
    {
      accessorKey: "loanProductName",
      header: "Facility",
      cell: ({ row }) => <span className="text-[11px] font-semibold">{row.getValue("loanProductName")}</span>,
    },
    {
      accessorKey: "principal",
      header: "Sanctioned Amount (₹)",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("principal"));
        return <div className="font-mono text-xs font-bold">₹{amount.toLocaleString("en-IN")}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Disbursement Stage",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const badge = STATUS_BADGES[status] || { label: status, classes: "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300" };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.classes}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const loan = row.original;
        if (loan.status !== "APPROVED") {
          return <span className="text-[10px] text-gray-400">—</span>;
        }
        const isBusy = disbursingId === loan.id;
        return (
          <button
            disabled={isBusy}
            onClick={() => onOpenDrawer(loan)}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1"
          >
            {isBusy && <Loader2 className="w-3 h-3 animate-spin" />}
            {isBusy ? "Disbursing..." : "Review & Disburse"}
          </button>
        );
      },
    },
  ];
}

export default function DisbursementPage() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Application | null>(null);
  const [disbursementDate, setDisbursementDate] = useState(new Date().toISOString().split("T")[0]);
  const [bankAccount, setBankAccount] = useState("");
  const [isPending, startTransition] = useTransition();
  const [disbursingId, setDisbursingId] = useState<number | null>(null);

  const loadLoans = () => {
    setLoading(true);
    fetch("/api/fineract/loans")
      .then((res) => res.json())
      .then((json) => {
        setData(json.pageItems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleDisburse = () => {
    if (!selectedLoan) return;

    startTransition(async () => {
      setDisbursingId(selectedLoan.id);
      const result = await disburseLoan(selectedLoan.id, {
        actualDisbursementDate: disbursementDate,
        transactionAmount: selectedLoan.principal,
      });
      setDisbursingId(null);

      if (result.error) {
        setError(result.error.defaultUserMessage || "Failed to disburse loan.");
        return;
      }
      setSelectedLoan(null);
      loadLoans();
    });
  };

  const emiData = selectedLoan
    ? generateEmiSchedule(selectedLoan.principal, 10.5, 24)
    : null;

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100">Disbursement & Pledge Operations</h1>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-slate-400">
            Register security pledges, configure NACH mandates, and release loan disbursements.
          </p>
        </div>
        <span className="text-[11px] font-bold text-gray-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md">
          {data.filter((loan) => loan.status === "APPROVED").length} Ready for Payout
        </span>
      </div>

      {/* Search bar */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Search by loan account..." className="w-full h-7 pl-8 pr-3 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded outline-none" />
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border-b border-red-100 shrink-0">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-950">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading disbursement queue...</div>
        ) : (
          <DataTable columns={buildColumns(disbursingId, setSelectedLoan)} data={data} />
        )}
      </div>

      {/* === Disbursement Confirmation Drawer === */}
      {selectedLoan && (
        <>
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/50 z-10"
            onClick={() => setSelectedLoan(null)}
          />

          {/* Slide-out Drawer */}
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl z-20 flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="h-12 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 bg-gray-50 dark:bg-slate-800/50">
              <h2 className="text-xs font-bold text-gray-900 dark:text-slate-100">
                Review & Disburse — {selectedLoan.accountNo}
              </h2>
              <button onClick={() => setSelectedLoan(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Loan Summary */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-slate-950 rounded-md border border-gray-200 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Product</p>
                  <p className="text-[11px] font-semibold text-gray-900 dark:text-white">{selectedLoan.loanProductName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Sanctioned Amount</p>
                  <p className="text-[11px] font-bold text-green-600 dark:text-green-400">₹{selectedLoan.principal.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Borrower ID</p>
                  <p className="text-[11px] font-semibold text-gray-900 dark:text-white">#{selectedLoan.clientId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Status</p>
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">APPROVED</p>
                </div>
              </div>

              {/* Bank Account Entry */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> Disbursement Details
                </h3>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Borrower Bank Account No.</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="e.g. HDFC0012345678"
                    className="mt-1 w-full h-8 px-2 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Disbursement Date</label>
                  <input
                    type="date"
                    value={disbursementDate}
                    onChange={(e) => setDisbursementDate(e.target.value)}
                    className="mt-1 w-full h-8 px-2 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>
              </div>

              {/* EMI Schedule Preview */}
              {emiData && (
                <div>
                  <h3 className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Calendar className="w-3.5 h-3.5" /> Repayment Schedule Preview
                    <span className="text-[9px] text-gray-400 normal-case font-normal ml-1">(First 6 EMIs)</span>
                  </h3>
                  <div className="rounded-md border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                          <th className="px-2 py-1.5 text-left font-bold">#</th>
                          <th className="px-2 py-1.5 text-left font-bold">Due Date</th>
                          <th className="px-2 py-1.5 text-right font-bold">EMI (₹)</th>
                          <th className="px-2 py-1.5 text-right font-bold">Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emiData.schedule.map((row) => (
                          <tr key={row.period} className="border-t border-gray-100 dark:border-slate-800">
                            <td className="px-2 py-1.5 text-gray-500">{row.period}</td>
                            <td className="px-2 py-1.5 text-gray-700 dark:text-slate-300">{row.dueDate}</td>
                            <td className="px-2 py-1.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                              ₹{Math.round(row.emi).toLocaleString("en-IN")}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono text-gray-500 dark:text-slate-400">
                              ₹{Math.round(row.balance).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                          <td colSpan={2} className="px-2 py-1.5 text-[10px] font-bold text-gray-600 dark:text-slate-300">Monthly EMI</td>
                          <td colSpan={2} className="px-2 py-1.5 text-right font-mono font-bold text-green-700 dark:text-green-400 text-[11px]">
                            ₹{Math.round(emiData.emi).toLocaleString("en-IN")} / mo
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer — Action Buttons */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 shrink-0 grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedLoan(null)}
                className="h-8 text-[11px] font-bold border border-gray-200 dark:border-slate-700 rounded-md text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisburse}
                disabled={isPending}
                className="h-8 text-[11px] font-bold bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Confirm Disbursement
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
