"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard, Clock, CheckCircle2, AlertCircle, IndianRupee, Loader2, Calendar } from "lucide-react";
import { recordRepayment } from "@/app/actions/collections";
import { repaymentSchema, type RepaymentValues } from "@/lib/schemas/collections";
import type { z } from "zod";

// Mock Data for Amortization Schedule
const mockSchedule = [
  { emiNo: 1, date: "2026-08-01", principal: 3958.33, interest: 625.00, total: 4583.33, status: "Paid" },
  { emiNo: 2, date: "2026-09-01", principal: 4007.81, interest: 575.52, total: 4583.33, status: "Paid" },
  { emiNo: 3, date: "2026-10-01", principal: 4057.91, interest: 525.42, total: 4583.33, status: "Pending" },
  { emiNo: 4, date: "2026-11-01", principal: 4108.63, interest: 474.70, total: 4583.33, status: "Pending" },
  { emiNo: 5, date: "2026-12-01", principal: 4159.99, interest: 423.34, total: 4583.33, status: "Pending" },
];

export default function LoanServicingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.input<typeof repaymentSchema>>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      loanId: params.id,
      amount: 4583.33, // Default to next EMI
      paymentMode: "UPI",
      transactionDate: new Date().toISOString().split('T')[0],
      referenceNumber: "",
      notes: "",
    },
  });

  const onSubmit = (data: z.input<typeof repaymentSchema>) => {
    const validData = data as RepaymentValues;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await recordRepayment(validData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.message || "Payment recorded successfully.");
        reset({ ...data, referenceNumber: "", notes: "" });
      }
    });
  };

  const sectionClass = "p-5 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm";
  const inputClass = "w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-black dark:focus:border-white transition-colors text-gray-900 dark:text-slate-100";
  const labelClass = "block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/applications" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Loan Servicing</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Account: {params.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
            Active - In Good Standing
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Loan Snapshot & Amortization */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Snapshot */}
            <div className={`grid grid-cols-3 gap-4 ${sectionClass}`}>
              <div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Disbursed Principal</p>
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">₹ 50,000.00</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Outstanding</p>
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">₹ 42,033.86</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Next EMI Due</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> 01 Oct 2026
                </p>
              </div>
            </div>

            {/* Amortization Schedule */}
            <div className={sectionClass}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">
                <Clock className="w-4 h-4" /> Amortization Schedule
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">EMI No.</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Date</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300 text-right">Principal (₹)</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300 text-right">Interest (₹)</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300 text-right">Total EMI (₹)</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                    {mockSchedule.map((row) => (
                      <tr key={row.emiNo} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 text-gray-900 dark:text-slate-100 font-medium">{row.emiNo}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{row.date}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-slate-100 text-right">{row.principal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-slate-100 text-right">{row.interest.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-slate-100 text-right font-bold">{row.total.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          {row.status === "Paid" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Record Repayment Form */}
          <div className="xl:col-span-1">
            <div className={sectionClass}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4 pb-2 border-b border-gray-200 dark:border-slate-800">
                <IndianRupee className="w-4 h-4 text-blue-600 dark:text-blue-500" /> Record Repayment
              </h2>
              
              {error && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 flex items-start gap-2 text-red-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 flex items-start gap-2 text-green-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register("loanId")} />
                
                <div>
                  <label className={labelClass}>Repayment Amount (₹)</label>
                  <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} className={inputClass} />
                  {errors.amount && <p className="text-[10px] text-red-500 mt-1">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Payment Mode</label>
                  <select {...register("paymentMode")} className={inputClass}>
                    <option value="UPI">UPI</option>
                    <option value="RTGS/NEFT">RTGS / NEFT</option>
                    <option value="CASH">Cash Collection</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                  {errors.paymentMode && <p className="text-[10px] text-red-500 mt-1">{errors.paymentMode.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Transaction Date</label>
                  <input type="date" {...register("transactionDate")} className={inputClass} />
                  {errors.transactionDate && <p className="text-[10px] text-red-500 mt-1">{errors.transactionDate.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Reference Number (Optional)</label>
                  <input type="text" {...register("referenceNumber")} className={inputClass} placeholder="e.g. UTR Number" />
                </div>

                <div>
                  <label className={labelClass}>Internal Notes (Optional)</label>
                  <textarea {...register("notes")} className={inputClass} rows={2} placeholder="Add any collection remarks..."></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-4 py-2.5 rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Submit Repayment
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
