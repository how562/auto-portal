import { getSupabase } from "./supabase";
import type { LeadAction } from "./leads";

export interface SubmitLeadInput {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  message: string;
  shopperIntent: string;
  leadAction: LeadAction;
  sourcePage: string;
  vehicleId: string | null;
  storeId: string | null;
}

export async function saveLead(input: SubmitLeadInput): Promise<string> {
  const supabase = getSupabase();
  const leadId = crypto.randomUUID();

  const { error } = await supabase.from("leads").insert({
    id: leadId,
    name: input.name.trim(),
    email: input.email.trim() || null,
    phone: input.phone.trim() || null,
    preferred_contact_method: input.preferredContactMethod,
    message: input.message.trim() || null,
    vehicle_id: input.vehicleId,
    store_id: input.storeId,
    shopper_intent: input.shopperIntent.trim() || null,
    lead_action: input.leadAction,
    source_page: input.sourcePage,
    status: "new",
  });

  if (error) {
    throw new Error(error.message || "Failed to save your request");
  }

  return leadId;
}

/**
 * Invokes the Edge Function with only lead_id — no CRM secrets in the browser.
 * Failures are logged; callers should still show success if saveLead succeeded.
 */
export async function enqueueDriveCentricDelivery(leadId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.functions.invoke("send-drivecentric-lead", {
    body: { lead_id: leadId },
  });

  if (error) {
    console.error("[Lead] DriveCentric delivery failed:", error.message, { leadId });
  }
}

export async function submitLeadFlow(input: SubmitLeadInput): Promise<string> {
  const leadId = await saveLead(input);
  void enqueueDriveCentricDelivery(leadId);
  return leadId;
}
