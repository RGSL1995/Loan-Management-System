"use client";

import { useState } from "react";
import { OpsCase } from "@/app/actions/ops-cases";
import { Search, Inbox, AlertTriangle, FileText, CheckCircle, Clock, ShieldAlert, ArrowLeft, MoreHorizontal, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export function OpsInboxClient({ initialTasks }: { initialTasks: OpsCase[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [selectedCase, setSelectedCase] = useState<OpsCase | null>(null);
  
  const searchParams = useSearchParams();
  const ctx = searchParams.get('ctx');
  let backUrl = "/dashboard";
  if (ctx === "los") backUrl = "/dashboard/applications";
  else if (ctx === "lms") backUrl = "/dashboard/accounts";

  const filteredTasks = initialTasks.filter(t => {
    if (activeFilter === "ALL") return true;
    return t.type === activeFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40 border-red-200 dark:border-red-900";
      case "HIGH": return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/40 border-orange-200 dark:border-orange-900";
      case "MEDIUM": return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40 border-blue-200 dark:border-blue-900";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN": return <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />;
      case "IN_PROGRESS": return <Clock className="w-3.5 h-3.5 text-blue-500" />;
      case "RESOLVED": return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      default: return <CheckCircle className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const SidebarItem = ({ icon: Icon, label, count, filterId }: { icon: any, label: string, count: number, filterId: string }) => (
    <button 
      onClick={() => setActiveFilter(filterId)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-[11px] font-medium ${
        activeFilter === filterId 
          ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm border border-gray-200 dark:border-slate-700" 
          : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <span className="bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
    </button>
  );

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-white dark:bg-slate-950">
      
      {/* Left Sidebar (Filters) */}
      <div className="w-56 border-r border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex flex-col shrink-0">
        <div className="h-14 border-b border-gray-200 dark:border-slate-800 flex items-center px-4 gap-3 shrink-0">
          <Link href={backUrl} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Operations Desk</h1>
          </div>
        </div>
        
        <div className="p-3 space-y-1">
          <SidebarItem icon={Inbox} label="All Cases" count={initialTasks.length} filterId="ALL" />
          <SidebarItem icon={ShieldAlert} label="My Deviations" count={initialTasks.filter(t => t.type === "DEVIATION").length} filterId="DEVIATION" />
          <SidebarItem icon={AlertTriangle} label="Escalations" count={initialTasks.filter(t => t.type === "ESCALATION").length} filterId="ESCALATION" />
          <SidebarItem icon={FileText} label="Pending PDD" count={initialTasks.filter(t => t.type === "PDD").length} filterId="PDD" />
        </div>
      </div>

      {/* Center Pane (Inbox List) */}
      <div className="w-80 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="h-14 border-b border-gray-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0">
          <h2 className="text-xs font-bold text-gray-900 dark:text-slate-100">Inbox</h2>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"><Search className="w-4 h-4" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-[11px] text-gray-500">No cases found.</div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-slate-800/50">
              {filteredTasks.map((task) => (
                <button 
                  key={task.id}
                  onClick={() => setSelectedCase(task)}
                  className={`p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${selectedCase?.id === task.id ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent"}`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400">{task.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 leading-tight mb-1">{task.title}</h3>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate mb-2">{task.description}</div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      {getStatusIcon(task.status)}
                      <span className="font-medium">{task.status.replace("_", " ")}</span>
                    </div>
                    <span className="text-[9px] text-gray-400">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane (Case Details) */}
      <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-slate-950/30 overflow-hidden relative">
        {selectedCase ? (
          <>
            <div className="h-14 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${getPriorityColor(selectedCase.priority).split(" ")[1]} ${getPriorityColor(selectedCase.priority).split(" ")[3]}`}>
                  <ShieldAlert className={`w-4 h-4 ${getPriorityColor(selectedCase.priority).split(" ")[0]}`} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">{selectedCase.title}</h2>
                  <div className="text-[10px] text-gray-500 flex items-center gap-2">
                    <span className="font-mono">{selectedCase.id}</span>
                    <span>•</span>
                    <span>{selectedCase.relatedEntityType}: <Link href="#" className="text-blue-600 hover:underline">{selectedCase.relatedEntityId}</Link></span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-[11px] font-bold text-gray-700 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700">
                  Reassign
                </button>
                <button className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-md text-[11px] font-bold shadow-sm hover:opacity-90">
                  Resolve Case
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Description Card */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-2">Issue Description</h3>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                    {selectedCase.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 shadow-sm grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      {getStatusIcon(selectedCase.status)}
                      <span className="text-[11px] font-medium text-gray-900 dark:text-slate-100">{selectedCase.status.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</label>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-gray-900 dark:text-slate-100">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {selectedCase.assignedTo}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Created At</label>
                    <div className="text-[11px] font-medium text-gray-900 dark:text-slate-100 mt-1">
                      {new Date(selectedCase.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">SLA Status</label>
                    <div className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                      Breaching in 2 days
                    </div>
                  </div>
                </div>

                {/* Activity Feed Placeholder */}
                <div className="pt-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-4">Activity Timeline</h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-slate-800 before:to-transparent">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-[11px] text-gray-900 dark:text-slate-100">Case Created</div>
                          <time className="text-[9px] font-mono text-gray-500">{new Date(selectedCase.createdAt).toLocaleTimeString()}</time>
                        </div>
                        <div className="text-[10px] text-gray-600 dark:text-slate-400">System generated task based on rule #492.</div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
            <Inbox className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a case to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
