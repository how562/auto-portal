import { redirect } from "next/navigation";

/** @deprecated Use /admin/homepage */
export default function AdminHomepageSectionsRedirect() {
  redirect("/admin/homepage");
}
