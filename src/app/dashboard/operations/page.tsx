import { redirect } from "next/navigation"

export default async function OperationsIndexPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const ctx = searchParams?.ctx;
  if (ctx) {
    redirect(`/dashboard/operations/tasks?ctx=${ctx}`);
  } else {
    redirect("/dashboard/operations/tasks");
  }
}
