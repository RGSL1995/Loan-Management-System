"use client";

import type { ApplicationInfo } from "@/lib/schemas/loan-application";

interface SclApplicationInfoStepProps {
  data?: any;
  onChange: (data: any) => void;
}

export default function SclApplicationInfoStep({ data, onChange }: SclApplicationInfoStepProps) {
  const info: Partial<ApplicationInfo> = data?.application_info || {
    sourcing_channel: "DIGITAL"
  };

  const productData = data?.product_data || {};

  const handleChange = (field: keyof ApplicationInfo, value: any) => {
    const updated = { ...info, [field]: value };
    onChange({ application_info: updated });
  };

  const handleProductChange = (field: string, value: any) => {
    onChange({
      product_data: {
        ...productData,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          SCL Application Setup &amp; Channel
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Configure the digital lending origination channel and upload photographs/signatures.
        </p>
      </div>

      {/* Sourcing Channel Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Origination Channel *
          </label>
          <select
            value={productData.origination_channel || "OWN_DLA"}
            onChange={(e) => handleProductChange("origination_channel", e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
            required
          >
            <option value="OWN_DLA">Direct Lending App (OWN_DLA)</option>
            <option value="LSP_DLA">LSP-originated Platform (LSP_DLA)</option>
            <option value="BRANCH">Direct Branch Inward (BRANCH)</option>
            <option value="WEB">Web Portal (WEB)</option>
          </select>
        </div>

        {productData.origination_channel === "LSP_DLA" && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
              LSP Partner / DLA ID *
            </label>
            <input
              type="text"
              placeholder="e.g. LSP_PARTNER_VAL"
              value={productData.lsp_id || ""}
              onChange={(e) => handleProductChange("lsp_id", e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
              required
            />
          </div>
        )}
      </div>

      {/* Photos Section */}
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
            Signed document scan, JPEG/PNG &lt;= 5 MB
          </p>
        </div>
      </div>
    </div>
  );
}
