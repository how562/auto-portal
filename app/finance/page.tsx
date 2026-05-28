import { redirect } from "next/navigation";

/** Short alias — canonical route is /finance-center */
export default function FinancePage() {
  redirect("/finance-center");
}
