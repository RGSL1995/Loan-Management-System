"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function DigilockerSuccessPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Collect all search params to send back
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Notify the parent window that opened this popup
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({
        type: 'digilocker_success',
        payload: params
      }, window.location.origin);
      
      // Auto-close the popup
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
        <h1 className="text-xl font-medium text-gray-900 dark:text-slate-100">Verification Successful</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Closing this window automatically...</p>
        <p className="text-xs mt-4 text-gray-400">If this window does not close, you may safely close it.</p>
      </div>
    </div>
  );
}
