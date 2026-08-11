import { onboardUser } from "@/app/actions/auth";
import { Users, FileText, Activity, DollarSign, AlertCircle, Plus } from "lucide-react";

export default async function AdminDashboard() {
  const clients = [
    { id: "C-1049", company: "Acme Corp", email: "admin@acmecorp.com", status: "active", volume: "$1.2M", created_at: "2026-06-15" },
    { id: "C-1050", company: "Stark Industries", email: "finance@stark.com", status: "active", volume: "$8.5M", created_at: "2026-06-20" },
    { id: "C-1051", company: "Wayne Ent", email: "bruce@wayne.com", status: "pending", volume: "-", created_at: "2026-07-01" },
  ];

  const recentApplications = [
    { id: "APP-9021", client: "Acme Corp", amount: "$50,000", type: "Working Capital", status: "Under Review" },
    { id: "APP-9022", client: "Globex", amount: "$250,000", type: "Equipment Financing", status: "Approved" },
    { id: "APP-9023", client: "Initech", amount: "$15,000", type: "Bridge Loan", status: "Rejected" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Administration</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">System configuration and user management.</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Active Clients</p>
              <p className="text-xl font-bold text-gray-900 dark:text-slate-100">124</p>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-md text-green-600 dark:text-green-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Total Originations</p>
              <p className="text-xl font-bold text-gray-900 dark:text-slate-100">$42.5M</p>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-md text-purple-600 dark:text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Active Loans</p>
              <p className="text-xl font-bold text-gray-900 dark:text-slate-100">892</p>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-md text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Default Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-slate-100">1.2%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          
          {/* Left Column: Onboard Client & Recent Apps */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Onboard Client Form */}
            <div className="p-4 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Onboard New Client</h2>
                <Plus className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Generate secure login credentials for a new organization.
              </p>
              <form action={async (formData) => {
                "use server";
                await onboardUser(formData);
              }} className="space-y-3">
                <div>
                  <label htmlFor="company" className="block text-xs font-medium text-gray-700 dark:text-slate-300">Company Name</label>
                  <input type="text" name="company" id="company" className="block w-full px-2 py-1.5 mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded text-xs focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all" placeholder="Wayne Enterprises" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-slate-300">Admin Email</label>
                  <input type="email" name="email" id="email" required className="block w-full px-2 py-1.5 mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded text-xs focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all" placeholder="client@example.com" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-slate-300">Temporary Password</label>
                  <input type="text" name="password" id="password" required className="block w-full px-2 py-1.5 mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded text-xs focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all" placeholder="SecurePassword123!" />
                </div>
                <button type="submit" className="w-full px-3 py-1.5 text-xs font-medium text-white dark:text-black bg-black dark:bg-white rounded shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Provision Account
                </button>
              </form>
            </div>

            {/* Recent Applications */}
            <div className="p-4 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Recent Applications</h2>
                <Activity className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </div>
              <div className="space-y-2">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-slate-800/50">
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-slate-100">{app.client}</p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400">{app.type} • {app.amount}</p>
                    </div>
                    <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${
                      app.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Client Directory */}
          <div className="w-full lg:w-2/3">
            <div className="p-4 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Client Directory</h2>
                <button className="text-xs text-black dark:text-white font-medium hover:underline">View all</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 border border-gray-100 dark:border-slate-700 rounded-md">
                  <thead className="bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Client</th>
                      <th className="px-4 py-2 text-[10px] font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-2 text-[10px] font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Total Volume</th>
                      <th className="px-4 py-2 text-[10px] font-medium tracking-wider text-left text-gray-500 dark:text-slate-400 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-6 h-6 rounded bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-gray-500 dark:text-slate-400 text-xs">
                              {client.company.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-xs font-medium text-gray-900 dark:text-slate-100">{client.company}</div>
                              <div className="text-[10px] text-gray-500 dark:text-slate-400">{client.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold leading-4 rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-slate-100 whitespace-nowrap font-medium">
                          {client.volume}
                        </td>
                        <td className="px-4 py-2 text-[10px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(client.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
