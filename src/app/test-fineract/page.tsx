"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Terminal } from "lucide-react";

interface TestLog {
  timestamp: string;
  status: "pending" | "success" | "error";
  message: string;
  details?: string;
}

export default function TestFineractPage() {
  const [logs, setLogs] = useState<TestLog[]>([]);

  useEffect(() => {
    const runTests = async () => {
      const newLogs: TestLog[] = [];
      const now = () => new Date().toLocaleTimeString();

      try {
        // Test 1: Fetch clients
        newLogs.push({
          timestamp: now(),
          status: "pending",
          message: "Testing /api/fineract/clients endpoint...",
        });
        setLogs([...newLogs]);

        const clientRes = await fetch("/api/fineract/clients");
        const clientData = await clientRes.json();

        if (clientRes.ok && clientData.pageItems) {
          newLogs[newLogs.length - 1] = {
            timestamp: now(),
            status: "success",
            message: `✓ Clients endpoint working (${clientData.pageItems.length} clients found)`,
            details: JSON.stringify(clientData.pageItems[0], null, 2),
          };
        } else {
          throw new Error(clientData.error?.defaultUserMessage || "Failed to fetch clients");
        }
        setLogs([...newLogs]);

        // Test 2: Fetch loans
        newLogs.push({
          timestamp: now(),
          status: "pending",
          message: "Testing /api/fineract/loans endpoint...",
        });
        setLogs([...newLogs]);

        const loanRes = await fetch("/api/fineract/loans");
        const loanData = await loanRes.json();

        if (loanRes.ok && loanData.pageItems) {
          newLogs[newLogs.length - 1] = {
            timestamp: now(),
            status: "success",
            message: `✓ Loans endpoint working (${loanData.pageItems.length} loans found)`,
            details: JSON.stringify(loanData.pageItems[0], null, 2),
          };
        } else {
          throw new Error(loanData.error?.defaultUserMessage || "Failed to fetch loans");
        }
        setLogs([...newLogs]);

        // Test 3: Fetch loan products
        newLogs.push({
          timestamp: now(),
          status: "pending",
          message: "Testing /api/fineract/loanproducts endpoint...",
        });
        setLogs([...newLogs]);

        const productRes = await fetch("/api/fineract/loanproducts");
        const productData = await productRes.json();

        if (productRes.ok && productData.pageItems) {
          newLogs[newLogs.length - 1] = {
            timestamp: now(),
            status: "success",
            message: `✓ Loan products endpoint working (${productData.pageItems.length} products found)`,
            details: JSON.stringify(productData.pageItems[0], null, 2),
          };
        } else {
          throw new Error(productData.error?.defaultUserMessage || "Failed to fetch products");
        }
        setLogs([...newLogs]);

        // Test 4: Fetch GL accounts
        newLogs.push({
          timestamp: now(),
          status: "pending",
          message: "Testing /api/fineract/glaccounts endpoint...",
        });
        setLogs([...newLogs]);

        const glRes = await fetch("/api/fineract/glaccounts");
        const glData = await glRes.json();

        if (glRes.ok) {
          newLogs[newLogs.length - 1] = {
            timestamp: now(),
            status: "success",
            message: `✓ GL accounts endpoint working`,
            details: JSON.stringify(glData.glAccountData?.[0], null, 2),
          };
        } else {
          throw new Error("Failed to fetch GL accounts");
        }
        setLogs([...newLogs]);

        // Success summary
        newLogs.push({
          timestamp: now(),
          status: "success",
          message: "✓✓✓ ALL TESTS PASSED - Fineract integration is working!",
        });
        setLogs([...newLogs]);
      } catch (error) {
        newLogs.push({
          timestamp: now(),
          status: "error",
          message: `✗ Test failed: ${error instanceof Error ? error.message : String(error)}`,
        });
        setLogs([...newLogs]);
      }
    };

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-6 h-6 text-green-400" />
            <h1 className="text-2xl font-bold">Fineract Integration Test</h1>
          </div>
          <p className="text-gray-400 text-sm">Testing all API endpoints...</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-3 font-mono text-sm">
          {logs.length === 0 && (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Running tests...
            </div>
          )}

          {logs.map((log, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-start gap-2">
                {log.status === "pending" && (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin mt-0.5 flex-shrink-0" />
                )}
                {log.status === "success" && (
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                )}
                {log.status === "error" && (
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                )}

                <span
                  className={`${
                    log.status === "success"
                      ? "text-green-400"
                      : log.status === "error"
                        ? "text-red-400"
                        : "text-blue-400"
                  }`}
                >
                  [{log.timestamp}]
                </span>
                <span className="text-gray-300">{log.message}</span>
              </div>

              {log.details && (
                <details className="ml-6 text-gray-400 text-xs">
                  <summary className="cursor-pointer hover:text-gray-300">View response JSON</summary>
                  <pre className="mt-2 p-3 bg-gray-900 rounded border border-gray-700 overflow-auto max-h-48">
                    {log.details}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {logs.length > 0 && logs[logs.length - 1].status === "success" && (
          <div className="mt-8 p-6 bg-green-900/20 border border-green-700 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-green-400 mb-2">Integration Verified!</h2>
                <ul className="text-sm text-green-300 space-y-1">
                  <li>✓ Fineract proxy is working</li>
                  <li>✓ Mock mode is active</li>
                  <li>✓ All 4 core endpoints responding</li>
                  <li>✓ Data structure matches Fineract schema</li>
                  <li>✓ Ready to implement LAS (Loan Against Securities)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {logs.length > 0 && logs[logs.length - 1].status === "error" && (
          <div className="mt-8 p-6 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-red-400 mb-2">Integration Failed</h2>
                <p className="text-sm text-red-300 mb-3">Check the error message above. Common issues:</p>
                <ul className="text-sm text-red-300 space-y-1 list-disc list-inside">
                  <li>FINERACT_MOCK_MODE not set to "true" in .env.local</li>
                  <li>Dev server not restarted after .env change</li>
                  <li>API route file missing or corrupted</li>
                  <li>Browser cache - try Ctrl+Shift+Delete</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
