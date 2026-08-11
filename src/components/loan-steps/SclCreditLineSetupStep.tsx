"use client";

import React, { useState } from "react";
import { CheckCircle, AlertCircle, Clock, ShieldCheck } from "lucide-react";

interface SclCreditLineSetupStepProps {
  data?: any;
  onChange: (data: any) => void;
}

export default function SclCreditLineSetupStep({ data, onChange }: SclCreditLineSetupStepProps) {
  const productData = data?.product_data || {};

  const updateProductField = (field: string, value: any) => {
    onChange({
      product_data: {
        ...productData,
        [field]: value
      }
    });
  };

  // Local state to simulate e-mandate registration
  const [registeringMandate, setRegisteringMandate] = useState(false);
  const mandateStatus = productData.mandate_status || "PENDING"; // PENDING | REGISTERED | FAILED

  const handleSimulateMandate = () => {
    setRegisteringMandate(true);
    setTimeout(() => {
      updateProductField("mandate_status", "REGISTERED");
      setRegisteringMandate(false);
    }, 1500);
  };

  // State to simulate KFS signing
  const [signingKFS, setSigningKFS] = useState(false);
  const kfsStatus = productData.kfs_status || "PENDING"; // PENDING | SIGNED

  const handleSimulateKFSSign = () => {
    setSigningKFS(true);
    setTimeout(() => {
      updateProductField("kfs_status", "SIGNED");
      setSigningKFS(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Credit Line Setup &amp; Mandates
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Configure revolving parameters, complete e-mandate registration, and satisfy regulatory pre-activation gates.
        </p>
      </div>

      {/* 1. Credit Limit Parameters */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <h3 className="text-xs font-bold text-gray-950 dark:text-slate-200 uppercase tracking-wider">
          1. Credit Line Parameters
        </h3>

        <div className={`grid grid-cols-1 gap-3 ${productData.purpose_of_line === "OTHER" ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Requested Credit Limit (₹) *
            </label>
            <input
              type="number"
              placeholder="e.g. 100000"
              value={productData.requested_limit || ""}
              onChange={(e) => updateProductField("requested_limit", parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Purpose of Drawdown *
            </label>
            <select
              value={productData.purpose_of_line || "WC"}
              onChange={(e) => updateProductField("purpose_of_line", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="WC">Working Capital / Business Needs</option>
              <option value="PERSONAL_NEEDS">Personal Unsecured Line</option>
              <option value="DEBT_CONSOLIDATION">Debt Consolidation</option>
              <option value="OTHER">Other Non-Speculative Purpose</option>
            </select>
          </div>

          {productData.purpose_of_line === "OTHER" && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Specify Purpose *
              </label>
              <input
                type="text"
                placeholder="Specify other purpose"
                value={productData.purpose_of_line_other || ""}
                onChange={(e) => updateProductField("purpose_of_line_other", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Review Cycle
            </label>
            <div className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-gray-700 dark:text-slate-300 font-medium">
              Annual Review (12 Months limit continuation)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Drawdowns & Repayments Mandates */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <h3 className="text-xs font-bold text-gray-950 dark:text-slate-200 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800 pb-1">
          2. Drawdown &amp; Repayment Mandates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Drawdown Destination Channel
            </label>
            <div className="flex flex-col gap-1 pt-1">
              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300">
                <input type="checkbox" checked disabled className="accent-black" />
                Direct Bank Transfer (v1 constraint)
              </label>
              <span className="text-[9px] text-amber-600 font-bold">
                ⚠️ UPI Drawdowns are blocked for NBFC lines per RBI regulations.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Repayment Mode (e-Mandate) *
            </label>
            <div className="flex gap-2">
              <select
                value={productData.repayment_mode || "UPI_AUTOPAY"}
                onChange={(e) => updateProductField("repayment_mode", e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
              >
                <option value="UPI_AUTOPAY">UPI Autopay mandate</option>
                <option value="NACH">eNACH / netbanking mandate</option>
              </select>
              <button
                type="button"
                onClick={handleSimulateMandate}
                disabled={mandateStatus === "REGISTERED" || registeringMandate}
                className="px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold rounded uppercase disabled:opacity-40"
              >
                {registeringMandate ? "Registering..." : mandateStatus === "REGISTERED" ? "Registered" : "Register"}
              </button>
            </div>
            <p className="text-[9px] text-gray-400 mt-1">
              Mandate Status: <span className={`font-bold ${mandateStatus === "REGISTERED" ? "text-green-600" : "text-amber-600"}`}>{mandateStatus}</span>
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Billing Statement Day *
            </label>
            <select
              value={productData.statement_cycle_day || "5"}
              onChange={(e) => updateProductField("statement_cycle_day", e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              {[1, 5, 10, 15, 20, 25, 28].map(day => (
                <option key={day} value={day}>{day}th of every month</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Activation Gates (Pre-activation) */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <h3 className="text-xs font-bold text-gray-950 dark:text-slate-200 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800 pb-1">
          3. Pre-Activation Compliance Gates (Lending Directions)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2 border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-800 dark:text-slate-200 uppercase">Key Fact Statement (KFS)</span>
              <p className="text-[9px] text-gray-400">Must be signed &amp; acknowledged before drawdown activation.</p>
            </div>
            <button
              type="button"
              onClick={handleSimulateKFSSign}
              disabled={kfsStatus === "SIGNED" || signingKFS}
              className={`px-3 py-1 text-[10px] font-bold rounded uppercase flex items-center gap-1 ${
                kfsStatus === "SIGNED" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-black text-white dark:bg-white dark:text-black"
              }`}
            >
              {kfsStatus === "SIGNED" ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Signed
                </>
              ) : signingKFS ? (
                "Signing..."
              ) : (
                "E-Sign KFS"
              )}
            </button>
          </div>

          <div className="p-2 border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 flex items-center gap-2">
            <div className="p-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-[10px] font-bold text-gray-800 dark:text-slate-200 uppercase">Cooling-Off Period</span>
              <p className="text-[9px] text-gray-400">
                Exit path: exit credit line with one-time exit fee within **3 Days** of limit activation.
              </p>
            </div>
          </div>
        </div>

        {/* GRO Signposting */}
        <div className="p-2 border border-blue-100 dark:border-blue-900/60 rounded bg-blue-50/20 dark:bg-blue-950/10 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-1 text-[10px] text-gray-600 dark:text-slate-400">
            <span className="font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
              Customer Support &amp; Grievance Redressal Signposting
            </span>
            <p>
              Lender Grievance Redressal Officer (GRO): **Ms. Anita Sharma** | Email: **gro@finbyx.com** | Ph: **011-49992999**.
            </p>
            <p>
              Escalation: If unresolved within 30 days, customers can register complaints on the RBI CMS portal: **https://cms.rbi.org.in**.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
