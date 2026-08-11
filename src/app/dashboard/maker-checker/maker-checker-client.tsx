"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Filter, CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MakerCheckerTask, approveMakerCheckerTask, rejectMakerCheckerTask } from "@/app/actions/maker-checker";

export function MakerCheckerClient({ initialTasks, userRole, userEmail }: { initialTasks: MakerCheckerTask[], userRole: string, userEmail: string }) {
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [selectedTask, setSelectedTask] = useState<MakerCheckerTask | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const searchParams = useSearchParams();
  const ctx = searchParams.get('ctx');
  let backUrl = "/dashboard";
  if (ctx === "los") backUrl = "/dashboard/applications";
  else if (ctx === "lms") backUrl = "/dashboard/accounts";

  const isMaker = userRole === "loan_officer";
  const isChecker = ["credit_manager", "tenant_admin", "operations_officer"].includes(userRole);

  const roleFilteredTasks = isMaker 
    ? initialTasks.filter(t => t.maker === userEmail) 
    : initialTasks;

  const filteredTasks = roleFilteredTasks.filter(t => t.processingResult === activeTab);

  const columns: ColumnDef<MakerCheckerTask>[] = [
    {
      accessorKey: "id",
      header: "Task ID",
      cell: ({ row }) => (
        <button 
          onClick={() => setSelectedTask(row.original)}
          className="font-mono text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          #{row.getValue("id")}
        </button>
      )
    },
    {
      accessorKey: "entityName",
      header: "Entity",
      cell: ({ row }) => <span className="font-bold text-[11px] text-gray-900 dark:text-slate-100">{row.getValue("entityName")}</span>
    },
    {
      accessorKey: "actionName",
      header: "Action",
      cell: ({ row }) => <span className="text-[11px] text-gray-600 dark:text-slate-400">{row.getValue("actionName")}</span>
    },
    {
      accessorKey: "maker",
      header: "Maker",
      cell: ({ row }) => <span className="text-[11px] font-medium text-gray-700 dark:text-slate-300">{row.getValue("maker")}</span>
    },
    {
      accessorKey: "madeOnDate",
      header: "Submitted Date",
      cell: ({ row }) => {
        const dateStr = row.getValue("madeOnDate") as string;
        return <span className="text-[11px] text-gray-500 dark:text-slate-400">{new Date(dateStr).toLocaleString()}</span>
      }
    },
    {
      accessorKey: "processingResult",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("processingResult") as string;
        let colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
        if (status === "APPROVED") colorClass = "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800";
        if (status === "REJECTED") colorClass = "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800";
        
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>
            {status}
          </span>
        );
      }
    }
  ];

  const handleApprove = () => {
    if (!selectedTask) return;
    startTransition(async () => {
      const res = await approveMakerCheckerTask(selectedTask.id);
      if (res.success) {
        setSelectedTask(null);
        // Refresh handled by revalidatePath in action
      } else {
        alert(res.message);
      }
    });
  };

  const handleReject = () => {
    if (!selectedTask || !rejectReason.trim()) return;
    
    startTransition(async () => {
      const res = await rejectMakerCheckerTask(selectedTask.id, rejectReason);
      if (res.success) {
        setSelectedTask(null);
        setRejectModalOpen(false);
        setRejectReason("");
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backUrl} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">
              {isMaker ? "My Sent Approvals" : "Pending Approvals Queue"}
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">
              {isMaker ? "Track the status of your submitted tasks." : "Review pending Fineract API commands."}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab("PENDING")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${activeTab === "PENDING" ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm border border-gray-200 dark:border-slate-700" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"}`}
          >
            {isMaker ? "Pending Review" : "Inbox"} ({roleFilteredTasks.filter(t => t.processingResult === "PENDING").length})
          </button>
          <button 
            onClick={() => setActiveTab("APPROVED")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${activeTab === "APPROVED" ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm border border-gray-200 dark:border-slate-700" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"}`}
          >
            Approved ({roleFilteredTasks.filter(t => t.processingResult === "APPROVED").length})
          </button>
          <button 
            onClick={() => setActiveTab("REJECTED")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${activeTab === "REJECTED" ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm border border-gray-200 dark:border-slate-700" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"}`}
          >
            Rejected ({roleFilteredTasks.filter(t => t.processingResult === "REJECTED").length})
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Maker or Entity..." 
            className="w-56 h-7 pl-8 pr-3 text-[11px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Data Table Area */}
      <div className="flex-1 overflow-x-auto bg-gray-50/20 dark:bg-slate-950/20">
        <DataTable columns={columns} data={filteredTasks} />
      </div>

      {/* Slide-out Review Drawer */}
      {selectedTask && (
        <div className="absolute inset-y-0 right-0 w-96 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col z-20 transition-transform transform duration-300 translate-x-0">
          <div className="h-12 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 bg-gray-50 dark:bg-slate-800/50">
            <h2 className="text-xs font-bold text-gray-900 dark:text-slate-100">Review Task #{selectedTask.id}</h2>
            <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Entity Name</label>
                <div className="text-[11px] font-medium text-gray-900 dark:text-slate-100">{selectedTask.entityName}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</label>
                <div className="text-[11px] font-medium text-gray-900 dark:text-slate-100">{selectedTask.actionName}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Maker</label>
                <div className="text-[11px] font-medium text-gray-900 dark:text-slate-100">{selectedTask.maker}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Resource ID</label>
                <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400">{selectedTask.resourceId}</div>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                Command Payload (JSON)
                <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-1.5 py-0.5 rounded">Fineract Schema</span>
              </label>
              <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md p-3 overflow-x-auto">
                <pre className="text-[10px] text-gray-800 dark:text-slate-300 font-mono">
                  {selectedTask.commandAsJson}
                </pre>
              </div>
            </div>
          </div>

          {selectedTask.processingResult === "PENDING" && isChecker && (
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 shrink-0 grid grid-cols-2 gap-2">
              <button 
                onClick={() => setRejectModalOpen(true)}
                disabled={isPending}
                className="h-8 flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-[11px] font-bold rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
              <button 
                onClick={handleApprove}
                disabled={isPending}
                className="h-8 flex items-center justify-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Approve
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Overlay when drawer is open */}
      {selectedTask && !rejectModalOpen && (
        <div 
          className="absolute inset-0 bg-black/10 dark:bg-black/40 z-10"
          onClick={() => setSelectedTask(null)}
        />
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Reject Task</h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Please provide a reason for rejecting this maker-checker task.</p>
            </div>
            <div className="p-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason here..."
                className="w-full h-24 p-2 text-xs border border-gray-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 focus:ring-1 focus:ring-red-500 outline-none resize-none text-gray-900 dark:text-slate-100"
                autoFocus
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-2">
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={isPending || !rejectReason.trim()}
                className="px-4 py-1.5 flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
