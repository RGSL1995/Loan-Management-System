"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import LoanApplicationForm from "@/components/LoanApplicationForm";
import { getLoanApplication } from "@/app/actions/loan-applications";

export default function ApplicationReviewPage() {
  const params = useParams();
  const applicationId = String(params.id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApp() {
      setLoading(true);
      const res = await getLoanApplication(applicationId);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        // Construct the full object that LoanApplicationForm expects
        const appData = res.data;
        
        // We map the database row back to the initialData schema shape
        const formInitialData = {
          application_info: {
            loan_type: appData.loan_type,
            sourcing_channel: appData.sourcing_channel,
            applicant_photo_file_id: appData.applicant_photo_file_id,
            applicant_signature_file_id: appData.applicant_signature_file_id,
          },
          applicant_details: appData.applicant_details,
          co_applicant_details: appData.co_applicant_details,
          authorized_contact: appData.authorized_contact,
          bank_account: appData.bank_account,
          associate_companies: appData.associate_companies || [],
          existing_loans: appData.existing_loans || [],
          proposed_facilities: appData.proposed_facilities || [],
          references: appData.references || [],
          document_checklist: appData.document_checklist || {},
          declaration: appData.declaration,
          product_data: appData.product_data || {},
        };

        setData(formInitialData);
      }
      setLoading(false);
    }
    loadApp();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-950">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Application</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "Application not found"}</p>
        <Link href="/dashboard/applications" className="px-4 py-2 bg-black text-white rounded">
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-2 shrink-0">
        <div className="flex items-center gap-1.5 mb-1">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-slate-100">
            Review Loan Application #{applicationId.split("-")[0].toUpperCase()}
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Read-only view of the submitted application data.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="w-full">
          <LoanApplicationForm
            applicationId={applicationId}
            initialData={data}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
}
