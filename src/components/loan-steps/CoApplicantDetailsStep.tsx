"use client";

import { useState } from "react";
import type { CoApplicantDetails, AddressBlock } from "@/lib/schemas/loan-application";
import { CoApplicantDetailsSchema } from "@/lib/schemas/loan-application";
import { useFormErrors, FieldError } from "@/lib/utils/field-validator";

interface CoApplicantDetailsStepProps {
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

export default function CoApplicantDetailsStep({ data, onChange }: CoApplicantDetailsStepProps) {
  const loanType = data?.application_info?.loan_type || "PERSONAL_LOAN";
  const coDetails: Partial<CoApplicantDetails> = data?.co_applicant_details || {};
  const isPresent = coDetails.name !== undefined; // Check if co-applicant was initialized

  // Mock KYC state
  const [verifyingDigiLocker, setVerifyingDigiLocker] = useState(false);
  const [digiLockerVerified, setDigiLockerVerified] = useState(false);

  // Field-level validation errors (fires onBlur)
  const { errors, validateWith } = useFormErrors();

  const initCoApplicant = (present: boolean) => {
    if (present) {
      onChange({
        co_applicant_details: {
          name: "",
          fathers_spouse_name: "",
          relationship: "BUSINESS_PARTNER",
          date_of_birth: "",
          marital_status: "SINGLE",
          gender: "M",
          dependents_count: 0,
          is_indian_citizen: true,
          category: "GENERAL",
          education_qualification: "GRADUATE",
          pan_number: "",
          mobile_number: "",
          email: "",
          correspondence_address: "RESIDENCE",
          residential_address: emptyAddress(),
          permanent_address: emptyAddress(),
        },
      });
    } else {
      onChange({ co_applicant_details: null });
      setDigiLockerVerified(false);
    }
  };

  const updateField = (field: keyof CoApplicantDetails, value: any) => {
    onChange({
      co_applicant_details: {
        ...coDetails,
        [field]: value,
      },
    });
  };

  const updateAddress = (addressKey: "residential_address" | "permanent_address", field: keyof AddressBlock, value: any) => {
    const currentAddress = coDetails[addressKey] || emptyAddress();
    onChange({
      co_applicant_details: {
        ...coDetails,
        [addressKey]: {
          ...currentAddress,
          [field]: (field === "years_at_address" || field === "years_in_city") ? (parseInt(value, 10) || 0) : value,
        },
      },
    });
  };

  const handleCopyResidenceToPermanent = (checked: boolean) => {
    if (checked) {
      onChange({
        co_applicant_details: {
          ...coDetails,
          permanent_address: { ...(coDetails.residential_address || emptyAddress()) },
        },
      });
    }
  };

  const triggerDigiLockerKYC = () => {
    setVerifyingDigiLocker(true);
    setTimeout(() => {
      setVerifyingDigiLocker(false);
      setDigiLockerVerified(true);
      onChange({
        co_applicant_details: {
          ...coDetails,
          name: "JANE DOE",
          fathers_spouse_name: "John Doe",
          relationship: loanType === "BUSINESS_LOAN" ? "BUSINESS_PARTNER" : "SPOUSE",
          date_of_birth: "1992-11-10",
          marital_status: "MARRIED",
          gender: "F",
          dependents_count: 1,
          is_indian_citizen: true,
          category: "GENERAL",
          education_qualification: "PROFESSIONAL",
          mobile_number: "9876543210",
          email: "jane.doe@example.com",
          residential_address: {
            address_line1: "Apt 201, Green Meadows Apartments",
            address_line2: "Outer Ring Road",
            landmark: "Opposite Tech Park",
            pincode: "560103",
            city: "Bengaluru",
            state: "Karnataka",
            ownership: "OWNED",
            years_at_address: 3,
            years_in_city: 6
          }
        }
      });
    }, 1200);
  };

  const renderAddressFields = (
    label: string,
    key: "residential_address" | "permanent_address"
  ) => {
    const addr = coDetails[key] || emptyAddress();
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
          Co-Applicant Details
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          {loanType === "BUSINESS_LOAN"
            ? "Provide promoter / director / partner acting in personal capacity as a co-applicant (typically mandatory)."
            : "Provide details of co-applicant / co-borrower (optional)."}
        </p>
      </div>

      {/* Gatekeeper Checkbox */}
      <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-slate-850 rounded bg-gray-50/30 dark:bg-slate-900/30">
        <input
          type="checkbox"
          id="coapp_present"
          checked={isPresent}
          onChange={(e) => initCoApplicant(e.target.checked)}
          className="w-3.5 h-3.5 accent-black dark:accent-white cursor-pointer"
        />
        <label htmlFor="coapp_present" className="text-[11px] font-bold text-gray-900 dark:text-slate-200 cursor-pointer">
          {loanType === "BUSINESS_LOAN" ? "Add Co-Applicant" : "Add Co-Applicant / Co-Borrower"}
        </label>
      </div>

      {!isPresent ? (
        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-slate-800 rounded bg-gray-50/50 dark:bg-slate-900/50 text-xs text-gray-400 font-semibold">
          No co-applicant declared. You can proceed directly to the next step.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top API triggers */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={triggerDigiLockerKYC}
              disabled={verifyingDigiLocker}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-[11px] font-bold rounded shadow transition-colors"
            >
              {verifyingDigiLocker ? "Linking DigiLocker..." : digiLockerVerified ? "Co-Applicant Linked ✓" : "Link DigiLocker (Co-Applicant)"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Co-applicant name"
                value={coDetails.name || ""}
                onChange={(e) => updateField("name", e.target.value.toUpperCase())}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Father&apos;s / Spouse&apos;s Name *
              </label>
              <input
                type="text"
                placeholder="Father's / Spouse's name"
                value={coDetails.fathers_spouse_name || ""}
                onChange={(e) => updateField("fathers_spouse_name", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Relationship *
              </label>
              <select
                value={coDetails.relationship || "BUSINESS_PARTNER"}
                onChange={(e) => updateField("relationship", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              >
                <option value="BUSINESS_PARTNER">BUSINESS PARTNER</option>
                <option value="SPOUSE">SPOUSE</option>
                <option value="PARENT">PARENT</option>
                <option value="CHILD">CHILD</option>
                <option value="SIBLING">SIBLING</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={coDetails.date_of_birth || ""}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Marital Status
              </label>
              <select
                value={coDetails.marital_status || "SINGLE"}
                onChange={(e) => updateField("marital_status", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              >
                <option value="SINGLE">SINGLE</option>
                <option value="MARRIED">MARRIED</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={coDetails.gender || "M"}
                onChange={(e) => updateField("gender", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              >
                <option value="M">MALE</option>
                <option value="F">FEMALE</option>
                <option value="THIRD_GENDER">THIRD GENDER</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                No. of Dependents
              </label>
              <input
                type="number"
                value={coDetails.dependents_count || ""}
                onChange={(e) => updateField("dependents_count", parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={coDetails.category || "GENERAL"}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OTHERS">OTHERS</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Education
              </label>
              <select
                value={coDetails.education_qualification || "GRADUATE"}
                onChange={(e) => updateField("education_qualification", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              >
                <option value="UG">UNDERGRADUATE</option>
                <option value="GRADUATE">GRADUATE</option>
                <option value="PROFESSIONAL">PROFESSIONAL</option>
                <option value="PG">POSTGRADUATE</option>
                <option value="OTHERS">OTHERS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                placeholder="ABCDE1234F"
                maxLength={10}
                value={coDetails.pan_number || ""}
                onChange={(e) => updateField("pan_number", e.target.value.toUpperCase())}
                onBlur={() => {
                  if (coDetails.pan_number) {
                    validateWith("pan_number", CoApplicantDetailsSchema.shape.pan_number, coDetails.pan_number);
                  }
                }}
                className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase ${
                  errors.pan_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
              />
              <FieldError message={errors.pan_number} />
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 gap-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Citizen of India?
                </label>
                <div className="flex items-center gap-1.5 h-7">
                  <input
                    type="checkbox"
                    id="is_indian"
                    checked={!!coDetails.is_indian_citizen}
                    onChange={(e) => updateField("is_indian_citizen", e.target.checked)}
                    className="w-3.5 h-3.5 accent-black dark:accent-white"
                  />
                  <label htmlFor="is_indian" className="text-[11px] text-gray-600 dark:text-slate-400 cursor-pointer">
                    Indian Citizen
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Correspondence Address
                </label>
                <select
                  value={coDetails.correspondence_address || "RESIDENCE"}
                  onChange={(e) => updateField("correspondence_address", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                >
                  <option value="RESIDENCE">RESIDENCE</option>
                  <option value="OFFICE">OFFICE</option>
                  <option value="NEW_PROPERTY">NEW PROPERTY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4">
            {renderAddressFields("Residential Address", "residential_address")}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="copy_addr_coapp"
                onChange={(e) => handleCopyResidenceToPermanent(e.target.checked)}
                className="w-3.5 h-3.5 accent-black dark:accent-white"
              />
              <label htmlFor="copy_addr_coapp" className="text-[11px] font-medium text-gray-600 dark:text-slate-400 cursor-pointer">
                Permanent Address is same as Residential Address
              </label>
            </div>

            {renderAddressFields("Permanent Address", "permanent_address")}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="coapp@example.com"
                value={coDetails.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => validateWith("email", CoApplicantDetailsSchema.shape.email, coDetails.email)}
                className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                  errors.email ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
              />
              <FieldError message={errors.email} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                maxLength={10}
                value={coDetails.mobile_number || ""}
                onChange={(e) => updateField("mobile_number", e.target.value)}
                onBlur={() => validateWith("mobile_number", CoApplicantDetailsSchema.shape.mobile_number, coDetails.mobile_number)}
                className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                  errors.mobile_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
              />
              <FieldError message={errors.mobile_number} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
