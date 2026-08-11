"use client";

import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitLoanApplication } from "@/app/actions/loans";
import { loanFormSchema, type LoanFormValues } from "@/lib/schemas/loans";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle, Briefcase, FileText, IndianRupee, Search } from "lucide-react";
import Link from "next/link";

export default function NewLoanApplicationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof loanFormSchema>>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      clientId: "", // Empty to force selection
      productId: "1", // Consumer Loan
      principalAmount: 50000,
      loanTerm: 12,
      interestRate: 15,
      repaymentStrategy: "EMI",
    },
  });

  const selectedClientId = watch("clientId");

  const onSubmit = (data: z.input<typeof loanFormSchema>) => {
    const validData = data as LoanFormValues;
    setError(null);
    startTransition(async () => {
      const result = await submitLoanApplication(validData);
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : result.error?.defaultUserMessage || "An error occurred");
      } else {
        router.push("/dashboard/applications");
      }
    });
  };

  const inputClass = "w-full h-8 px-3 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-black dark:focus:border-white transition-colors text-gray-900 dark:text-slate-100";
  const labelClass = "block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1.5";
  const errorClass = "text-[10px] text-red-500 mt-1";
  const sectionClass = "p-5 bg-gray-50 dark:bg-slate-950/50 rounded-lg border border-gray-100 dark:border-slate-800/50";
  const sectionTitleClass = "flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4 pb-2 border-b border-gray-200 dark:border-slate-800";

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/applications/new" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Originate Loan</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Create a new loan application for an existing client.</p>
          </div>
        </div>
        
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="h-8 px-4 bg-black text-white text-[11px] font-medium rounded flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Submit Application
        </button>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 flex items-start gap-2 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Client Selection */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}><Briefcase className="w-4 h-4" /> Borrower Selection</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Search Client by Name or PAN</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Acme Corp..." 
                      className={`${inputClass} pl-9`} 
                    />
                  </div>
                </div>

                {/* Dummy Mock Search Results */}
                {searchQuery.length > 0 && !selectedClientId && (
                  <div className="border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 mt-2 overflow-hidden shadow-sm">
                    <button 
                      type="button"
                      onClick={() => {
                        setValue("clientId", "CLIENT-1234");
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0"
                    >
                      <div className="font-semibold text-gray-900 dark:text-slate-100">Acme Corp Ltd</div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400">PAN: ABCDE1234F • ID: CLIENT-1234</div>
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setValue("clientId", "CLIENT-5678");
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0"
                    >
                      <div className="font-semibold text-gray-900 dark:text-slate-100">John Doe</div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400">PAN: XXXXX9999X • ID: CLIENT-5678</div>
                    </button>
                  </div>
                )}

                {/* Selected Client Display */}
                {selectedClientId && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-green-900 dark:text-green-100">Client Selected: {selectedClientId === "CLIENT-1234" ? "Acme Corp Ltd" : "John Doe"}</p>
                      <p className="text-[10px] text-green-700 dark:text-green-400">ID: {selectedClientId}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setValue("clientId", "")}
                      className="text-[10px] text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 underline font-medium"
                    >
                      Change
                    </button>
                  </div>
                )}
                {errors.clientId && <p className={errorClass}>{errors.clientId.message}</p>}
                
                <div className="pt-2">
                  <label className={labelClass}>Loan Product *</label>
                  <select {...register("productId")} className={inputClass}>
                    <option value="1">Consumer Loan (Default)</option>
                    <option value="2">Working Capital Loan</option>
                    <option value="3">Loan Against Securities (LAS)</option>
                    <option value="4">Vehicle Loan</option>
                  </select>
                  {errors.productId && <p className={errorClass}>{errors.productId.message}</p>}
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}><IndianRupee className="w-4 h-4" /> Financial Terms</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Principal Amount (₹) *</label>
                  <div className="flex">
                    <span className="flex items-center justify-center px-3 border border-r-0 border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 rounded-l text-xs text-gray-500 dark:text-slate-400">
                      ₹
                    </span>
                    <input type="number" {...register("principalAmount", { valueAsNumber: true })} className={`${inputClass} rounded-l-none`} placeholder="50000" />
                  </div>
                  {errors.principalAmount && <p className={errorClass}>{errors.principalAmount.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Loan Term (Months) *</label>
                    <input type="number" {...register("loanTerm", { valueAsNumber: true })} className={inputClass} placeholder="12" />
                    {errors.loanTerm && <p className={errorClass}>{errors.loanTerm.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Interest Rate (% p.a.) *</label>
                    <input type="number" step="0.01" {...register("interestRate", { valueAsNumber: true })} className={inputClass} placeholder="15.00" />
                    {errors.interestRate && <p className={errorClass}>{errors.interestRate.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Repayment Strategy */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}><FileText className="w-4 h-4" /> Repayment Strategy</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Amortization Method *</label>
                  <select {...register("repaymentStrategy")} className={inputClass}>
                    <option value="EMI">Equal Monthly Installments (EMI)</option>
                    <option value="Bullet">Bullet Repayment (Principal at maturity)</option>
                    <option value="EPI">Equal Principal Installments</option>
                  </select>
                  {errors.repaymentStrategy && <p className={errorClass}>{errors.repaymentStrategy.message}</p>}
                </div>
                
                <div className="p-3 bg-gray-100 dark:bg-slate-800/50 rounded border border-gray-200 dark:border-slate-700">
                  <h4 className="text-[11px] font-semibold text-gray-900 dark:text-slate-100 mb-1">Repayment Schedule Preview</h4>
                  <p className="text-[10px] text-gray-600 dark:text-slate-400 leading-relaxed">
                    Based on the selected terms, the system will generate a schedule upon approval. 
                    Interest is calculated daily based on the outstanding principal balance.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
