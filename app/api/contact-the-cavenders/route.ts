import { NextResponse } from "next/server";
import {
  saveContactTheCavendersSubmission,
  validateContactTheCavendersSubmission,
} from "@/lib/contactTheCavendersSubmit";

interface ContactBody {
  location?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  message?: string;
  /** Honeypot — must be empty */
  website?: string;
}

export async function POST(request: Request) {
  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const input = {
    location: body.location ?? "",
    firstName: body.firstName ?? "",
    lastName: body.lastName ?? "",
    phone: body.phone ?? "",
    email: body.email ?? "",
    message: body.message ?? "",
  };

  const errors = validateContactTheCavendersSubmission(input);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const id = await saveContactTheCavendersSubmission(input);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to submit your message.";
    console.error("[contact-the-cavenders]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
