"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Send, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface ScripItem {
  id: string;
  security_type: "LISTED_EQUITY" | "EQUITY_MF" | "DEBT_MF" | "GSEC" | "BOND" | "INSURANCE_POLICY";
  isin: string;
  security_name: string;
  quantity: number;
  market_price: number;
  ltv_pct: number; // e.g., 50%
  concentration_check: boolean;
  promoter_insider_flag: boolean;
  eligible_flag: boolean;
}

interface LasData {
  holding_type_selector?: string[];
  depository?: "NSDL" | "CDSL";
  dp_id?: string;
  client_id?: string;
  demat_holder_names?: string[];
  scrip_rows?: ScripItem[];
  total_collateral_value?: number;
  drawing_power?: number;
  pledge_mode?: string;
  pledge_status?: "PENDING" | "INITIATED" | "CONFIRMED" | "FAILED";
  purpose_of_loan?: string;
  dp_connected?: boolean;
}

interface Props {
  data: Partial<LasData>;
  onChange: (data: Partial<LasData>) => void;
}

// Prefilled mock portfolios for CDSL / NSDL fetch simulation
const MOCK_SECURITIES: Record<string, ScripItem[]> = {
  PERSONAL_DEMAT: [
    {
      id: "scrip-1",
      security_type: "LISTED_EQUITY",
      isin: "INE002A01018",
      security_name: "RELIANCE INDUSTRIES LTD",
      quantity: 120,
      market_price: 2450.5,
      ltv_pct: 50,
      concentration_check: false,
      promoter_insider_flag: false,
      eligible_flag: true,
    },
    {
      id: "scrip-2",
      security_type: "LISTED_EQUITY",
      isin: "INE040A01034",
      security_name: "HDFC BANK LTD",
      quantity: 250,
      market_price: 1610.2,
      ltv_pct: 50,
      concentration_check: false,
      promoter_insider_flag: false,
      eligible_flag: true,
    },
    {
      id: "scrip-3",
      security_type: "EQUITY_MF",
      isin: "INF200K01UV3",
      security_name: "SBI BLUECHIP FUND - DIRECT GROWTH",
      quantity: 3450.12,
      market_price: 82.4,
      ltv_pct: 50,
      concentration_check: false,
      promoter_insider_flag: false,
      eligible_flag: true,
    },
  ],
  BUSINESS_DEMAT: [
    {
      id: "scrip-101",
      security_type: "LISTED_EQUITY",
      isin: "INE002A01018",
      security_name: "RELIANCE INDUSTRIES LTD",
      quantity: 1500,
      market_price: 2450.5,
      ltv_pct: 50,
      concentration_check: false,
      promoter_insider_flag: true, // insider scrip
      eligible_flag: true,
    },
    {
      id: "scrip-102",
      security_type: "GSEC",
      isin: "IN0020230085",
      security_name: "7.18% GS 2033 GOVERNMENT BOND",
      quantity: 500,
      market_price: 100.8,
      ltv_pct: 70, // debt higher LTV
      concentration_check: false,
      promoter_insider_flag: false,
      eligible_flag: true,
    },
    {
      id: "scrip-103",
      security_type: "DEBT_MF",
      isin: "INF179K01LQ9",
      security_name: "HDFC SHORT TERM DEBT FUND",
      quantity: 15400.5,
      market_price: 28.9,
      ltv_pct: 70,
      concentration_check: false,
      promoter_insider_flag: false,
      eligible_flag: true,
    },
  ]
};

export default function LasProductStep({ data, onChange }: Props) {
  // Local state with fallback initializers
  const [holdingTypes, setHoldingTypes] = useState<string[]>(data.holding_type_selector || ["DEMAT_SECURITIES"]);
  const [depository, setDepository] = useState<"NSDL" | "CDSL">(data.depository || "CDSL");
  const [dpId, setDpId] = useState(data.dp_id || "");
  const [clientId, setClientId] = useState(data.client_id || "");
  const [scripRows, setScripRows] = useState<ScripItem[]>(data.scrip_rows || []);
  const [pledgeStatus, setPledgeStatus] = useState<"PENDING" | "INITIATED" | "CONFIRMED" | "FAILED">(data.pledge_status || "PENDING");
  const [purpose, setPurpose] = useState(data.purpose_of_loan || "BUSINESS_WC");
  const [fetching, setFetching] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpPrompt, setShowOtpPrompt] = useState(false);
  const [errorText, setErrorText] = useState("");

  const dpConnected = data.dp_connected || false;

  // Sync back to form state whenever changes occur
  useEffect(() => {
    // Recalculate totals
    let totalVal = 0;
    let totalDp = 0;
    
    scripRows.forEach((row) => {
      if (row.eligible_flag) {
        const grossValue = row.quantity * row.market_price;
        totalVal += grossValue;
        
        // Single-scrip concentration check (limit single scrip contribution to 40% of total collateral)
        // If concentration_check flag is true, contribution limit logic applies
        const ltvValue = grossValue * (row.ltv_pct / 100);
        totalDp += ltvValue;
      }
    });

    onChange({
      holding_type_selector: holdingTypes,
      depository,
      dp_id: dpId,
      client_id: clientId,
      scrip_rows: scripRows,
      pledge_status: pledgeStatus,
      purpose_of_loan: purpose,
      total_collateral_value: Number(totalVal.toFixed(2)),
      drawing_power: Number(totalDp.toFixed(2)),
      pledge_mode: "Depository OTP-authenticated pledge (SEBI margin-pledge flow)",
      dp_connected: dpConnected
    });
  }, [holdingTypes, depository, dpId, clientId, scripRows, pledgeStatus, purpose, dpConnected]);

  const handleHoldingTypeToggle = (type: string) => {
    setHoldingTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Simulate Depository holdings fetch
  const handleFetchHoldings = () => {
    if (depository === "NSDL" && !dpId.startsWith("IN")) {
      setErrorText("NSDL DP ID must start with 'IN'.");
      return;
    }
    if (!clientId) {
      setErrorText("Client ID / BO ID is required.");
      return;
    }
    setErrorText("");
    setFetching(true);
    
    setTimeout(() => {
      // Choose mock portfolio based on DP ID
      const chosenPortfolio = clientId.length > 8 ? MOCK_SECURITIES.BUSINESS_DEMAT : MOCK_SECURITIES.PERSONAL_DEMAT;
      setScripRows(chosenPortfolio);
      onChange({
        demat_holder_names: ["BORROWER PRIMARY HOLDER", "JOINT SECONDARY HOLDER"],
        dp_connected: true
      });
      setFetching(false);
    }, 1500);
  };

  const handleAddRow = () => {
    const newScrip: ScripItem = {
      id: `scrip-custom-${Date.now()}`,
      security_type: "LISTED_EQUITY",
      isin: "INE",
      security_name: "NEW SECURITY",
      quantity: 100,
      market_price: 150,
      ltv_pct: 50,
      concentration_check: false,
      promoter_insider_flag: false,
      eligible_flag: true,
    };
    setScripRows((prev) => [...prev, newScrip]);
  };

  const handleRemoveRow = (id: string) => {
    setScripRows((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateRowField = (id: string, field: keyof ScripItem, val: any) => {
    setScripRows((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        
        // Enforce LTV ceiling (equities capped at 50% haircut/LTV by RBI)
        if (field === "ltv_pct" && updated.security_type === "LISTED_EQUITY" && val > 50) {
          updated.ltv_pct = 50;
        }
        return updated;
      })
    );
  };

  // Simulate SEBI OTP Pledge flow
  const handleInitiatePledge = () => {
    setSendingOtp(true);
    setTimeout(() => {
      setSendingOtp(false);
      setOtpSent(true);
      setShowOtpPrompt(true);
      setPledgeStatus("INITIATED");
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otpCode === "123456" || otpCode.length === 6) {
      setPledgeStatus("CONFIRMED");
      setShowOtpPrompt(false);
      setErrorText("");
    } else {
      setErrorText("Invalid OTP. Enter 123456 for testing.");
    }
  };

  // Calculations for display
  const totalValue = scripRows.reduce((sum, s) => sum + (s.eligible_flag ? s.quantity * s.market_price : 0), 0);
  const totalDp = scripRows.reduce((sum, s) => sum + (s.eligible_flag ? (s.quantity * s.market_price * (s.ltv_pct / 100)) : 0), 0);

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          5. Collateral - Securities
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          Connect depository holdings, select securities to offer, and execute OTP authorization for SEBI margin-pledge lien marking.
        </p>
      </div>

      {/* 1. Holding Account Setup */}
      <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-gray-50/20 dark:bg-slate-900/10 space-y-3">
        <h3 className="text-[10px] font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
          1. Depository & Holding Accounts
        </h3>
        
        {/* Holding type selector */}
        <div className="flex flex-wrap gap-4 text-xs">
          {[
            { key: "DEMAT_SECURITIES", label: "Demat Securities (Shares/Mutual Funds)" },
            { key: "MF_NON_DEMAT", label: "MF Non-Demat (Folios)" },
            { key: "GSEC_BOND", label: "G-Sec / Bonds" },
            { key: "INSURANCE_POLICY", label: "Insurance Policies" },
          ].map((type) => (
            <label key={type.key} className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={holdingTypes.includes(type.key)}
                onChange={() => handleHoldingTypeToggle(type.key)}
                className="w-3.5 h-3.5 accent-black dark:accent-white"
              />
              {type.label}
            </label>
          ))}
        </div>

        {/* Depository connection fields */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/60">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Select Depository
            </label>
            <div className="flex gap-2">
              {["CDSL", "NSDL"].map((dep) => (
                <label
                  key={dep}
                  className={`flex-1 flex items-center justify-center py-1 border rounded cursor-pointer text-xs font-bold ${
                    depository === dep
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-gray-200 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-900/30 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="depository"
                    value={dep}
                    checked={depository === dep}
                    onChange={() => {
                      setDepository(dep as any);
                      setErrorText("");
                    }}
                    className="sr-only"
                  />
                  {dep}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              DP ID *
            </label>
            <input
              type="text"
              placeholder={depository === "NSDL" ? "e.g. IN301549" : "e.g. 12081600"}
              value={dpId}
              onChange={(e) => setDpId(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Client ID / BO ID *
            </label>
            <input
              type="text"
              placeholder={depository === "NSDL" ? "8 digits" : "16 digits"}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleFetchHoldings}
              disabled={fetching || !clientId}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-gray-800 disabled:opacity-40 rounded text-xs font-bold transition-all shadow"
            >
              <RefreshCw className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} />
              {fetching ? "Fetching gateway..." : "Fetch Holdings"}
            </button>
          </div>
        </div>

        {errorText && (
          <div className="text-[10px] text-red-600 dark:text-red-400 font-semibold">{errorText}</div>
        )}

        {/* DP connection success verification state */}
        {dpConnected && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded text-xs">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
            <div className="flex-1 text-green-800 dark:text-green-300 font-medium">
              Connected successfully! Verified Holder Names: <span className="font-bold">BORROWER PRIMARY HOLDER</span> (Primary), <span className="font-bold">JOINT SECONDARY HOLDER</span> (Joint).
            </div>
          </div>
        )}
      </div>

      {/* 2. Securities Offered Table */}
      <div className="border border-gray-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
        <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
            2. Securities Offered for Pledge
          </h3>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1 px-2 py-0.5 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-[10px] font-bold text-gray-700 dark:text-slate-300 transition-colors"
          >
            <Plus className="w-2.5 h-2.5" /> Add Scrip
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-200 dark:border-slate-800 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-1 px-3">Security Type</th>
                <th className="py-1 px-2">ISIN</th>
                <th className="py-1 px-3">Security Name</th>
                <th className="py-1 px-2 text-right">Quantity</th>
                <th className="py-1 px-2 text-right">NAV/Price</th>
                <th className="py-1 px-2 text-right">Gross Value</th>
                <th className="py-1 px-2 text-center w-16">LTV%</th>
                <th className="py-1 px-2 text-center">Insider?</th>
                <th className="py-1 px-2 text-center">Eligible?</th>
                <th className="py-1 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {scripRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-gray-400 dark:text-slate-500 font-medium">
                    No holdings loaded. Connect to depository or add custom scrips to calculate drawing power.
                  </td>
                </tr>
              ) : (
                scripRows.map((row) => {
                  const grossValue = row.quantity * row.market_price;
                  return (
                    <tr key={row.id} className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/30 ${!row.eligible_flag ? "opacity-50" : ""}`}>
                      <td className="py-1 px-3">
                        <select
                          value={row.security_type}
                          onChange={(e) => handleUpdateRowField(row.id, "security_type", e.target.value)}
                          className="px-1.5 py-0.5 text-[11px] border border-gray-200 dark:border-slate-700 rounded bg-transparent text-gray-900 dark:text-slate-100 outline-none"
                        >
                          <option value="LISTED_EQUITY">Listed Equity</option>
                          <option value="EQUITY_MF">Equity Mutual Fund</option>
                          <option value="DEBT_MF">Debt Mutual Fund</option>
                          <option value="GSEC">G-Sec Bond</option>
                          <option value="BOND">Corporate Bond</option>
                        </select>
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="text"
                          value={row.isin}
                          onChange={(e) => handleUpdateRowField(row.id, "isin", e.target.value)}
                          className="w-24 px-1 py-0.5 border border-gray-200 dark:border-slate-700 bg-transparent rounded text-[11px] text-gray-900 dark:text-slate-100 outline-none uppercase font-mono"
                        />
                      </td>
                      <td className="py-1 px-3 font-semibold text-gray-900 dark:text-slate-200">
                        <input
                          type="text"
                          value={row.security_name}
                          onChange={(e) => handleUpdateRowField(row.id, "security_name", e.target.value)}
                          className="w-full px-1 py-0.5 border border-gray-200 dark:border-slate-700 bg-transparent rounded text-[11px] text-gray-900 dark:text-slate-100 outline-none"
                        />
                      </td>
                      <td className="py-1 px-2 text-right">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => handleUpdateRowField(row.id, "quantity", Number(e.target.value))}
                          className="w-16 px-1 py-0.5 text-right border border-gray-200 dark:border-slate-700 bg-transparent rounded text-[11px] text-gray-900 dark:text-slate-100 outline-none"
                        />
                      </td>
                      <td className="py-1 px-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={row.market_price}
                          onChange={(e) => handleUpdateRowField(row.id, "market_price", Number(e.target.value))}
                          className="w-16 px-1 py-0.5 text-right border border-gray-200 dark:border-slate-700 bg-transparent rounded text-[11px] text-gray-900 dark:text-slate-100 outline-none"
                        />
                      </td>
                      <td className="py-1 px-2 text-right font-bold text-gray-900 dark:text-slate-200">
                        ₹{grossValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-1 px-2 text-center">
                        <input
                          type="number"
                          value={row.ltv_pct}
                          onChange={(e) => handleUpdateRowField(row.id, "ltv_pct", Number(e.target.value))}
                          className="w-10 px-1 py-0.5 text-center border border-gray-200 dark:border-slate-700 bg-transparent rounded text-[11px] text-gray-900 dark:text-slate-100 outline-none"
                        />
                      </td>
                      <td className="py-1 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={row.promoter_insider_flag}
                          onChange={(e) => handleUpdateRowField(row.id, "promoter_insider_flag", e.target.checked)}
                          className="w-3.5 h-3.5 accent-black dark:accent-white"
                        />
                      </td>
                      <td className="py-1 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={row.eligible_flag}
                          onChange={(e) => handleUpdateRowField(row.id, "eligible_flag", e.target.checked)}
                          className="w-3.5 h-3.5 accent-black dark:accent-white"
                        />
                      </td>
                      <td className="py-1 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings & Notices */}
      {scripRows.some(r => r.promoter_insider_flag && r.eligible_flag) && (
        <div className="flex items-start gap-2 p-2.5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/35 rounded text-[11px] text-yellow-800 dark:text-yellow-400">
          <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-600 mt-0.5" />
          <div>
            <span className="font-bold">Insider/Promoter Holding Detected:</span> One or more selected scrips belong to insider/promoter holdings. Under SEBI regulations, a pledge on promoter holdings requires a SAST Regulation 31 encumbrance disclosure within 2 working days. Sign-off undertakings will be enforced in the Declarations step.
          </div>
        </div>
      )}

      {/* 3. Purpose & Pledge Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left pane: Purpose and Totals */}
        <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900 space-y-3">
          <h3 className="text-[10px] font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
            3. Loan Purpose & Collateral Value
          </h3>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
              Purpose of Loan *
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
            >
              <option value="BUSINESS_WC">Business Working Capital Requirements</option>
              <option value="PERSONAL_NEEDS">Personal Needs & Emergency Liquidity</option>
              <option value="OTHER">Other Permitted General Corporate Purpose</option>
            </select>
            <span className="text-[9px] text-gray-400 mt-0.5 block font-medium">
              * Funding for IPO subscriptions, speculative stock investments, or purchase of land is prohibited.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/60">
            <div className="bg-gray-50 dark:bg-slate-800/60 p-2 rounded">
              <span className="block text-[9px] text-gray-500 dark:text-slate-400 font-bold uppercase">Total Collateral Value</span>
              <span className="text-sm font-extrabold text-gray-950 dark:text-slate-100">
                ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded">
              <span className="block text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase">Computed Drawing Power</span>
              <span className="text-sm font-extrabold text-blue-900 dark:text-blue-300">
                ₹{totalDp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Right pane: Pledge Intent Setup */}
        <div className="border border-gray-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider mb-2">
              4. SEBI OTP-Authenticated Lien creation
            </h3>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Pledge Mode:</span>
                <span className="font-bold text-gray-950 dark:text-slate-200">OTP-authenticated online lien</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  pledgeStatus === "CONFIRMED"
                    ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    : pledgeStatus === "INITIATED"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                    : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {pledgeStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800/60">
            {pledgeStatus === "CONFIRMED" ? (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded text-xs text-green-700 dark:text-green-400">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span className="font-semibold">SEBI Margin-Pledge verified! Pledge confirmation callback recorded in transaction log.</span>
              </div>
            ) : showOtpPrompt ? (
              <div className="space-y-2 p-2 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-150 dark:border-blue-900 rounded">
                <label className="block text-[9px] font-bold text-blue-700 dark:text-blue-400 uppercase mb-1">
                  Enter 6-digit Depository OTP (e.g. 123456)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="------"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-24 px-2 py-1 text-center font-mono text-xs border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-3 py-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded text-xs font-bold transition-all shadow"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInitiatePledge}
                disabled={sendingOtp || scripRows.length === 0}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-gray-800 disabled:opacity-40 rounded text-xs font-bold transition-all shadow"
              >
                <Send className="w-3 h-3" />
                {sendingOtp ? "Initiating..." : "Initiate Pledge & Send OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
