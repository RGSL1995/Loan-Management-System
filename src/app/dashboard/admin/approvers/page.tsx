"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  getLASApprovers,
  addLASApprover,
  removeLASApprover,
} from "@/app/actions/las-admin";
import type { LASApprover } from "@/lib/schemas/las";

export default function LASApproversPage() {
  const [approvers, setApprovers] = useState<LASApprover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    role: "loan_officer" as const,
    authority_limit: "",
    can_override: false,
  });

  // Mock user list - in production, fetch from users table
  const mockUsers = [
    { id: "user-001", name: "Rajesh Kumar (Loan Officer)" },
    { id: "user-002", name: "Priya Singh (Loan Officer)" },
    { id: "user-003", name: "Amit Patel (Credit Manager)" },
    { id: "user-004", name: "Deepa Verma (Credit Manager)" },
    { id: "user-005", name: "Vikram Gupta (Director)" },
  ];

  const roleLabels = {
    loan_officer: "Loan Officer",
    credit_manager: "Credit Manager",
    director: "Director",
    super_user: "Super User",
  };

  useEffect(() => {
    fetchApprovers();
  }, []);

  async function fetchApprovers() {
    try {
      setLoading(true);
      const result = await getLASApprovers();
      if (result.error) {
        setError(result.error);
      } else {
        setApprovers(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch approvers");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddApprover(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formData.user_id || !formData.authority_limit) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const result = await addLASApprover({
        user_id: formData.user_id,
        role: formData.role,
        authority_limit: parseInt(formData.authority_limit),
        can_override: formData.can_override,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Approver added successfully");
        setFormData({
          user_id: "",
          role: "loan_officer",
          authority_limit: "",
          can_override: false,
        });
        setShowForm(false);
        fetchApprovers();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add approver");
    }
  }

  async function handleRemoveApprover(id: string) {
    if (!confirm("Remove this approver from the hierarchy?")) return;

    try {
      const result = await removeLASApprover(id);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Approver removed successfully");
        setApprovers(approvers.filter((a) => a.id !== id));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove approver");
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Approval Hierarchy
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Configure who can approve loans and their authority limits
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Approver
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 m-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 m-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-600 dark:text-green-400">{success}</div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
              <p className="mt-4 text-gray-600 dark:text-slate-400">
                Loading approvers...
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl space-y-6">
            {/* Add Form */}
            {showForm && (
              <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  Add New Approver
                </h2>

                <form onSubmit={handleAddApprover} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                        User
                      </label>
                      <select
                        value={formData.user_id}
                        onChange={(e) =>
                          setFormData({ ...formData, user_id: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        required
                      >
                        <option value="">Select a user...</option>
                        {mockUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as typeof formData.role,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      >
                        <option value="loan_officer">Loan Officer</option>
                        <option value="credit_manager">Credit Manager</option>
                        <option value="director">Director</option>
                        <option value="super_user">Super User</option>
                      </select>
                    </div>

                    {/* Authority Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                        Authority Limit (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 1000000"
                        value={formData.authority_limit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authority_limit: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        required
                      />
                    </div>

                    {/* Override Permission */}
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.can_override}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              can_override: e.target.checked,
                            })
                          }
                          className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          Can Override Limits
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-sm font-medium text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                      Add Approver
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Approvers List */}
            {approvers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  No approvers configured yet
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                  Add First Approver
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {approvers.map((approver) => (
                  <div
                    key={approver.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                          {mockUsers.find((u) => u.id === approver.user_id)?.name ||
                            "Unknown User"}
                        </h3>
                        <span className="px-2 py-1 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {roleLabels[approver.role as keyof typeof roleLabels]}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-600 dark:text-slate-400">
                          Authority Limit:{" "}
                          <span className="font-medium text-gray-900 dark:text-slate-100">
                            ₹{(approver.authority_limit / 100000).toFixed(1)}L
                          </span>
                        </span>
                        {approver.can_override && (
                          <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 font-medium">
                            Can Override
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => approver.id && handleRemoveApprover(approver.id)}
                      className="ml-4 p-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Info Box */}
            {approvers.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Approval Hierarchy:</strong> Loan Officer creates applications → Credit Manager approves up to their limit → Director/Super User for override/exceptions
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
