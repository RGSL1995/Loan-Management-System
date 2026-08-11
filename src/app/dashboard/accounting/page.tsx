"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Search, Filter, Plus, FileDown } from "lucide-react"

type JournalEntry = {
  id: string
  date: string
  transactionId: string
  accountName: string
  glCode: string
  type: "Debit" | "Credit"
  amount: number
  status: "Posted" | "Draft" | "Reversed"
}

const columns: ColumnDef<JournalEntry>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "transactionId",
    header: "Txn ID",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] text-gray-500 dark:text-slate-400">{row.getValue("transactionId")}</span>
    )
  },
  {
    accessorKey: "glCode",
    header: "GL Code",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] font-medium text-gray-700 dark:text-slate-300">{row.getValue("glCode")}</span>
    )
  },
  {
    accessorKey: "accountName",
    header: "Account",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-slate-100">{row.getValue("accountName")}</span>
    )
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${type === "Credit" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"}`}>
          {type}
        </span>
      )
    }
  },
  {
    accessorKey: "amount",
    header: "Amount (₹)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(amount)
      return <div className="text-right font-mono text-[11px] font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let colorClass = "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
      if (status === "Posted") colorClass = "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      if (status === "Reversed") colorClass = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>
          {status}
        </span>
      )
    },
  },
]

const data: JournalEntry[] = [
  { id: "1", date: "06 Jul 2026", transactionId: "TXN-88219", glCode: "10001", accountName: "Cash in Bank", type: "Debit", amount: 500000.00, status: "Posted" },
  { id: "2", date: "06 Jul 2026", transactionId: "TXN-88219", glCode: "30010", accountName: "Loan Disbursement", type: "Credit", amount: 500000.00, status: "Posted" },
  { id: "3", date: "05 Jul 2026", transactionId: "TXN-88218", glCode: "40001", accountName: "Interest Income", type: "Credit", amount: 15430.50, status: "Posted" },
  { id: "4", date: "05 Jul 2026", transactionId: "TXN-88218", glCode: "10001", accountName: "Cash in Bank", type: "Debit", amount: 15430.50, status: "Posted" },
  { id: "5", date: "04 Jul 2026", transactionId: "TXN-88217", glCode: "50020", accountName: "Processing Fee", type: "Credit", amount: 5000.00, status: "Draft" },
]

export default function AccountingPage() {
  return (
    <div className="flex flex-col sm:flex-row w-full h-full bg-white dark:bg-slate-950">
      {/* Center Data Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden sm:border-r border-gray-200 dark:border-slate-800">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight">General Ledger (Journal Entries)</h1>
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium hidden sm:inline-block">
              Showing Last 30 Days
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search GL code or TXN..." 
                className="w-full sm:w-56 h-7 pl-8 pr-3 text-[11px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
            <button className="h-7 w-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" title="Export CSV">
              <FileDown className="w-3.5 h-3.5" />
            </button>
            <button className="h-7 px-3 bg-black text-white text-[11px] font-medium rounded flex items-center gap-1.5 hover:bg-gray-800 transition-colors whitespace-nowrap">
              <Plus className="w-3.5 h-3.5" /> Manual Entry
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
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Account Type</label>
            <select className="h-8 px-2 text-[11px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-gray-400 dark:focus:border-slate-500 w-full">
              <option>All Accounts</option>
              <option>Asset (1xxxx)</option>
              <option>Liability (2xxxx)</option>
              <option>Equity (3xxxx)</option>
              <option>Revenue (4xxxx)</option>
              <option>Expense (5xxxx)</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Transaction Date</label>
            <div className="flex items-center gap-2">
              <input type="date" className="flex-1 w-full h-8 px-2 text-[10px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-gray-400 dark:focus:border-slate-500" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Status</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" defaultChecked /> Posted
              </label>
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" defaultChecked /> Draft
              </label>
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" /> Reversed
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
