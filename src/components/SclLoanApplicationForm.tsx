"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import type { CompleteLoanApplication } from "@/lib/schemas/loan-application";
import { saveLoanApplication, submitLoanApplication } from "@/app/actions/loan-applications";

import SclApplicationInfoStep from "./loan-steps/SclApplicationInfoStep";
import ApplicantDetailsStep from "./loan-steps/ApplicantDetailsStep";
import CoApplicantDetailsStep from "./loan-steps/CoApplicantDetailsStep";
import ContactAndGroupCosStep from "./loan-steps/ContactAndGroupCosStep";
import SclProductStep from "./loan-steps/SclProductStep";
import BankAndFacilityStep from "./loan-steps/BankAndFacilityStep";
import SclCreditLineSetupStep from "./loan-steps/SclCreditLineSetupStep";
import SclReferencesAndDocumentsStep from "./loan-steps/SclReferencesAndDocumentsStep";
import DeclarationStep from "./loan-steps/DeclarationStep";

interface SclLoanApplicationFormProps {
  applicationId?: string;
  initialData?: Partial<CompleteLoanApplication>;
  onSuccess?: (applicationId: string) => void;
  initialLoanType?: "PERSONAL_LOAN" | "BUSINESS_LOAN";
}

// Stable wrapper components
const SclProductStepWrapper = ({ data, onChange, ...rest }: any) => {
  return <SclProductStep {...rest} data={data} onChange={onChange} />;
};

const CreditLineSetupStepWrapper = ({ data, onChange, ...rest }: any) => {
  return <SclCreditLineSetupStep {...rest} data={data} onChange={onChange} />;
};

const DocumentsStepWrapper = ({ data, onChange, ...rest }: any) => {
  return <SclReferencesAndDocumentsStep {...rest} data={data} onChange={onChange} />;
};

export default function SclLoanApplicationForm({
  applicationId,
  initialData,
  onSuccess,
  initialLoanType = "PERSONAL_LOAN",
}: SclLoanApplicationFormProps) {
  const [formData, setFormData] = useState<Partial<CompleteLoanApplication> & { product_data?: Record<string, any> }>(
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
      product_data: {
        origination_channel: "OWN_DLA",
        occupation_type: "SALARIED",
        employer_name: "",
        declared_monthly_income: 0,
        aa_consent: false,
        aa_fetch_status: "PENDING",
        requested_limit: 100000,
        purpose_of_line: "WC",
        repayment_mode: "UPI_AUTOPAY",
        mandate_status: "PENDING",
        statement_cycle_day: "5",
        kfs_status: "PENDING",
      },
    }
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loanType = formData.application_info?.loan_type || "PERSONAL_LOAN";

  // Build steps dynamically based on personal vs business profile
  const baseSteps = [
    { id: 1, title: "Setup & Channel", component: SclApplicationInfoStep },
    { id: 2, title: "Applicant Details", component: ApplicantDetailsStep },
    {
      id: 3,
      title: "Co-Applicant / Co-Borrowers",
      component: CoApplicantDetailsStep,
    },
    ...(loanType === "BUSINESS_LOAN"
      ? [{ id: 4, title: "Contact & Group Cos", component: ContactAndGroupCosStep }]
      : []),
    {
      id: loanType === "BUSINESS_LOAN" ? 5 : 4,
      title: "Income & Capacity",
      component: SclProductStepWrapper,
    },
    {
      id: loanType === "BUSINESS_LOAN" ? 6 : 5,
      title: "Financial Profile",
      component: BankAndFacilityStep,
    },
    {
      id: loanType === "BUSINESS_LOAN" ? 7 : 6,
      title: "Credit Line Setup",
      component: CreditLineSetupStepWrapper,
    },
    {
      id: loanType === "BUSINESS_LOAN" ? 8 : 7,
      title: "Documents",
      component: DocumentsStepWrapper,
    },
  ];

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
    setFormData((prev) => ({
      ...prev,
      ...stepData,
      product_data: stepData.product_data 
        ? { ...prev.product_data, ...stepData.product_data }
        : prev.product_data
    }));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload = {
        ...formData,
        status: "DRAFT",
      };
      const result = await saveLoanApplication(payload as any, applicationId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("Application draft saved successfully!");
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
    setSuccessMessage(null);
    try {
      const payload = {
        ...formData,
        status: "SUBMITTED",
      };

      const saveResult = await saveLoanApplication(payload as any, applicationId);
      if (saveResult.error) {
        setError(saveResult.error);
        return;
      }

      const appId = applicationId || saveResult.data?.id;
      if (!appId) throw new Error("Application ID not found");

      const submitResult = await submitLoanApplication(appId);
      if (submitResult.error) {
        setError(submitResult.error);
      } else {
        setSuccessMessage("SCL Application submitted successfully!");
        onSuccess?.(appId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-50 dark:bg-slate-955">
      {/* Progress Stepper Bar */}
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
              {loading ? "Submitting..." : "Submit SCL Application"}
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
