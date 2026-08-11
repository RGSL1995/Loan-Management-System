"use client";

import type { ApplicationInfo } from "@/lib/schemas/loan-application";

interface LasApplicationInfoStepProps {
  data?: any;
  onChange: (data: any) => void;
}

export default function LasApplicationInfoStep({ data, onChange }: LasApplicationInfoStepProps) {
  const info: Partial<ApplicationInfo> = data?.application_info || {
    sourcing_channel: "DIGITAL"
  };

  const handleChange = (field: keyof ApplicationInfo, value: any) => {
    const updated = { ...info, [field]: value };
    onChange({ application_info: updated });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          LAS Application Setup
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Set up the sourcing channel and upload key signatures and photographs.
        </p>
      </div>

      {/* Inputs Group */}
      <div className="grid grid-cols-1 gap-3 max-w-md">
        {/* Sourcing Channel */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Sourcing Channel *
          </label>
          <select
            value={info.sourcing_channel || "DIGITAL"}
            onChange={(e) => handleChange("sourcing_channel", e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
            required
          >
            <option value="DIGITAL">Digital Self-Sourced (DIGITAL)</option>
            <option value="BRANCH">Direct Branch (BRANCH)</option>
            <option value="DSA">Direct Sales Agent (DSA)</option>
            <option value="DST">Direct Sales Team (DST)</option>
          </select>
        </div>
      </div>

      {/* File Uploads Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-slate-800/60">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Applicant Photograph *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleChange("applicant_photo_file_id", file.name);
              }
            }}
            className="block w-full text-xs text-gray-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-gray-200 dark:file:border-slate-700 file:text-[10px] file:font-semibold file:bg-gray-50 dark:file:bg-slate-800 file:text-gray-700 dark:file:text-slate-300 hover:file:bg-gray-100 dark:hover:file:bg-slate-700"
          />
          {info.applicant_photo_file_id && (
            <p className="text-[10px] text-green-600 font-medium mt-1">
              ✓ Attached: {info.applicant_photo_file_id}
            </p>
          )}
          <p className="text-[9px] text-gray-400 mt-0.5">
            Passport format, JPEG/PNG &lt;= 5 MB
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Applicant Signature Specimen *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleChange("applicant_signature_file_id", file.name);
              }
            }}
            className="block w-full text-xs text-gray-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-gray-200 dark:file:border-slate-700 file:text-[10px] file:font-semibold file:bg-gray-50 dark:file:bg-slate-800 file:text-gray-700 dark:file:text-slate-300 hover:file:bg-gray-100 dark:hover:file:bg-slate-700"
          />
          {info.applicant_signature_file_id && (
            <p className="text-[10px] text-green-600 font-medium mt-1">
              ✓ Attached: {info.applicant_signature_file_id}
            </p>
          )}
          <p className="text-[9px] text-gray-400 mt-0.5">
            Signature Specimen, JPEG/PNG &lt;= 5 MB
          </p>
        </div>
      </div>
    </div>
  );
}
