"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

interface MCALoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataFetched: (data: any) => void;
  applicationId?: string;
}

export default function ZaubacorpFetchModal({
  isOpen,
  onClose,
  onDataFetched,
}: MCALoginModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [mcaUsername, setMcaUsername] = useState("");
  const [mcaPassword, setMcaPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [step, setStep] = useState<"search" | "mca-login" | "review">("search");
  const [dataSource, setDataSource] = useState<"zaubacorp" | "mca">("zaubacorp");

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let endpoint = "";
      let payload: any = {};

      if (dataSource === "zaubacorp") {
        endpoint = "/api/zaubacorp/search";
        payload = { companyName };
      } else {
        endpoint = "/api/mca/company-fetch";
        payload = { companyName, mcaUsername, mcaPassword };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    setMcaUsername("");
    setMcaPassword("");
    setFetchedData(null);
    setStep("search");
    setDataSource("zaubacorp");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            {step === "search" ? "Fetch Company Details" : "Company Details"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === "search" ? (
            <div className="space-y-4">
              {/* Source Selection Tabs */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setDataSource("zaubacorp")}
                  className={`pb-3 px-4 font-medium text-sm transition ${
                    dataSource === "zaubacorp"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                  }`}
                >
                  Zaubacorp
                </button>
                <button
                  onClick={() => setDataSource("mca")}
                  className={`pb-3 px-4 font-medium text-sm transition ${
                    dataSource === "mca"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                  }`}
                >
                  MCA Login
                </button>
              </div>

              <form onSubmit={handleFetch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>

                {dataSource === "mca" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        MCA Username/Email *
                      </label>
                      <input
                        type="text"
                        value={mcaUsername}
                        onChange={(e) => setMcaUsername(e.target.value)}
                        placeholder="Your MCA Portal Username"
                        required={dataSource === "mca"}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        MCA Password *
                      </label>
                      <input
                        type="password"
                        value={mcaPassword}
                        onChange={(e) => setMcaPassword(e.target.value)}
                        placeholder="Your MCA Portal Password"
                        required={dataSource === "mca"}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> A browser window will open for you to manually solve the CAPTCHA and enter OTP. The system will then fetch company details automatically.
                      </p>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !companyName || (dataSource === "mca" && (!mcaUsername || !mcaPassword))}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? (dataSource === "mca" ? "Opening MCA Portal..." : "Searching...") : "Fetch Details"}
                </button>
              </form>
            </div>
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
