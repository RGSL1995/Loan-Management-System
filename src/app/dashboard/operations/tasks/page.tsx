import { getOpsCases } from "@/app/actions/ops-cases";
import { OpsInboxClient } from "./ops-inbox-client";

export default async function OpsCasesPage() {
  const tasks = await getOpsCases();
  return <OpsInboxClient initialTasks={tasks} />;
}
