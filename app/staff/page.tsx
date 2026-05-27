import { redirect } from "next/navigation";

/** Alias route — executive leadership only (not full staff directory). */
export default function StaffPage() {
  redirect("/executive-team");
}
