"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { fetchMCADetails } from "@/app/actions/mca-fetch";

interface MCALoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataFetched: (data: any) => void;
  applicationId?: string;
}

export default function MCALoginModal({
  isOpen,
  onClose,
  onDataFetched,
  applicationId,
}: MCALoginModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [mcaUsername, setMcaUsername] = useState("");
  const [mcaPassword, setMcaPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [step, setStep] = useState<"login" | "otp" | "review">("login");
  const [sessionId, setSessionId] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mca/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mcaUsername,
          mcaPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initiate login");
      }

      const result = await response.json();
      setSessionId(result.sessionId);
      setError("");
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await fetchMCADetails(
        companyName,
        mcaUsername,
        mcaPassword,
        applicationId,
        sessionId,
        otp
      );

      if (result.success) {
        setFetchedData(result.data);
        setStep("review");
      } else {
        setError(result.error || "OTP verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
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
    setStep("login");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            {step === "login" ? "MCA Login" : step === "otp" ? "Enter OTP" : "Verify Company Details"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corporation Ltd"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  MCA Username/Email *
                </label>
                <input
                  type="text"
                  value={mcaUsername}
                  onChange={(e) => setMcaUsername(e.target.value)}
                  placeholder="Your MCA login email"
                  required
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
                  placeholder="Your MCA password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                💡 Your MCA credentials are only used to fetch company details and are encrypted before storage.
              </div>

              <button
                type="submit"
                disabled={isLoading || !companyName || !mcaUsername || !mcaPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Logging in..." : "Send OTP"}
              </button>
            </form>
          ) : step === "otp" ? (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  An OTP has been sent to your registered email/mobile. Please enter it below to verify your identity.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Enter OTP *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-center tracking-widest"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Verifying..." : "Verify & Fetch Details"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setOtp("");
                  setSessionId("");
                }}
                className="w-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 py-2 px-4 rounded-md font-medium transition"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">Company details fetched successfully!</p>
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
                onClick={() => setStep("login")}
                className="w-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 py-2 px-4 rounded-md font-medium transition"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
