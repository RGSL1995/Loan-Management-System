"use client";

import { useState } from "react";
import type { ApplicantDetails, AddressBlock } from "@/lib/schemas/loan-application";
import { ApplicantDetailsSchema } from "@/lib/schemas/loan-application";
import { generateDigilockerLink, fetchDigilockerResult } from "@/app/actions/kyc";
import { useFormErrors, FieldError } from "@/lib/utils/field-validator";

interface ApplicantDetailsStepProps {
  data?: any;
  onChange: (data: any) => void;
}

const emptyAddress = (): AddressBlock => ({
  address_line1: "",
  address_line2: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
  ownership: "OTHERS",
  years_at_address: 0,
  years_in_city: 0,
});

export default function ApplicantDetailsStep({ data, onChange }: ApplicantDetailsStepProps) {
  const loanType = data?.application_info?.loan_type || "PERSONAL_LOAN";
  const details: Partial<ApplicantDetails> = data?.applicant_details || {
    legal_status: "OTHERS",
    permanent_employees: 0,
    temporary_employees: 0,
    advance_tax_paid: false,
  };

  // Mock verification states
  const [verifyingCIN, setVerifyingCIN] = useState(false);
  const [cinVerified, setCinVerified] = useState(false);
  const [verifyingPAN, setVerifyingPAN] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [verifyingGST, setVerifyingGST] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [verifyingDigiLocker, setVerifyingDigiLocker] = useState(false);
  const [digiLockerVerified, setDigiLockerVerified] = useState(false);

  // Field-level validation errors (fires onBlur)
  const { errors, validateWith } = useFormErrors();

  const updateField = (field: keyof ApplicantDetails, value: any) => {
    onChange({
      applicant_details: {
        ...details,
        [field]: value,
      },
    });
  };

  const updateAddress = (addressKey: "residential_address" | "permanent_address" | "registered_office_address", field: keyof AddressBlock, value: any) => {
    const currentAddress = details[addressKey] || emptyAddress();
    onChange({
      applicant_details: {
        ...details,
        [addressKey]: {
          ...currentAddress,
          [field]: (field === "years_at_address" || field === "years_in_city") ? (parseInt(value, 10) || 0) : value,
        },
      },
    });
  };

  // Address Copy helpers
  const handleCopyResidenceToPermanent = (checked: boolean) => {
    if (checked) {
      onChange({
        applicant_details: {
          ...details,
          permanent_address: { ...(details.residential_address || emptyAddress()) },
        },
      });
    }
  };

  const handleCopyBusinessToRegistered = (checked: boolean) => {
    if (checked) {
      onChange({
        applicant_details: {
          ...details,
          registered_office_address: { ...(details.residential_address || emptyAddress()) },
        },
      });
    }
  };

  // Mock API triggers
  const triggerCINLookup = () => {
    if (!details.roc_registration_number) return;
    setVerifyingCIN(true);
    setTimeout(() => {
      setVerifyingCIN(false);
      setCinVerified(true);
      onChange({
        applicant_details: {
          ...details,
          name: "ACME ENTERPRISES PRIVATE LIMITED",
          date_of_birth_or_incorporation: "2015-06-12",
          registered_office_address: {
            address_line1: "502-504, 5th Floor, Tower B, Copia Corporate Suites",
            address_line2: "Jasola District Centre",
            landmark: "Near Jasola Metro",
            pincode: "110025",
            city: "New Delhi",
            state: "Delhi",
            ownership: "RENTED",
            years_at_address: 8,
            years_in_city: 8
          }
        }
      });
    }, 1200);
  };

  const triggerPANVerification = () => {
    if (!details.pan_number) return;
    setVerifyingPAN(true);
    setTimeout(() => {
      setVerifyingPAN(false);
      setPanVerified(true);
      if (loanType === "PERSONAL_LOAN") {
        updateField("fathers_spouse_name", "Richard Doe");
      }
    }, 1000);
  };

  const triggerGSTVerification = () => {
    if (!details.gst_registration_number) return;
    setVerifyingGST(true);
    setTimeout(() => {
      setVerifyingGST(false);
      setGstVerified(true);
      onChange({
        applicant_details: {
          ...details,
          name: details.name || "ACME ENTERPRISES PRIVATE LIMITED",
          residential_address: {
            address_line1: "Sector 62, Block C-20",
            address_line2: "Stellar IT Park",
            landmark: "Noida Electronic City",
            pincode: "201301",
            city: "Noida",
            state: "Uttar Pradesh",
            ownership: "RENTED",
            years_at_address: 5,
            years_in_city: 10
          }
        }
      });
    }, 1200);
  };

  const triggerDigiLockerKYC = async () => {
    setVerifyingDigiLocker(true);
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard/kyc/digilocker-success`;
      const result = await generateDigilockerLink({ redirect_url: redirectUrl });
      
      if (!result.success || !result.data?.url) {
        throw new Error("Failed to generate DigiLocker URL");
      }

      const width = 500;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        result.data.url,
        "SurepassDigiLocker",
        `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`
      );

      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'digilocker_success') {
          window.removeEventListener("message", messageListener);
          
          const sessionId = event.data.payload?.client_id || result.data?.session_id || "mock-session";
          const kycResult = await fetchDigilockerResult(sessionId);
          
          if (kycResult.success && kycResult.data) {
            setVerifyingDigiLocker(false);
            setDigiLockerVerified(true);
            
            const kycAddress = kycResult.data.address;
            onChange({
              applicant_details: {
                ...details,
                name: kycResult.data.full_name || details.name,
                date_of_birth_or_incorporation: kycResult.data.dob || details.date_of_birth_or_incorporation,
                residential_address: {
                  address_line1: kycAddress?.house || "",
                  address_line2: kycAddress?.street || "",
                  landmark: kycAddress?.landmark || "",
                  pincode: kycAddress?.pc || "",
                  city: kycAddress?.dist || kycAddress?.city || "",
                  state: kycAddress?.state || "",
                  ownership: "OWNED",
                  years_at_address: details.residential_address?.years_at_address || 0,
                  years_in_city: details.residential_address?.years_in_city || 0
                }
              }
            });
          } else {
            setVerifyingDigiLocker(false);
            alert("Failed to retrieve KYC data. Please try again.");
          }
        }
      };

      window.addEventListener("message", messageListener);
      
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          window.removeEventListener("message", messageListener);
          // If we haven't verified yet, turn off the loading state
          if (!digiLockerVerified) setVerifyingDigiLocker(false);
        }
      }, 1000);

    } catch (error) {
      console.error(error);
      setVerifyingDigiLocker(false);
      alert("Error starting DigiLocker flow.");
    }
  };

  const renderAddressFields = (
    label: string,
    key: "residential_address" | "permanent_address" | "registered_office_address"
  ) => {
    const addr = details[key] || emptyAddress();
    return (
      <div className="space-y-2 p-2 border border-gray-100 dark:border-slate-800 rounded bg-gray-50/50 dark:bg-slate-900/10">
        <h4 className="text-[11px] font-bold text-gray-700 dark:text-slate-300">{label}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Address Line 1 *"
              value={addr.address_line1 || ""}
              onChange={(e) => updateAddress(key, "address_line1", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Address Line 2"
              value={addr.address_line2 || ""}
              onChange={(e) => updateAddress(key, "address_line2", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Landmark"
              value={addr.landmark || ""}
              onChange={(e) => updateAddress(key, "landmark", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Pincode *"
              maxLength={6}
              value={addr.pincode || ""}
              onChange={(e) => updateAddress(key, "pincode", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <input
              type="text"
              placeholder="City *"
              value={addr.city || ""}
              onChange={(e) => updateAddress(key, "city", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
            <input
              type="text"
              placeholder="State *"
              value={addr.state || ""}
              onChange={(e) => updateAddress(key, "state", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
          </div>
          <div>
            <select
              value={addr.ownership || "OTHERS"}
              onChange={(e) => updateAddress(key, "ownership", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="OWNED">OWNED</option>
              <option value="RENTED">RENTED</option>
              <option value="COMPANY_PROVIDED">COMPANY PROVIDED</option>
              <option value="OTHERS">OTHERS</option>
            </select>
          </div>
          <div>
            <input
              type="number"
              placeholder="Years at address"
              value={addr.years_at_address || ""}
              onChange={(e) => updateAddress(key, "years_at_address", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Years in city"
              value={addr.years_in_city || ""}
              onChange={(e) => updateAddress(key, "years_in_city", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Applicant Details
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          {loanType === "BUSINESS_LOAN"
            ? "Enter business entity legal parameters, registrations, office addresses, and workforce metrics."
            : "Enter personal details, individual tax configuration, and verified home address proofs."}
        </p>
      </div>

      {loanType === "BUSINESS_LOAN" ? (
        /* ================== BUSINESS LOAN LAYOUT ================== */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* ROC Registration Number (CIN) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                CIN (ROC Registration No)
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="e.g. U74140DL2015PTC288123"
                  value={details.roc_registration_number || ""}
                  onChange={(e) => updateField("roc_registration_number", e.target.value.toUpperCase())}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={triggerCINLookup}
                  disabled={verifyingCIN || !details.roc_registration_number}
                  className="px-2 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-[10px] font-bold rounded shadow transition-colors disabled:opacity-40"
                >
                  {verifyingCIN ? "Fetching..." : cinVerified ? "Verified ✓" : "MCA Verify"}
                </button>
              </div>
            </div>

            {/* Entity Legal Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                Entity Legal Name *
              </label>
              <input
                type="text"
                placeholder="Entity name matches MCA"
                value={details.name || ""}
                onChange={(e) => updateField("name", e.target.value.toUpperCase())}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase"
                required
              />
            </div>

            {/* Legal Status Dropdown */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                Legal Status *
              </label>
              <select
                value={details.legal_status || "OTHERS"}
                onChange={(e) => updateField("legal_status", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              >
                <option value="PVT_LTD">Private Limited Company</option>
                <option value="PUBLIC_LTD">Public Limited Company</option>
                <option value="PARTNERSHIP_FIRM">Partnership Firm</option>
                <option value="PROPRIETORSHIP">Proprietorship</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* PAN Number */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                Company / Firm PAN *
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={details.pan_number || ""}
                  onChange={(e) => updateField("pan_number", e.target.value.toUpperCase())}
                  onBlur={() => validateWith("pan_number", ApplicantDetailsSchema.shape.pan_number, details.pan_number)}
                  className={`flex-1 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase ${
                    errors.pan_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={triggerPANVerification}
                  disabled={verifyingPAN || !details.pan_number}
                  className="px-2 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-[10px] font-bold rounded shadow transition-colors disabled:opacity-40"
                >
                  {verifyingPAN ? "Verifying..." : panVerified ? "Verified ✓" : "Verify PAN"}
                </button>
              </div>
              <FieldError message={errors.pan_number} />
            </div>

            {/* GSTIN */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                GST Registration No (GSTIN)
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="07AAAAA1111A1Z1"
                  maxLength={15}
                  value={details.gst_registration_number || ""}
                  onChange={(e) => updateField("gst_registration_number", e.target.value.toUpperCase())}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={triggerGSTVerification}
                  disabled={verifyingGST || !details.gst_registration_number}
                  className="px-2 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-[10px] font-bold rounded shadow transition-colors disabled:opacity-40"
                >
                  {verifyingGST ? "Fetching..." : gstVerified ? "Verified ✓" : "GST Verify"}
                </button>
              </div>
            </div>

            {/* Incorporation Date */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                Date of Incorporation *
              </label>
              <input
                type="date"
                value={details.date_of_birth_or_incorporation || ""}
                onChange={(e) => updateField("date_of_birth_or_incorporation", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
          </div>

          {/* Conditional Partnership Deed */}
          {details.legal_status === "PARTNERSHIP_FIRM" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                  Partnership Deed Registration No *
                </label>
                <input
                  type="text"
                  placeholder="Enter Deed Number"
                  value={details.partnership_deed_no || ""}
                  onChange={(e) => updateField("partnership_deed_no", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* Address Blocks */}
          <div className="space-y-4">
            {renderAddressFields("Principal Place of Business Address *", "residential_address")}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="copy_addr"
                onChange={(e) => handleCopyBusinessToRegistered(e.target.checked)}
                className="w-3.5 h-3.5 accent-black dark:accent-white"
              />
              <label htmlFor="copy_addr" className="text-[11px] font-medium text-gray-600 dark:text-slate-400 cursor-pointer">
                Registered Office address is same as Principal Place of Business Address
              </label>
            </div>

            {renderAddressFields("Registered Office Address *", "registered_office_address")}
          </div>

          {/* Workforce & Property Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Built-Up Area (sq. ft.)
              </label>
              <input
                type="text"
                placeholder="e.g. 1500 sq ft"
                value={details.built_up_area || ""}
                onChange={(e) => updateField("built_up_area", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Permanent Employees
              </label>
              <input
                type="number"
                value={details.permanent_employees || ""}
                onChange={(e) => updateField("permanent_employees", parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Temporary Employees
              </label>
              <input
                type="number"
                value={details.temporary_employees || ""}
                onChange={(e) => updateField("temporary_employees", parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Advance Tax Paid Status
              </label>
              <div className="flex items-center gap-2 h-7">
                <input
                  type="checkbox"
                  id="adv_tax"
                  checked={!!details.advance_tax_paid}
                  onChange={(e) => updateField("advance_tax_paid", e.target.checked)}
                  className="w-3.5 h-3.5 accent-black dark:accent-white"
                />
                <label htmlFor="adv_tax" className="text-[11px] text-gray-600 dark:text-slate-400 cursor-pointer">
                  Advance Tax Paid for last FY
                </label>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Corporate Email Address *
              </label>
              <input
                type="email"
                placeholder="info@company.com"
                value={details.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="info@company.com"
                value={details.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => validateWith("email", ApplicantDetailsSchema.shape.email, details.email)}
                className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                  errors.email ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
                required
              />
              <FieldError message={errors.email} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                maxLength={10}
                value={details.mobile_number || ""}
                onChange={(e) => updateField("mobile_number", e.target.value)}
                onBlur={() => validateWith("mobile_number", ApplicantDetailsSchema.shape.mobile_number, details.mobile_number)}
                className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                  errors.mobile_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
                required
              />
              <FieldError message={errors.mobile_number} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Landline Number
              </label>
              <input
                type="text"
                placeholder="STD - Landline"
                value={details.landline_number || ""}
                onChange={(e) => updateField("landline_number", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ================== PERSONAL LOAN LAYOUT ================== */
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={triggerDigiLockerKYC}
              disabled={verifyingDigiLocker}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-xs font-bold rounded shadow transition-colors"
            >
              {verifyingDigiLocker ? "Connecting DigiLocker..." : digiLockerVerified ? "DigiLocker Linked ✓" : "Link DigiLocker KYC"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* PAN Number */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                Individual PAN Number *
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="ABCDE1234P (4th char must be P)"
                  maxLength={10}
                  value={details.pan_number || ""}
                  onChange={(e) => updateField("pan_number", e.target.value.toUpperCase())}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={triggerPANVerification}
                  disabled={verifyingPAN || !details.pan_number}
                  className="px-2 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-[10px] font-bold rounded shadow transition-colors disabled:opacity-40"
                >
                  {verifyingPAN ? "Verifying..." : panVerified ? "Verified ✓" : "Verify PAN"}
                </button>
              </div>
            </div>

            {/* Applicant Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                Full Name (matches PAN/Aadhaar) *
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={details.name || ""}
                onChange={(e) => updateField("name", e.target.value.toUpperCase())}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Father's / Spouse's Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                Father&apos;s / Spouse&apos;s Name *
              </label>
              <input
                type="text"
                placeholder="Father's / Spouse's Name"
                value={details.fathers_spouse_name || ""}
                onChange={(e) => updateField("fathers_spouse_name", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                Date of Birth *
              </label>
              <input
                type="date"
                value={details.date_of_birth_or_incorporation || ""}
                onChange={(e) => updateField("date_of_birth_or_incorporation", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4">
            {renderAddressFields("Residential Address *", "residential_address")}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="copy_addr_personal"
                onChange={(e) => handleCopyResidenceToPermanent(e.target.checked)}
                className="w-3.5 h-3.5 accent-black dark:accent-white"
              />
              <label htmlFor="copy_addr_personal" className="text-[11px] font-medium text-gray-600 dark:text-slate-400 cursor-pointer">
                Permanent Address is same as Residential Address
              </label>
            </div>

            {renderAddressFields("Permanent Address *", "permanent_address")}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Personal Email Address *
              </label>
              <input
                type="email"
                placeholder="email@domain.com"
                value={details.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => validateWith("email", ApplicantDetailsSchema.shape.email, details.email)}
                className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                  errors.email ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
                required
              />
              <FieldError message={errors.email} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                maxLength={10}
                value={details.mobile_number || ""}
                onChange={(e) => updateField("mobile_number", e.target.value)}
                onBlur={() => validateWith("mobile_number", ApplicantDetailsSchema.shape.mobile_number, details.mobile_number)}
                className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                  errors.mobile_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
                required
              />
              <FieldError message={errors.mobile_number} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Landline Number
              </label>
              <input
                type="text"
                placeholder="STD - Landline"
                value={details.landline_number || ""}
                onChange={(e) => updateField("landline_number", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
