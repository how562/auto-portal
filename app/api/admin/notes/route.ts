import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  archiveNote,
  createNote,
  listNotesAdmin,
  updateNote,
  type NoteCreateInput,
  type NoteUpdateInput,
} from "@/lib/notesAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 503 },
    );
  }

  try {
    const includeArchived =
      new URL(request.url).searchParams.get("archived") === "1";
    const rows = await listNotesAdmin({ includeArchived });
    return NextResponse.json({ rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as NoteCreateInput;
    const row = await createNote(body);
    return NextResponse.json({ row }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  id: string;
  updates: NoteUpdateInput;
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as PatchBody;
    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const row = await updateNote(id, body.updates ?? {});
    return NextResponse.json({ row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 503 },
    );
  }

  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const row = await archiveNote(id);
    return NextResponse.json({ row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Archive failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
