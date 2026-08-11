"use client";

import { useState } from "react";
import { AlertCircle, FileText, Upload, CheckCircle } from "lucide-react";
import type { Reference, ProposedFacility, DocumentUploadItem } from "@/lib/schemas/loan-application";

interface LapReferencesAndDocumentsStepProps {
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

export default function LapReferencesAndDocumentsStep({ data, onChange, mode }: LapReferencesAndDocumentsStepProps) {
  const loanType = data?.application_info?.loan_type || "PERSONAL_LOAN";
  const productData = data?.product_data || {};
  
  // Section: Proposed Facility
  const facilities = data?.proposed_facilities || [];
  const facility: ProposedFacility = facilities[0] || {
    facility_type: loanType,
    facility_amount_lakhs: productData.proposed_amount_lakhs || 10,
    loan_tenure_years: productData.tenure_years || 5
  };

  const updateFacilityField = (field: keyof ProposedFacility | "end_use_declaration" | "end_use_declaration_other", value: any) => {
    const updated = {
      ...facility,
      facility_type: loanType,
      [field]: field === "facility_amount_lakhs" ? (parseFloat(value) || 0) : 
               field === "loan_tenure_years" ? (parseInt(value, 10) || 0) : value
    };
    
    // Sync with product_data to let the Property valuation step read it
    const extraProductData: Record<string, any> = {};
    if (field === "facility_amount_lakhs") {
      extraProductData.proposed_amount_lakhs = parseFloat(value) || 0;
    }
    if (field === "loan_tenure_years") {
      extraProductData.tenure_years = parseInt(value, 10) || 0;
    }
    if (field === "end_use_declaration") {
      extraProductData.end_use_declaration = value;
    }

    onChange({ 
      proposed_facilities: [updated],
      product_data: {
        ...productData,
        ...extraProductData
      }
    });
  };

  // Section: References
  const refs: Reference[] = data?.references || [];
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

    // Relation check
    if (field === "relationship") {
      const relation = value.toLowerCase().trim();
      const updatedErrors = [...refErrors];
      if (FAMILY_RELATIONSHIPS.includes(relation)) {
        updatedErrors[idx] = "Family members excluded";
      } else {
        updatedErrors[idx] = "";
      }
      setRefErrors(updatedErrors);
    }

    onChange({ references: updatedRefs });
  };

  // Section: Documents Checklist
  const checklist = data?.document_checklist || {};

  const docOptions = loanType === "BUSINESS_LOAN" ? [
    { key: "company_pan", label: "PAN Card of Company", required: true, apiSatisfied: true },
    { key: "company_address_proof", label: "Address Proof / KYC OVD of Company", required: true },
    { key: "title_deed_chain", label: "Complete Title Deed Chain (Original Deeds)", required: true },
    { key: "encumbrance_certificate", label: "Encumbrance Certificate (13-30 Years)", required: true },
    { key: "property_tax_receipt", label: "Latest Property Tax Receipts paid", required: true },
    { key: "approved_plan_oc", label: "Approved building plan + Occupancy Certificate", required: false },
    { key: "foreclosure_letter", label: "Prior loan foreclosure letter + LOD (BT cases)", required: false },
    { key: "bank_statements_6m", label: "Bank Statement - Last 6 Months", required: true },
    { key: "itr_company_promoters", label: "ITR + computation - Last 2-3 Years", required: true },
    { key: "coapplicant_kyc", label: "Co-applicant / Co-owner KYC (PAN + Address)", required: false },
    { key: "incorporation_certificate", label: "Certificate of Incorporation / Partnership Deed", required: true },
    { key: "moa_aoa", label: "MoA + AoA / Partnership Constitution", required: true },
    { key: "board_resolution", label: "Board resolution authorising borrowing & mortgage creation", required: true },
    { key: "audited_financials", label: "Audited Financials - Last 3 Years + Provisional", required: true },
    { key: "gst_returns_12m", label: "GST Returns - Last 12 Months", required: false },
    { key: "company_profile", label: "Profile of Company, Directors & Key Persons", required: true }
  ] : [
    { key: "applicant_pan", label: "Individual PAN Card", required: true, apiSatisfied: true },
    { key: "applicant_address_proof", label: "Address Proof / KYC OVD (DigiLocker)", required: true, apiSatisfied: true },
    { key: "title_deed_chain", label: "Complete Title Deed Chain (Original Deeds)", required: true },
    { key: "encumbrance_certificate", label: "Encumbrance Certificate (13-30 Years)", required: true },
    { key: "property_tax_receipt", label: "Latest Property Tax Receipts paid", required: true },
    { key: "approved_plan_oc", label: "Approved building plan + Occupancy Certificate", required: false },
    { key: "foreclosure_letter", label: "Prior loan foreclosure letter + LOD (BT cases)", required: false },
    { key: "bank_statements_6m", label: "Bank Statement - Last 6 Months", required: true },
    { key: "itr_computations", label: "ITR + Computation - Last 2-3 Years", required: true },
    { key: "coapplicant_kyc", label: "Co-applicant / Co-owner KYC (PAN + Address)", required: false },
    { key: "income_proof", label: "Income proof (Salary slips / Form 16 / Business docs)", required: true }
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
      file_size: 3450912, // mock size 3.3MB
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
          <h3 className="text-xs font-bold text-gray-990 dark:text-slate-200 uppercase tracking-wider">
            1. Proposed LAP Loan Facility
          </h3>
          <div className={`grid grid-cols-1 gap-2 ${productData.end_use_declaration === "OTHER" ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Facility Type *
              </label>
              <input
                type="text"
                value="LAP Term Loan (EMI)"
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
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                End Use Declaration *
              </label>
              <select
                value={productData.end_use_declaration || "BUSINESS_EXPANSION"}
                onChange={(e) => updateFacilityField("end_use_declaration", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              >
                <option value="BUSINESS_EXPANSION">Business Expansion / Capex</option>
                <option value="WORKING_CAPITAL">Working Capital Requirement</option>
                <option value="PERSONAL_MEDICAL">Personal (Medical Expenses)</option>
                <option value="PERSONAL_EDUCATION">Personal (Higher Education)</option>
                <option value="PERSONAL_MARRIAGE">Personal (Marriage)</option>
                <option value="DEBT_CONSOLIDATION">Debt Consolidation</option>
                <option value="OTHER">Other Non-Speculative Use</option>
              </select>
            </div>

            {productData.end_use_declaration === "OTHER" && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                  Specify End Use *
                </label>
                <input
                  type="text"
                  placeholder="Specify other end use"
                  value={productData.end_use_declaration_other || ""}
                  onChange={(e) => updateFacilityField("end_use_declaration_other", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                  required
                />
              </div>
            )}
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
                        className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Relationship (e.g. Colleague) *"
                        value={ref.relationship || ""}
                        onChange={(e) => updateReference(idx, "relationship", e.target.value)}
                        className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                          refErrors[idx] ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 dark:border-slate-700"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Address Line 1 *"
                      value={ref.address_line1 || ""}
                      onChange={(e) => updateReference(idx, "address_line1", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                      required
                    />
                    <div className="grid grid-cols-3 gap-1">
                      <input
                        type="text"
                        placeholder="PIN *"
                        maxLength={6}
                        value={ref.pincode || ""}
                        onChange={(e) => updateReference(idx, "pincode", e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="City *"
                        value={ref.city || ""}
                        onChange={(e) => updateReference(idx, "city", e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={ref.state || ""}
                        onChange={(e) => updateReference(idx, "state", e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Occupation"
                      value={ref.occupation || ""}
                      onChange={(e) => updateReference(idx, "occupation", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Years Known *"
                      value={ref.years_known || ""}
                      onChange={(e) => updateReference(idx, "years_known", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Mobile No *"
                      maxLength={10}
                      value={ref.mobile_number || ""}
                      onChange={(e) => updateReference(idx, "mobile_number", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                      required
                    />
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
          Required Documents Checklist (LAP)
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
                  <td className="py-1.5 px-3 font-mono text-[10px] text-gray-500 dark:text-slate-400">
                    {stateItem.file_name ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-slate-300">{stateItem.file_name}</span>
                        <span>{((stateItem.file_size || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      "No file attached"
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                      stateItem.status === "VERIFIED"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-450"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450"
                    }`}>
                      {stateItem.status || "PENDING"}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <label className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-[10px] font-bold uppercase hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer">
                      <Upload className="w-3 h-3" />
                      Upload File
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSimulatedUpload(doc.key, file.name);
                        }}
                        className="hidden"
                      />
                    </label>
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
