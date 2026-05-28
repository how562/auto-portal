"use client";

/**
 * Editable brand-reference CMS sections. Global UI tokens are shown separately (read-only).
 */

import { useCallback, useState } from "react";
import {
  BRANDING_COLOR_CATEGORIES,
  BRANDING_DISCLAIMER_TYPES,
  BRANDING_FONT_ROLES,
  BRANDING_LOGO_TYPES,
  BRANDING_LOGO_VARIANTS,
  BRANDING_MESSAGING_CATEGORIES,
  type BrandingColorRow,
  type BrandingCmsResource,
  type BrandingDealerReferenceRow,
  type BrandingDisclaimerRow,
  type BrandingLogoRow,
  type BrandingMessagingRow,
  type BrandingTypographyRow,
} from "@/lib/brandingCmsTypes";
import { CMS_MEDIA_ACCEPT, validateCmsMediaUpload } from "@/lib/cmsMediaValidation";
import {
  createBrandingRow,
  deleteBrandingRow,
  isFallbackCmsId,
  updateBrandingRow,
  uploadBrandingLogoFile,
} from "@/lib/brandingCmsClient";
import { hexToRgb, normalizeHex } from "@/lib/brandingCmsUtils";
import { colorTokens } from "@/lib/designTokens";
import {
  ActiveBadge,
  BrandingCmsEmpty,
  BrandingCmsModal,
  BrandingCmsToolbar,
  CheckboxField,
  ConfirmDeleteDialog,
  FieldLabel,
  LogoPreviewDual,
  SelectInput,
  TextInput,
  TokenLinkBadge,
} from "@/components/admin/branding/cms/BrandingCmsShared";
import { CopyTokenButton } from "@/components/admin/branding/CopyTokenButton";
import { DealershipComplianceNotice } from "@/components/admin/branding/DealershipComplianceNotice";

function useCmsMutation<T extends { id: string }>(
  resource: BrandingCmsResource,
  rows: T[],
  setRows: (rows: T[]) => void,
) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const persist = useCallback(
    async (id: string | null, payload: Record<string, unknown>) => {
      setBusy(true);
      setError(null);
      try {
        if (id && !isFallbackCmsId(id)) {
          const row = await updateBrandingRow<T>(resource, id, payload);
          setRows(rows.map((r) => (r.id === id ? row : r)));
        } else {
          const row = await createBrandingRow<T>(resource, payload);
          const withoutFallback =
            id && isFallbackCmsId(id) ? rows.filter((r) => r.id !== id) : rows;
          setRows([...withoutFallback, row]);
        }
        return true;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Save failed");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [resource, rows, setRows],
  );

  const remove = useCallback(
    async (id: string) => {
      if (isFallbackCmsId(id)) {
        setRows(rows.filter((r) => r.id !== id));
        return true;
      }
      setBusy(true);
      setError(null);
      try {
        await deleteBrandingRow(resource, id);
        setRows(rows.filter((r) => r.id !== id));
        return true;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Delete failed");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [resource, rows, setRows],
  );

  return { error, busy, persist, remove, setError };
}

// ——— Logos ———

export function BrandingLogosEditor({
  rows,
  setRows,
  readOnly,
}: {
  rows: BrandingLogoRow[];
  setRows: (rows: BrandingLogoRow[]) => void;
  readOnly?: boolean;
}) {
  const { error, busy, persist, remove } = useCmsMutation("logos", rows, setRows);
  const [editing, setEditing] = useState<BrandingLogoRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandingLogoRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const openNew = () =>
    setEditing({
      id: "new",
      name: "",
      logo_type: "primary",
      variant: "any",
      file_url: "",
      alt_text: "",
      usage_notes: "",
      sort_order: rows.length,
      is_active: true,
      created_at: "",
      updated_at: "",
    });

  async function save() {
    if (!editing) return;
    const ok = await persist(editing.id === "new" ? null : editing.id, {
      name: editing.name,
      logo_type: editing.logo_type,
      variant: editing.variant,
      file_url: editing.file_url,
      alt_text: editing.alt_text || null,
      usage_notes: editing.usage_notes || null,
      sort_order: editing.sort_order,
      is_active: editing.is_active,
    });
    if (ok) setEditing(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Logo files are stored as URLs (upload to CMS media). No hardcoded assets.
      </p>
      {!readOnly && (
        <BrandingCmsToolbar title="Brand logos" onAdd={openNew} />
      )}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {rows.length === 0 ? (
        <BrandingCmsEmpty label="logos" onAdd={openNew} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[var(--line)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{row.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {row.logo_type} · {row.variant}
                  </p>
                </div>
                <ActiveBadge active={row.is_active} />
              </div>
              <div className="mt-3">
                <LogoPreviewDual fileUrl={row.file_url} alt={row.alt_text ?? row.name} />
              </div>
              {!readOnly && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    className="text-xs font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(row)}
                    className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <BrandingCmsModal
        open={Boolean(editing)}
        title={editing?.id === "new" ? "Add logo" : "Edit logo"}
        onClose={() => setEditing(null)}
        onSave={save}
        saving={busy || uploading}
      >
        {editing ? (
          <div className="space-y-3">
            <div>
              <FieldLabel>Name</FieldLabel>
              <TextInput value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            </div>
            <div>
              <FieldLabel>Type</FieldLabel>
              <SelectInput
                value={editing.logo_type}
                onChange={(v) => setEditing({ ...editing, logo_type: v })}
                options={BRANDING_LOGO_TYPES.map((t) => ({ value: t, label: t }))}
              />
            </div>
            <div>
              <FieldLabel>Variant</FieldLabel>
              <SelectInput
                value={editing.variant}
                onChange={(v) => setEditing({ ...editing, variant: v })}
                options={BRANDING_LOGO_VARIANTS.map((t) => ({ value: t, label: t }))}
              />
            </div>
            <div>
              <FieldLabel>File URL</FieldLabel>
              <TextInput
                value={editing.file_url}
                onChange={(v) => setEditing({ ...editing, file_url: v })}
              />
              <input
                type="file"
                accept={CMS_MEDIA_ACCEPT}
                className="mt-2 block w-full text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const validation = validateCmsMediaUpload(file);
                  if (!validation.ok) {
                    alert(validation.error);
                    return;
                  }
                  setUploading(true);
                  try {
                    const url = await uploadBrandingLogoFile(file);
                    setEditing({ ...editing, file_url: url });
                  } catch (err: unknown) {
                    alert(err instanceof Error ? err.message : "Upload failed");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </div>
            {editing.file_url ? (
              <LogoPreviewDual fileUrl={editing.file_url} alt={editing.alt_text ?? ""} />
            ) : null}
            <div>
              <FieldLabel>Alt text</FieldLabel>
              <TextInput
                value={editing.alt_text ?? ""}
                onChange={(v) => setEditing({ ...editing, alt_text: v })}
              />
            </div>
            <div>
              <FieldLabel>Usage notes</FieldLabel>
              <TextInput
                multiline
                value={editing.usage_notes ?? ""}
                onChange={(v) => setEditing({ ...editing, usage_notes: v })}
              />
            </div>
            <CheckboxField
              label="Active"
              checked={editing.is_active}
              onChange={(v) => setEditing({ ...editing, is_active: v })}
            />
          </div>
        ) : null}
      </BrandingCmsModal>
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        label={deleteTarget?.name ?? "logo"}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await remove(deleteTarget.id);
          if (ok) setDeleteTarget(null);
        }}
        busy={busy}
      />
    </div>
  );
}

// ——— Colors ———

export function BrandingColorsEditor({
  rows,
  setRows,
}: {
  rows: BrandingColorRow[];
  setRows: (rows: BrandingColorRow[]) => void;
}) {
  const { error, busy, persist, remove } = useCmsMutation("colors", rows, setRows);
  const [editing, setEditing] = useState<BrandingColorRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandingColorRow | null>(null);

  const tokenOptions = [
    { value: "", label: "None (brand-only)" },
    ...colorTokens.map((t) => ({ value: t.cssVar, label: `${t.label} (${t.cssVar})` })),
  ];

  const openNew = () =>
    setEditing({
      id: "new",
      name: "",
      token_name: null,
      hex: "#152a47",
      rgb: hexToRgb("#152a47"),
      usage_note: "",
      category: "primary",
      sort_order: rows.length,
      is_active: true,
      created_at: "",
      updated_at: "",
    });

  async function save() {
    if (!editing) return;
    const hex = normalizeHex(editing.hex);
    const ok = await persist(editing.id === "new" ? null : editing.id, {
      name: editing.name,
      token_name: editing.token_name || null,
      hex,
      rgb: hexToRgb(hex),
      usage_note: editing.usage_note || null,
      category: editing.category,
      sort_order: editing.sort_order,
      is_active: editing.is_active,
    });
    if (ok) setEditing(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Brand-reference colors for guidelines. Linking a global token documents the relationship —
        it does not change portal theme (edit globals.css for that).
      </p>
      <BrandingCmsToolbar title="Brand reference colors" onAdd={openNew} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {rows.length === 0 ? (
        <BrandingCmsEmpty label="colors" onAdd={openNew} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex gap-4 rounded-xl border border-[var(--line)] p-4"
            >
              <span
                className="h-14 w-14 shrink-0 rounded-lg border border-[var(--line-dark)]"
                style={{ backgroundColor: row.hex }}
                aria-hidden
              />
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-[var(--ink)]">{row.name}</p>
                  <ActiveBadge active={row.is_active} />
                </div>
                <p className="font-mono text-xs text-[var(--muted)]">
                  {row.hex} {row.rgb ? `· ${row.rgb}` : ""}
                </p>
                <TokenLinkBadge tokenName={row.token_name} />
                <p className="mt-1 text-xs text-[var(--muted)]">{row.category}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    className="text-xs font-semibold underline-offset-2 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(row)}
                    className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <BrandingCmsModal
        open={Boolean(editing)}
        title={editing?.id === "new" ? "Add color" : "Edit color"}
        onClose={() => setEditing(null)}
        onSave={save}
        saving={busy}
      >
        {editing ? (
          <div className="space-y-3">
            <div>
              <FieldLabel>Name</FieldLabel>
              <TextInput value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            </div>
            <div>
              <FieldLabel>Global token (optional)</FieldLabel>
              <SelectInput
                value={editing.token_name ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, token_name: v || null })
                }
                options={tokenOptions}
              />
            </div>
            <div>
              <FieldLabel>HEX</FieldLabel>
              <TextInput
                value={editing.hex}
                onChange={(v) => {
                  const hex = normalizeHex(v);
                  setEditing({ ...editing, hex, rgb: hexToRgb(hex) });
                }}
              />
              {editing.rgb ? (
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">{editing.rgb}</p>
              ) : null}
            </div>
            <div>
              <FieldLabel>Category</FieldLabel>
              <SelectInput
                value={editing.category}
                onChange={(v) => setEditing({ ...editing, category: v })}
                options={BRANDING_COLOR_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div>
              <FieldLabel>Usage note</FieldLabel>
              <TextInput
                multiline
                value={editing.usage_note ?? ""}
                onChange={(v) => setEditing({ ...editing, usage_note: v })}
              />
            </div>
            <CheckboxField
              label="Active"
              checked={editing.is_active}
              onChange={(v) => setEditing({ ...editing, is_active: v })}
            />
          </div>
        ) : null}
      </BrandingCmsModal>
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        label={deleteTarget?.name ?? "color"}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await remove(deleteTarget.id);
          if (ok) setDeleteTarget(null);
        }}
        busy={busy}
      />
    </div>
  );
}

// ——— Typography ———

export function BrandingTypographyEditor({
  rows,
  setRows,
}: {
  rows: BrandingTypographyRow[];
  setRows: (rows: BrandingTypographyRow[]) => void;
}) {
  const { error, busy, persist, remove } = useCmsMutation("typography", rows, setRows);
  const [editing, setEditing] = useState<BrandingTypographyRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandingTypographyRow | null>(null);

  const openNew = () =>
    setEditing({
      id: "new",
      font_role: "body",
      font_family: "Gopadel",
      fallback_stack: "system-ui, sans-serif",
      font_weights: "400, 600",
      usage_notes: "",
      example_preview: "",
      sort_order: rows.length,
      is_active: true,
      created_at: "",
      updated_at: "",
    });

  async function save() {
    if (!editing) return;
    const ok = await persist(editing.id === "new" ? null : editing.id, {
      font_role: editing.font_role,
      font_family: editing.font_family,
      fallback_stack: editing.fallback_stack || null,
      font_weights: editing.font_weights || null,
      usage_notes: editing.usage_notes || null,
      example_preview: editing.example_preview || null,
      sort_order: editing.sort_order,
      is_active: editing.is_active,
    });
    if (ok) setEditing(null);
  }

  return (
    <div className="space-y-4">
      <BrandingCmsToolbar title="Typography standards" onAdd={openNew} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {rows.length === 0 ? (
        <BrandingCmsEmpty label="typography records" onAdd={openNew} />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[var(--line)] p-4"
            >
              <div className="flex justify-between">
                <p className="font-semibold capitalize text-[var(--ink)]">{row.font_role}</p>
                <ActiveBadge active={row.is_active} />
              </div>
              <p className="mt-1 text-sm text-[var(--ink)]">{row.font_family}</p>
              {row.example_preview ? (
                <p className="mt-2 font-sans text-lg text-[var(--muted)]">{row.example_preview}</p>
              ) : null}
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => setEditing(row)} className="text-xs font-semibold hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => setDeleteTarget(row)} className="text-xs font-semibold text-red-700 hover:underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <BrandingCmsModal open={Boolean(editing)} title="Typography" onClose={() => setEditing(null)} onSave={save} saving={busy}>
        {editing ? (
          <div className="space-y-3">
            <div>
              <FieldLabel>Role</FieldLabel>
              <SelectInput
                value={editing.font_role}
                onChange={(v) => setEditing({ ...editing, font_role: v })}
                options={BRANDING_FONT_ROLES.map((r) => ({ value: r, label: r }))}
              />
            </div>
            <div>
              <FieldLabel>Font family</FieldLabel>
              <TextInput value={editing.font_family} onChange={(v) => setEditing({ ...editing, font_family: v })} />
            </div>
            <div>
              <FieldLabel>Fallback stack</FieldLabel>
              <TextInput value={editing.fallback_stack ?? ""} onChange={(v) => setEditing({ ...editing, fallback_stack: v })} />
            </div>
            <div>
              <FieldLabel>Weights</FieldLabel>
              <TextInput value={editing.font_weights ?? ""} onChange={(v) => setEditing({ ...editing, font_weights: v })} />
            </div>
            <div>
              <FieldLabel>Example preview</FieldLabel>
              <TextInput multiline value={editing.example_preview ?? ""} onChange={(v) => setEditing({ ...editing, example_preview: v })} />
            </div>
            <div>
              <FieldLabel>Usage notes</FieldLabel>
              <TextInput multiline value={editing.usage_notes ?? ""} onChange={(v) => setEditing({ ...editing, usage_notes: v })} />
            </div>
            <CheckboxField label="Active" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
          </div>
        ) : null}
      </BrandingCmsModal>
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        label={deleteTarget?.font_role ?? "record"}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await remove(deleteTarget.id);
          if (ok) setDeleteTarget(null);
        }}
        busy={busy}
      />
    </div>
  );
}

// ——— Messaging ———

export function BrandingMessagingEditor({
  rows,
  setRows,
}: {
  rows: BrandingMessagingRow[];
  setRows: (rows: BrandingMessagingRow[]) => void;
}) {
  const { error, busy, persist, remove } = useCmsMutation("messaging", rows, setRows);
  const [editing, setEditing] = useState<BrandingMessagingRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandingMessagingRow | null>(null);

  const openNew = () =>
    setEditing({
      id: "new",
      title: "",
      category: "voice",
      body: "",
      usage_notes: "",
      applies_to: "group-wide",
      dealership_name: null,
      oem: null,
      sort_order: rows.length,
      is_active: true,
      created_at: "",
      updated_at: "",
    });

  async function save() {
    if (!editing) return;
    const ok = await persist(editing.id === "new" ? null : editing.id, {
      title: editing.title,
      category: editing.category,
      body: editing.body,
      usage_notes: editing.usage_notes || null,
      applies_to: editing.applies_to,
      dealership_name: editing.dealership_name || null,
      oem: editing.oem || null,
      sort_order: editing.sort_order,
      is_active: editing.is_active,
    });
    if (ok) setEditing(null);
  }

  return (
    <div className="space-y-4">
      <BrandingCmsToolbar title="Messaging" onAdd={openNew} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {rows.length === 0 ? (
        <BrandingCmsEmpty label="messaging items" onAdd={openNew} />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-[var(--line)] p-4">
              <div className="flex justify-between gap-2">
                <p className="font-semibold text-[var(--ink)]">{row.title}</p>
                <ActiveBadge active={row.is_active} />
              </div>
              <p className="text-xs text-[var(--gold)]">
                {row.category} · {row.applies_to}
              </p>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">{row.body}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => setEditing(row)} className="text-xs font-semibold hover:underline">Edit</button>
                <CopyTokenButton value={row.body} label="Copy" />
                <button type="button" onClick={() => setDeleteTarget(row)} className="text-xs font-semibold text-red-700 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <BrandingCmsModal open={Boolean(editing)} title="Messaging" onClose={() => setEditing(null)} onSave={save} saving={busy}>
        {editing ? (
          <div className="space-y-3">
            <div><FieldLabel>Title</FieldLabel><TextInput value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} /></div>
            <div>
              <FieldLabel>Category</FieldLabel>
              <SelectInput value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} options={BRANDING_MESSAGING_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </div>
            <div><FieldLabel>Body</FieldLabel><TextInput multiline value={editing.body} onChange={(v) => setEditing({ ...editing, body: v })} /></div>
            <div>
              <FieldLabel>Applies to</FieldLabel>
              <SelectInput
                value={editing.applies_to}
                onChange={(v) => setEditing({ ...editing, applies_to: v })}
                options={[
                  { value: "group-wide", label: "Group-wide" },
                  { value: "dealership", label: "Dealership" },
                  { value: "oem", label: "OEM" },
                ]}
              />
            </div>
            {editing.applies_to !== "group-wide" ? (
              <>
                <div><FieldLabel>Dealership name</FieldLabel><TextInput value={editing.dealership_name ?? ""} onChange={(v) => setEditing({ ...editing, dealership_name: v })} /></div>
                <div><FieldLabel>OEM</FieldLabel><TextInput value={editing.oem ?? ""} onChange={(v) => setEditing({ ...editing, oem: v })} /></div>
              </>
            ) : null}
            <div><FieldLabel>Usage notes</FieldLabel><TextInput multiline value={editing.usage_notes ?? ""} onChange={(v) => setEditing({ ...editing, usage_notes: v })} /></div>
            <CheckboxField label="Active" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
          </div>
        ) : null}
      </BrandingCmsModal>
      <ConfirmDeleteDialog open={Boolean(deleteTarget)} label={deleteTarget?.title ?? ""} onCancel={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { const ok = await remove(deleteTarget.id); if (ok) setDeleteTarget(null); } }} busy={busy} />
    </div>
  );
}

// ——— Disclaimers ———

export function BrandingDisclaimersEditor({
  rows,
  setRows,
}: {
  rows: BrandingDisclaimerRow[];
  setRows: (rows: BrandingDisclaimerRow[]) => void;
}) {
  const { error, busy, persist, remove } = useCmsMutation("disclaimers", rows, setRows);
  const [editing, setEditing] = useState<BrandingDisclaimerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandingDisclaimerRow | null>(null);

  const openNew = () =>
    setEditing({
      id: "new",
      title: "",
      disclaimer_type: "general",
      body: "",
      applies_to: "group-wide",
      dealership_name: null,
      oem: null,
      is_required: false,
      effective_date: null,
      expiration_date: null,
      sort_order: rows.length,
      is_active: true,
      created_at: "",
      updated_at: "",
    });

  async function save() {
    if (!editing) return;
    const ok = await persist(editing.id === "new" ? null : editing.id, {
      title: editing.title,
      disclaimer_type: editing.disclaimer_type,
      body: editing.body,
      applies_to: editing.applies_to,
      dealership_name: editing.dealership_name || null,
      oem: editing.oem || null,
      is_required: editing.is_required,
      effective_date: editing.effective_date || null,
      expiration_date: editing.expiration_date || null,
      sort_order: editing.sort_order,
      is_active: editing.is_active,
    });
    if (ok) setEditing(null);
  }

  return (
    <div className="space-y-4">
      <BrandingCmsToolbar title="Disclaimers" onAdd={openNew} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {rows.length === 0 ? (
        <BrandingCmsEmpty label="disclaimers" onAdd={openNew} />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-[var(--line)] p-4">
              <div className="flex justify-between">
                <p className="font-semibold text-[var(--ink)]">{row.title}</p>
                <ActiveBadge active={row.is_active} />
              </div>
              <p className="text-xs text-[var(--muted)]">
                {row.disclaimer_type} · {row.applies_to}
                {row.is_required ? " · Required" : ""}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{row.body}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => setEditing(row)} className="text-xs font-semibold hover:underline">Edit</button>
                <CopyTokenButton value={row.body} label="Copy" />
                <button type="button" onClick={() => setDeleteTarget(row)} className="text-xs font-semibold text-red-700 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <BrandingCmsModal open={Boolean(editing)} title="Disclaimer" onClose={() => setEditing(null)} onSave={save} saving={busy}>
        {editing ? (
          <div className="space-y-3">
            <div><FieldLabel>Title</FieldLabel><TextInput value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} /></div>
            <div>
              <FieldLabel>Type</FieldLabel>
              <SelectInput value={editing.disclaimer_type} onChange={(v) => setEditing({ ...editing, disclaimer_type: v })} options={BRANDING_DISCLAIMER_TYPES.map((t) => ({ value: t, label: t }))} />
            </div>
            <div><FieldLabel>Copy</FieldLabel><TextInput multiline value={editing.body} onChange={(v) => setEditing({ ...editing, body: v })} /></div>
            <div>
              <FieldLabel>Applies to</FieldLabel>
              <SelectInput
                value={editing.applies_to}
                onChange={(v) => setEditing({ ...editing, applies_to: v })}
                options={[
                  { value: "group-wide", label: "Group-wide" },
                  { value: "oem", label: "OEM" },
                  { value: "dealership", label: "Dealership" },
                ]}
              />
            </div>
            <CheckboxField label="Required" checked={editing.is_required} onChange={(v) => setEditing({ ...editing, is_required: v })} />
            <CheckboxField label="Active" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
          </div>
        ) : null}
      </BrandingCmsModal>
      <ConfirmDeleteDialog open={Boolean(deleteTarget)} label={deleteTarget?.title ?? ""} onCancel={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { const ok = await remove(deleteTarget.id); if (ok) setDeleteTarget(null); } }} busy={busy} />
    </div>
  );
}

// ——— Dealer references ———

export function BrandingDealerReferencesEditor({
  rows,
  setRows,
}: {
  rows: BrandingDealerReferenceRow[];
  setRows: (rows: BrandingDealerReferenceRow[]) => void;
}) {
  const { error, busy, persist, remove } = useCmsMutation("dealer-references", rows, setRows);
  const [editing, setEditing] = useState<BrandingDealerReferenceRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandingDealerReferenceRow | null>(null);
  const [detailView, setDetailView] = useState<BrandingDealerReferenceRow | null>(null);

  const openNew = () =>
    setEditing({
      id: "new",
      store_name: "",
      oem: "",
      logo_reference_url: null,
      required_ad_elements: "",
      known_restrictions: "",
      compliance_notes: "",
      disclaimer_notes: "",
      sort_order: rows.length,
      is_active: true,
      created_at: "",
      updated_at: "",
    });

  async function save() {
    if (!editing) return;
    const ok = await persist(editing.id === "new" ? null : editing.id, {
      store_name: editing.store_name,
      oem: editing.oem,
      logo_reference_url: editing.logo_reference_url || null,
      required_ad_elements: editing.required_ad_elements || null,
      known_restrictions: editing.known_restrictions || null,
      compliance_notes: editing.compliance_notes || null,
      disclaimer_notes: editing.disclaimer_notes || null,
      sort_order: editing.sort_order,
      is_active: editing.is_active,
    });
    if (ok) setEditing(null);
  }

  return (
    <div className="space-y-4">
      <DealershipComplianceNoteInline />
      <BrandingCmsToolbar title="Dealership compliance references" onAdd={openNew} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {rows.length === 0 ? (
        <BrandingCmsEmpty label="dealer references" onAdd={openNew} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-[var(--line)] bg-white p-4">
              <div className="flex justify-between">
                <h4 className="text-sm font-semibold text-[var(--ink)]">{row.store_name}</h4>
                <ActiveBadge active={row.is_active} />
              </div>
              <p className="text-xs text-[var(--gold)]">{row.oem}</p>
              <p className="mt-2 line-clamp-2 text-xs text-[var(--muted)]">{row.compliance_notes}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setDetailView(row)} className="text-xs font-semibold hover:underline">View</button>
                <button type="button" onClick={() => setEditing(row)} className="text-xs font-semibold hover:underline">Edit</button>
                <button type="button" onClick={() => setDeleteTarget(row)} className="text-xs font-semibold text-red-700 hover:underline">Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <BrandingCmsModal open={Boolean(detailView)} title={detailView?.store_name ?? ""} onClose={() => setDetailView(null)} onSave={() => setDetailView(null)} saving={false}>
        {detailView ? (
          <dl className="space-y-3 text-sm">
            {[
              ["Compliance", detailView.compliance_notes],
              ["Ad elements", detailView.required_ad_elements],
              ["Restrictions", detailView.known_restrictions],
              ["Disclaimers", detailView.disclaimer_notes],
            ].map(([label, val]) => (
              <div key={label}>
                <dt className="font-semibold text-[var(--ink)]">{label}</dt>
                <dd className="mt-1 text-[var(--muted)]">{val || "—"}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </BrandingCmsModal>
      <BrandingCmsModal open={Boolean(editing)} title="Dealer reference" onClose={() => setEditing(null)} onSave={save} saving={busy}>
        {editing ? (
          <div className="space-y-3">
            <div><FieldLabel>Store name</FieldLabel><TextInput value={editing.store_name} onChange={(v) => setEditing({ ...editing, store_name: v })} /></div>
            <div><FieldLabel>OEM</FieldLabel><TextInput value={editing.oem} onChange={(v) => setEditing({ ...editing, oem: v })} /></div>
            <div><FieldLabel>Logo reference URL</FieldLabel><TextInput value={editing.logo_reference_url ?? ""} onChange={(v) => setEditing({ ...editing, logo_reference_url: v })} /></div>
            <div><FieldLabel>Required ad elements</FieldLabel><TextInput multiline value={editing.required_ad_elements ?? ""} onChange={(v) => setEditing({ ...editing, required_ad_elements: v })} /></div>
            <div><FieldLabel>Known restrictions</FieldLabel><TextInput multiline value={editing.known_restrictions ?? ""} onChange={(v) => setEditing({ ...editing, known_restrictions: v })} /></div>
            <div><FieldLabel>Compliance notes</FieldLabel><TextInput multiline value={editing.compliance_notes ?? ""} onChange={(v) => setEditing({ ...editing, compliance_notes: v })} /></div>
            <div><FieldLabel>Disclaimer notes</FieldLabel><TextInput multiline value={editing.disclaimer_notes ?? ""} onChange={(v) => setEditing({ ...editing, disclaimer_notes: v })} /></div>
            <CheckboxField label="Active" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
          </div>
        ) : null}
      </BrandingCmsModal>
      <ConfirmDeleteDialog open={Boolean(deleteTarget)} label={deleteTarget?.store_name ?? ""} onCancel={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { const ok = await remove(deleteTarget.id); if (ok) setDeleteTarget(null); } }} busy={busy} />
    </div>
  );
}

function DealershipComplianceNoteInline() {
  return <DealershipComplianceNotice />;
}
