import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function DedupePage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const ctx = searchParams?.ctx;
  let backUrl = "/dashboard";
  if (ctx === "los") backUrl = "/dashboard/applications";
  else if (ctx === "lms") backUrl = "/dashboard/accounts";

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shrink-0 flex items-center gap-3">
        <Link href={backUrl} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500 dark:text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Duplicates</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage application duplicates.</p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-500 dark:text-slate-400 text-sm">Duplicates view coming soon.</p>
      </div>
    </div>
  )
}
