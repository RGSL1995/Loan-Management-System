"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldAlert, AlertCircle, CheckCircle } from "lucide-react";
import type { Reference, ProposedFacility, DocumentUploadItem } from "@/lib/schemas/loan-application";

interface ReferencesAndDocumentsProps {
  data?: any;
  onChange: (data: any) => void;
  mode: "references" | "documents";
}

const FAMILY_RELATIONSHIPS = [
  "father", "mother", "brother", "sister", "spouse", "son", "daughter",
  "husband", "wife", "parent", "sibling", "child", "uncle", "aunt", "cousin"
];

const emptyReference = (): Reference => ({
  name: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  occupation: "",
  phone_number: "",
  mobile_number: "",
  relationship: "",
  years_known: 1,
});

export default function LasReferencesAndDocumentsStep({ data, onChange, mode }: ReferencesAndDocumentsProps) {
  const loanType = data?.application_info?.loan_type || "PERSONAL_LOAN";
  const drawingPower = data?.drawing_power || 0;
  const totalCollateral = data?.total_collateral_value || 0;

  // Section: Proposed Facility
  const facilities = data?.proposed_facilities || [];
  const facility: ProposedFacility = facilities[0] || {
    facility_type: loanType,
    facility_amount_lakhs: 5,
    loan_tenure_years: 3
  };

  // Section: References
  const refs: Reference[] = data?.references || [];
  const [refErrors, setRefErrors] = useState<string[]>([ "", "" ]);

  // Section: Documents Checklist
  const checklist = data?.document_checklist || {};

  const docOptions = loanType === "BUSINESS_LOAN" ? [
    { key: "company_pan", label: "PAN Card of Company / Entity *", required: true },
    { key: "company_address_proof", label: "Address Proof of Company / Entity *", required: true },
    { key: "incorporation_docs", label: "Certificate of Incorporation / Shop License / Partnership Deed *", required: true },
    { key: "directors_kyc", label: "PAN + Address Proof of Directors / Promoters / Partners *", required: true },
    { key: "demat_statement", label: "Demat Account Holding Statement *", required: true },
    { key: "board_resolution", label: "Board Resolution / Authorization for Pledge *", required: true },
    { key: "audited_financials", label: "Audited Financials - Last 3 Years *", required: true },
    { key: "bank_statements_6m", label: "Bank Statements - Last 6 Months *", required: true }
  ] : [
    { key: "applicant_pan", label: "Individual PAN Card *", required: true },
    { key: "applicant_address_proof", label: "Address Proof (Aadhaar / Passport / DL) *", required: true },
    { key: "demat_statement", label: "Demat Account Holding Statement *", required: true },
    { key: "pledge_form", label: "Signed Pledge Request Form *", required: true }
  ];

  const updateDocumentStatus = (key: string, updates: Partial<DocumentUploadItem>) => {
    const current = checklist[key] || {
      document_name: docOptions.find(d => d.key === key)?.label || key,
      is_submitted: false,
      status: "PENDING"
    };
    onChange({
      document_checklist: {
        ...checklist,
        [key]: {
          ...current,
          ...updates
        }
      }
    });
  };

  const handleSimulatedUpload = (key: string, fileName: string) => {
    updateDocumentStatus(key, {
      is_submitted: true,
      file_name: fileName,
      file_size: 2048576, // 2MB
      status: "VERIFIED"
    });
  };

  const updateFacilityField = (field: keyof ProposedFacility, value: any) => {
    const updated = {
      ...facility,
      facility_type: loanType,
      [field]: field === "facility_amount_lakhs" ? (parseFloat(value) || 0) : (parseInt(value, 10) || 0)
    };
    onChange({ proposed_facilities: [updated] });
  };

  const addReferenceRow = () => {
    const updated = [...refs, emptyReference()];
    onChange({ references: updated });
  };

  const removeReferenceRow = (index: number) => {
    const updated = refs.filter((_, idx) => idx !== index);
    onChange({ references: updated });
  };

  const updateReference = (idx: number, field: keyof Reference, value: any) => {
    const updatedRefs = [...refs];
    while (updatedRefs.length <= idx) {
      updatedRefs.push(emptyReference());
    }
    
    updatedRefs[idx] = {
      ...updatedRefs[idx],
      [field]: field === "years_known" ? (parseInt(value, 10) || 1) : value,
    };

    // Relationship family check
    if (field === "relationship") {
      const isFamily = FAMILY_RELATIONSHIPS.some(f => value.toLowerCase().trim().includes(f));
      const updatedErrors = [...refErrors];
      updatedErrors[idx] = isFamily ? "References must not be family members." : "";
      setRefErrors(updatedErrors);
    }

    onChange({ references: updatedRefs });
  };

  if (mode === "references") {
    const limitInRupees = (facility.facility_amount_lakhs || 0) * 100000;
    const isOverLimit = limitInRupees > drawingPower;

    return (
      <div className="space-y-4">
        {/* LTV & Limits Summary Banner */}
        <div className="bg-gray-50 dark:bg-slate-900/60 p-3 border border-gray-200 dark:border-slate-800 rounded grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase">Total Collateral Value</span>
            <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
              ₹{totalCollateral.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase">Drawing Power (Collateral LTV)</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              ₹{drawingPower.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase">Pledge Mode</span>
            <span className="text-sm font-bold text-gray-900 dark:text-slate-100">SEBI Margin-Pledge Flow</span>
          </div>
        </div>

        {/* LAS Limit Requested */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300">1. Facility Limit Request</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
                Facility Type
              </label>
              <input
                type="text"
                value="OVERDRAFT AGAINST SECURITIES"
                disabled
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 rounded text-gray-900 dark:text-slate-100 outline-none font-semibold uppercase"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
                Overdraft Limit Requested (₹ Lakhs) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter limit in Lakhs"
                value={facility.facility_amount_lakhs || ""}
                onChange={(e) => updateFacilityField("facility_amount_lakhs", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
              <p className="text-[9px] text-gray-400 mt-0.5">
                Eligible Drawing Power: ₹{(drawingPower / 100000).toFixed(2)} Lakhs
              </p>
            </div>
            
            <div className="flex items-end">
              {isOverLimit && (
                <div className="w-full flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded text-red-700 dark:text-red-400 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-[10px]">
                    Requested limit exceeds Drawing Power!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* References list */}
        <div className="space-y-2 pt-2 border-t border-gray-150 dark:border-slate-850">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              2. References (Provide 2 non-family references)
            </h3>
            <button
              type="button"
              onClick={addReferenceRow}
              className="inline-flex items-center gap-1 px-2 py-0.5 border border-black text-black dark:border-white dark:text-white rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-[10px] font-bold"
            >
              <Plus className="w-3 h-3" /> Add Reference
            </button>
          </div>

          {refs.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-gray-200 dark:border-slate-800 rounded bg-gray-50/50 dark:bg-slate-900/50 text-xs text-gray-400 font-semibold">
              No references added. Please provide exactly two references.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[0, 1].map((idx) => {
                const ref = refs[idx] || emptyReference();
                return (
                  <div
                    key={idx}
                    className="p-3 border border-gray-150 dark:border-slate-800 rounded bg-white dark:bg-slate-900/50 relative space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Reference #{idx + 1}
                      </span>
                      {refErrors[idx] && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-red-500 font-bold">
                          <AlertCircle className="w-3 h-3" /> {refErrors[idx]}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-450 mb-0.5">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={ref.name || ""}
                          onChange={(e) => updateReference(idx, "name", e.target.value)}
                          className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-450 mb-0.5">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={ref.mobile_number || ""}
                          onChange={(e) => updateReference(idx, "mobile_number", e.target.value)}
                          className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-450 mb-0.5">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={ref.address_line1 || ""}
                        onChange={(e) => updateReference(idx, "address_line1", e.target.value)}
                        className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none mb-1"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={ref.city || ""}
                          onChange={(e) => updateReference(idx, "city", e.target.value)}
                          className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Pincode"
                          maxLength={6}
                          value={ref.pincode || ""}
                          onChange={(e) => updateReference(idx, "pincode", e.target.value)}
                          className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-450 mb-0.5">
                          Relationship *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Colleague / Neighbor"
                          value={ref.relationship || ""}
                          onChange={(e) => updateReference(idx, "relationship", e.target.value)}
                          className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-450 mb-0.5">
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={ref.occupation || ""}
                          onChange={(e) => updateReference(idx, "occupation", e.target.value)}
                          className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================== DOCUMENTS CHECKLIST VIEW ================== */
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Pledge & Collateral Document Checklist
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Upload self-attested copies of the requested documents. Accepted formats: PDF, JPEG, PNG up to 10MB.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-slate-900/50">
              <th className="py-2 px-3">Document Name</th>
              <th className="py-2 px-3">Mandatory</th>
              <th className="py-2 px-3">Action</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-slate-850">
            {docOptions.map((doc) => {
              const fileMeta = checklist[doc.key] || {};
              return (
                <tr key={doc.key} className="text-xs hover:bg-gray-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-2 px-3 font-semibold text-gray-900 dark:text-slate-200">
                    {doc.label}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 text-[9px] rounded-full font-bold bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                      Yes
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {fileMeta.is_submitted ? (
                      <div className="flex flex-col text-[10px]">
                        <span className="font-semibold text-gray-700 dark:text-slate-300 truncate max-w-[150px]">
                          📎 {fileMeta.file_name}
                        </span>
                        <span className="text-gray-400">
                          {(fileMeta.file_size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleSimulatedUpload(doc.key, file.name);
                          }
                        }}
                        className="block text-[10px] text-gray-500 dark:text-slate-400 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border file:border-gray-200 dark:file:border-slate-700 file:text-[9px] file:font-semibold file:bg-gray-50 dark:file:bg-slate-800 file:text-gray-700 dark:file:text-slate-350 hover:file:bg-gray-100 dark:hover:file:bg-slate-700 cursor-pointer"
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      fileMeta.status === "VERIFIED"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                    }`}>
                      {fileMeta.status || "PENDING"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
