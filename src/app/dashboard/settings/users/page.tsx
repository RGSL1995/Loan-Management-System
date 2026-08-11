"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Search, Filter, Plus } from "lucide-react"

type User = {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  office: string
  role: string
  status: "Active" | "Inactive"
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "office",
    header: "Office",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return (
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-[10px] font-medium text-gray-700 dark:text-slate-300">
          {row.getValue("role")}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
          status === "Active" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50" : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50"
        }`}>
          {status}
        </span>
      )
    },
  },
]

const data: User[] = [
  { id: "1", username: "finbyx.admin", firstName: "Finbyx", lastName: "Admin", email: "admin@finbyx.com", office: "Global HQ", role: "Super Admin", status: "Active" },
  { id: "2", username: "john.doe", firstName: "John", lastName: "Doe", email: "john@finbyx.com", office: "New York Branch", role: "Branch Manager", status: "Active" },
  { id: "3", username: "jane.smith", firstName: "Jane", lastName: "Smith", email: "jane@finbyx.com", office: "New York Branch", role: "Loan Officer", status: "Active" },
  { id: "4", username: "robert.c", firstName: "Robert", lastName: "Chen", email: "robert@finbyx.com", office: "London Branch", role: "Credit Analyst", status: "Inactive" },
  { id: "5", username: "sarah.j", firstName: "Sarah", lastName: "Jenkins", email: "sarah@finbyx.com", office: "Global HQ", role: "Auditor", status: "Active" },
]

export default function UsersSettingsPage() {
  return (
    <div className="flex w-full h-full bg-white dark:bg-slate-900">
      {/* Center Data Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-slate-800">
        {/* Toolbar */}
        <div className="h-12 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight dark:text-slate-100">System Users</h1>
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
              Total: {data.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-48 h-7 pl-8 pr-3 text-[11px] bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
            <button className="h-7 px-3 bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium rounded flex items-center gap-1.5 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New User
            </button>
          </div>
        </div>
        
        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <DataTable columns={columns} data={data} />
        </div>
      </div>

      {/* Right Sidebar (Filters & Actions) - fixed width w-72 */}
      <div className="w-72 bg-gray-50 dark:bg-slate-950 flex flex-col h-full shrink-0">
        <div className="h-12 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
            <Filter className="w-4 h-4" /> Filters
          </div>
        </div>
        
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Office</label>
            <select className="h-8 px-2 text-[11px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded outline-none focus:border-gray-400 dark:focus:border-slate-500">
              <option>All Offices</option>
              <option>Global HQ</option>
              <option>New York Branch</option>
              <option>London Branch</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Role</label>
            <select className="h-8 px-2 text-[11px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded outline-none focus:border-gray-400 dark:focus:border-slate-500">
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Branch Manager</option>
              <option>Loan Officer</option>
              <option>Credit Analyst</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-700 dark:text-slate-300">Status</label>
            <select className="h-8 px-2 text-[11px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded outline-none focus:border-gray-400 dark:focus:border-slate-500">
              <option>Any Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <button className="h-8 w-full mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-[11px] font-medium rounded hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}
