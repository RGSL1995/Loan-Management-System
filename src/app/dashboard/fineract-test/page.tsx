"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface TestResult {
  name: string;
  status: "loading" | "success" | "error";
  message: string;
  data?: unknown;
  error?: unknown;
}

export default function FineractTestPage() {
  const [results, setResults] = useState<TestResult[]>([
    { name: "Clients", status: "loading", message: "Fetching..." },
    { name: "Loan Products", status: "loading", message: "Fetching..." },
    { name: "Loans", status: "loading", message: "Fetching..." },
    { name: "Savings Accounts", status: "loading", message: "Fetching..." },
    { name: "GL Accounts", status: "loading", message: "Fetching..." },
  ]);

  useEffect(() => {
    const testEndpoints = async () => {
      const newResults: TestResult[] = [];

      const endpoints = [
        { name: "Clients", path: "clients" },
        { name: "Loan Products", path: "loanproducts" },
        { name: "Loans", path: "loans" },
        { name: "Savings Accounts", path: "savingsaccounts" },
        { name: "GL Accounts", path: "glaccounts" },
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`/api/fineract/${endpoint.path}`);
          const data = await res.json();
          newResults.push({
            name: endpoint.name,
            status: res.ok ? "success" : "error",
            message: res.ok
              ? `✓ ${endpoint.name} fetched successfully`
              : `✗ Failed to fetch ${endpoint.name}`,
            data: data,
          });
        } catch (error) {
          newResults.push({
            name: endpoint.name,
            status: "error",
            message: "✗ Network error",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      setResults(newResults);
    };

    testEndpoints();
  }, []);

  const successCount = results.filter((r) => r.status === "success").length;
  const allPassed = successCount === results.length;

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-slate-950">
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Fineract Integration Test
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Testing API endpoints and mock data integration
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {successCount}/{results.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">Endpoints OK</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4 max-w-4xl">
          {allPassed && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                ✓ All Fineract endpoints working! Mock data is ready for development.
              </p>
            </div>
          )}

          {results.map((result) => (
            <div
              key={result.name}
              className="p-4 border rounded-lg border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
            >
              <div className="flex items-start gap-3">
                {result.status === "loading" && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin mt-0.5" />
                )}
                {result.status === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                )}
                {result.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                    {result.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    {result.message}
                  </p>

                  {!!result.data && (
                    <details className="mt-3">
                      <summary className="text-xs font-mono text-gray-500 dark:text-slate-500 cursor-pointer hover:text-gray-700 dark:hover:text-slate-300">
                        View JSON Response
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-slate-800 rounded text-[10px] font-mono text-gray-700 dark:text-slate-300 overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}

                  {!!result.error && (
                    <details className="mt-3">
                      <summary className="text-xs font-mono text-red-500 cursor-pointer hover:text-red-700">
                        View Error Details
                      </summary>
                      <pre className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-[10px] font-mono text-red-600 dark:text-red-400">
                        {String(result.error)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 border rounded-lg border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">
              Mock Data Summary
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
              <li>✓ 3 Sample Clients (2 individuals, 1 business)</li>
              <li>✓ 3 Loan Products (Term Loan, Working Capital, Personal)</li>
              <li>✓ 3 Loans at different statuses (Active, Approved, Pending)</li>
              <li>✓ 60 Installments per loan with schedules</li>
              <li>✓ 2 Savings accounts per client</li>
              <li>✓ 4 General Ledger accounts (Asset, Liability, Equity, Income)</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Next Steps
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Visit /dashboard/applications to see loan applications list</li>
              <li>Update dashboard pages to fetch real Fineract data</li>
              <li>Implement loan origination forms with Zod validation</li>
              <li>Add approval and disbursement workflows</li>
              <li>Connect to live Fineract instance when ready</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
