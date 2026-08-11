"use client";

import React, { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";

interface LapProductStepProps {
  data: any; // parent formData
  onChange: (data: any) => void;
}

export default function LapProductStep({ data, onChange }: LapProductStepProps) {
  // Safe extraction of product_data
  const productData = data.product_data || {};

  // Local helper to update fields directly inside product_data
  const updateProductField = (field: string, value: any) => {
    onChange({
      product_data: {
        ...productData,
        [field]: value
      }
    });
  };

  // Safe extraction of nested structures in product_data
  const property = productData.property || {
    property_type: "RESIDENTIAL",
    property_subtype: "FLAT",
    address_line1: "",
    address_line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    geotag: "",
    land_area: 0,
    built_up_area: 0,
    area_unit: "SQ_FT",
    property_age_years: 0,
    occupancy_status: "SELF_OCCUPIED",
    current_use: "AS_PER_PLAN",
    ownership_type: "SOLE",
    owners: [{ name: "", share_percent: 100 }],
    title_deed_reference: "",
    encumbrance_certificate_ref: "",
    cersai_search_result: "CLEAR",
    existing_loans_on_property: false,
    existing_loans_details: "",
  };

  const valuation = productData.valuation || {
    valuation_report_1: 0,
    valuation_report_2: 0,
    legal_scrutiny_report: "CLEAR_MARKETABLE",
    technical_report: "CLEAR",
    approved_plan_status: "YES",
    property_tax_receipts: "PAID",
  };

  const security = productData.security || {
    mortgage_type: "EQUITABLE",
    stamp_duty_state: "Delhi",
    property_insurance_insurer: "",
    property_insurance_sum: 0,
    cersai_registration: "PENDING"
  };

  // Facility detail helper (lives at product_data root in this step for form continuity)
  const proposed_amount_lakhs = productData.proposed_amount_lakhs || 10;
  const tenure_years = productData.tenure_years || 5;

  const updatePropertyField = (field: string, value: any) => {
    updateProductField("property", {
      ...property,
      [field]: value
    });
  };

  const updateValuationField = (field: string, value: any) => {
    updateProductField("valuation", {
      ...valuation,
      [field]: value
    });
  };

  const updateSecurityField = (field: string, value: any) => {
    updateProductField("security", {
      ...security,
      [field]: value
    });
  };

  // Repeating Table helper for Property Owners
  const ownersList = property.owners || [];
  const addOwnerRow = () => {
    const updatedOwners = [...ownersList, { name: "", share_percent: 0 }];
    updatePropertyField("owners", updatedOwners);
  };
  const removeOwnerRow = (index: number) => {
    const updatedOwners = ownersList.filter((_: any, idx: number) => idx !== index);
    updatePropertyField("owners", updatedOwners);
  };
  const updateOwnerRow = (index: number, field: string, value: any) => {
    const updatedOwners = [...ownersList];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [field]: field === "share_percent" ? (parseFloat(value) || 0) : value
    };
    updatePropertyField("owners", updatedOwners);
  };

  // Derived Calculations
  const ownersShareSum = ownersList.reduce((acc: number, owner: any) => acc + (owner.share_percent || 0), 0);
  const assessedValueLakhs = Math.min(valuation.valuation_report_1 || 0, valuation.valuation_report_2 || valuation.valuation_report_1 || 0);
  const calculatedLtv = assessedValueLakhs > 0 ? (proposed_amount_lakhs / assessedValueLakhs) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Collateral - Property Details (LAP)
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Capture property specifications, legal titles, valuation reports, and mortgage registration plans.
        </p>
      </div>

      {/* 1. Property Identity Section */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <h3 className="text-xs font-bold text-gray-950 dark:text-slate-200 uppercase tracking-wider">
          1. Property Identity
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Property Type *
            </label>
            <select
              value={property.property_type || "RESIDENTIAL"}
              onChange={(e) => updatePropertyField("property_type", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
              <option value="PLOT">Plot / Land</option>
              <option value="MIXED_USE">Mixed Use</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Property Subtype *
            </label>
            <select
              value={property.property_subtype || "FLAT"}
              onChange={(e) => updatePropertyField("property_subtype", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="FLAT">Flat / Apartment</option>
              <option value="INDEPENDENT_HOUSE">Independent House</option>
              <option value="OFFICE">Office Space</option>
              <option value="SHOP">Retail Shop</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="LAND">Bare Land / Plot</option>
              <option value="OTHER">Other Property Subtype</option>
            </select>
            
            {property.property_subtype === "OTHER" && (
              <div className="mt-2">
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                  Specify Property Subtype *
                </label>
                <input
                  type="text"
                  placeholder="Specify other subtype"
                  value={property.property_subtype_other || ""}
                  onChange={(e) => updatePropertyField("property_subtype_other", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Occupancy Status *
            </label>
            <select
              value={property.occupancy_status || "SELF_OCCUPIED"}
              onChange={(e) => updatePropertyField("occupancy_status", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="SELF_OCCUPIED">Self Occupied</option>
              <option value="LET_OUT">Let Out / Rented</option>
              <option value="VACANT">Vacant</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Current Use Compliance *
            </label>
            <select
              value={property.current_use || "AS_PER_PLAN"}
              onChange={(e) => updatePropertyField("current_use", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="AS_PER_PLAN">As per Approved Plan</option>
              <option value="DEVIATION">Deviation Present</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <input
              type="text"
              placeholder="Address Line 1 *"
              value={property.address_line1 || ""}
              onChange={(e) => updatePropertyField("address_line1", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Address Line 2"
              value={property.address_line2 || ""}
              onChange={(e) => updatePropertyField("address_line2", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Landmark"
              value={property.landmark || ""}
              onChange={(e) => updatePropertyField("landmark", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <input
              type="text"
              placeholder="PIN *"
              maxLength={6}
              value={property.pincode || ""}
              onChange={(e) => updatePropertyField("pincode", e.target.value)}
              className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
            <input
              type="text"
              placeholder="City *"
              value={property.city || ""}
              onChange={(e) => updatePropertyField("city", e.target.value)}
              className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
            <input
              type="text"
              placeholder="State *"
              value={property.state || ""}
              onChange={(e) => updatePropertyField("state", e.target.value)}
              className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Land / Built-up Area
            </label>
            <div className="flex gap-1">
              <input
                type="number"
                placeholder="Area"
                value={property.land_area || ""}
                onChange={(e) => updatePropertyField("land_area", parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              />
              <select
                value={property.area_unit || "SQ_FT"}
                onChange={(e) => updatePropertyField("area_unit", e.target.value)}
                className="px-1 py-1 text-[10px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              >
                <option value="SQ_FT">Sq. Ft</option>
                <option value="SQ_MTR">Sq. Mtr</option>
                <option value="SQ_YRD">Sq. Yd</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Property Age (Years) *
            </label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={property.property_age_years || ""}
              onChange={(e) => updatePropertyField("property_age_years", parseInt(e.target.value, 10) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Property Geotagging
            </label>
            <input
              type="text"
              placeholder="e.g. 28.6139, 77.2090"
              value={property.geotag || ""}
              onChange={(e) => updatePropertyField("geotag", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Ownership & Title */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-1">
          <h3 className="text-xs font-bold text-gray-950 dark:text-slate-200 uppercase tracking-wider">
            2. Ownership & Title
          </h3>
          <div className="flex gap-2">
            <select
              value={property.ownership_type || "SOLE"}
              onChange={(e) => updatePropertyField("ownership_type", e.target.value)}
              className="px-2 py-0.5 text-[10px] border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="SOLE">Sole Ownership</option>
              <option value="JOINT">Joint Ownership</option>
              <option value="INHERITED">Inherited</option>
              <option value="POA_HELD">Power of Attorney</option>
              <option value="HUF">HUF Property</option>
            </select>
          </div>
        </div>

        {/* Owners Table */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Co-Owners &amp; Shareholding Details</span>
            <button
              type="button"
              onClick={addOwnerRow}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] rounded font-bold uppercase"
            >
              <Plus className="w-3 h-3" /> Add Owner
            </button>
          </div>

          <div className="border border-gray-200 dark:border-slate-800 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-100 dark:bg-slate-800 text-[10px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-1 px-2">Owner Name *</th>
                  <th className="p-1 px-2 w-32 text-right">Share (%) *</th>
                  <th className="p-1 px-2 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {ownersList.map((owner: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-1 px-2">
                      <input
                        type="text"
                        placeholder="Owner Full Name"
                        value={owner.name || ""}
                        onChange={(e) => updateOwnerRow(idx, "name", e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-transparent text-gray-900 dark:text-slate-100 outline-none"
                        required
                      />
                    </td>
                    <td className="p-1 px-2">
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={owner.share_percent || ""}
                        onChange={(e) => updateOwnerRow(idx, "share_percent", e.target.value)}
                        className="w-full text-right px-1.5 py-0.5 border border-gray-200 dark:border-slate-700 rounded bg-transparent text-gray-900 dark:text-slate-100 outline-none"
                        required
                      />
                    </td>
                    <td className="p-1 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeOwnerRow(idx)}
                        disabled={ownersList.length <= 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ownersShareSum !== 100 && (
            <p className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold">
              <AlertCircle className="w-3 h-3" /> Total owner shares sum to {ownersShareSum}%. Must sum to exactly 100%.
            </p>
          )}
        </div>

        {/* Deed and CERSAI search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Title Deed Reference *
            </label>
            <input
              type="text"
              placeholder="e.g. Sale Deed Reg No. 123/2020"
              value={property.title_deed_reference || ""}
              onChange={(e) => updatePropertyField("title_deed_reference", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Encumbrance Certificate Reference *
            </label>
            <input
              type="text"
              placeholder="e.g. EC No. 9982 (15 Years Search)"
              value={property.encumbrance_certificate_ref || ""}
              onChange={(e) => updatePropertyField("encumbrance_certificate_ref", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              CERSAI Search Registry Result
            </label>
            <select
              value={property.cersai_search_result || "CLEAR"}
              onChange={(e) => updatePropertyField("cersai_search_result", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none font-bold text-green-600 dark:text-green-400"
            >
              <option value="CLEAR">CLEAR / NO CHARGE FOUND</option>
              <option value="PRIOR_CHARGE_FOUND">PRIOR CHARGE DETECTED (Stop/Review)</option>
            </select>
          </div>
        </div>

        {/* Existing loan check */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={!!property.existing_loans_on_property}
              onChange={(e) => updatePropertyField("existing_loans_on_property", e.target.checked)}
              className="w-3.5 h-3.5 accent-black dark:accent-white"
            />
            Existing outstanding loan(s) charged against this property (BT / Top-up Case)?
          </label>

          {property.existing_loans_on_property && (
            <div className="mt-2">
              <textarea
                placeholder="Mention lender name, foreclosure amount, and details of original title deeds return plan..."
                value={property.existing_loans_details || ""}
                onChange={(e) => updatePropertyField("existing_loans_details", e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Valuation & Technical */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <h3 className="text-xs font-bold text-gray-950 dark:text-slate-200 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800 pb-1">
          3. Valuation &amp; Technical Reports (Lender Scrutiny Track)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Valuation Report 1 (₹ Lakhs)
            </label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={valuation.valuation_report_1 || ""}
              onChange={(e) => updateValuationField("valuation_report_1", parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Valuation Report 2 (₹ Lakhs)
            </label>
            <input
              type="number"
              placeholder="Dual valuer (large ticket)"
              value={valuation.valuation_report_2 || ""}
              onChange={(e) => updateValuationField("valuation_report_2", parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>

          {/* Assessed Value & LTV indicators */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1">
              Assessed Value (Lakhs)
            </label>
            <div className="px-2 py-1 text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded">
              ₹ {assessedValueLakhs.toFixed(2)} Lakhs
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1">
              Computed LTV Status
            </label>
            <div className={`px-2 py-1 text-xs font-bold border rounded ${
              calculatedLtv > 70 
                ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200" 
                : calculatedLtv > 0 
                ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200" 
                : "bg-gray-100 dark:bg-slate-800 text-gray-500 border-gray-200"
            }`}>
              {calculatedLtv > 0 ? `${calculatedLtv.toFixed(1)}% LTV` : "N/A"}
              {calculatedLtv > 70 && " (Breaches 70% Limit)"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Legal Scrutiny (LSR) *
            </label>
            <select
              value={valuation.legal_scrutiny_report || "CLEAR_MARKETABLE"}
              onChange={(e) => updateValuationField("legal_scrutiny_report", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="CLEAR_MARKETABLE">Clear &amp; Marketable Title</option>
              <option value="DEFECTIVE">Defective Title (Reject)</option>
              <option value="REFER">Refer to Advocate / Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Technical Report *
            </label>
            <select
              value={valuation.technical_report || "CLEAR"}
              onChange={(e) => updateValuationField("technical_report", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="CLEAR">Approved Structure / Site OK</option>
              <option value="DEVIATION">Demolition Risk / Deviation</option>
              <option value="REJECT">Reject (Technical Violation)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Approved Plan Status
            </label>
            <select
              value={valuation.approved_plan_status || "YES"}
              onChange={(e) => updateValuationField("approved_plan_status", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="YES">Approved Building Plan &amp; OC OK</option>
              <option value="NO">Plan Deviations / No Plan</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Property Tax Paid *
            </label>
            <select
              value={valuation.property_tax_receipts || "PAID"}
              onChange={(e) => updateValuationField("property_tax_receipts", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="PAID">Receipts Up to Date</option>
              <option value="UNPAID">Tax Outstanding</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Security Creation & Plan */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <h3 className="text-xs font-bold text-gray-950 dark:text-slate-200 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800 pb-1">
          4. Security Creation Plan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Mortgage Mode *
            </label>
            <div className="flex gap-4 pt-1">
              <label className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="mortgage_type"
                  checked={security.mortgage_type === "EQUITABLE"}
                  onChange={() => updateSecurityField("mortgage_type", "EQUITABLE")}
                  className="accent-black dark:accent-white"
                />
                Equitable Mortgage
              </label>
              <label className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="mortgage_type"
                  checked={security.mortgage_type === "REGISTERED"}
                  onChange={() => updateSecurityField("mortgage_type", "REGISTERED")}
                  className="accent-black dark:accent-white"
                />
                Registered Mortgage
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Property State (Stamp Duty Scale)
            </label>
            <select
              value={security.stamp_duty_state || "Delhi"}
              onChange={(e) => updateSecurityField("stamp_duty_state", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="Delhi">Delhi / NCR</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="TamilNadu">Tamil Nadu</option>
              <option value="Haryana">Haryana</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Property Insurance Insurer
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Ergo"
              value={security.property_insurance_insurer || ""}
              onChange={(e) => updateSecurityField("property_insurance_insurer", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Insurance Sum Insured (₹ Lakhs)
            </label>
            <input
              type="number"
              placeholder="e.g. 40"
              value={security.property_insurance_sum || ""}
              onChange={(e) => updateSecurityField("property_insurance_sum", parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
