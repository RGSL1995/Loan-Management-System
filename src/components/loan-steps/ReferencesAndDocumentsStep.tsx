"use client";

import { useState } from "react";
import { AlertCircle, FileText, Upload, CheckCircle } from "lucide-react";
import type { Reference, ProposedFacility, DocumentUploadItem } from "@/lib/schemas/loan-application";
import { ReferenceSchema } from "@/lib/schemas/loan-application";
import { useFormErrors, FieldError } from "@/lib/utils/field-validator";

interface ReferencesAndDocumentsStepProps {
  data?: any;
  onChange: (data: any) => void;
  mode: "references" | "documents";
}

const FAMILY_RELATIONSHIPS = [
  "spouse", "father", "mother", "brother", "sister", "son", "daughter",
  "parent", "sibling", "child", "family", "wife", "husband", "uncle", "aunt",
  "cousin", "grandfather", "grandmother", "nephew", "niece"
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

export default function ReferencesAndDocumentsStep({ data, onChange, mode }: ReferencesAndDocumentsStepProps) {
  const loanType = data?.application_info?.loan_type || "PERSONAL_LOAN";
  
  // Section: Proposed Facility
  const facilities = data?.proposed_facilities || [];
  const facility: ProposedFacility = facilities[0] || {
    facility_type: loanType,
    facility_amount_lakhs: 5,
    loan_tenure_years: 3
  };

  const updateFacilityField = (field: keyof ProposedFacility, value: any) => {
    const updated = {
      ...facility,
      facility_type: loanType,
      [field]: field === "facility_amount_lakhs" ? (parseFloat(value) || 0) : (parseInt(value, 10) || 0)
    };
    onChange({ proposed_facilities: [updated] });
  };

  // Section: References
  const refs: Reference[] = data?.references || [];
  // Per-reference, per-field error map: errors[refIndex][fieldName]
  const [refFieldErrors, setRefFieldErrors] = useState<Record<string, string>[]>([ {}, {} ]);

  const setRefError = (idx: number, field: string, msg: string | null) => {
    setRefFieldErrors((prev) => {
      const next = [...prev];
      while (next.length <= idx) next.push({});
      next[idx] = { ...next[idx], [field]: msg ?? "" };
      return next;
    });
  };

  const validateRefField = (idx: number, field: keyof Reference, value: unknown) => {
    const schema = ReferenceSchema.shape[field];
    if (!schema) return;
    const result = (schema as any).safeParse(value);
    setRefError(idx, field, result.success ? null : result.error.issues[0]?.message ?? "Invalid value");
  };

  const [refErrors, setRefErrors] = useState<string[]>([ "", "" ]);

  const updateReference = (idx: number, field: keyof Reference, value: any) => {
    const updatedRefs = [...refs];
    while (updatedRefs.length <= idx) {
      updatedRefs.push(emptyReference());
    }
    
    updatedRefs[idx] = {
      ...updatedRefs[idx],
      [field]: field === "years_known" ? (parseInt(value, 10) || 1) : value,
    };

    // Family relationship check — keep inline for immediate feedback
    if (field === "relationship") {
      const isFamily = FAMILY_RELATIONSHIPS.some(f => value.toLowerCase().trim().includes(f));
      const updatedErrors = [...refErrors];
      updatedErrors[idx] = isFamily ? "References must not be family members." : "";
      setRefErrors(updatedErrors);
      // Also update per-field error for consistency
      setRefError(idx, "relationship", isFamily ? "References must not be family members" : null);
    }

    onChange({ references: updatedRefs });
  };

  // Section: Documents Checklist
  const checklist = data?.document_checklist || {};

  const docOptions = loanType === "BUSINESS_LOAN" ? [
    { key: "company_pan", label: "PAN Card of Company", required: true, apiSatisfied: true },
    { key: "company_address_proof", label: "Address Proof of Company (Electricity/Utility)", required: true },
    { key: "incorporation_certificate", label: "Certificate of Incorporation", required: true },
    { key: "shop_license", label: "Shop License", required: false },
    { key: "director_kyc", label: "PAN + Address Proof of Directors / Promoters", required: true, apiSatisfied: true },
    { key: "moa_aoa", label: "MoA + AoA", required: true },
    { key: "partnership_deed", label: "Partnership Deed", required: false },
    { key: "audited_financials", label: "Audited Financials - Last 3 Years", required: true },
    { key: "provisional_financials", label: "Provisional Financials - Last FY", required: true },
    { key: "itr_company_promoters", label: "ITR - Company + Promoters (with computations)", required: true },
    { key: "tax_audit_reports", label: "Tax Audit Reports - Last 3 Years (if applicable)", required: false },
    { key: "bank_statements_6m", label: "Bank Statement - Last 6 Months", required: true },
    { key: "existing_sanction_letters", label: "Sanction Letters of Declared Facilities", required: false },
    { key: "director_biodata", label: "Profile / Bio-data of Directors (Experience Proof)", required: true },
    { key: "company_profile", label: "Profile of Company & Key Persons", required: true }
  ] : [
    { key: "applicant_pan", label: "Individual PAN Card", required: true, apiSatisfied: true },
    { key: "applicant_address_proof", label: "Address Proof (Passport/Utility Bill)", required: true, apiSatisfied: true },
    { key: "itr_computations", label: "ITR + Computation of Income + Acknowledgement", required: true },
    { key: "bank_statements_6m", label: "Bank Statement - Last 6 Months", required: true },
    { key: "existing_sanction_letters", label: "Sanction Letters of Declared Facilities", required: false }
  ];

  const updateDocumentStatus = (key: string, updates: Partial<DocumentUploadItem>) => {
    const current = checklist[key] || {
      document_name: docOptions.find(d => d.key === key)?.label || key,
      is_submitted: false,
      status: "PENDING",
      is_api_satisfied: docOptions.find(d => d.key === key)?.apiSatisfied || false
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
    const docMeta = docOptions.find(d => d.key === key);
    updateDocumentStatus(key, {
      is_submitted: true,
      file_name: fileName,
      file_size: 2451092, // mock size 2.3MB
      status: "VERIFIED",
      is_api_satisfied: docMeta?.apiSatisfied || false
    });
  };

  if (mode === "references") {
    /* ================== REFERENCES VIEW ================== */
    return (
      <div className="space-y-4">
        {/* Proposed Facility Block */}
        <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-2">
          <h3 className="text-xs font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
            1. Proposed Loan Facility
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Facility Type *
              </label>
              <input
                type="text"
                value={loanType.replace("_", " ")}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-gray-100 dark:bg-slate-800/80 text-gray-900 dark:text-slate-100 outline-none uppercase font-semibold"
                disabled
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Sanction Amount (₹ Lakhs) *
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Amount in Lakhs"
                value={facility.facility_amount_lakhs || ""}
                onChange={(e) => updateFacilityField("facility_amount_lakhs", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Loan Tenure (Years) *
              </label>
              <input
                type="number"
                placeholder="Tenure in years"
                value={facility.loan_tenure_years || ""}
                onChange={(e) => updateFacilityField("loan_tenure_years", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* References Block */}
        <div className="space-y-3">
          <div className="border-b border-gray-150 dark:border-slate-800 pb-1 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
              2. References (Exactly 2, Non-Family)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[0, 1].map((idx) => {
              const ref = refs[idx] || emptyReference();
              return (
                <div key={idx} className="border border-gray-200 dark:border-slate-800 rounded p-2.5 bg-gray-50/50 dark:bg-slate-900/10 space-y-2">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-1">
                    <span className="text-[10px] font-extrabold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                      Reference #{idx + 1}
                    </span>
                    {refErrors[idx] && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-red-500 font-bold">
                        <AlertCircle className="w-3 h-3" /> {refErrors[idx]}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={ref.name || ""}
                        onChange={(e) => updateReference(idx, "name", e.target.value)}
                        onBlur={() => validateRefField(idx, "name", refs[idx]?.name)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refFieldErrors[idx]?.name ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                      <FieldError message={refFieldErrors[idx]?.name} />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Relationship (e.g. Colleague) *"
                        value={ref.relationship || ""}
                        onChange={(e) => updateReference(idx, "relationship", e.target.value)}
                        onBlur={() => validateRefField(idx, "relationship", refs[idx]?.relationship)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refFieldErrors[idx]?.relationship || refErrors[idx] ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                      <FieldError message={refFieldErrors[idx]?.relationship || refErrors[idx]} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Address Line 1 *"
                        value={ref.address_line1 || ""}
                        onChange={(e) => updateReference(idx, "address_line1", e.target.value)}
                        onBlur={() => validateRefField(idx, "address_line1", refs[idx]?.address_line1)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refFieldErrors[idx]?.address_line1 ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                      <FieldError message={refFieldErrors[idx]?.address_line1} />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Pincode *"
                        maxLength={6}
                        value={ref.pincode || ""}
                        onChange={(e) => updateReference(idx, "pincode", e.target.value)}
                        onBlur={() => validateRefField(idx, "pincode", refs[idx]?.pincode)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refFieldErrors[idx]?.pincode ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                      <FieldError message={refFieldErrors[idx]?.pincode} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <input
                        type="text"
                        placeholder="City *"
                        value={ref.city || ""}
                        onChange={(e) => updateReference(idx, "city", e.target.value)}
                        onBlur={() => validateRefField(idx, "city", refs[idx]?.city)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refFieldErrors[idx]?.city ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                      <FieldError message={refFieldErrors[idx]?.city} />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State *"
                        value={ref.state || ""}
                        onChange={(e) => updateReference(idx, "state", e.target.value)}
                        onBlur={() => validateRefField(idx, "state", refs[idx]?.state)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refFieldErrors[idx]?.state ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                      <FieldError message={refFieldErrors[idx]?.state} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="text"
                      placeholder="Occupation"
                      value={ref.occupation || ""}
                      onChange={(e) => updateReference(idx, "occupation", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                    />
                    <div>
                      <input
                        type="number"
                        placeholder="Years Known *"
                        value={ref.years_known || ""}
                        onChange={(e) => updateReference(idx, "years_known", e.target.value)}
                        onBlur={() => validateRefField(idx, "years_known", refs[idx]?.years_known)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refFieldErrors[idx]?.years_known ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                      <FieldError message={refFieldErrors[idx]?.years_known} />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Mobile No *"
                        maxLength={10}
                        value={ref.mobile_number || ""}
                        onChange={(e) => updateReference(idx, "mobile_number", e.target.value)}
                        onBlur={() => validateRefField(idx, "mobile_number", refs[idx]?.mobile_number)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refFieldErrors[idx]?.mobile_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                      <FieldError message={refFieldErrors[idx]?.mobile_number} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ================== DOCUMENTS CHECKLIST VIEW ================== */
  return (
    <div className="space-y-3">
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Required Documents checklist
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Upload self-attested copies of mandatory documents to satisfy credit underwriting constraints.
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
              <th className="py-1 px-3">Document Description *</th>
              <th className="py-1 px-2 text-center w-20">Submitted</th>
              <th className="py-1 px-3">Attached File Details</th>
              <th className="py-1 px-2 text-center w-28">Status</th>
              <th className="py-1 px-2 text-center w-32">Upload Specimen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-xs">
            {docOptions.map((doc) => {
              const stateItem = checklist[doc.key] || {
                document_name: doc.label,
                is_submitted: doc.apiSatisfied || false,
                status: doc.apiSatisfied ? "VERIFIED" : "PENDING",
                is_api_satisfied: doc.apiSatisfied || false
              };

              return (
                <tr key={doc.key} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-1.5 px-3">
                    <span className="font-semibold text-gray-950 dark:text-slate-200">{doc.label}</span>
                    {doc.required && (
                      <span className="text-red-500 font-extrabold ml-1">*</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!stateItem.is_submitted}
                      disabled={doc.apiSatisfied}
                      onChange={(e) => updateDocumentStatus(doc.key, { is_submitted: e.target.checked })}
                      className="w-3.5 h-3.5 accent-black dark:accent-white"
                    />
                  </td>
                  <td className="py-1.5 px-3 text-[10px] text-gray-500 dark:text-slate-400">
                    {doc.apiSatisfied ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> Auto-satisfied via API integrations
                      </span>
                    ) : stateItem.file_name ? (
                      <span className="flex items-center gap-1 font-mono text-gray-900 dark:text-slate-200">
                        <FileText className="w-3 h-3 text-gray-400" /> {stateItem.file_name} (2.3 MB)
                      </span>
                    ) : (
                      <span className="italic text-gray-400">No file uploaded</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                        stateItem.status === "VERIFIED"
                          ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                          : stateItem.status === "REJECTED"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}
                    >
                      {stateItem.status}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {!doc.apiSatisfied && (
                      <label className="inline-flex items-center gap-0.5 px-2 py-0.5 border border-gray-300 dark:border-slate-700 rounded text-[10px] font-bold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer shadow-sm transition-colors">
                        <Upload className="w-2.5 h-2.5" /> Upload
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSimulatedUpload(doc.key, file.name);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
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
