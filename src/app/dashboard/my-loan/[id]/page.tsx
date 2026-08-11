import Link from "next/link";
import { ArrowLeft, IndianRupee, Calendar, ShieldCheck, AlertCircle } from "lucide-react";
import { getMyLoans } from "@/app/actions/loans";

// Mock amortization schedule — the borrower's servicing data isn't backed
// by a live Fineract schedule endpoint yet (same stubbing approach as the
// staff-facing loan servicing page).
const mockSchedule = [
  { emiNo: 1, date: "2026-08-01", principal: 3958.33, interest: 625.0, total: 4583.33, status: "Paid" },
  { emiNo: 2, date: "2026-09-01", principal: 4007.81, interest: 575.52, total: 4583.33, status: "Paid" },
  { emiNo: 3, date: "2026-10-01", principal: 4057.91, interest: 525.42, total: 4583.33, status: "Pending" },
  { emiNo: 4, date: "2026-11-01", principal: 4108.63, interest: 474.7, total: 4583.33, status: "Pending" },
  { emiNo: 5, date: "2026-12-01", principal: 4159.99, interest: 423.34, total: 4583.33, status: "Pending" },
];

export default async function MyLoanDetailPage({ params }: { params: { id: string } }) {
  const { data, error } = await getMyLoans();
  const loans = (data as { pageItems?: any[] })?.pageItems || (Array.isArray(data) ? data : []);
  const loan = loans.find((l: any) => String(l.id) === params.id);

  if (error || !loan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm text-gray-600 dark:text-slate-400">
          {error?.defaultUserMessage || "This loan isn't linked to your account."}
        </p>
        <Link href="/dashboard/my-loan" className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 hover:underline">
          Back to my loans
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shrink-0 flex items-center gap-3">
        <Link href="/dashboard/my-loan" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">{loan.loanProductName}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-mono">#{loan.accountNo}</p>
        </div>
      </div>

      <div className="p-4 md:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-gray-400">Principal Amount</span>
            <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-2">
              ₹{Number(loan.principal || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-gray-400">Interest Rate</span>
            <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-2">{loan.interestRatePerPeriod}% p.a.</p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-gray-400">Status</span>
            <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-2 capitalize">
              {String(loan.status || "").replace(/_/g, " ").toLowerCase()}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100">Amortization Schedule</h2>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              <IndianRupee className="w-3.5 h-3.5" /> Make Payment
            </button>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-slate-400">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">EMI #</th>
                <th className="text-left px-4 py-2 font-semibold">Due Date</th>
                <th className="text-right px-4 py-2 font-semibold">Principal</th>
                <th className="text-right px-4 py-2 font-semibold">Interest</th>
                <th className="text-right px-4 py-2 font-semibold">Total</th>
                <th className="text-right px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockSchedule.map((row) => (
                <tr key={row.emiNo} className="border-t border-gray-100 dark:border-slate-800">
                  <td className="px-4 py-2 font-mono">{row.emiNo}</td>
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2 text-right font-mono">₹{row.principal.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2 text-right font-mono">₹{row.interest.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2 text-right font-mono font-bold">₹{row.total.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.status === "Paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100">Pledged Collateral & Statements</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Statement downloads and pledged security details will appear here once your loan documents are generated.
          </p>
        </div>
      </div>
    </div>
  );
}
