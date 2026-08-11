"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Briefcase,
  CreditCard,
  FileText,
  ShieldCheck,
  Building2
} from "lucide-react";
import type { Declaration } from "@/lib/schemas/loan-application";
import { DeclarationSchema } from "@/lib/schemas/loan-application";
import { useFormErrors, FieldError } from "@/lib/utils/field-validator";

interface DeclarationStepProps {
  data?: any;
  onChange: (data: any) => void;
}

function ReviewSummary({ data }: { data: any }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    applicant: true,
    coapplicant: false,
    collateral: true,
    financial: false,
    references: false,
  });

  const toggle = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const appInfo = data?.application_info || {};
  const applicant = data?.applicant_details || {};
  const coapp = data?.co_applicant_details || {};
  const hasCoapp = !!(coapp?.name);
  const bank = data?.bank_account || {};
  const existingLoans = data?.existing_loans || [];
  const proposedFacilities = data?.proposed_facilities || [];
  const references = data?.references || [];
  const documentChecklist = data?.document_checklist || {};
  const productData = data?.product_data || {};

  const isLAP = !!(productData?.property);
  const isLAS = !!(productData?.scrip_rows || productData?.depository);
  const isSCL = !!(productData?.requested_limit || productData?.purpose_of_line);

  const property = productData.property || {};
  const valuation = productData.valuation || {};
  const security = productData.security || {};

  // Capacity calculations for SCL
  const existingEmisSum = existingLoans.reduce((sum: number, loan: any) => sum + (parseFloat(loan.emi) || 0), 0);
  const requestedLimit = parseFloat(productData.requested_limit) || 100000;
  const proposedMinDue = requestedLimit * 0.05; // 5% revolving min due
  
  const declaredMonthlyIncome = appInfo.loan_type === "BUSINESS_LOAN"
    ? (parseFloat(productData.annual_turnover) || 0) / 12
    : (parseFloat(productData.declared_monthly_income) || 0);

  const foirPercent = declaredMonthlyIncome > 0 ? ((existingEmisSum + proposedMinDue) / declaredMonthlyIncome) * 100 : 0;

  // Helper for address string
  const formatAddress = (addr: any) => {
    if (!addr) return "N/A";
    const parts = [
      addr.address_line1,
      addr.address_line2,
      addr.landmark,
      addr.city,
      addr.state,
      addr.pincode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="text-[11px] font-bold text-gray-500 dark:text-slate-405 uppercase tracking-wider">
        Application Summary Review
      </div>

      {/* Accordion Panels */}
      
      {/* 1. Applicant & Business details */}
      <div className="border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => toggle("applicant")}
          className="w-full flex items-center justify-between p-2 text-left text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors border-b border-transparent data-[expanded=true]:border-gray-200 dark:data-[expanded=true]:border-slate-800"
          data-expanded={expanded.applicant}
        >
          <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            {appInfo.loan_type === "BUSINESS_LOAN" ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>1. Applicant &amp; Entity Details</span>
          </div>
          {expanded.applicant ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded.applicant && (
          <div className="p-2.5 text-[11px] space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50 dark:bg-slate-955/20 p-2 rounded border border-gray-150 dark:border-slate-850">
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Applicant Name</span>
                <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{applicant.name || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">
                  {appInfo.loan_type === "BUSINESS_LOAN" ? "Date of Inc" : "Date of Birth"}
                </span>
                <span className="font-semibold text-gray-900 dark:text-slate-200">{applicant.date_of_birth_or_incorporation || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">PAN Number</span>
                <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{applicant.pan_number || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Loan Type</span>
                <span className="font-semibold text-gray-900 dark:text-slate-205 uppercase">{appInfo.loan_type === "BUSINESS_LOAN" ? "Business Loan" : "Personal Loan"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Mobile Number</span>
                <span className="font-semibold text-gray-900 dark:text-slate-200">{applicant.mobile_number || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-405 uppercase font-semibold">Email Address</span>
                <span className="font-semibold text-gray-900 dark:text-slate-205">{applicant.email || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Sourcing Channel</span>
                <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{appInfo.sourcing_channel || "DIGITAL"}</span>
              </div>
              {appInfo.loan_type === "PERSONAL_LOAN" && (
                <div>
                  <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Father/Spouse Name</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{applicant.fathers_spouse_name || "N/A"}</span>
                </div>
              )}
            </div>

            {appInfo.loan_type === "BUSINESS_LOAN" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50 dark:bg-slate-955/20 p-2 rounded border border-gray-150 dark:border-slate-850">
                <div>
                  <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Constitution</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{applicant.legal_status || "N/A"}</span>
                </div>
                {applicant.roc_registration_number && (
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">ROC Reg No</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{applicant.roc_registration_number}</span>
                  </div>
                )}
                {applicant.partnership_deed_no && (
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-405 uppercase font-semibold">Partnership Deed No</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-205 uppercase">{applicant.partnership_deed_no}</span>
                  </div>
                )}
                <div>
                  <span className="block text-[9px] text-gray-500 dark:text-slate-405 uppercase font-semibold">GST Registration</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-205 uppercase">{applicant.gst_registration_number || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-500 dark:text-slate-405 uppercase font-semibold">Employees (Perm / Temp)</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-205">
                    {applicant.permanent_employees || 0} / {applicant.temporary_employees || 0}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-500 dark:text-slate-405 uppercase font-semibold">Advance Tax Paid?</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-205">{applicant.advance_tax_paid ? "YES" : "NO"}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {appInfo.loan_type === "BUSINESS_LOAN" ? (
                <>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Principal Place of Business Address</span>
                    <span className="text-gray-800 dark:text-slate-300 font-medium">{formatAddress(applicant.residential_address)}</span>
                  </div>
                  {applicant.registered_office_address && (
                    <div>
                      <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Registered Office Address</span>
                      <span className="text-gray-800 dark:text-slate-300 font-medium">{formatAddress(applicant.registered_office_address)}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Residential Address</span>
                    <span className="text-gray-800 dark:text-slate-300 font-medium">{formatAddress(applicant.residential_address)}</span>
                  </div>
                  {applicant.permanent_address && (
                    <div>
                      <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Permanent Address</span>
                      <span className="text-gray-800 dark:text-slate-300 font-medium">{formatAddress(applicant.permanent_address)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Co-Applicant details */}
      <div className="border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => toggle("coapplicant")}
          className="w-full flex items-center justify-between p-2 text-left text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors border-b border-transparent data-[expanded=true]:border-gray-200 dark:data-[expanded=true]:border-slate-800"
          data-expanded={expanded.coapplicant}
        >
          <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Users className="w-3.5 h-3.5" />
            <span>2. Co-Applicant / Co-Borrowers Details</span>
          </div>
          {expanded.coapplicant ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded.coapplicant && (
          <div className="p-2.5 text-[11px] space-y-2.5">
            {hasCoapp ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50 dark:bg-slate-955/20 p-2 rounded border border-gray-150 dark:border-slate-850">
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Co-Applicant Name</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{coapp.name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Relationship</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{coapp.relationship}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Date of Birth</span>
                    <span className="font-semibold text-gray-950 dark:text-slate-200">{coapp.date_of_birth}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">PAN Number</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{coapp.pan_number || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Mobile Number</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-205">{coapp.mobile_number || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Email Address</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200">{coapp.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Education</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{coapp.education_qualification || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Correspondence</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{coapp.correspondence_address || "N/A"}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Residential Address</span>
                    <span className="text-gray-800 dark:text-slate-300 font-medium">{formatAddress(coapp.residential_address)}</span>
                  </div>
                  {coapp.permanent_address && (
                    <div>
                      <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Permanent Address</span>
                      <span className="text-gray-800 dark:text-slate-300 font-medium">{formatAddress(coapp.permanent_address)}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-3 border border-dashed border-gray-200 dark:border-slate-800 rounded bg-gray-50/50 dark:bg-slate-900/50 text-gray-405 font-semibold">
                No Co-applicant declared.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Product & Collateral specific terms */}
      <div className="border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => toggle("collateral")}
          className="w-full flex items-center justify-between p-2 text-left text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors border-b border-transparent data-[expanded=true]:border-gray-200 dark:data-[expanded=true]:border-slate-800"
          data-expanded={expanded.collateral}
        >
          <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Briefcase className="w-3.5 h-3.5" />
            <span>3. Product &amp; Collateral Specifics</span>
          </div>
          {expanded.collateral ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded.collateral && (
          <div className="p-2.5 text-[11px] space-y-2.5">
            {isLAS && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50 dark:bg-slate-955/20 p-2 rounded border border-gray-150 dark:border-slate-850">
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Depository</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{productData.depository || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">DP ID</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase font-mono">{productData.dp_id || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Client ID</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase font-mono">{productData.client_id || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Pledge Status</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{productData.pledge_status || "PENDING"}</span>
                  </div>
                  {productData.demat_holder_names && (
                    <div className="col-span-2 sm:col-span-4">
                      <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Demat Holder Names</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">
                        {Array.isArray(productData.demat_holder_names) ? productData.demat_holder_names.join(", ") : productData.demat_holder_names}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] text-gray-500 dark:text-slate-405 uppercase font-semibold">Pledged Portfolio Scrips</span>
                  <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100/70 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
                          <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase">ISIN</th>
                          <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase">Security Name</th>
                          <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase">Qty</th>
                          <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase text-right">Price (₹)</th>
                          <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase text-right">LTV %</th>
                          <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase text-right">Pledge Value (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-[10px]">
                        {(productData.scrip_rows || []).map((scrip: any, idx: number) => {
                          const val = (parseFloat(scrip.market_price) || 0) * (parseFloat(scrip.quantity) || 0);
                          return (
                            <tr key={scrip.id || idx} className="hover:bg-gray-50/30 dark:hover:bg-slate-900/20">
                              <td className="py-1 px-2 font-mono uppercase text-gray-800 dark:text-slate-350">{scrip.isin || "N/A"}</td>
                              <td className="py-1 px-2 text-gray-900 dark:text-slate-200 uppercase font-medium">{scrip.security_name || "N/A"}</td>
                              <td className="py-1 px-2 text-gray-805 dark:text-slate-300">{scrip.quantity || 0}</td>
                              <td className="py-1 px-2 text-right text-gray-805 dark:text-slate-300 font-mono">{(parseFloat(scrip.market_price) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="py-1 px-2 text-right text-gray-805 dark:text-slate-300 font-mono">{scrip.ltv_pct || 50}%</td>
                              <td className="py-1 px-2 text-right font-semibold text-gray-905 dark:text-slate-250 font-mono">{(val * (scrip.ltv_pct / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          );
                        })}
                        {(!productData.scrip_rows || productData.scrip_rows.length === 0) && (
                          <tr>
                            <td colSpan={6} className="py-2 text-center text-gray-400 font-semibold">No scrips pledged.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-900/50 rounded border border-gray-150 dark:border-slate-850">
                  <div>
                    <span className="text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Total Collateral Value</span>
                    <span className="block text-xs font-bold text-gray-900 dark:text-slate-200 font-mono">₹{(productData.total_collateral_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Eligible Drawing Power (Limit)</span>
                    <span className="block text-xs font-extrabold text-green-700 dark:text-green-405 font-mono">₹{(productData.drawing_power || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {isLAP && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Property &amp; Valuation Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50 dark:bg-slate-950/20 p-2 rounded border border-gray-150 dark:border-slate-850">
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Property Type</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{property.property_type || "N/A"} ({property.property_subtype || "N/A"})</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Area (Built-up / Land)</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200">
                      {property.built_up_area || 0} / {property.land_area || 0} {property.area_unit || "SQ_FT"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Occupancy / Use</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{property.occupancy_status || "N/A"} ({property.current_use || "N/A"})</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">CERSAI Result</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{property.cersai_search_result || "N/A"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Property Address</span>
                    <span className="text-gray-800 dark:text-slate-350 font-medium">{formatAddress(property)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Title Deed Ref</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-205 uppercase">{property.title_deed_reference || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Mortgage Type</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-202 uppercase">{security.mortgage_type || "N/A"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50 dark:bg-slate-955/20 p-2 rounded border border-gray-150 dark:border-slate-850">
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Valuation Report 1</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 font-mono">₹{(parseFloat(valuation.valuation_report_1) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Valuation Report 2</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 font-mono">₹{(parseFloat(valuation.valuation_report_2) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Legal Scrutiny</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-202 uppercase">{valuation.legal_scrutiny_report || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Technical Valuation</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-202 uppercase">{valuation.technical_report || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            {isSCL && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50 dark:bg-slate-950/20 p-2 rounded border border-gray-150 dark:border-slate-850">
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Occupation Type</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{productData.occupation_type || "N/A"}</span>
                  </div>
                  {productData.employer_name && (
                    <div>
                      <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Employer Name</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-200 uppercase">{productData.employer_name}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Declared Monthly Income</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-200 font-mono">₹{(parseFloat(productData.declared_monthly_income) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {productData.annual_turnover && (
                    <div>
                      <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Annual Turnover</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-200 font-mono">₹{(parseFloat(productData.annual_turnover) || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Requested Credit Limit</span>
                    <span className="font-semibold text-green-700 dark:text-green-400 font-mono font-bold">₹{(parseFloat(productData.requested_limit) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Purpose of Line</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-202 uppercase">{productData.purpose_of_line || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Repayment Mode</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-202 uppercase">{productData.repayment_mode || "N/A"} (Mandate: {productData.mandate_status || "PENDING"})</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Statement Cycle Day</span>
                    <span className="font-semibold text-gray-900 dark:text-slate-202">{productData.statement_cycle_day || "5th"}</span>
                  </div>
                </div>

                {/* Capacity check parameters */}
                <div className="flex justify-between items-center p-2.5 bg-gray-55/80 dark:bg-slate-905/20 rounded border border-gray-150 dark:border-slate-850">
                  <div>
                    <span className="text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Capacity Evaluation Monthly Income</span>
                    <span className="block text-xs font-semibold text-gray-950 dark:text-slate-202 font-mono">
                      ₹{declaredMonthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Estimated FOIR %</span>
                    <span className={`block text-xs font-extrabold font-mono ${foirPercent > 60 ? "text-red-655 dark:text-red-400" : "text-green-700 dark:text-green-450"}`}>
                      {foirPercent.toFixed(1)}% {foirPercent > 60 ? "(Escalate Required)" : "(Acceptable)"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Financial profile & bank accounts */}
      <div className="border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => toggle("financial")}
          className="w-full flex items-center justify-between p-2 text-left text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors border-b border-transparent data-[expanded=true]:border-gray-200 dark:data-[expanded=true]:border-slate-800"
          data-expanded={expanded.financial}
        >
          <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <CreditCard className="w-3.5 h-3.5" />
            <span>4. Bank Account &amp; Financial Obligations</span>
          </div>
          {expanded.financial ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded.financial && (
          <div className="p-2.5 text-[11px] space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50 dark:bg-slate-950/20 p-2 rounded border border-gray-150 dark:border-slate-850">
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Account Holder Name</span>
                <span className="font-semibold text-gray-900 dark:text-slate-202 uppercase">{bank.account_holder_name || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Bank &amp; Branch</span>
                <span className="font-semibold text-gray-900 dark:text-slate-202 uppercase">{bank.bank_name || "N/A"} ({bank.branch || "N/A"})</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Account Number</span>
                <span className="font-semibold text-gray-900 dark:text-slate-202 font-mono">{bank.account_number || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">IFSC Code</span>
                <span className="font-semibold text-gray-900 dark:text-slate-202 font-mono uppercase">{bank.ifsc || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Account Type</span>
                <span className="font-semibold text-gray-900 dark:text-slate-202 uppercase">{bank.account_type || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Verification Status</span>
                <span className={`font-bold ${bank.is_verified ? "text-green-600 dark:text-green-400" : "text-amber-500"}`}>
                  {bank.is_verified ? "VERIFIED (PENNY DROP PASSED) ✓" : "PENDING"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Existing Loan Liabilities</span>
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/70 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
                      <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase">Loan Type</th>
                      <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase">Institution</th>
                      <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase text-right">Loan Amount</th>
                      <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase text-right">EMI (Monthly)</th>
                      <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase text-right">Outstanding Principal</th>
                      <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase text-center">Bal Tenure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-[10px]">
                    {existingLoans.map((loan: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-slate-900/20">
                        <td className="py-1 px-2 text-gray-900 dark:text-slate-202 uppercase font-medium">{loan.loan_type}</td>
                        <td className="py-1 px-2 text-gray-805 dark:text-slate-350 uppercase">{loan.institution_name}</td>
                        <td className="py-1 px-2 text-right text-gray-805 dark:text-slate-300 font-mono">₹{(parseFloat(loan.loan_amount) || 0).toLocaleString('en-IN')}</td>
                        <td className="py-1 px-2 text-right font-medium text-gray-900 dark:text-slate-250 font-mono">₹{(parseFloat(loan.emi) || 0).toLocaleString('en-IN')}</td>
                        <td className="py-1 px-2 text-right text-gray-805 dark:text-slate-300 font-mono">₹{(parseFloat(loan.outstanding_principal) || 0).toLocaleString('en-IN')}</td>
                        <td className="py-1 px-2 text-center text-gray-805 dark:text-slate-300 font-mono">{loan.balance_tenure_months} m</td>
                      </tr>
                    ))}
                    {existingLoans.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-2 text-center text-gray-400 font-semibold">No existing liability declared.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {proposedFacilities.length > 0 && (
              <div className="space-y-1">
                <span className="block text-[9px] text-gray-500 dark:text-slate-405 uppercase font-semibold">Requested Proposed Facilities</span>
                <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/70 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
                        <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase">Requested Facility</th>
                        <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase text-right">Amount</th>
                        <th className="py-1 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase text-center">Tenure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-[10px]">
                      {proposedFacilities.map((fac: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-slate-900/20">
                          <td className="py-1 px-2 text-gray-900 dark:text-slate-202 uppercase font-medium">{fac.facility_type?.replace(/_/g, ' ')}</td>
                          <td className="py-1 px-2 text-right font-bold text-gray-900 dark:text-slate-202 font-mono">₹{(parseFloat(fac.facility_amount_lakhs) || 0).toLocaleString('en-IN')} Lakhs</td>
                          <td className="py-1 px-2 text-center text-gray-805 dark:text-slate-300 font-mono">{fac.loan_tenure_years} Years</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. References & Documents */}
      <div className="border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => toggle("references")}
          className="w-full flex items-center justify-between p-2 text-left text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors border-b border-transparent data-[expanded=true]:border-gray-200 dark:data-[expanded=true]:border-slate-800"
          data-expanded={expanded.references}
        >
          <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <FileText className="w-3.5 h-3.5" />
            <span>5. References &amp; Uploaded Documents</span>
          </div>
          {expanded.references ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded.references && (
          <div className="p-2.5 text-[11px] space-y-2.5">
            {references.length > 0 && (
              <div className="space-y-1">
                <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Reference Contacts</span>
                <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/70 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
                        <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase">Name</th>
                        <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase">Relationship</th>
                        <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase">Mobile</th>
                        <th className="py-1 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-[10px]">
                      {references.map((ref: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-slate-900/20">
                          <td className="py-1 px-2 text-gray-900 dark:text-slate-205 uppercase font-medium">{ref.name}</td>
                          <td className="py-1 px-2 text-gray-805 dark:text-slate-350 uppercase">{ref.relationship} ({ref.years_known} yrs)</td>
                          <td className="py-1 px-2 text-gray-805 dark:text-slate-300 font-mono">{ref.mobile_number}</td>
                          <td className="py-1 px-2 text-gray-800 dark:text-slate-350">{formatAddress(ref)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="block text-[9px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Document Checklist Status</span>
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/70 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
                      <th className="py-1.5 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase">Document Class</th>
                      <th className="py-1.5 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase">File Name</th>
                      <th className="py-1.5 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase text-center">Size (KB)</th>
                      <th className="py-1.5 px-2 text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase text-center">Status</th>
                      <th className="py-1.5 px-2 text-[9px] font-bold text-gray-655 dark:text-slate-400 uppercase text-center">API Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-250 dark:divide-slate-800 text-[10px]">
                    {Object.entries(documentChecklist).map(([key, item]: [string, any]) => (
                      <tr key={key} className="hover:bg-gray-50/30 dark:hover:bg-slate-900/20">
                        <td className="py-1.5 px-2 text-gray-900 dark:text-slate-205 uppercase font-medium">
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="py-1.5 px-2 text-gray-805 dark:text-slate-350 truncate max-w-[150px]">
                          {item.file_name || <span className="text-gray-400 italic">Not Uploaded</span>}
                        </td>
                        <td className="py-1.5 px-2 text-center text-gray-805 dark:text-slate-300 font-mono">
                          {item.file_size ? `${(item.file_size / 1024).toFixed(1)}` : "-"}
                        </td>
                        <td className="py-1.5 px-2 text-center font-bold">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                            item.is_submitted ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}>
                            {item.is_submitted ? "SUBMITTED" : "PENDING"}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-center font-semibold">
                          {item.is_api_satisfied ? (
                            <span className="text-green-605 dark:text-green-405 flex items-center justify-center gap-0.5 text-[9px]">
                              <ShieldCheck className="w-3 h-3 text-green-600" /> Yes
                            </span>
                          ) : (
                            <span className="text-gray-400 flex items-center justify-center gap-0.5">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {Object.keys(documentChecklist).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-2 text-center text-gray-455 font-semibold">No documents required or uploaded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeclarationStep({ data, onChange }: DeclarationStepProps) {
  const decl: Partial<Declaration> = data?.declaration || {
    decl_accepted: false,
    consent_credit_bureau: false,
    consent_data_sharing: false,
    consent_ekyc_aadhaar: false,
    aadhaar_number: "",
    service_agency_rel_no: "",
    declaration_date: new Date().toISOString().split("T")[0]
  };

  const hasCoapp = data?.co_applicant_details && data.co_applicant_details.name;

  // Field-level validation errors (fires onBlur)
  const { errors, validateWith } = useFormErrors();

  const updateField = (field: keyof Declaration, value: any) => {
    onChange({
      declaration: {
        ...decl,
        [field]: value,
      },
    });
  };

  // State for Aadhaar masking
  const [aadhaarFocus, setAadhaarFocus] = useState(false);
  const [coAadhaarFocus, setCoAadhaarFocus] = useState(false);

  // HTML5 Signature Canvas logic for applicant
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!decl.applicant_signature_file_id);

  // Co-applicant signature canvas
  const coCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCoDrawing, setIsCoDrawing] = useState(false);
  const [hasCoSigned, setHasCoSigned] = useState(!!decl.co_applicant_signature_file_id);

  // Initialize Canvas
  const initCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
  };

  useEffect(() => {
    initCanvas(canvasRef.current);
  }, [canvasRef]);

  useEffect(() => {
    if (hasCoapp) {
      initCanvas(coCanvasRef.current);
    }
  }, [coCanvasRef, hasCoapp]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSigned(true);
      updateField("applicant_signature_file_id", "canvas_signature.png");
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    updateField("applicant_signature_file_id", "");
  };

  // Co-applicant Drawing handlers
  const startCoDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = coCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsCoDrawing(true);
  };

  const drawCo = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCoDrawing) return;
    const canvas = coCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopCoDrawing = () => {
    if (isCoDrawing) {
      setIsCoDrawing(false);
      setHasCoSigned(true);
      updateField("co_applicant_signature_file_id", "co_canvas_signature.png");
    }
  };

  const clearCoSignature = () => {
    const canvas = coCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasCoSigned(false);
    updateField("co_applicant_signature_file_id", "");
  };

  const getMaskedAadhaar = (val?: string) => {
    if (!val) return "";
    if (val.length < 12) return val;
    return `XXXX-XXXX-${val.slice(-4)}`;
  };

  const declarationText = `DECLARATION CLAUSES 1-14 (VERBATIM):
1. The fee paid herewith is non-refundable under any circumstances.
2. The appraisal of the loan application is at the sole discretion of the lender, and the lender reserves the right to reject this application without assigning any reasons whatsoever.
3. The particulars, information, and representations given herein form the basis of the credit assessment and loan decisions, and any inaccuracy therein shall entitle the lender to cancel the facility immediately.
4. I/We declare that no insolvency, bankruptcy, winding up, or recovery proceedings have been initiated or are pending against me/us or my/our directors/partners.
5. I/We have read, understood, and agree to abide by the terms and conditions governing the credit facility as published on the website/portal.
6. The interest is computed on a daily rest basis and is subject to revision as per the credit policy of the lender.
7. The lender reserves the right to reject any application, and the documents submitted along with this application shall not be returned.
8. Credit Bureau Consent: I/We hereby consent to the lender obtaining credit reports from CIBIL or other authorized credit information companies for the purpose of credit appraisal and monitoring of the facility.
9. I/We agree to be governed by the lender's rules, regulations, and operational directives in force from time to time.
10. I/We undertake to inform the lender immediately in writing of any changes in residence/office address, occupation, shareholding pattern, or financial profile.
11. I/We declare that I/we are not related to any of the directors or senior employees of the lender, except as declared in writing.
12. DSA/DST Commission Disclosure: I/We declare that no direct commission or service fee has been paid by me/us to any sourcing agent (DSA/DST) other than the standard processing fees charged directly by the lender.
13. DPDP Consent: (a) I/We consent to the collection, processing, and storage of my/our personal data for the purpose of loan appraisal, servicing, and compliance. (b) I/We consent to data sharing with third-party service agencies (UIDAI, NSDL, MCA, GSTN) for API verification. (c) I/We agree that data sharing is limited to the purposes declared. (d) I/We acknowledge that I/we have the right to withdraw this consent by writing to the Grievance Officer, subject to repayment of outstanding dues.
14. Aadhaar e-KYC Consent (Optional): I/We hereby voluntarily provide consent to use my Aadhaar number for performing OTP-based e-KYC authentication to verify my identity.`;

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Review & Submit
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Accept granular consents, complete Aadhaar checks, sign specimen, and submit application.
        </p>
      </div>

      {/* Accordion view summarizing all filled application form details */}
      <ReviewSummary data={data} />

      {/* Verbatim Scroll Container */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300">
          verbatim terms & conditions
        </label>
        <div className="h-28 overflow-y-scroll text-[10px] p-2 border border-gray-200 dark:border-slate-800 rounded bg-gray-50/50 dark:bg-slate-900/50 leading-relaxed font-mono whitespace-pre-line text-gray-600 dark:text-slate-400">
          {declarationText}
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Applicant Block */}
        <div className="border border-gray-200 dark:border-slate-800 rounded p-2.5 space-y-2 bg-gray-50/20 dark:bg-slate-900/10">
          <span className="text-[10px] font-extrabold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
            Applicant Consents & Specimen
          </span>
          <div className="space-y-1.5 text-xs text-gray-700 dark:text-slate-350">
            {/* Clause 1-12 */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!decl.decl_accepted}
                onChange={(e) => updateField("decl_accepted", e.target.checked)}
                className="w-3.5 h-3.5 mt-0.5 accent-black dark:accent-white"
                required
              />
              <span className="text-[11px]">Accept General Declarations (Clauses 1-12) *</span>
            </label>
            {/* Bureau */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!decl.consent_credit_bureau}
                onChange={(e) => updateField("consent_credit_bureau", e.target.checked)}
                className="w-3.5 h-3.5 mt-0.5 accent-black dark:accent-white"
                required
              />
              <span className="text-[11px]">Consent to Bureau CIBIL Pull (Clause 8) *</span>
            </label>
            {/* Data sharing */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!decl.consent_data_sharing}
                onChange={(e) => updateField("consent_data_sharing", e.target.checked)}
                className="w-3.5 h-3.5 mt-0.5 accent-black dark:accent-white"
                required
              />
              <span className="text-[11px]">Consent to DPDP Data Sharing & Storage (Clause 13) *</span>
            </label>
            {/* Aadhaar (optional) */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!decl.consent_ekyc_aadhaar}
                onChange={(e) => updateField("consent_ekyc_aadhaar", e.target.checked)}
                className="w-3.5 h-3.5 mt-0.5 accent-black dark:accent-white"
              />
              <span className="text-[11px]">Optional OTP-based Aadhaar e-KYC (Clause 14)</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-gray-150 dark:border-slate-800">
            {/* Aadhaar Input */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">
                Aadhaar Number
              </label>
              <input
                type="text"
                maxLength={12}
                placeholder="12-digit Aadhaar"
                value={aadhaarFocus ? decl.aadhaar_number || "" : getMaskedAadhaar(decl.aadhaar_number)}
                onFocus={() => setAadhaarFocus(true)}
                onBlur={() => {
                  setAadhaarFocus(false);
                  // Only validate if user has typed something
                  if (decl.aadhaar_number) {
                    validateWith("aadhaar_number", DeclarationSchema.shape.aadhaar_number, decl.aadhaar_number);
                  }
                }}
                onChange={(e) => updateField("aadhaar_number", e.target.value.replace(/\D/g, ""))}
                className={`w-full px-2 py-0.5 text-xs border rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none ${
                  errors.aadhaar_number ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
              />
              <FieldError message={errors.aadhaar_number} />
            </div>

            {/* Service Agency Relationship Number */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">
                Relationship ID (if any)
              </label>
              <input
                type="text"
                placeholder="Bank Relationship No"
                value={decl.service_agency_rel_no || ""}
                onChange={(e) => updateField("service_agency_rel_no", e.target.value)}
                className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Signature Specimen Canvas */}
          <div className="space-y-1.5 pt-1.5 border-t border-gray-150 dark:border-slate-800">
            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-500 dark:text-slate-400">
              <span>Sign in the pad below *</span>
              {hasSigned && (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" /> Signed
                </span>
              )}
            </div>
            <div className="relative border border-gray-200 dark:border-slate-850 rounded bg-white overflow-hidden h-20">
              <canvas
                ref={canvasRef}
                width={300}
                height={80}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              <button
                type="button"
                onClick={clearSignature}
                className="absolute right-1 bottom-1 p-1 bg-red-50 text-red-500 hover:bg-red-100 rounded shadow-sm border border-red-200 transition-colors"
                title="Clear Signature"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Co-Applicant Block */}
        {hasCoapp ? (
          <div className="border border-gray-200 dark:border-slate-800 rounded p-2.5 space-y-2 bg-gray-50/20 dark:bg-slate-900/10">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
              Co-Applicant Consents & Specimen
            </span>
            <div className="space-y-1.5 text-xs text-gray-700 dark:text-slate-350">
              {/* Clause 1-12 */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!decl.co_applicant_decl_accepted}
                  onChange={(e) => updateField("co_applicant_decl_accepted", e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 accent-black dark:accent-white"
                  required
                />
                <span className="text-[11px]">Co-Applicant Accept Declarations *</span>
              </label>
              {/* Bureau */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!decl.co_applicant_consent_credit_bureau}
                  onChange={(e) => updateField("co_applicant_consent_credit_bureau", e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 accent-black dark:accent-white"
                  required
                />
                <span className="text-[11px]">Co-Applicant Bureau Consent *</span>
              </label>
              {/* Data sharing */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!decl.co_applicant_consent_data_sharing}
                  onChange={(e) => updateField("co_applicant_consent_data_sharing", e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 accent-black dark:accent-white"
                  required
                />
                <span className="text-[11px]">Co-Applicant DPDP Data Sharing Consent *</span>
              </label>
              {/* Aadhaar (optional) */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!decl.co_applicant_consent_ekyc_aadhaar}
                  onChange={(e) => updateField("co_applicant_consent_ekyc_aadhaar", e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 accent-black dark:accent-white"
                />
                <span className="text-[11px]">Co-Applicant Optional Aadhaar e-KYC</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-gray-150 dark:border-slate-800">
              {/* Aadhaar Input */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">
                  Co-Applicant Aadhaar
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="12-digit Aadhaar"
                  value={coAadhaarFocus ? decl.co_applicant_aadhaar_number || "" : getMaskedAadhaar(decl.co_applicant_aadhaar_number)}
                  onFocus={() => setCoAadhaarFocus(true)}
                  onBlur={() => setCoAadhaarFocus(false)}
                  onChange={(e) => updateField("co_applicant_aadhaar_number", e.target.value.replace(/\D/g, ""))}
                  className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">
                  Date
                </label>
                <input
                  type="date"
                  value={decl.co_applicant_declaration_date || ""}
                  onChange={(e) => updateField("co_applicant_declaration_date", e.target.value)}
                  className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Signature Specimen Canvas */}
            <div className="space-y-1.5 pt-1.5 border-t border-gray-150 dark:border-slate-800">
              <div className="flex justify-between items-center text-[10px] font-semibold text-gray-500 dark:text-slate-400">
                <span>Co-Applicant sign pad below *</span>
                {hasCoSigned && (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" /> Signed
                  </span>
                )}
              </div>
              <div className="relative border border-gray-200 dark:border-slate-850 rounded bg-white overflow-hidden h-20">
                <canvas
                  ref={coCanvasRef}
                  width={300}
                  height={80}
                  onMouseDown={startCoDrawing}
                  onMouseMove={drawCo}
                  onMouseUp={stopCoDrawing}
                  onMouseLeave={stopCoDrawing}
                  className="w-full h-full cursor-crosshair"
                />
                <button
                  type="button"
                  onClick={clearCoSignature}
                  className="absolute right-1 bottom-1 p-1 bg-red-50 text-red-500 hover:bg-red-100 rounded shadow-sm border border-red-200 transition-colors"
                  title="Clear Signature"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 dark:border-slate-800 rounded p-4 flex items-center justify-center text-xs text-gray-400 bg-gray-50/50 dark:bg-slate-900/50 font-semibold text-center">
            No co-applicant declared. Co-applicant consents are omitted.
          </div>
        )}
      </div>
    </div>
  );
}
