import { redirect } from "next/navigation";

/** Legacy alias — canonical route is /our-story */
export default function CavenderHistoryPage() {
  redirect("/our-story");
}
