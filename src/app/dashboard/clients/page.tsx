import { Search, Filter, UserPlus, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { proxyToFineract } from "@/lib/fineract/proxy"
import { ClientsTable, type Client } from "./clients-table"

export default async function ClientsPage() {
  // Fetch mock (or real) data from Fineract through our Proxy
  const { data: rawResult } = await proxyToFineract("clients", "GET");
  const rawClients = (rawResult as any)?.pageItems || [];

  // Transform Fineract OpenAPI schema into UI model.
  // Handles both the real Fineract shape (status.value, activationDate as
  // [y, m, d]) and the flatter mock-proxy shape (status as a plain string,
  // activationDate as an ISO date string).
  const data: Client[] = Array.isArray(rawClients) ? rawClients.map((p: any) => {
    let activationStr = "Pending";
    if (p.activationDate) {
      if (Array.isArray(p.activationDate)) {
        activationStr = new Date(p.activationDate[0], p.activationDate[1] - 1, p.activationDate[2]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } else {
        activationStr = new Date(p.activationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }

    const statusValue = (typeof p.status === "string" ? p.status : p.status?.value || "").toUpperCase();

    return {
      id: p.id.toString(),
      clientName: p.displayName || p.fullname || [p.firstname, p.lastname].filter(Boolean).join(" ") || "Unknown Client",
      accountNo: p.accountNo || p.id.toString(),
      branch: p.officeName || "HQ",
      status: statusValue === "ACTIVE" ? "Active" : statusValue === "PENDING" ? "Pending" : "Closed",
      activationDate: activationStr,
      loanCycle: 1 // Default or calculate based on loans
    }
  }) : [];
  return (
    <div className="flex w-full h-full bg-white dark:bg-slate-950">
      {/* Center Data Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-slate-800">
        {/* Toolbar */}
        <div className="h-12 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight">Clients Directory</h1>
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
                Total: {data.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                className="w-56 h-7 pl-8 pr-3 text-[11px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
            <button className="h-7 w-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" title="Export Data">
              <Download className="w-3.5 h-3.5" />
            </button>
            <Link href="/dashboard/clients/new">
              <button className="h-7 px-3 bg-black text-white text-[11px] font-medium rounded flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
                <UserPlus className="w-3.5 h-3.5" /> New Client
              </button>
            </Link>
          </div>
        </div>
        
        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-gray-50/20 dark:bg-slate-950/20">
          <ClientsTable data={data} />
        </div>
      </div>

      {/* Right Sidebar (Filters & Actions) - fixed width w-72 */}
      <div className="w-72 bg-gray-50 dark:bg-slate-900 flex flex-col h-full shrink-0">
        <div className="h-12 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
            <Filter className="w-4 h-4" /> Filters
          </div>
        </div>
        
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Branch Office</label>
            <select className="h-8 px-2 text-[11px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-gray-400 dark:focus:border-slate-500">
              <option>All Branches</option>
              <option>Global HQ</option>
              <option>New York Branch</option>
              <option>London Branch</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Status</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" defaultChecked /> Active
              </label>
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" defaultChecked /> Pending
              </label>
              <label className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800" /> Closed
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Activation Date Range</label>
            <div className="flex items-center gap-2">
              <input type="date" className="flex-1 h-8 px-2 text-[10px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-gray-400 dark:focus:border-slate-500" />
              <span className="text-gray-400 text-xs">to</span>
              <input type="date" className="flex-1 h-8 px-2 text-[10px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-gray-400 dark:focus:border-slate-500" />
            </div>
          </div>

          <button className="h-8 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-[11px] font-medium rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}
