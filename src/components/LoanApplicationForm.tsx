"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import type { CompleteLoanApplication } from "@/lib/schemas/loan-application";
import { saveLoanApplication, submitLoanApplication } from "@/app/actions/loan-applications";
import ApplicationInfoStep from "./loan-steps/ApplicationInfoStep";
import ApplicantDetailsStep from "./loan-steps/ApplicantDetailsStep";
import CoApplicantDetailsStep from "./loan-steps/CoApplicantDetailsStep";
import ContactAndGroupCosStep from "./loan-steps/ContactAndGroupCosStep";
import BankAndFacilityStep from "./loan-steps/BankAndFacilityStep";
import ReferencesAndDocumentsStep from "./loan-steps/ReferencesAndDocumentsStep";
import DeclarationStep from "./loan-steps/DeclarationStep";
// Product-specific steps — inject into the form based on productType
import LapProductStep from "./loan-steps/LapProductStep";
import SclProductStep from "./loan-steps/SclProductStep";

// Valid product types for the three loan products
type ProductType = "LAP" | "SCL" | "GENERAL";

interface LoanApplicationFormProps {
  applicationId?: string;
  initialData?: Partial<CompleteLoanApplication>;
  onSuccess?: (applicationId: string) => void;
  // productType drives which product-specific step is injected
  productType?: ProductType;
  initialLoanType?: "PERSONAL_LOAN" | "BUSINESS_LOAN";
  readOnly?: boolean;
  onLoanTypeChange?: (loanType: "PERSONAL_LOAN" | "BUSINESS_LOAN") => void;
}

// Stable wrapper components defined outside the main component to prevent unmounting/remounting issues

const LapProductStepWrapper = ({ data, onChange, ...rest }: any) => {
  const productData = data.product_data || {};
  const handleProductDataChange = (newProductData: any) => {
    onChange({ product_data: newProductData });
  };
  return <LapProductStep {...rest} data={productData} onChange={handleProductDataChange} />;
};

const SclProductStepWrapper = ({ data, onChange, ...rest }: any) => {
  const productData = data.product_data || {};
  const handleProductDataChange = (newProductData: any) => {
    onChange({ product_data: newProductData });
  };
  return <SclProductStep {...rest} data={productData} onChange={handleProductDataChange} />;
};

const ReferencesStepWrapper = (props: any) => {
  return <ReferencesAndDocumentsStep {...props} mode="references" />;
};

const DocumentsStepWrapper = (props: any) => {
  return <ReferencesAndDocumentsStep {...props} mode="documents" />;
};

export default function LoanApplicationForm({
  applicationId,
  initialData,
  onSuccess,
  productType = "GENERAL", // Default to general for the reference form
  initialLoanType,
  readOnly = false,
  onLoanTypeChange,
}: LoanApplicationFormProps) {
  const [formData, setFormData] = useState<Partial<CompleteLoanApplication> & { product_data?: Record<string, any> }>(
    initialData || {
      application_info: { 
        loan_type: initialLoanType || "PERSONAL_LOAN", 
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
      // Holds product-specific JSONB fields; developers can add fields here freely
      product_data: {},
    }
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loanType = formData.application_info?.loan_type || "PERSONAL_LOAN";

  useEffect(() => {
    onLoanTypeChange?.(loanType);
  }, [loanType, onLoanTypeChange]);

  // Build the product-specific step based on productType
  // Uses a thin wrapper to bridge between formData.product_data and the step's own state.
  const productStepConfig = productType !== "GENERAL" ? {
    title:
      productType === "LAP" ? "Property & Valuation (LAP)" :
      "Credit Line Terms (SCL)",
    component: productType === "LAP" ? LapProductStepWrapper : SclProductStepWrapper,
  } : null;

  // Compute steps dynamically based on selected product type
  const baseSteps = [
    { id: 1, title: "Setup & Product", component: ApplicationInfoStep },
    { id: 2, title: "Applicant Details", component: ApplicantDetailsStep },
    {
      id: 3,
      title: "Co-Applicant",
      component: CoApplicantDetailsStep,
    },
    ...(loanType === "BUSINESS_LOAN"
      ? [{ id: 4, title: "Contact & Group Cos", component: ContactAndGroupCosStep }]
      : []),
    {
      id: loanType === "BUSINESS_LOAN" ? 5 : 4,
      title: "Financial Profile",
      component: BankAndFacilityStep,
    },
    {
      id: loanType === "BUSINESS_LOAN" ? 6 : 5,
      title: "Facility & References",
      component: ReferencesStepWrapper,
    },
    {
      id: loanType === "BUSINESS_LOAN" ? 7 : 6,
      title: "Documents",
      component: DocumentsStepWrapper,
    },
  ];

  // Inject the product-specific step just before Declaration
  const declarationStep = {
    id: baseSteps.length + 1 + (productStepConfig ? 1 : 0),
    title: "Review & Submit",
    component: DeclarationStep,
  };

  const steps = [
    ...baseSteps.map((s, i) => ({ ...s, id: i + 1 })),
    ...(productStepConfig ? [{ id: baseSteps.length + 1, ...productStepConfig }] : []),
    { ...declarationStep, id: baseSteps.length + 1 + (productStepConfig ? 1 : 0) },
  ].map((s, idx) => ({ ...s, id: idx + 1 }));

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  const handleStepChange = (stepData: any) => {
    setFormData((prev) => ({
      ...prev,
      ...stepData,
    }));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await saveLoanApplication(formData as CompleteLoanApplication, applicationId);
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
      // Save first
      const saveResult = await saveLoanApplication(formData as CompleteLoanApplication, applicationId);
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
        setSuccessMessage("Application submitted successfully!");
        onSuccess?.(appId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#eeeeee] dark:bg-slate-900/40 p-1">
      <div className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded shadow-sm">
        {/* Progress Bar */}
        <div className="bg-gray-50 dark:bg-slate-900/50 px-4 py-3 border-b border-gray-150 dark:border-slate-800">
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
          <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900 px-4 py-2 text-red-700 dark:text-red-400 text-[11px] font-medium leading-relaxed whitespace-pre-line">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-900 px-4 py-2 text-green-700 dark:text-green-400 text-[11px] font-medium">
            {successMessage}
          </div>
        )}

        {/* Form Content */}
        <div className="px-4 py-4 min-h-[400px]">
          <fieldset disabled={readOnly} className={readOnly ? "opacity-90 pointer-events-none" : ""}>
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={formData}
                onChange={handleStepChange}
              />
            )}
          </fieldset>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 dark:bg-slate-900/50 border-t border-gray-150 dark:border-slate-800 px-4 py-3 rounded-b-lg flex justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded text-xs font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="flex gap-2">
            {!readOnly && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded text-xs font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </button>
            )}

            {currentStep === steps.length ? (
              !readOnly ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 rounded text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              ) : null
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 rounded text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
