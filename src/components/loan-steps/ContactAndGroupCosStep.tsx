"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ContactPerson, AssociateCompany } from "@/lib/schemas/loan-application";
import { ContactPersonSchema } from "@/lib/schemas/loan-application";
import { useFormErrors, FieldError } from "@/lib/utils/field-validator";

interface ContactAndGroupCosStepProps {
  data?: any;
  onChange: (data: any) => void;
}

export default function ContactAndGroupCosStep({ data, onChange }: ContactAndGroupCosStepProps) {
  const contact = data?.contact_person || { name: "", designation: "", mobile_number: "", email: "" };
  const companies: AssociateCompany[] = data?.associate_companies || [];
  const { errors, validateWith } = useFormErrors();

  const updateContactField = (field: keyof ContactPerson, value: string) => {
    onChange({
      contact_person: {
        ...contact,
        [field]: value,
      },
    });
  };

  const addCompanyRow = () => {
    const updated = [
      ...companies,
      { company_name: "", business_profile: "", sales_last_fy: 0, pat_last_fy: 0, total_borrowings: 0, total_net_worth: 0 },
    ];
    onChange({ associate_companies: updated });
  };

  const removeCompanyRow = (index: number) => {
    const updated = companies.filter((_, idx) => idx !== index);
    onChange({ associate_companies: updated });
  };

  const updateCompanyField = (index: number, field: keyof AssociateCompany, value: any) => {
    const updated = [...companies];
    updated[index] = {
      ...updated[index],
      [field]: (field === "sales_last_fy" || field === "pat_last_fy" || field === "total_borrowings" || field === "total_net_worth")
        ? (parseFloat(value) || 0)
        : value,
    };
    onChange({ associate_companies: updated });
  };

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Contact & Group Companies
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Capture details of the primary contact person and group corporate exposures.
        </p>
      </div>

      {/* Section 1: Authorized Contact Person */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300">1. Authorized Contact Person</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Contact Person Name"
              value={contact.name || ""}
              onChange={(e) => updateContactField("name", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
              Designation *
            </label>
            <input
              type="text"
              placeholder="e.g., Director / Partner / CFO"
              value={contact.designation || ""}
              onChange={(e) => updateContactField("designation", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile"
              maxLength={10}
              value={contact.mobile_number || ""}
              onChange={(e) => updateContactField("mobile_number", e.target.value)}
              onBlur={() => validateWith("mobile_number", ContactPersonSchema.shape.mobile_number, contact.mobile_number)}
              className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white ${
                errors.mobile_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              required
            />
            <FieldError message={errors.mobile_number} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="email@company.com"
              value={contact.email || ""}
              onChange={(e) => updateContactField("email", e.target.value)}
              onBlur={() => validateWith("email", ContactPersonSchema.shape.email, contact.email)}
              className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white ${
                errors.email ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              required
            />
            <FieldError message={errors.email} />
          </div>
        </div>
      </div>

      {/* Section 2: Associate / Group Companies */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            2. Associate & Group Companies
          </h3>
          <button
            type="button"
            onClick={addCompanyRow}
            className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-[10px] font-semibold rounded shadow transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Row
          </button>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-gray-200 dark:border-slate-800 rounded bg-gray-50/50 dark:bg-slate-900/50 text-[11px] text-gray-400">
            No associate or group companies added yet. Click &quot;Add Row&quot; if applicable.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-1.5 px-2">Company Name *</th>
                  <th className="py-1.5 px-2">Business Profile</th>
                  <th className="py-1.5 px-2 text-right">Sales Last FY (₹)</th>
                  <th className="py-1.5 px-2 text-right">PAT Last FY (₹)</th>
                  <th className="py-1.5 px-2 text-right">Borrowings (₹)</th>
                  <th className="py-1.5 px-2 text-right">Net Worth (₹)</th>
                  <th className="py-1.5 px-2 text-center w-8">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-xs">
                {companies.map((co, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="Company name"
                        value={co.company_name || ""}
                        onChange={(e) => updateCompanyField(idx, "company_name", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none"
                        required
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="Profile / Activity"
                        value={co.business_profile || ""}
                        onChange={(e) => updateCompanyField(idx, "business_profile", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="0"
                        value={co.sales_last_fy || ""}
                        onChange={(e) => updateCompanyField(idx, "sales_last_fy", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none text-right"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="0"
                        value={co.pat_last_fy || ""}
                        onChange={(e) => updateCompanyField(idx, "pat_last_fy", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none text-right"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="0"
                        value={co.total_borrowings || ""}
                        onChange={(e) => updateCompanyField(idx, "total_borrowings", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none text-right"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="0"
                        value={co.total_net_worth || ""}
                        onChange={(e) => updateCompanyField(idx, "total_net_worth", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none text-right"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeCompanyRow(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
