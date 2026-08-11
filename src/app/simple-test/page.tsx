"use client";

import { useEffect, useState } from "react";

export default function SimpleTest() {
  const [result, setResult] = useState<string>("Loading...");

  useEffect(() => {
    fetch("/api/fineract/clients")
      .then((res) => {
        setResult(`Status: ${res.status}\n`);
        return res.json();
      })
      .then((data) => {
        setResult((prev) => prev + "Response: " + JSON.stringify(data, null, 2));
      })
      .catch((err) => {
        setResult(`Error: ${err.message}`);
      });
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen font-mono">
      <h1 className="text-2xl font-bold mb-4">Simple Fineract Test</h1>
      <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-96">{result}</pre>
    </div>
  );
}
