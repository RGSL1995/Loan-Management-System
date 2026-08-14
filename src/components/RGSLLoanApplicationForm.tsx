"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Save, Send, Upload, Database } from "lucide-react";
import { saveLoanApplication, submitLoanApplication } from "@/app/actions/loan-applications";
import DocumentUploadModal from "./DocumentUploadModal";
import CompanySearchModal from "./CompanySearchModal";
import DocumentsUploadSection from "./DocumentsUploadSection";
import { createClient } from "@/lib/supabase/client";

interface RGSLLoanApplicationFormProps {
  applicationId?: string;
  onSuccess?: (applicationId: string) => void;
}

const STEPS = [
  { id: "loan-details", label: "Loan Details", icon: "📋" },
  { id: "applicant", label: "Applicant", icon: "👤" },
  { id: "collateral", label: "Collateral Details", icon: "🏠" },
  { id: "processing", label: "Processing Fees", icon: "💳" },
  { id: "declaration", label: "Declaration", icon: "✓" },
  { id: "documents", label: "Documents", icon: "📄" },
];

export default function RGSLLoanApplicationForm({
  applicationId,
  onSuccess,
}: RGSLLoanApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicantType, setApplicantType] = useState<"individual" | "corporate" | "others">("individual");
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState<"loan_application" | "sanction_letter">("loan_application");
  const [showCompanySearch, setShowMCAModal] = useState(false);

  const [formData, setFormData] = useState({
    // Loan Details
    loan_amount: "",
    loan_tenure: "",
    loan_purpose: "",
    loan_facility_type: "",
    branch: "",
    applicant_type: "individual" as "individual" | "corporate" | "others",

    // Applicant Individual Details
    individual: {
      name: "",
      father_husband_name: "",
      gender: "",
      marital_status: "",
      dob: "",
      qualification: "",
      occupation: "",
      pan: "",
      aadhaar: "",
      passport: "",
      mobile: "",
      landline: "",
      email: "",
      current_address: "",
      current_state: "",
      current_city: "",
      current_pin: "",
      residence_type: "",
      years_of_residence: "",
      permanent_address: "",
      permanent_state: "",
      permanent_city: "",
      permanent_pin: "",
      work_office_name: "",
      work_address: "",
      work_city: "",
      work_pin: "",
      work_landmark: "",
      work_landline: "",
      work_email: "",
    },

    // Applicant Business Details
    business: {
      company_type: "",
      is_registered: "",
      entity_name: "",
      dol: "",
      pan: "",
      cin_llpin: "",
      corporate_address: "",
      corporate_state: "",
      corporate_pin: "",
      contact_no: "",
      contact_email: "",
      registered_address: "",
      registered_state: "",
      registered_pin: "",
      ownership_type: "",
      landline: "",
      email: "",
      gstin_uin: "",
    },

    // Collateral Details (up to 3)
    collaterals: [
      {
        type: "",
        charge_type: "",
        property_age: "",
        property_status: "",
        address: "",
        details: "",
        taluka: "",
        village_city: "",
        pin: "",
      },
    ],

    // Processing Fees
    processing_fees: {
      instrument_type: "",
      instrument_no: "",
      amount: "",
      bank_name: "",
      instrument_date: "",
    },

    // Other Details
    other_details: "",

    // Declaration
    declaration_accepted: false,

    // Documents
    documents_checklist: [],
  });

  // Load existing application data
  useEffect(() => {
    if (!applicationId) return;

    const loadApplicationData = async () => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("loan_applications")
          .select("*")
          .eq("id", applicationId)
          .single();

        if (error || !data) {
          console.error("Failed to load application:", error);
          return;
        }

        // Populate form with saved data
        setFormData((prev) => ({
          ...prev,
          loan_amount: data.loan_amount?.toString() || "",
          loan_tenure: data.loan_tenure?.toString() || "",
          loan_purpose: data.loan_purpose || "",
          loan_facility_type: data.loan_facility_type || "",
          branch: data.branch || "",
          applicant_type: data.applicant_type || "individual",
          individual: data.individual_applicant_data || prev.individual,
          business: data.business_applicant_data || prev.business,
          collaterals: data.collateral_details || prev.collaterals,
          processing_fees: data.processing_fees_data || prev.processing_fees,
          other_details: data.other_details || "",
        }));

        // Set applicant type for UI
        if (data.applicant_type) {
          setApplicantType(data.applicant_type);
        }
      } catch (err) {
        console.error("Error loading application:", err);
      }
    };

    loadApplicationData();
  }, [applicationId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value,
      },
    }));
  };

  const handleCompanyDataFetched = (mcaData: any) => {
    setFormData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        entity_name: mcaData.entity_name || prev.business.entity_name,
        cin_llpin: mcaData.cin_llpin || prev.business.cin_llpin,
        pan: mcaData.pan || prev.business.pan,
        dol: mcaData.dol || prev.business.dol,
        company_type: mcaData.company_type || prev.business.company_type,
        is_registered: mcaData.is_registered || prev.business.is_registered,
        corporate_address: mcaData.corporate_address || prev.business.corporate_address,
        corporate_state: mcaData.corporate_state || prev.business.corporate_state,
        corporate_pin: mcaData.corporate_pin || prev.business.corporate_pin,
        contact_no: mcaData.contact_no || prev.business.contact_no,
        contact_email: mcaData.contact_email || prev.business.contact_email,
        registered_address: mcaData.registered_address || prev.business.registered_address,
        registered_state: mcaData.registered_state || prev.business.registered_state,
        registered_pin: mcaData.registered_pin || prev.business.registered_pin,
        gstin_uin: mcaData.gstin_uin || prev.business.gstin_uin,
      },
    }));
  };

  const handleCollateralChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev };
      (updated as any).collaterals[index][field] = value;
      return updated;
    });
  };

  const addCollateral = () => {
    setFormData((prev) => ({
      ...prev,
      collaterals: [
        ...prev.collaterals,
        {
          type: "",
          charge_type: "",
          property_age: "",
          property_status: "",
          address: "",
          details: "",
          taluka: "",
          village_city: "",
          pin: "",
        },
      ],
    }));
  };

  // Helper function to extract FIRST numeric value from formatted strings (handles Indian format)
  const extractFirstNumber = (value: string | number): string => {
    if (!value && value !== 0) return "";
    // Convert to string if number
    const valueStr = String(value);
    // Remove all non-numeric characters except decimal point
    const cleaned = valueStr.replace(/[^\d.]/g, "");
    // Extract first sequence of digits (handle both 175000000 and 175.00)
    const match = cleaned.match(/\d+(?:\.\d+)?/);
    // Return as integer (remove decimal if present)
    return match ? Math.floor(parseFloat(match[0])).toString() : "";
  };

  const handleDocumentUpload = (extractedData: any) => {
    // Merge extracted data into form data
    setFormData((prev) => {
      const merged = { ...prev };

      // Update loan details - clean up formatted values (extract first number only)
      if (extractedData.loan_amount) {
        merged.loan_amount = extractFirstNumber(extractedData.loan_amount);
      }
      if (extractedData.loan_tenure) {
        merged.loan_tenure = extractFirstNumber(extractedData.loan_tenure);
      }
      if (extractedData.loan_purpose) merged.loan_purpose = extractedData.loan_purpose;
      if (extractedData.loan_facility_type) merged.loan_facility_type = extractedData.loan_facility_type;

      // Determine applicant type
      let determinedType = extractedData.applicant_type || "individual";

      // Auto-detect corporate if business data exists or applicant name looks like company
      if (extractedData.business && extractedData.business.entity_name) {
        determinedType = "corporate";
      } else if (extractedData.individual && extractedData.individual.name) {
        const name = extractedData.individual.name.toLowerCase();
        // Check if name contains corporate indicators
        if (name.includes("private limited") || name.includes("pvt ltd") ||
            name.includes("limited") || name.includes("llp") ||
            name.includes("corporation") || name.includes("company")) {
          determinedType = "corporate";
        }
      }

      // Update applicant type
      if (determinedType) {
        setApplicantType(determinedType);
        merged.applicant_type = determinedType;
      }

      // Update individual data if present
      if (extractedData.individual) {
        merged.individual = {
          ...merged.individual,
          ...extractedData.individual,
        };
      }

      // Update business data if present
      if (extractedData.business) {
        merged.business = {
          ...merged.business,
          ...extractedData.business,
        };
      }

      // Update collaterals if present
      if (extractedData.collaterals && extractedData.collaterals.length > 0) {
        merged.collaterals = extractedData.collaterals;
      }

      // Update processing fees if present
      if (extractedData.processing_fees) {
        merged.processing_fees = {
          ...merged.processing_fees,
          ...extractedData.processing_fees,
        };
      }

      // Update other details if present
      if (extractedData.other_details) merged.other_details = extractedData.other_details;

      return merged;
    });

    // Show success message
    alert("Document data extracted and form filled successfully! Please review the fields.");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const result = await saveLoanApplication(formData, applicationId, "GENERAL");
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert("Application saved successfully!");
        if (result.data?.id && onSuccess) {
          onSuccess(result.data.id);
        }
      }
    } catch (err) {
      alert("Failed to save application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!applicationId) {
      alert("Please save the application first");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitLoanApplication(applicationId);
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert("Application submitted successfully!");
      }
    } catch (err) {
      alert("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              RGSL General Loan Application
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setUploadDocumentType("loan_application");
                setShowDocumentUpload(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Upload className="w-3 h-3" /> Upload Form
            </button>
            <button
              onClick={() => {
                setUploadDocumentType("sanction_letter");
                setShowDocumentUpload(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Upload className="w-3 h-3" /> Upload Letter
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`px-4 py-2 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                idx === currentStep
                  ? "bg-blue-600 text-white"
                  : idx < currentStep
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
              }`}
            >
              {step.icon} {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <div className="space-y-6 bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Loan Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Requested Loan Amount *
                  </label>
                  <input
                    type="number"
                    value={formData.loan_amount}
                    onChange={(e) => handleInputChange("loan_amount", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Tenure of Loan (Months) *
                  </label>
                  <input
                    type="number"
                    value={formData.loan_tenure}
                    onChange={(e) => handleInputChange("loan_tenure", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                    placeholder="Enter tenure"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Purpose of Loan *
                  </label>
                  <textarea
                    value={formData.loan_purpose}
                    onChange={(e) => handleInputChange("loan_purpose", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                    placeholder="Enter purpose of loan"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Type of Loan Facility *
                  </label>
                  <select
                    value={formData.loan_facility_type}
                    onChange={(e) => handleInputChange("loan_facility_type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">Select Loan Facility Type</option>
                    <option value="loan_against_property">Loan Against Property</option>
                    <option value="loan_against_securities">Loan Against Securities</option>
                    <option value="real_estate_project_finance">Real-estate Project Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Branch *
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => handleInputChange("branch", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">Select Branch</option>
                    <option value="noida">Noida</option>
                    <option value="delhi">Delhi</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">
                  Applicant Type
                </h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="individual"
                      checked={applicantType === "individual"}
                      onChange={(e) => setApplicantType(e.target.value as "individual" | "corporate" | "others")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Individual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="corporate"
                      checked={applicantType === "corporate"}
                      onChange={(e) => setApplicantType(e.target.value as "individual" | "corporate" | "others")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Corporate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="others"
                      checked={applicantType === "others"}
                      onChange={(e) => setApplicantType(e.target.value as "individual" | "corporate" | "others")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Others</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && applicantType === "individual" && (
            <div className="space-y-6 bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                Applicant Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.individual.name}
                    onChange={(e) => handleNestedChange("individual", "name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Father's / Husband's Name
                  </label>
                  <input
                    type="text"
                    value={formData.individual.father_husband_name}
                    onChange={(e) => handleNestedChange("individual", "father_husband_name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.individual.gender}
                    onChange={(e) => handleNestedChange("individual", "gender", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Marital Status
                  </label>
                  <select
                    value={formData.individual.marital_status}
                    onChange={(e) => handleNestedChange("individual", "marital_status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">Select Status</option>
                    <option value="married">Married</option>
                    <option value="single">Single</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.individual.dob}
                    onChange={(e) => handleNestedChange("individual", "dob", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Qualification
                  </label>
                  <select
                    value={formData.individual.qualification}
                    onChange={(e) => handleNestedChange("individual", "qualification", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="high_school">High School</option>
                    <option value="graduate">Graduate</option>
                    <option value="post_graduate">Post Graduate</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Occupation
                  </label>
                  <select
                    value={formData.individual.occupation}
                    onChange={(e) => handleNestedChange("individual", "occupation", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="salaried">Salaried</option>
                    <option value="business">Business</option>
                    <option value="housewife">Housewife</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    PAN
                  </label>
                  <input
                    type="text"
                    value={formData.individual.pan}
                    onChange={(e) => handleNestedChange("individual", "pan", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                    placeholder="XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Aadhaar
                  </label>
                  <input
                    type="text"
                    value={formData.individual.aadhaar}
                    onChange={(e) => handleNestedChange("individual", "aadhaar", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                    placeholder="XXXX XXXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.individual.mobile}
                    onChange={(e) => handleNestedChange("individual", "mobile", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.individual.email}
                    onChange={(e) => handleNestedChange("individual", "email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Current Residential Address
                  </label>
                  <textarea
                    value={formData.individual.current_address}
                    onChange={(e) => handleNestedChange("individual", "current_address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.individual.current_state}
                    onChange={(e) => handleNestedChange("individual", "current_state", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.individual.current_city}
                    onChange={(e) => handleNestedChange("individual", "current_city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={formData.individual.current_pin}
                    onChange={(e) => handleNestedChange("individual", "current_pin", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Residence Type
                  </label>
                  <select
                    value={formData.individual.residence_type}
                    onChange={(e) => handleNestedChange("individual", "residence_type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="rented">Rented</option>
                    <option value="owned">Owned</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Years of Residence
                  </label>
                  <input
                    type="number"
                    value={formData.individual.years_of_residence}
                    onChange={(e) => handleNestedChange("individual", "years_of_residence", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (applicantType === "corporate" || applicantType === "others") && (
            <div className="space-y-6 bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Applicant Details
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMCAModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-sm font-medium"
                >
                  <Database className="w-4 h-4" />
                  Fetch Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Company/Business Type
                  </label>
                  <select
                    value={formData.business.company_type}
                    onChange={(e) => handleNestedChange("business", "company_type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="public">Public</option>
                    <option value="pvt_ltd">Pvt. Ltd.</option>
                    <option value="partnership">Partnership Firm</option>
                    <option value="llp">LLP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Registered?
                  </label>
                  <select
                    value={formData.business.is_registered}
                    onChange={(e) => handleNestedChange("business", "is_registered", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Entity Name *
                  </label>
                  <input
                    type="text"
                    value={formData.business.entity_name}
                    onChange={(e) => handleNestedChange("business", "entity_name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Date of Incorporation
                  </label>
                  <input
                    type="date"
                    value={formData.business.dol}
                    onChange={(e) => handleNestedChange("business", "dol", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    PAN
                  </label>
                  <input
                    type="text"
                    value={formData.business.pan}
                    onChange={(e) => handleNestedChange("business", "pan", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    CIN / LLPIN / Reg. No.
                  </label>
                  <input
                    type="text"
                    value={formData.business.cin_llpin}
                    onChange={(e) => handleNestedChange("business", "cin_llpin", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Corporate Office Address
                  </label>
                  <textarea
                    value={formData.business.corporate_address}
                    onChange={(e) => handleNestedChange("business", "corporate_address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.business.corporate_state}
                    onChange={(e) => handleNestedChange("business", "corporate_state", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={formData.business.corporate_pin}
                    onChange={(e) => handleNestedChange("business", "corporate_pin", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Contact No.
                  </label>
                  <input
                    type="tel"
                    value={formData.business.contact_no}
                    onChange={(e) => handleNestedChange("business", "contact_no", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.business.contact_email}
                    onChange={(e) => handleNestedChange("business", "contact_email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    GSTIN/UIN
                  </label>
                  <input
                    type="text"
                    value={formData.business.gstin_uin}
                    onChange={(e) => handleNestedChange("business", "gstin_uin", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Collateral/Security Details
                </h2>
                <button
                  onClick={addCollateral}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Add Collateral
                </button>
              </div>

              {formData.collaterals.map((collateral, idx) => (
                <div key={idx} className="border-t border-gray-200 dark:border-slate-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">
                    Collateral {idx + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Type of Collateral
                      </label>
                      <select
                        value={collateral.type}
                        onChange={(e) => handleCollateralChange(idx, "type", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                      >
                        <option value="">Select</option>
                        <option value="plot">Plot</option>
                        <option value="flat">Flat</option>
                        <option value="land">Land</option>
                        <option value="project">Project</option>
                        <option value="builder_floor">Builder Floor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Type of Charge
                      </label>
                      <select
                        value={collateral.charge_type}
                        onChange={(e) => handleCollateralChange(idx, "charge_type", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                      >
                        <option value="">Select</option>
                        <option value="equitable_mortgage">Equitable Mortgage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Age of Property
                      </label>
                      <select
                        value={collateral.property_age}
                        onChange={(e) => handleCollateralChange(idx, "property_age", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                      >
                        <option value="">Select</option>
                        <option value="less_5">Less than 5 Years</option>
                        <option value="5_15">5 to 15 Years</option>
                        <option value="15_25">15 to 25 Years</option>
                        <option value="25_40">25 to 40 Years</option>
                        <option value="above_40">More than 40 Years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Property Status
                      </label>
                      <select
                        value={collateral.property_status}
                        onChange={(e) => handleCollateralChange(idx, "property_status", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                      >
                        <option value="">Select</option>
                        <option value="ready">Ready</option>
                        <option value="under_construction">Under Construction</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Collateral Address
                      </label>
                      <textarea
                        value={collateral.address}
                        onChange={(e) => handleCollateralChange(idx, "address", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Details of Collateral
                      </label>
                      <textarea
                        value={collateral.details}
                        onChange={(e) => handleCollateralChange(idx, "details", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Taluka/Tehsil
                      </label>
                      <input
                        type="text"
                        value={collateral.taluka}
                        onChange={(e) => handleCollateralChange(idx, "taluka", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Village/City
                      </label>
                      <input
                        type="text"
                        value={collateral.village_city}
                        onChange={(e) => handleCollateralChange(idx, "village_city", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={collateral.pin}
                        onChange={(e) => handleCollateralChange(idx, "pin", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                Processing Fees
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Instrument Type
                  </label>
                  <select
                    value={formData.processing_fees.instrument_type}
                    onChange={(e) => handleNestedChange("processing_fees", "instrument_type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="cheque">Cheque</option>
                    <option value="dd">DD</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Instrument No.
                  </label>
                  <input
                    type="text"
                    value={formData.processing_fees.instrument_no}
                    onChange={(e) => handleNestedChange("processing_fees", "instrument_no", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.processing_fees.amount}
                    onChange={(e) => handleNestedChange("processing_fees", "amount", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.processing_fees.bank_name}
                    onChange={(e) => handleNestedChange("processing_fees", "bank_name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Instrument Date
                  </label>
                  <input
                    type="date"
                    value={formData.processing_fees.instrument_date}
                    onChange={(e) => handleNestedChange("processing_fees", "instrument_date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                Customer Declaration
              </h2>

              <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300">
                <p>
                  I/We hereby declare that the details furnished above are true and correct to the best of my knowledge and belief and I undertake to inform you of any changes therein immediately.
                </p>

                <p>
                  I/We confirm that no insolvency proceedings or suits for recovery of outstanding dues or monies whatsoever and/or any criminal proceedings have been initiated and/or are pending against me/us.
                </p>

                <p>
                  I/We understand and acknowledge that RGSL shall have the absolute discretion to reject our application and RGSL shall not be responsible in any manner whatsoever for such rejection.
                </p>

                <p>
                  I/We hereby consent to the RGSL or its Authorized Agents and third party service providers to use information/data provided to contact me through any channel and further authorize disclosure of information to its affiliates/group companies.
                </p>

                <label className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.declaration_accepted}
                    onChange={(e) => handleInputChange("declaration_accepted", e.target.checked)}
                    className="mt-1 w-4 h-4"
                  />
                  <span>
                    I/We hereby declare that I/we have read and understood all the terms and conditions and hereby accept them.
                  </span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                Application Documents
              </h2>

              {applicationId ? (
                <>
                  <DocumentsUploadSection applicationId={applicationId} />

                  <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-3">
                      📋 Requisite Documents Checklist
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Identity Proof (Passport, Driving License, Voter's ID)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Income Proof (Salary Slips, ITR, Bank Statements)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Asset Documents (Sale Deed, Allotment Letter, NOC)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Signature Attestation</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Passport size photographs for all applicants</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Company documents (MOA, AOA, PAN Card, GST Certificate)</span>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                  Save the application first to upload CKYC documents.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-6 py-4 shrink-0 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save
          </button>

          {currentStep === STEPS.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.declaration_accepted}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Submit
            </button>
          )}
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
          disabled={currentStep === STEPS.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentUpload}
        onClose={() => setShowDocumentUpload(false)}
        onDataExtracted={handleDocumentUpload}
        documentType={uploadDocumentType}
      />

      <CompanySearchModal
        isOpen={showCompanySearch}
        onClose={() => setShowMCAModal(false)}
        onDataFetched={handleCompanyDataFetched}
        applicationId={applicationId}
      />
    </div>
  );
}
