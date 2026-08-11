"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Search, Filter, Plus, FileDown, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Account = {
  id: string
  accountNo: string
  clientName: string
  product: string
  principal: number
  outstanding: number
  status: "Active" | "Arrears" | "Closed"
  dpd: number
}

const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "accountNo",
    header: "Account #",
    cell: ({ row }) => (
      <Link href={`/dashboard/accounts/${row.original.id}`} className="font-mono text-[10px] text-blue-600 dark:text-blue-400 hover:underline">
        {row.getValue("accountNo")}
      </Link>
    )
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
    cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-slate-100">{row.getValue("clientName")}</span>
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => <span className="text-[11px] text-gray-600 dark:text-slate-400">{row.getValue("product")}</span>
  },
  {
    accessorKey: "principal",
    header: "Principal (₹)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("principal"))
      const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
      return <div className="text-right font-mono text-[11px]">{formatted}</div>
    },
  },
  {
    accessorKey: "outstanding",
    header: "Outstanding (₹)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("outstanding"))
      const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
      return <div className="text-right font-mono text-[11px] font-bold text-gray-900 dark:text-slate-100">{formatted}</div>
    },
  },
  {
    accessorKey: "dpd",
    header: "DPD",
    cell: ({ row }) => {
      const dpd = row.getValue("dpd") as number
      let colorClass = "text-gray-500 dark:text-slate-400"
      if (dpd > 0 && dpd <= 30) colorClass = "text-yellow-600 dark:text-yellow-400 font-bold"
      if (dpd > 30) colorClass = "text-red-600 dark:text-red-400 font-bold"
      
      return <span className={`text-[11px] ${colorClass}`}>{dpd === 0 ? "-" : dpd}</span>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let colorClass = "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
      if (status === "Active") colorClass = "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      if (status === "Arrears") colorClass = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>
          {status}
        </span>
      )
    },
  },
]

const data: Account[] = [
  { id: "1", accountNo: "LN-001029", clientName: "Acme Corp Ltd", product: "Term Loan (Secured)", principal: 5000000, outstanding: 4250000, status: "Active", dpd: 0 },
  { id: "2", accountNo: "LN-001030", clientName: "Sarah Jenkins", product: "Personal Loan", principal: 250000, outstanding: 250000, status: "Active", dpd: 0 },
  { id: "3", accountNo: "LN-001031", clientName: "Global Trade LLC", product: "Working Capital", principal: 10000000, outstanding: 10500000, status: "Arrears", dpd: 45 },
  { id: "4", accountNo: "LN-000982", clientName: "Robert Chen", product: "Term Loan (Secured)", principal: 1500000, outstanding: 0, status: "Closed", dpd: 0 },
]

export default function AccountsPage() {
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
              <h1 className="text-sm font-bold tracking-tight">Loan Accounts</h1>
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium hidden sm:inline-block">
                Total: {data.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Account No..." 
                className="w-full sm:w-56 h-7 pl-8 pr-3 text-[11px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
            <button className="h-7 w-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" title="Export CSV">
              <FileDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        {/* Table Area */}
        <div className="flex-1 overflow-x-auto bg-gray-50/20 dark:bg-slate-950/20">
          <DataTable columns={columns} data={data} />
        </div>
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
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Product Type</label>
            <select className="h-8 px-2 text-[11px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-gray-400 dark:focus:border-slate-500 w-full">
              <option>All Products</option>
              <option>Term Loan (Secured)</option>
              <option>Working Capital</option>
              <option>Personal Loan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Status</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" defaultChecked /> Active
              </label>
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" defaultChecked /> Arrears
              </label>
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" /> Closed
              </label>
            </div>
          </div>

          <button className="h-8 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-[11px] font-medium rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
