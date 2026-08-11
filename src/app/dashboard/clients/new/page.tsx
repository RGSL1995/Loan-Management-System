"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientInSupabase } from "@/app/actions/clients";
import { clientFormSchema, type ClientFormValues } from "@/lib/schemas/clients";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle, Building2, UserCircle2, ShieldCheck, Contact2 } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      dob: "",
      gender: "Male",
      mobile: "",
      email: "",
      pan: "",
      aadhaar: "",
      office_id: "1",
      dpdp_consent: false,
    },
  });

  const onSubmit = (data: ClientFormValues) => {
    setError(null);
    startTransition(async () => {
      // Save client directly to Supabase (not Fineract)
      const result = await createClientInSupabase(data);
      if ('error' in result && result.error) {
        setError(typeof result.error === 'string' ? result.error : (result as any).error?.defaultUserMessage || "An error occurred");
      } else {
        router.push("/dashboard/clients");
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
          <Link href="/dashboard/clients" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Onboard New Client</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Fill in the KYC and personal details to create a new profile.</p>
          </div>
        </div>
        
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="h-8 px-4 bg-black text-white text-[11px] font-medium rounded flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Client
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
            
            {/* Personal Details */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}><UserCircle2 className="w-4 h-4" /> Personal Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input {...register("first_name")} className={inputClass} placeholder="First name" />
                    {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input {...register("last_name")} className={inputClass} placeholder="Last name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date of Birth *</label>
                    <input type="date" {...register("dob")} className={inputClass} />
                    {errors.dob && <p className={errorClass}>{errors.dob.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select {...register("gender")} className={inputClass}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                    {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}><Contact2 className="w-4 h-4" /> Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Mobile Number *</label>
                  <div className="flex">
                    <span className="flex items-center justify-center px-3 border border-r-0 border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 rounded-l text-xs text-gray-500 dark:text-slate-400">
                      +91
                    </span>
                    <input {...register("mobile")} className={`${inputClass} rounded-l-none`} placeholder="9999999999" maxLength={10} />
                  </div>
                  {errors.mobile && <p className={errorClass}>{errors.mobile.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" {...register("email")} className={inputClass} placeholder="client@example.com" />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>
              </div>
            </div>

            {/* KYC Details */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}><ShieldCheck className="w-4 h-4" /> KYC Verification</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>PAN Number *</label>
                  <input {...register("pan")} className={`${inputClass} uppercase`} placeholder="ABCDE1234F" maxLength={10} />
                  {errors.pan && <p className={errorClass}>{errors.pan.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Aadhaar Number *</label>
                  <input {...register("aadhaar")} className={inputClass} placeholder="123412341234" maxLength={12} />
                  {errors.aadhaar && <p className={errorClass}>{errors.aadhaar.message}</p>}
                </div>
              </div>
            </div>

            {/* Assignment & Compliance */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}><Building2 className="w-4 h-4" /> Branch & Compliance</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Assigned Branch *</label>
                  <select {...register("office_id")} className={inputClass}>
                    <option value="1">Global HQ</option>
                    <option value="2">New York Branch</option>
                    <option value="3">London Branch</option>
                  </select>
                  {errors.office_id && <p className={errorClass}>{errors.office_id.message}</p>}
                </div>
                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" {...register("dpdp_consent")} className="mt-0.5 rounded border-gray-300 text-black focus:ring-black" />
                    <span className="text-[11px] leading-snug text-gray-600 dark:text-slate-400">
                      I confirm that explicit consent has been collected from this individual for processing their personal and financial data in accordance with the DPDP Act 2023. *
                    </span>
                  </label>
                  {errors.dpdp_consent && <p className={errorClass}>{errors.dpdp_consent.message}</p>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
