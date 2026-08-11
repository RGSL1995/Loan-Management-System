"use client";

import { AlertCircle, FileText, Upload, CheckCircle } from "lucide-react";
import type { DocumentUploadItem } from "@/lib/schemas/loan-application";

interface SclReferencesAndDocumentsStepProps {
  data?: any;
  onChange: (data: any) => void;
}

export default function SclReferencesAndDocumentsStep({ data, onChange }: SclReferencesAndDocumentsStepProps) {
  const loanType = data?.application_info?.loan_type || "PERSONAL_LOAN";
  const productData = data?.product_data || {};
  const checklist = data?.document_checklist || {};

  const isMandateRegistered = productData.mandate_status === "REGISTERED";
  const isKfsSigned = productData.kfs_status === "SIGNED";

  // Document checklist configuration for SCL Personal vs Business
  const docOptions = loanType === "BUSINESS_LOAN" ? [
    { key: "company_pan", label: "PAN Card of Company", required: true, apiSatisfied: true },
    { key: "company_address_proof", label: "Address Proof of Entity", required: true },
    { key: "incorporation_certificate", label: "Certificate of Incorporation / Partnership Deed", required: true },
    { key: "moa_aoa", label: "MoA + AoA / Partnership Constitution", required: true },
    { key: "director_kyc", label: "Director / Promoter KYC (PAN + Aadhaar OTP)", required: true },
    { key: "board_resolution", label: "Board resolution authorising SCL limit", required: true },
    { key: "audited_financials", label: "Audited Financials - Last 3 Years", required: true },
    { key: "provisional_financials", label: "Provisional Financials - Last FY", required: true },
    { key: "gst_returns_12m", label: "GST Returns - Last 12 Months", required: false, apiSatisfied: productData.aa_fetch_status === "FETCHED" },
    { key: "bank_statements_6m", label: "Bank Statement - Last 6 Months", required: true, apiSatisfied: productData.aa_fetch_status === "FETCHED" },
    { key: "signed_kfs", label: "Signed Key Fact Statement (KFS)", required: true, apiSatisfied: isKfsSigned },
    { key: "emandate_registration", label: "e-Mandate registration (NACH/UPI Autopay)", required: true, apiSatisfied: isMandateRegistered }
  ] : [
    { key: "applicant_pan", label: "Individual PAN Card", required: true, apiSatisfied: true },
    { key: "applicant_address_proof", label: "Address Proof (Aadhaar OTP e-KYC)", required: true, apiSatisfied: true },
    { key: "live_photo", label: "Live Photograph (Match vs CKYC)", required: true },
    { key: "vcip_session", label: "V-CIP (Video KYC) session recording", required: false },
    { key: "income_proof", label: "Income Proof (AA bank transactions / payslips / ITR)", required: true, apiSatisfied: productData.aa_fetch_status === "FETCHED" },
    { key: "employer_proof", label: "Employer / Business Proof", required: true },
    { key: "signed_kfs", label: "Signed Key Fact Statement (KFS)", required: true, apiSatisfied: isKfsSigned },
    { key: "signed_sanction", label: "Signed sanction letter + T&Cs", required: true, apiSatisfied: isKfsSigned },
    { key: "emandate_registration", label: "e-Mandate registration (NACH/UPI Autopay)", required: true, apiSatisfied: isMandateRegistered }
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
      file_size: 1450982, // mock size 1.4MB
      status: "VERIFIED",
      is_api_satisfied: docMeta?.apiSatisfied || false
    });
  };

  return (
    <div className="space-y-3">
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Required Documents Checklist (SCL)
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
                    ) : doc.apiSatisfied ? (
                      <span className="text-green-600 font-semibold italic">Satisfied via API/Setup</span>
                    ) : (
                      "No file attached"
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                      stateItem.status === "VERIFIED" || doc.apiSatisfied
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-450"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450"
                    }`}>
                      {doc.apiSatisfied ? "VERIFIED" : (stateItem.status || "PENDING")}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <label className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-[10px] font-bold uppercase hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer disabled:opacity-40">
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
                        disabled={doc.apiSatisfied}
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
