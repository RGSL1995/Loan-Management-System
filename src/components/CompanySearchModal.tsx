"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

interface CompanySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataFetched: (data: any) => void;
}

export default function CompanySearchModal({
  isOpen,
  onClose,
  onDataFetched,
}: CompanySearchModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [step, setStep] = useState<"search" | "review">("search");

  // Auto-fetch first matching company
  const handleFetchDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/surepass/company-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setFetchedData(result.data);
        setStep("review");
      } else {
        alert(result.error || "Failed to fetch company details");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    onDataFetched(fetchedData);
    handleClose();
  };

  const handleClose = () => {
    setCompanyName("");
    setFetchedData(null);
    setStep("search");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
            {step === "search" ? "Fetch Company Details" : "Company Details"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {step === "search" ? (
            <form onSubmit={handleFetchDetails} className="space-y-3">
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Company Name *
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name (e.g., Zucol)"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>How it works:</strong><br/>
                  1️⃣ Enter company name<br/>
                  2️⃣ Click "Fetch Details"<br/>
                  3️⃣ System automatically finds CIN<br/>
                  4️⃣ Fetches all company details instantly<br/>
                  5️⃣ Form auto-fills automatically<br/>
                  <br/>
                  <strong>⚡ Fast & Simple!</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !companyName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Fetching Details..." : "Fetch Details"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">Company details loaded</p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {fetchedData?.entity_name && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-slate-400">Entity Name</p>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{fetchedData.entity_name}</p>
                  </div>
                )}
                {fetchedData?.cin_llpin && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-slate-400">CIN/LLPIN</p>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{fetchedData.cin_llpin}</p>
                  </div>
                )}
                {fetchedData?.pan && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-slate-400">PAN</p>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{fetchedData.pan}</p>
                  </div>
                )}
                {fetchedData?.dol && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-slate-400">Date of Incorporation</p>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{fetchedData.dol}</p>
                  </div>
                )}
                {fetchedData?.corporate_address && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-slate-400">Corporate Address</p>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{fetchedData.corporate_address}</p>
                  </div>
                )}
                {fetchedData?.contact_no && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-slate-400">Contact Number</p>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{fetchedData.contact_no}</p>
                  </div>
                )}
                {fetchedData?.contact_email && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-slate-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{fetchedData.contact_email}</p>
                  </div>
                )}
                {fetchedData?.gstin_uin && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-slate-400">GSTIN/UIN</p>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{fetchedData.gstin_uin}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition"
              >
                Confirm & Fill Form
              </button>

              <button
                onClick={() => setStep("search")}
                className="w-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 py-2 px-4 rounded-md font-medium transition"
              >
                Search Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
