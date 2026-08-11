"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface SclProductStepProps {
  data: any; // parent formData
  onChange: (data: any) => void;
}

export default function SclProductStep({ data, onChange }: SclProductStepProps) {
  const loanType = data?.application_info?.loan_type || "PERSONAL_LOAN";
  const productData = data.product_data || {};
  const existingLoans = data.existing_loans || [];

  // Local helper to update fields inside product_data
  const updateProductField = (field: string, value: any) => {
    onChange({
      product_data: {
        ...productData,
        [field]: value
      }
    });
  };

  // Computations for capacity
  const existingEmisSum = existingLoans.reduce((sum: number, loan: any) => sum + (parseFloat(loan.emi) || 0), 0);
  const requestedLimit = parseFloat(productData.requested_limit) || 100000;
  const proposedMinDue = requestedLimit * 0.05; // 5% of credit limit is standard revolving min-due
  
  // Use declared monthly income for Personal, or annual turnover / 12 for Business
  const declaredMonthlyIncome = loanType === "BUSINESS_LOAN"
    ? (parseFloat(productData.annual_turnover) || 0) / 12
    : (parseFloat(productData.declared_monthly_income) || 0);

  const foirPercent = declaredMonthlyIncome > 0 ? ((existingEmisSum + proposedMinDue) / declaredMonthlyIncome) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Income &amp; Credit Capacity (SCL)
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Verify borrower employment and declared income for credit capacity evaluation.
        </p>
      </div>

      {/* 1. Employment & Declaration */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <h3 className="text-xs font-bold text-gray-955 dark:text-slate-200 uppercase tracking-wider">
          1. Employment &amp; Declared Income
        </h3>

        {loanType === "PERSONAL_LOAN" ? (
          <div className={`grid grid-cols-1 gap-3 ${productData.occupation_type === "OTHER" ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Occupation Type *
              </label>
              <select
                value={productData.occupation_type || "SALARIED"}
                onChange={(e) => updateProductField("occupation_type", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              >
                <option value="SALARIED">Salaried Employee</option>
                <option value="SELF_EMPLOYED_PROF">Self-Employed Professional</option>
                <option value="SELF_EMPLOYED_BIZ">Self-Employed Business Owner</option>
                <option value="OTHER">Other / Retired</option>
              </select>
            </div>

            {productData.occupation_type === "OTHER" && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                  Specify Occupation *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retired"
                  value={productData.occupation_type_other || ""}
                  onChange={(e) => updateProductField("occupation_type_other", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Employer / Business Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={productData.employer_name || ""}
                onChange={(e) => updateProductField("employer_name", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Declared Monthly Income (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={productData.declared_monthly_income || ""}
                onChange={(e) => updateProductField("declared_monthly_income", parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Business Legal Status
              </label>
              <input
                type="text"
                value={(data.applicant_details?.legal_status || "PVT_LTD").replace("_", " ")}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-gray-100 dark:bg-slate-800/80 text-gray-900 dark:text-slate-100 outline-none uppercase font-bold"
                disabled
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Business Vintage (Years) *
              </label>
              <input
                type="number"
                placeholder="e.g. 3"
                value={productData.business_vintage_years || ""}
                onChange={(e) => updateProductField("business_vintage_years", parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-950 dark:text-slate-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Declared Annual Turnover (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 1500000"
                value={productData.annual_turnover || ""}
                onChange={(e) => updateProductField("annual_turnover", parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Debt-to-Income / FOIR Capability */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-2">
        <h3 className="text-xs font-bold text-gray-950 dark:text-slate-200 uppercase tracking-wider">
          2. Capacity Evaluation (FOIR)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
            <span className="block text-[9px] font-bold text-gray-400 uppercase">Existing EMIs</span>
            <span className="font-extrabold text-gray-900 dark:text-slate-150">₹ {existingEmisSum.toFixed(2)}</span>
          </div>

          <div className="p-2 border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
            <span className="block text-[9px] font-bold text-gray-400 uppercase">Min-Due on Limit (5%)</span>
            <span className="font-extrabold text-gray-900 dark:text-slate-150">₹ {proposedMinDue.toFixed(2)}</span>
          </div>

          <div className="p-2 border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
            <span className="block text-[9px] font-bold text-gray-400 uppercase">Income / Month (Declared)</span>
            <span className="font-extrabold text-gray-900 dark:text-slate-150">₹ {declaredMonthlyIncome.toFixed(2)}</span>
          </div>

          <div className={`p-2 border rounded ${
            foirPercent > 50
              ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200"
              : "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200"
          }`}>
            <span className="block text-[9px] font-bold uppercase">Computed FOIR (%)</span>
            <span className="font-extrabold">{foirPercent.toFixed(1)}%</span>
            {foirPercent > 50 && " (Exceeds Policy 50%)"}
          </div>
        </div>
      </div>
    </div>
  );
}
