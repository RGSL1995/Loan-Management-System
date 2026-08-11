"use client"

import { useEffect, useState, useTransition } from "react"
import { ShieldCheck, Plus, X } from "lucide-react"
import { getPlatformUsers, createPlatformAdmin } from "@/app/actions/platform"
import { ROLE_DESCRIPTIONS } from "@/components/ProfileDrawer"

interface PlatformUser {
  id: string
  full_name: string | null
  email: string | null
  role: string
  is_active: boolean
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadUsers = () => {
    setLoading(true)
    getPlatformUsers().then((res) => {
      setUsers((res.data as PlatformUser[]) || [])
      setLoading(false)
    })
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSubmit = (formData: FormData) => {
    setMessage(null)
    startTransition(async () => {
      const result = await createPlatformAdmin(null, formData)
      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setShowForm(false)
        loadUsers()
      } else {
        setMessage({ type: "error", text: result.message || "Failed to create platform admin." })
      }
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Admins</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users with global platform access.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 h-9 px-4 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Platform Admin"}
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form action={handleSubmit} className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
            <p className="text-xs font-semibold text-gray-700">Platform Admin</p>
            <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{ROLE_DESCRIPTIONS.platform_admin}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name</label>
            <input name="fullName" required className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-black" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
            <input name="email" type="email" required className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-black" placeholder="jane@finbyx.com" />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-4 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {isPending ? "Creating..." : "Create Platform Admin"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading platform users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No platform admins found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-bold uppercase text-gray-500">Name</th>
                <th className="text-left px-4 py-2 text-xs font-bold uppercase text-gray-500">Email</th>
                <th className="text-left px-4 py-2 text-xs font-bold uppercase text-gray-500">Role</th>
                <th className="text-left px-4 py-2 text-xs font-bold uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{user.full_name || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-600">{user.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                      <ShieldCheck className="w-3 h-3" />
                      {user.role === "super_admin" ? "Super Admin" : "Platform Admin"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
