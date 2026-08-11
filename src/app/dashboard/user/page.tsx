import { LogoutButton } from "@/app/components/LogoutButton";
import { CreditCard, Wallet, Calendar, FileText, ArrowRight, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default async function UserDashboard() {
  // Bypassing auth for now: using mock data instead of Supabase
  const user = { email: "finance@stark.com" };

  const loans = [
    { id: "L-8829", type: "Working Capital", amount: "$150,000", rate: "6.5%", nextPayment: "2026-07-15", status: "active" },
    { id: "L-8830", type: "Equipment Finance", amount: "$85,000", rate: "7.2%", nextPayment: "2026-07-20", status: "active" },
  ];

  const transactions = [
    { id: "TX-1", desc: "Monthly Repayment (L-8829)", amount: "$4,500", date: "2026-06-15", type: "debit" },
    { id: "TX-2", desc: "Loan Disbursement (L-8830)", amount: "$85,000", date: "2026-06-10", type: "credit" },
    { id: "TX-3", desc: "Monthly Repayment (L-8829)", amount: "$4,500", date: "2026-05-15", type: "debit" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-black dark:bg-slate-800 flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Client Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-slate-400 hidden sm:block">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Welcome back, Stark Industries</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Here's an overview of your current loan facilities.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              New Application
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Top Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="p-6 bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Outstanding Balance</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">$235,000</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Available Credit</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">$765,000</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">of $1.0M Limit</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Next Payment Due</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">$4,500</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">Due in 13 days (Jul 15)</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            
            {/* Left Column: Active Loans */}
            <div className="w-full lg:w-2/3 space-y-8">
              <div className="p-6 bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                    Active Facilities
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 rounded-t-lg">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Facility ID</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Type</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Principal</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Rate</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Next Payment</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                      {loans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100 whitespace-nowrap">{loan.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">{loan.type}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100 whitespace-nowrap">{loan.amount}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">{loan.rate}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">{loan.nextPayment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Recent Transactions */}
            <div className="w-full lg:w-1/3">
              <div className="p-6 bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-100 dark:border-slate-800 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                    Recent Activity
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>
                          {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{tx.desc}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-slate-100'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-8 px-4 py-2 text-sm font-medium text-black dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  View All Statements
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
