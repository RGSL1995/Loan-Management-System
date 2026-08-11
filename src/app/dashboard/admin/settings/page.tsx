"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { getLASSettings, updateLASSettings } from "@/app/actions/las-admin";
import type { LASSettings } from "@/lib/schemas/las";

export default function LASSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    require_kyo_check: false,
    require_approval: true,
    require_cibil_check: true,
    require_bureau_pull: true,
    auto_approve_below: "",
    max_default_days_before_liquidation: "90",
    require_nsdl_pledge: true,
    enable_auto_liquidation: false,
    max_security_age_days: "",
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const result = await getLASSettings();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setFormData({
          require_kyo_check: result.data.require_kyo_check || false,
          require_approval: result.data.require_approval || true,
          require_cibil_check: result.data.require_cibil_check || true,
          require_bureau_pull: result.data.require_bureau_pull || true,
          auto_approve_below: result.data.auto_approve_below?.toString() || "",
          max_default_days_before_liquidation:
            result.data.max_default_days_before_liquidation?.toString() || "90",
          require_nsdl_pledge: result.data.require_nsdl_pledge || true,
          enable_auto_liquidation: result.data.enable_auto_liquidation || false,
          max_security_age_days:
            result.data.max_security_age_days?.toString() || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        require_kyo_check: formData.require_kyo_check,
        require_approval: formData.require_approval,
        require_cibil_check: formData.require_cibil_check,
        require_bureau_pull: formData.require_bureau_pull,
        auto_approve_below: formData.auto_approve_below
          ? parseInt(formData.auto_approve_below)
          : undefined,
        max_default_days_before_liquidation: parseInt(
          formData.max_default_days_before_liquidation
        ),
        require_nsdl_pledge: formData.require_nsdl_pledge,
        enable_auto_liquidation: formData.enable_auto_liquidation,
        max_security_age_days: formData.max_security_age_days
          ? parseInt(formData.max_security_age_days)
          : undefined,
      };

      const result = await updateLASSettings(payload);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Settings updated successfully");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            LAS Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Configure company-wide rules and policies
          </p>
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
                Loading settings...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
            {/* KYC & Compliance Section */}
            <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                KYC & Compliance
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.require_kyo_check}
                    onChange={(e) =>
                      setFormData({ ...formData, require_kyo_check: e.target.checked })
                    }
                    disabled={saving}
                    className="w-5 h-5 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      Require KYO Check
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      Mandate Know Your Obligation verification before loan origination
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.require_cibil_check}
                    onChange={(e) =>
                      setFormData({ ...formData, require_cibil_check: e.target.checked })
                    }
                    disabled={saving}
                    className="w-5 h-5 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      Require CIBIL Check
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      Pull credit score from CIBIL bureau before approval
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.require_bureau_pull}
                    onChange={(e) =>
                      setFormData({ ...formData, require_bureau_pull: e.target.checked })
                    }
                    disabled={saving}
                    className="w-5 h-5 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      Require Bureau Pull
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      Pull multi-bureau credit report before disbursement
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Approval Settings Section */}
            <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Approval Workflow
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.require_approval}
                    onChange={(e) =>
                      setFormData({ ...formData, require_approval: e.target.checked })
                    }
                    disabled={saving}
                    className="w-5 h-5 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      Require Approval
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      All loans must be approved by a credit manager
                    </p>
                  </div>
                </label>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
                    Auto-Approve Loans Below Amount (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 500000 for ₹5 lakhs"
                    value={formData.auto_approve_below}
                    onChange={(e) =>
                      setFormData({ ...formData, auto_approve_below: e.target.value })
                    }
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                    Leave empty to disable. Loans below this amount skip manual approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Securities Section */}
            <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Securities & Pledge
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.require_nsdl_pledge}
                    onChange={(e) =>
                      setFormData({ ...formData, require_nsdl_pledge: e.target.checked })
                    }
                    disabled={saving}
                    className="w-5 h-5 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      Require NSDL Pledge
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      Mandate NSDL pledge for stocks and mutual funds
                    </p>
                  </div>
                </label>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
                    Max Security Age (days, Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 365 for 1 year"
                    value={formData.max_security_age_days}
                    onChange={(e) =>
                      setFormData({ ...formData, max_security_age_days: e.target.value })
                    }
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                    Securities older than this are marked for revaluation/refresh.
                  </p>
                </div>
              </div>
            </div>

            {/* Default & Liquidation Section */}
            <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Default & Liquidation Policy
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
                    Default Days Before Liquidation
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    placeholder="90"
                    value={formData.max_default_days_before_liquidation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_default_days_before_liquidation: e.target.value,
                      })
                    }
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                    After N days of default, borrower's collateral can be liquidated.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_auto_liquidation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enable_auto_liquidation: e.target.checked,
                      })
                    }
                    disabled={saving}
                    className="w-5 h-5 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      Enable Auto Liquidation
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      Automatically liquidate collateral after default period (requires ops override)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
