import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Clock, FileWarning, Search, TrendingUp, XCircle, Users } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, office_id")
    .eq("id", user.id)
    .single()

  const role = profile?.role || "loan_officer"

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-y-auto overflow-x-hidden">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome, {profile?.full_name || user.email}</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Here is your daily snapshot across all branches.</p>
        </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* LEFT COLUMN (LOS Matrix + Branch Table) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* LOS Performance Matrix */}
          <Card className="rounded-xl shadow-sm border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                LOS Performance Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
                <PerformanceRow title="Submitted" count={42} amount="₹ 4.2 Cr" color="bg-blue-500" percent={100} icon={<Clock className="w-4 h-4 text-blue-500" />} />
                <PerformanceRow title="Logged" count={28} amount="₹ 2.8 Cr" color="bg-indigo-500" percent={66} icon={<Search className="w-4 h-4 text-indigo-500" />} />
                <PerformanceRow title="Sanctioned" count={15} amount="₹ 1.5 Cr" color="bg-emerald-500" percent={35} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
                <PerformanceRow title="Disbursed" count={8} amount="₹ 80 L" color="bg-teal-500" percent={19} icon={<DollarSignIcon className="w-4 h-4 text-teal-500" />} />
                <PerformanceRow title="Rejected" count={5} amount="₹ 50 L" color="bg-red-500" percent={12} icon={<XCircle className="w-4 h-4 text-red-500" />} />
              </div>
            </CardContent>
          </Card>

          {/* Branch Performance Table */}
          <Card className="rounded-xl shadow-sm border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
                  <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-gray-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">Branch</th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 text-right">FTD (NOS)</th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 text-right">FTD Amount</th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 text-right">FTM (NOS)</th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 text-right">FTM Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                    <BranchRow branch="Mumbai (HO)" ftdNos={3} ftdAmt="₹ 4,50,000" ftmNos={22} ftmAmt="₹ 46,20,000" />
                    <BranchRow branch="Delhi" ftdNos={1} ftdAmt="₹ 15,00,000" ftmNos={21} ftmAmt="₹ 1,68,50,000" />
                    <BranchRow branch="Bangalore" ftdNos={0} ftdAmt="₹ 0" ftmNos={5} ftmAmt="₹ 6,00,000" />
                    <BranchRow branch="Pune" ftdNos={0} ftdAmt="₹ 0" ftmNos={1} ftmAmt="₹ 2,50,000" />
                  </tbody>
                </table>
             </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (Task Center) */}
        <div className="space-y-6">
          
          {/* Command Center */}
          <Card className="rounded-xl shadow-sm border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Task Command Center</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <TaskQueue title="Pendency" count={12} color="bg-orange-500" icon={<Clock className="w-4 h-4 text-orange-600" />} active />
              <TaskQueue title="Deviation" count={3} color="bg-red-500" icon={<FileWarning className="w-4 h-4 text-red-600" />} active />
              <TaskQueue title="Duplicates" count={2} color="bg-blue-500" icon={<Users className="w-4 h-4 text-blue-600" />} active />
              <TaskQueue title="Escalations" count={0} color="bg-gray-400" icon={<AlertCircle className="w-4 h-4 text-gray-400" />} />
              <TaskQueue title="Approvals" count={0} color="bg-gray-400" icon={<CheckCircle2 className="w-4 h-4 text-gray-400" />} />
              <TaskQueue title="Corrections" count={0} color="bg-gray-400" icon={<FileWarning className="w-4 h-4 text-gray-400" />} />
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="rounded-xl shadow-sm border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[300px]">
             <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
               <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Recent Applications</CardTitle>
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50/30 dark:bg-slate-900/50">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <FileTextIcon className="w-6 h-6 text-gray-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No recent applications found.</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-[200px]">You haven't logged any new loan applications today.</p>
                <Link href="/dashboard/applications/new" className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors">
                  Start New Application
                </Link>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

function PerformanceRow({ title, count, amount, color, percent, icon }: { title: string, count: number, amount: string, color: string, percent: number, icon: React.ReactNode }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex items-center gap-4 w-40 shrink-0">
        <div className={`p-1.5 rounded-md bg-gray-100 dark:bg-slate-800`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
      </div>
      
      <div className="flex-1 px-8 hidden md:block">
        <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-8 w-48 shrink-0 text-right">
        <div>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">Volume</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{count}</p>
        </div>
        <div className="w-20">
          <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">Value</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{amount}</p>
        </div>
      </div>
    </div>
  )
}

function BranchRow({ branch, ftdNos, ftdAmt, ftmNos, ftmAmt }: { branch: string, ftdNos: number, ftdAmt: string, ftmNos: number, ftmAmt: string }) {
  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{branch}</td>
      <td className="px-4 py-3 text-sm text-right font-mono">{ftdNos}</td>
      <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-white font-medium">{ftdAmt}</td>
      <td className="px-4 py-3 text-sm text-right font-mono">{ftmNos}</td>
      <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-white font-medium">{ftmAmt}</td>
    </tr>
  )
}

function TaskQueue({ title, count, color, icon, active = false }: { title: string, count: number, color: string, icon: React.ReactNode, active?: boolean }) {
  return (
    <div className={`flex flex-col p-3 rounded-lg border ${active ? 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all' : 'border-dashed border-gray-200 dark:border-slate-800 opacity-60'} `}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">{title}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between mt-auto">
        <span className={`text-2xl font-black ${active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-600'}`}>{count > 0 ? count : '-'}</span>
        {active && count > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}></span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
  )
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
  )
}
