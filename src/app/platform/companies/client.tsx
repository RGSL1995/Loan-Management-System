"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Search, Plus, Building, X, Eye, EyeOff } from "lucide-react"
import { onboardCompany } from "@/app/actions/platform"
import { ROLE_DESCRIPTIONS } from "@/components/ProfileDrawer"
// Removed Next.js 14 useFormState and react-dom useFormStatus as per typical simplified React 18 patterns when 19 isn't guaranteed
// Let's implement a standard async form submission

export type Company = {
  id: string
  name: string
  status: "Active" | "Inactive" | "Suspended"
  createdAt: string
  adminEmail: string
}

const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "id",
    header: "Tenant ID",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] text-gray-500 dark:text-slate-400">{row.getValue("id")}</span>
    )
  },
  {
    accessorKey: "name",
    header: "Company Name",
    cell: ({ row }) => <span className="font-bold text-gray-900 dark:text-slate-100">{row.getValue("name")}</span>
  },
  {
    accessorKey: "adminEmail",
    header: "Tenant Admin Email",
  },
  {
    accessorKey: "createdAt",
    header: "Onboarded Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let colorClass = "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
      if (status === "Active") colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      if (status === "Suspended") colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>
          {status}
        </span>
      )
    },
  },
]

export function PlatformCompaniesClient({ data }: { data: Company[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    
    const formData = new FormData(e.currentTarget)
    const res = await onboardCompany(null, formData)
    
    if (res.success) {
      setMessage("Company onboarded successfully!")
      setTimeout(() => {
        setIsModalOpen(false)
        setMessage("")
      }, 1500)
    } else {
      setMessage(res.message || "An error occurred.")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col h-full relative text-gray-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-8 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Tenant Companies</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage lending institutions using the Finbyx platform.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Onboard Company
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/50 dark:bg-slate-900/50 gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              className="w-full sm:w-64 h-8 pl-9 pr-3 text-sm bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-400">
            <Building className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            {data.length} Total Tenants
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <DataTable columns={columns} data={data} />
        </div>
      </div>

      {/* Onboarding Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-xl w-full max-w-[450px] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
              <h2 className="font-bold text-gray-900 dark:text-slate-100">Onboard New Company</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Company Name</label>
                <input 
                  type="text" 
                  name="companyName" 
                  required
                  placeholder="e.g. Acme Finance"
                  className="h-9 px-3 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-3 py-2">
                <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">Tenant Admin</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-snug mt-0.5">{ROLE_DESCRIPTIONS.tenant_admin}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Tenant Admin Email</label>
                <input 
                  type="email" 
                  name="adminEmail" 
                  required
                  placeholder="admin@company.com"
                  className="h-9 px-3 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Tenant Admin Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="adminPassword" 
                    required
                    placeholder="Minimum 8 characters"
                    className="h-9 w-full px-3 pr-10 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded text-xs font-medium ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="h-10 w-full bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-2"
              >
                {isLoading ? "Provisioning..." : "Onboard Tenant"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
