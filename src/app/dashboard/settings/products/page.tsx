import { redirect } from "next/navigation";

// Product management already lives at /dashboard/admin/products — this tab
// redirects there instead of duplicating the page.
export default function ProductsSettingsPage() {
  redirect("/dashboard/admin/products");
}
