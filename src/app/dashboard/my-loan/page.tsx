import { redirect } from "next/navigation";
import { getMyLoans } from "@/app/actions/loans";
import { CreditCard, AlertCircle } from "lucide-react";

export default async function MyLoanIndexPage() {
  const { data, error } = await getMyLoans();
  const loans = (data as { pageItems?: any[] })?.pageItems || (Array.isArray(data) ? data : []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm text-gray-600 dark:text-slate-400">{error.defaultUserMessage}</p>
      </div>
    );
  }

  if (loans.length === 1) {
    redirect(`/dashboard/my-loan/${loans[0].id}`);
  }

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 p-4 md:p-8 overflow-auto">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">My Loans</h1>
      </div>

      {loans.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-slate-400">You don't have any loan accounts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan: any) => (
            <a
              key={loan.id}
              href={`/dashboard/my-loan/${loan.id}`}
              className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs hover:border-gray-300 dark:hover:border-slate-700 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase text-gray-400">{loan.loanProductName}</p>
              <p className="text-lg font-black text-gray-900 dark:text-slate-100 mt-1">
                ₹{Number(loan.principal || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-mono">#{loan.accountNo}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
