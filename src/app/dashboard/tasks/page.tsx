import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Maker-Checker Tasks</h1>
          <p className="text-sm text-gray-500">Review, approve, or reject pending operations.</p>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center flex-col text-gray-500">
           <CheckSquare className="h-10 w-10 mb-4 text-gray-300" />
           <p className="text-sm">Tasks / Approvals Data Table Placeholder</p>
        </div>
      </div>
    </div>
  );
}
