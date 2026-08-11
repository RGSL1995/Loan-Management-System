"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import type { CompleteLoanApplication } from "@/lib/schemas/loan-application";
import { saveLoanApplication, submitLoanApplication } from "@/app/actions/loan-applications";

import LasApplicationInfoStep from "./loan-steps/LasApplicationInfoStep";
import ApplicantDetailsStep from "./loan-steps/ApplicantDetailsStep";
import CoApplicantDetailsStep from "./loan-steps/CoApplicantDetailsStep";
import ContactAndGroupCosStep from "./loan-steps/ContactAndGroupCosStep";
import LasProductStep from "./loan-steps/LasProductStep";
import BankAndFacilityStep from "./loan-steps/BankAndFacilityStep";
import LasReferencesAndDocumentsStep from "./loan-steps/LasReferencesAndDocumentsStep";
import DeclarationStep from "./loan-steps/DeclarationStep";

interface LasLoanApplicationFormProps {
  applicationId?: string;
  initialData?: Partial<CompleteLoanApplication>;
  onSuccess?: (applicationId: string) => void;
  initialLoanType?: "PERSONAL_LOAN" | "BUSINESS_LOAN";
}

// Stable wrapper components defined outside the main component to prevent unmounting/remounting issues
const LasProductStepWrapper = ({ data, onChange, ...rest }: any) => {
  const productData = data.product_data || {};
  const handleProductDataChange = (newProductData: any) => {
    onChange({ product_data: newProductData });
  };
  return <LasProductStep {...rest} data={productData} onChange={handleProductDataChange} />;
};

const ReferencesStepWrapper = (props: any) => {
  return <LasReferencesAndDocumentsStep {...props} mode="references" />;
};

const DocumentsStepWrapper = (props: any) => {
  return <LasReferencesAndDocumentsStep {...props} mode="documents" />;
};

export default function LasLoanApplicationForm({
  applicationId,
  initialData,
  onSuccess,
  initialLoanType = "PERSONAL_LOAN",
}: LasLoanApplicationFormProps) {
  const [formData, setFormData] = useState<Partial<CompleteLoanApplication> & { product_data?: Record<string, any>, drawing_power?: number, total_collateral_value?: number }>(
    initialData || {
      application_info: { 
        loan_type: initialLoanType, 
        sourcing_channel: "DIGITAL" 
      },
      associate_companies: [],
      existing_loans: [],
      proposed_facilities: [],
      references: [],
      document_checklist: {},
      declaration: {
        decl_accepted: false,
        consent_credit_bureau: false,
        consent_data_sharing: false,
        consent_ekyc_aadhaar: false,
        declaration_date: new Date().toISOString().split("T")[0]
      },
      product_data: {},
      drawing_power: 0,
      total_collateral_value: 0,
    }
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loanType = formData.application_info?.loan_type || "PERSONAL_LOAN";

  // Compute steps dynamically based on selected profile (Personal vs Business)
  const baseSteps = [
    { id: 1, title: "Setup & Sourcing", component: LasApplicationInfoStep },
    { id: 2, title: "Applicant Details", component: ApplicantDetailsStep },
    {
      id: 3,
      title: "Co-Applicant / Joint Holders",
      component: CoApplicantDetailsStep,
    },
    ...(loanType === "BUSINESS_LOAN"
      ? [{ id: 4, title: "Contact & Group Cos", component: ContactAndGroupCosStep }]
      : []),
    {
      id: loanType === "BUSINESS_LOAN" ? 5 : 4,
      title: "Collateral - Securities",
      component: LasProductStepWrapper,
    },
    {
      id: loanType === "BUSINESS_LOAN" ? 6 : 5,
      title: "Financial Profile",
      component: BankAndFacilityStep,
    },
    {
      id: loanType === "BUSINESS_LOAN" ? 7 : 6,
      title: "Facility Ask & References",
      component: ReferencesStepWrapper,
    },
    {
      id: loanType === "BUSINESS_LOAN" ? 8 : 7,
      title: "Documents",
      component: DocumentsStepWrapper,
    },
  ];

  // Inject the final Declaration step at the end
  const declarationStep = {
    id: baseSteps.length + 1,
    title: "Review & Submit",
    component: DeclarationStep,
  };

  const steps = [
    ...baseSteps.map((s, i) => ({ ...s, id: i + 1 })),
    { ...declarationStep, id: baseSteps.length + 1 },
  ];

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  const handleStepChange = (stepData: any) => {
    // If the step component updates drawing power or collateral total, bubble it up to top level
    const extraFields: Record<string, any> = {};
    if (stepData.product_data?.drawing_power !== undefined) {
      extraFields.drawing_power = stepData.product_data.drawing_power;
    }
    if (stepData.product_data?.total_collateral_value !== undefined) {
      extraFields.total_collateral_value = stepData.product_data.total_collateral_value;
    }

    setFormData((prev) => ({
      ...prev,
      ...stepData,
      ...extraFields,
      // Safely merge product_data if present
      product_data: stepData.product_data 
        ? { ...prev.product_data, ...stepData.product_data }
        : prev.product_data
    }));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      // Save directly to Supabase
      const payload = {
        ...formData,
        product_type: loanType === "BUSINESS_LOAN" ? "LAS_BUSINESS" : "LAS_PERSONAL"
      };
      const result = await saveLoanApplication(payload as any, applicationId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("Draft saved successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
        if (result.data?.id && !applicationId) {
          onSuccess?.(result.data.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check references count
      if ((formData.references || []).length < 2) {
        setError("Please add at least two references before submitting.");
        setLoading(false);
        return;
      }

      // Check facility amount vs drawing power
      const proposedFacilities = formData.proposed_facilities || [];
      const facility = proposedFacilities[0] || { facility_amount_lakhs: 0 };
      const limitRequestedInRupees = (facility.facility_amount_lakhs || 0) * 100000;
      const dp = formData.drawing_power || 0;
      if (limitRequestedInRupees <= 0) {
        setError("Facility requested limit amount must be greater than 0.");
        setLoading(false);
        return;
      }
      if (limitRequestedInRupees > dp) {
        setError(`Requested limit amount (₹${limitRequestedInRupees.toLocaleString()}) cannot exceed your eligible Drawing Power (₹${dp.toLocaleString()}).`);
        setLoading(false);
        return;
      }

      // Check documents checklist
      const mandatoryDocsKeys = loanType === "BUSINESS_LOAN"
        ? ["company_pan", "company_address_proof", "incorporation_docs", "directors_kyc", "demat_statement", "board_resolution", "audited_financials", "bank_statements_6m"]
        : ["applicant_pan", "applicant_address_proof", "demat_statement", "pledge_form"];

      const missingDocs = mandatoryDocsKeys.filter(key => {
        const doc = (formData.document_checklist || {})[key];
        return !doc || !doc.is_submitted;
      });

      if (missingDocs.length > 0) {
        setError("Please upload all mandatory documents before submitting.");
        setLoading(false);
        return;
      }

      // Save first
      const payload = {
        ...formData,
        product_type: loanType === "BUSINESS_LOAN" ? "LAS_BUSINESS" : "LAS_PERSONAL"
      };
      const saveResult = await saveLoanApplication(payload as any, applicationId);
      if (saveResult.error) {
        setError(saveResult.error);
        return;
      }

      const appId = applicationId || saveResult.data?.id;
      if (!appId) throw new Error("Application ID not found");

      // Then submit
      const submitResult = await submitLoanApplication(appId);
      if (submitResult.error) {
        setError(submitResult.error);
      } else {
        setSuccessMessage("LAS Application submitted successfully!");
        onSuccess?.(appId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Progress Bar */}
      <div className="bg-gray-50 dark:bg-slate-900/50 px-4 py-3 border-b border-gray-150 dark:border-slate-800 shrink-0">
        <div className="flex flex-wrap gap-2">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => setCurrentStep(step.id)}
                disabled={idx >= currentStep && !formData.application_info?.loan_type}
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  idx < currentStep - 1
                    ? "bg-green-600 text-white cursor-pointer"
                    : idx === currentStep - 1
                    ? "bg-black text-white dark:bg-white dark:text-black font-extrabold"
                    : "bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-pointer"
                }`}
              >
                {idx < currentStep - 1 ? "✓" : step.id}
              </button>
              <span
                className={`text-[10px] font-semibold tracking-tight hidden md:block ${
                  idx <= currentStep - 1
                    ? "text-gray-900 dark:text-slate-100 font-bold"
                    : "text-gray-400 dark:text-slate-500"
                }`}
              >
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <div className="w-4 h-[1px] bg-gray-300 dark:bg-slate-800" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/60 px-4 py-2 text-red-700 dark:text-red-400 text-[11px] font-semibold flex items-center justify-between shrink-0">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-[10px] underline hover:no-underline">Dismiss</button>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-900/60 px-4 py-2 text-green-700 dark:text-green-400 text-[11px] font-semibold shrink-0">
          ✓ {successMessage}
        </div>
      )}

      {/* Form Steps Scroll View */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded p-4 shadow-sm max-w-7xl mx-auto">
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={formData}
              onChange={handleStepChange}
            />
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-3 py-2 shrink-0 flex justify-between gap-2">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1 || loading}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          {currentStep === steps.length ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? "Submitting..." : "Submit LAS Application"}
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
