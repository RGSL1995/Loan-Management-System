import { proxyToFineract } from "@/lib/fineract/proxy";
import { MakerCheckerClient } from "./maker-checker-client";
import { MakerCheckerTask } from "@/app/actions/maker-checker";
import { getCurrentUser } from "@/lib/supabase/rbac";

export default async function MakerCheckerPage() {
  // Fetch tasks from Fineract proxy
  const { data: rawTasks } = await proxyToFineract("makercheckers", "GET");
  const tasks: MakerCheckerTask[] = Array.isArray(rawTasks) ? rawTasks : [];

  const user = await getCurrentUser();
  const userRole = user?.role || "loan_officer";
  const userEmail = user?.email || "";

  return <MakerCheckerClient initialTasks={tasks} userRole={userRole} userEmail={userEmail} />;
}
