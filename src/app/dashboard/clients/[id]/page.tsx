import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, Calendar, FileText, AlertCircle } from "lucide-react";
import { proxyToFineract } from "@/lib/fineract/proxy";
import { getLoans } from "@/app/actions/loans";
import { GrantPortalAccess } from "../clients-table";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const clientId = Number(params.id);
  const { data: rawClient, error } = await proxyToFineract(`clients/${clientId}`, "GET");

  if (error || !rawClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm text-gray-600 dark:text-slate-400">Client not found.</p>
        <Link href="/dashboard/clients" className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 hover:underline">
          Back to Clients Directory
        </Link>
      </div>
    );
  }

  const client = rawClient as any;
  const clientName = client.displayName || client.fullname || [client.firstname, client.lastname].filter(Boolean).join(" ") || "Unknown Client";
  const statusValue = (typeof client.status === "string" ? client.status : client.status?.value || "").toUpperCase();

  const { data: loansData } = await getLoans(clientId);
  const loans = (loansData as { pageItems?: any[] })?.pageItems || (Array.isArray(loansData) ? loansData : []);

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clients" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">{clientName}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-mono">#{client.accountNo || client.id}</p>
          </div>
        </div>
        <GrantPortalAccess
          client={{
            id: String(client.id),
            clientName,
            accountNo: client.accountNo || String(client.id),
            branch: client.officeName || "HQ",
            status: statusValue === "ACTIVE" ? "Active" : statusValue === "PENDING" ? "Pending" : "Closed",
            activationDate: "",
            loanCycle: loans.length,
          }}
        />
      </div>

      <div className="p-4 md:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Mobile</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{client.mobileNo || "—"}</p>
            </div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Email</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{client.emailAddress || "—"}</p>
            </div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Status</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 capitalize">{statusValue.toLowerCase() || "—"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100">Loan Accounts</h2>
          </div>
          {loans.length === 0 ? (
            <p className="p-5 text-xs text-gray-500 dark:text-slate-400">No loan accounts for this client yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-slate-400">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Account #</th>
                  <th className="text-left px-4 py-2 font-semibold">Facility</th>
                  <th className="text-right px-4 py-2 font-semibold">Principal</th>
                  <th className="text-right px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan: any) => (
                  <tr key={loan.id} className="border-t border-gray-100 dark:border-slate-800">
                    <td className="px-4 py-2 font-mono">{loan.accountNo}</td>
                    <td className="px-4 py-2">{loan.loanProductName}</td>
                    <td className="px-4 py-2 text-right font-mono">₹{Number(loan.principal || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300">
                        {String(loan.status || "").replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
