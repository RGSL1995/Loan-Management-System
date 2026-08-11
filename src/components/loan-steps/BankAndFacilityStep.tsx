"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle, HelpCircle } from "lucide-react";
import type { ExistingLoan, BankAccount } from "@/lib/schemas/loan-application";
import { BankAccountSchema } from "@/lib/schemas/loan-application";
import { useFormErrors, FieldError } from "@/lib/utils/field-validator";

interface BankAndFacilityStepProps {
  data?: any;
  onChange: (data: any) => void;
}

export default function BankAndFacilityStep({ data, onChange }: BankAndFacilityStepProps) {
  const existingLoans: ExistingLoan[] = data?.existing_loans || [];
  const bankData: Partial<BankAccount> = data?.bank_account || {
    account_holder_name: "",
    bank_name: "",
    branch: "",
    ifsc: "",
    account_number: "",
    account_type: "INDIVIDUAL",
    is_verified: false
  };

  const [confirmAccountNumber, setConfirmAccountNumber] = useState(bankData.account_number || "");
  const [prefillingBureau, setPrefillingBureau] = useState(false);
  const [verifyingPennyDrop, setVerifyingPennyDrop] = useState(false);
  const [pennyDropError, setPennyDropError] = useState<string | null>(null);

  // Field-level validation errors (fires onBlur)
  const { errors, validateWith, setError } = useFormErrors();

  const updateBankField = (field: keyof BankAccount, value: any) => {
    onChange({
      bank_account: {
        ...bankData,
        [field]: value,
      },
    });
  };

  // Add / Remove existing loans
  const addLoanRow = () => {
    const updated = [
      ...existingLoans,
      { loan_type: "LOAN_AGAINST_PROPERTY", institution_name: "", account_number: "", loan_amount: 0, emi: 0, outstanding_principal: 0, balance_tenure_months: 0 }
    ];
    onChange({ existing_loans: updated });
  };

  const removeLoanRow = (index: number) => {
    const updated = existingLoans.filter((_, idx) => idx !== index);
    onChange({ existing_loans: updated });
  };

  const updateLoanField = (index: number, field: keyof ExistingLoan, value: any) => {
    const updated = [...existingLoans];
    updated[index] = {
      ...updated[index],
      [field]: (field === "loan_amount" || field === "emi" || field === "outstanding_principal" || field === "balance_tenure_months")
        ? (parseFloat(value) || 0)
        : value,
    };
    onChange({ existing_loans: updated });
  };

  // Mock CIBIL bureau prefill
  const triggerBureauPrefill = () => {
    setPrefillingBureau(true);
    setTimeout(() => {
      setPrefillingBureau(false);
      const mockLoans: ExistingLoan[] = [
        {
          loan_type: "LOAN_AGAINST_PROPERTY",
          institution_name: "HDFC BANK LTD",
          account_number: "LAP-889210-99",
          loan_amount: 2500000,
          emi: 28500,
          outstanding_principal: 1850000,
          balance_tenure_months: 120
        },
        {
          loan_type: "SMART_CREDIT_LINE",
          institution_name: "ICICI BANK LTD",
          account_number: "SCL-110291-04",
          loan_amount: 500000,
          emi: 0,
          outstanding_principal: 120000,
          balance_tenure_months: 24
        }
      ];
      onChange({ existing_loans: mockLoans });
    }, 1200);
  };

  // Mock Penny Drop
  const triggerPennyDrop = () => {
    if (!bankData.account_number || !bankData.ifsc || !bankData.account_holder_name) {
      setPennyDropError("Please enter Account Holder, Account Number, and IFSC first.");
      return;
    }
    if (bankData.account_number !== confirmAccountNumber) {
      setPennyDropError("Account numbers do not match.");
      return;
    }

    setPennyDropError(null);
    setVerifyingPennyDrop(true);
    setTimeout(() => {
      setVerifyingPennyDrop(false);
      updateBankField("is_verified", true);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Financial Profile
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Declare existing credit facility obligations and verified bank account for penny-drop checks.
        </p>
      </div>

      {/* Section 1: Existing Loans */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            1. Existing Credit Facilities
          </h3>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={triggerBureauPrefill}
              disabled={prefillingBureau}
              className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-[10px] font-bold text-gray-700 dark:text-slate-300 rounded shadow transition-colors"
            >
              {prefillingBureau ? "Bureau Pulling..." : "Prefill from Bureau"}
            </button>
            <button
              type="button"
              onClick={addLoanRow}
              className="inline-flex items-center gap-0.5 px-2 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-[10px] font-bold rounded shadow transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Row
            </button>
          </div>
        </div>

        {existingLoans.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-gray-200 dark:border-slate-800 rounded bg-gray-50/50 dark:bg-slate-900/50 text-[11px] text-gray-400">
            No existing loans declared. If you have active loans, add them or prefill from the bureau bureau.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-[10px] font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-1 px-2">Loan Type *</th>
                  <th className="py-1 px-2">Institution *</th>
                  <th className="py-1 px-2">Account No *</th>
                  <th className="py-1 px-2 text-right">Sanctioned (₹) *</th>
                  <th className="py-1 px-2 text-right">Monthly EMI (₹) *</th>
                  <th className="py-1 px-2 text-right">Outstanding (₹) *</th>
                  <th className="py-1 px-2 text-right">Balance Months *</th>
                  <th className="py-1 px-2 text-center w-8">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-xs">
                {existingLoans.map((loan, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-1">
                      {(() => {
                        const standardTypes = [
                          "PERSONAL_LOAN",
                          "BUSINESS_LOAN",
                          "HOME_LOAN",
                          "LOAN_AGAINST_PROPERTY",
                          "LOAN_AGAINST_SECURITIES",
                          "AUTO_LOAN",
                          "GOLD_LOAN",
                          "CASH_CREDIT",
                          "OVERDRAFT",
                          "SMART_CREDIT_LINE"
                        ];
                        const isStandardType = standardTypes.includes(loan.loan_type);
                        const selectValue = isStandardType ? loan.loan_type : "OTHER";

                        return (
                          <div className="flex flex-col gap-1">
                            <select
                              value={selectValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "OTHER") {
                                  updateLoanField(idx, "loan_type", "");
                                } else {
                                  updateLoanField(idx, "loan_type", val);
                                }
                              }}
                              className="w-full px-1 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px]"
                            >
                              <option value="PERSONAL_LOAN">Personal Loan (PL)</option>
                              <option value="BUSINESS_LOAN">Business Loan (BL)</option>
                              <option value="HOME_LOAN">Home Loan (HL)</option>
                              <option value="LOAN_AGAINST_PROPERTY">Loan Against Property (LAP)</option>
                              <option value="LOAN_AGAINST_SECURITIES">Loan Against Securities (LAS)</option>
                              <option value="AUTO_LOAN">Auto/Vehicle Loan (AUTO)</option>
                              <option value="GOLD_LOAN">Gold Loan (GOLD)</option>
                              <option value="CASH_CREDIT">Cash Credit (CC)</option>
                              <option value="OVERDRAFT">Overdraft (OD)</option>
                              <option value="SMART_CREDIT_LINE">Smart Credit Line</option>
                              <option value="OTHER">Other (Specify)</option>
                            </select>
                            {!isStandardType && (
                              <input
                                type="text"
                                placeholder="Specify loan type..."
                                value={loan.loan_type || ""}
                                onChange={(e) => updateLoanField(idx, "loan_type", e.target.value)}
                                className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[10px] outline-none"
                                required
                              />
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="Lender Name"
                        value={loan.institution_name}
                        onChange={(e) => updateLoanField(idx, "institution_name", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none"
                        required
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="Acc No"
                        value={loan.account_number}
                        onChange={(e) => updateLoanField(idx, "account_number", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none"
                        required
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="Sanctioned"
                        value={loan.loan_amount || ""}
                        onChange={(e) => updateLoanField(idx, "loan_amount", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none text-right"
                        required
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="EMI"
                        value={loan.emi || ""}
                        onChange={(e) => updateLoanField(idx, "emi", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none text-right"
                        required
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="Outstanding"
                        value={loan.outstanding_principal || ""}
                        onChange={(e) => updateLoanField(idx, "outstanding_principal", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none text-right"
                        required
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="Tenure m"
                        value={loan.balance_tenure_months || ""}
                        onChange={(e) => updateLoanField(idx, "balance_tenure_months", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-[11px] outline-none text-right"
                        required
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeLoanRow(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Bank Account Details */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            2. Bank Account Details (Disbursal & Mandate)
          </h3>
          <div className="flex items-center gap-1">
            {bankData.is_verified ? (
              <span className="inline-flex items-center gap-0.5 text-green-600 dark:text-green-400 text-[10px] font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Penny-Drop Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={triggerPennyDrop}
                disabled={verifyingPennyDrop}
                className="px-2.5 py-1 bg-black text-white hover:bg-gray-800 dark:bg-slate-100 dark:text-black dark:hover:bg-gray-200 text-[10px] font-bold rounded shadow transition-colors"
              >
                {verifyingPennyDrop ? "Initiating Penny-Drop..." : "Verify Account"}
              </button>
            )}
          </div>
        </div>

        {pennyDropError && (
          <p className="text-[10px] text-red-500 font-semibold">{pennyDropError}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Account Holder Name */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Account Holder Name *
            </label>
            <input
              type="text"
              placeholder="Exactly as in passbook"
              value={bankData.account_holder_name || ""}
              onChange={(e) => updateBankField("account_holder_name", e.target.value.toUpperCase())}
              onBlur={() => validateWith("account_holder_name", BankAccountSchema.shape.account_holder_name, bankData.account_holder_name)}
              disabled={bankData.is_verified}
              className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase disabled:bg-gray-100 dark:disabled:bg-slate-800/80 ${
                errors.account_holder_name ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              required
            />
            <FieldError message={errors.account_holder_name} />
          </div>

          {/* IFSC Code — auto-uppercases on change, validates on blur */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              IFSC Code *
            </label>
            <input
              type="text"
              placeholder="e.g. SBIN0001024"
              maxLength={11}
              value={bankData.ifsc || ""}
              onChange={(e) => {
                // Auto-convert to uppercase as user types
                const val = e.target.value.toUpperCase();
                updateBankField("ifsc", val);
                // Mock branch prefill if valid length
                if (val.length === 11) {
                  if (val.startsWith("HDFC")) {
                    updateBankField("bank_name", "HDFC BANK");
                    updateBankField("branch", "NOIDA SECTOR 62");
                  } else if (val.startsWith("ICIC")) {
                    updateBankField("bank_name", "ICICI BANK");
                    updateBankField("branch", "MUMBAI BANDRA KURLA");
                  } else if (val.startsWith("SBIN")) {
                    updateBankField("bank_name", "STATE BANK OF INDIA");
                    updateBankField("branch", "NEW DELHI MAIN");
                  }
                }
              }}
              onBlur={() => validateWith("ifsc", BankAccountSchema.shape.ifsc, bankData.ifsc)}
              disabled={bankData.is_verified}
              className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none uppercase disabled:bg-gray-100 dark:disabled:bg-slate-800/80 ${
                errors.ifsc ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              required
            />
            <FieldError message={errors.ifsc} />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Bank Name *
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank"
              value={bankData.bank_name || ""}
              onChange={(e) => updateBankField("bank_name", e.target.value)}
              onBlur={() => validateWith("bank_name", BankAccountSchema.shape.bank_name, bankData.bank_name)}
              disabled={bankData.is_verified}
              className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800/80 ${
                errors.bank_name ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              required
            />
            <FieldError message={errors.bank_name} />
          </div>

          {/* Branch Name */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Branch *
            </label>
            <input
              type="text"
              placeholder="e.g. Connaught Place"
              value={bankData.branch || ""}
              onChange={(e) => updateBankField("branch", e.target.value)}
              onBlur={() => validateWith("branch", BankAccountSchema.shape.branch, bankData.branch)}
              disabled={bankData.is_verified}
              className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800/80 ${
                errors.branch ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              required
            />
            <FieldError message={errors.branch} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Account Number */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Account Number *
            </label>
            <input
              type={bankData.is_verified ? "text" : "password"}
              placeholder="Enter account number"
              value={bankData.is_verified ? "●●●●●●●●" + bankData.account_number?.slice(-4) : bankData.account_number || ""}
              onChange={(e) => updateBankField("account_number", e.target.value)}
              onBlur={() => validateWith("account_number", BankAccountSchema.shape.account_number, bankData.account_number)}
              disabled={bankData.is_verified}
              className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800/80 ${
                errors.account_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              required
            />
            <FieldError message={errors.account_number} />
          </div>

          {/* Confirm Account Number */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Confirm Account Number *
            </label>
            <input
              type={bankData.is_verified ? "text" : "password"}
              placeholder="Re-enter to confirm"
              value={bankData.is_verified ? "●●●●●●●●" + bankData.account_number?.slice(-4) : confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value)}
              onBlur={() => {
                // Validate that confirm matches the primary account number
                if (confirmAccountNumber && confirmAccountNumber !== bankData.account_number) {
                  setError("confirm_account_number", "Account numbers do not match");
                } else {
                  setError("confirm_account_number", null);
                }
              }}
              disabled={bankData.is_verified}
              className={`w-full px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800/80 ${
                errors.confirm_account_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              required
            />
            <FieldError message={errors.confirm_account_number} />
          </div>

          {/* Operated Since */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Account Operated Since
            </label>
            <input
              type="text"
              placeholder="MM/YYYY"
              maxLength={7}
              value={bankData.account_operated_since || ""}
              onChange={(e) => updateBankField("account_operated_since", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>

          {/* Holding Type */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Holding Type *
            </label>
            <select
              value={bankData.account_type || "INDIVIDUAL"}
              onChange={(e) => updateBankField("account_type", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            >
              <option value="INDIVIDUAL">INDIVIDUAL</option>
              <option value="JOINT">JOINT</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
