"use client"

import { useState, useTransition } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { UserCog } from "lucide-react"
import { provisionBorrowerAccess } from "@/app/actions/clients"

export type Client = {
  id: string
  clientName: string
  accountNo: string
  branch: string
  status: "Active" | "Pending" | "Closed"
  activationDate: string
  loanCycle: number
}

export function GrantPortalAccess({ client }: { client: Client }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleGrant = () => {
    if (!email) return
    setMessage(null)
    startTransition(async () => {
      const result = await provisionBorrowerAccess(Number(client.id), client.clientName, email)
      if (result.success) {
        setMessage(result.message)
      } else {
        setMessage(result.error || "Failed to grant portal access.")
      }
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
        title="Grant borrower portal access"
      >
        <UserCog className="w-3.5 h-3.5" /> Portal Access
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg z-20 p-3 flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-gray-600 dark:text-slate-300">Borrower login email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
            className="h-7 px-2 text-[11px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-gray-400"
          />
          <button
            onClick={handleGrant}
            disabled={isPending || !email}
            className="h-7 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded disabled:opacity-60"
          >
            {isPending ? "Granting..." : "Grant Access"}
          </button>
          {message && <p className="text-[10px] text-gray-500 dark:text-slate-400">{message}</p>}
        </div>
      )}
    </div>
  )
}

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "accountNo",
    header: "Account #",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] text-gray-500 dark:text-slate-400">{row.getValue("accountNo")}</span>
    )
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
    cell: ({ row }) => (
      <Link href={`/dashboard/clients/${row.original.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
        {row.getValue("clientName")}
      </Link>
    )
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "activationDate",
    header: "Activation Date",
  },
  {
    accessorKey: "loanCycle",
    header: "Loan Cycle",
    cell: ({ row }) => (
      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-[10px] text-gray-600 dark:text-slate-300">
        {row.getValue("loanCycle")}
      </span>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let colorClass = "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
      if (status === "Active") colorClass = "bg-green-50 text-green-700 border-green-200"
      if (status === "Pending") colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200"
      if (status === "Closed") colorClass = "bg-red-50 text-red-700 border-red-200"
      
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${colorClass}`}>
          {status}
        </span>
      )
    },
  },
  {
    id: "action",
    header: "",
    cell: ({ row }) => <GrantPortalAccess client={row.original} />,
  },
]

export function ClientsTable({ data }: { data: Client[] }) {
  return <DataTable columns={columns} data={data} />
}
