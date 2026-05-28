import { isContactTheCavendersLocation } from "@/lib/contactTheCavendersLocations";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export interface ContactTheCavendersSubmissionInput {
  location: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
}

export type ContactTheCavendersValidationError = {
  field: string;
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s().+\-]{7,24}$/;

export function validateContactTheCavendersSubmission(
  input: ContactTheCavendersSubmissionInput,
): ContactTheCavendersValidationError[] {
  const errors: ContactTheCavendersValidationError[] = [];

  if (!isContactTheCavendersLocation(input.location.trim())) {
    errors.push({ field: "location", message: "Please select a preferred location." });
  }

  if (input.firstName.trim().length < 1) {
    errors.push({ field: "firstName", message: "First name is required." });
  }

  if (input.lastName.trim().length < 1) {
    errors.push({ field: "lastName", message: "Last name is required." });
  }

  const phone = input.phone.trim();
  if (!phone || !PHONE_RE.test(phone)) {
    errors.push({ field: "phone", message: "Please enter a valid phone number." });
  }

  const email = input.email.trim();
  if (!email || !EMAIL_RE.test(email)) {
    errors.push({ field: "email", message: "Please enter a valid email address." });
  }

  const message = input.message.trim();
  if (message.length < 10) {
    errors.push({
      field: "message",
      message: "Please share a message of at least 10 characters.",
    });
  }

  if (message.length > 8000) {
    errors.push({ field: "message", message: "Message is too long." });
  }

  return errors;
}

export async function saveContactTheCavendersSubmission(
  input: ContactTheCavendersSubmissionInput,
): Promise<string> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Message storage is not configured. Please try again later.");
  }

  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();

  const { error } = await supabase.from("contact_the_cavenders_submissions").insert({
    id,
    location: input.location.trim(),
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
    status: "new",
    reviewed: false,
  });

  if (error) {
    throw new Error(error.message || "Failed to save your message");
  }

  return id;
}
