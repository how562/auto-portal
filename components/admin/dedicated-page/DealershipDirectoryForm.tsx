"use client";

import type { DealershipCmsEntry, DealershipDepartmentFields } from "@/lib/dealershipDirectoryTypes";
import {
  FormSection,
  TextField,
} from "@/components/admin/dedicated-page/formFields";

function DepartmentFields({
  label,
  fields,
  onChange,
}: {
  label: string;
  fields: DealershipDepartmentFields;
  onChange: (fields: DealershipDepartmentFields) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)]/70 bg-[var(--surface)]/40 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Phone"
          value={fields.phone}
          onChange={(phone) => onChange({ ...fields, phone })}
        />
        <TextField
          label="CTA label"
          value={fields.ctaLabel}
          onChange={(ctaLabel) => onChange({ ...fields, ctaLabel })}
        />
        <TextField
          label="CTA URL"
          value={fields.ctaUrl}
          onChange={(ctaUrl) => onChange({ ...fields, ctaUrl })}
          className="sm:col-span-2"
          mono
        />
      </div>
    </div>
  );
}

export function DealershipDirectoryForm({
  dealerships,
  onChange,
  showMapFields = false,
}: {
  dealerships: DealershipCmsEntry[];
  onChange: (dealerships: DealershipCmsEntry[]) => void;
  showMapFields?: boolean;
}) {
  function patchDealer(index: number, next: DealershipCmsEntry) {
    const updated = [...dealerships];
    updated[index] = next;
    onChange(updated);
  }

  return (
    <FormSection title="Dealership directory">
      <p className="sm:col-span-2 text-sm text-[var(--muted)]">
        Edit each location&apos;s image, address, and sales, service, and parts contact
        numbers and CTA links. Store records still supply fallbacks when a field is left
        blank.
      </p>
      {dealerships.map((dealer, index) => (
        <div
          key={dealer.id}
          className="sm:col-span-2 space-y-4 rounded-xl border border-[var(--line)] p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Location {index + 1} · {dealer.storeName}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Display name"
              value={dealer.storeName}
              onChange={(storeName) => patchDealer(index, { ...dealer, storeName })}
            />
            <TextField
              label="Image URL"
              value={dealer.imageUrl}
              onChange={(imageUrl) => patchDealer(index, { ...dealer, imageUrl })}
              mono
            />
            <TextField
              label="Address line 1"
              value={dealer.addressLine1}
              onChange={(addressLine1) => patchDealer(index, { ...dealer, addressLine1 })}
            />
            <TextField
              label="Address line 2"
              value={dealer.addressLine2}
              onChange={(addressLine2) => patchDealer(index, { ...dealer, addressLine2 })}
            />
            <TextField
              label="Primary CTA label"
              value={dealer.viewCtaLabel}
              onChange={(viewCtaLabel) => patchDealer(index, { ...dealer, viewCtaLabel })}
            />
            <TextField
              label="Primary CTA URL"
              value={dealer.viewUrl}
              onChange={(viewUrl) => patchDealer(index, { ...dealer, viewUrl })}
              mono
            />
            {showMapFields ? (
              <>
                <TextField
                  label="Map marker top (%)"
                  value={dealer.mapTop}
                  onChange={(mapTop) => patchDealer(index, { ...dealer, mapTop })}
                />
                <TextField
                  label="Map marker left (%)"
                  value={dealer.mapLeft}
                  onChange={(mapLeft) => patchDealer(index, { ...dealer, mapLeft })}
                />
                <label className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={dealer.showOnInset}
                    onChange={(e) =>
                      patchDealer(index, { ...dealer, showOnInset: e.target.checked })
                    }
                    className="rounded border-[var(--line)]"
                  />
                  <span className="text-sm text-[var(--ink)]">Show on inset map</span>
                </label>
              </>
            ) : null}
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <DepartmentFields
              label="Sales"
              fields={dealer.sales}
              onChange={(sales) => patchDealer(index, { ...dealer, sales })}
            />
            <DepartmentFields
              label="Service"
              fields={dealer.service}
              onChange={(service) => patchDealer(index, { ...dealer, service })}
            />
            <DepartmentFields
              label="Parts"
              fields={dealer.parts}
              onChange={(parts) => patchDealer(index, { ...dealer, parts })}
            />
          </div>
        </div>
      ))}
    </FormSection>
  );
}
