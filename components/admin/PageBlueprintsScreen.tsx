"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BlueprintPreviewPanel } from "@/components/admin/BlueprintPreviewPanel";
import { ScreenshotToBlueprintForm } from "@/components/admin/ScreenshotToBlueprintForm";
import {
  BLUEPRINT_JSON_EXAMPLE,
  type PageBlueprint,
} from "@/lib/cmsPageBlueprint";
import { CMS_SECTION_REGISTRY } from "@/lib/cmsSectionRegistry";
import { CMS_SECTION_TYPES } from "@/lib/cmsTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

type InputTab = "screenshot" | "paste";
type Step = "input" | "preview";

interface PageBlueprintsScreenProps {
  /** When false, only manual JSON import is shown (no OpenAI required). */
  screenshotAiEnabled: boolean;
}

export function PageBlueprintsScreen({
  screenshotAiEnabled,
}: PageBlueprintsScreenProps) {
  const [inputTab, setInputTab] = useState<InputTab>("paste");
  const [step, setStep] = useState<Step>("input");
  const [rawJson, setRawJson] = useState("");
  const [blueprint, setBlueprint] = useState<PageBlueprint | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);

  const supportedTypes = useMemo(
    () =>
      CMS_SECTION_TYPES.filter((t) => CMS_SECTION_REGISTRY[t].supported).map(
        (t) => CMS_SECTION_REGISTRY[t].label,
      ),
    [],
  );

  function goToPreview(next: PageBlueprint, nextWarnings: string[] = []) {
    setBlueprint(next);
    setWarnings(nextWarnings);
    setErrors([]);
    setStep("preview");
  }

  function resetToInput() {
    setStep("input");
    setBlueprint(null);
    setWarnings([]);
    setErrors([]);
  }

  async function validateJson() {
    setValidating(true);
    setErrors([]);
    try {
      const parsed = JSON.parse(rawJson) as unknown;
      const res = await fetch("/api/admin/page-blueprints/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        blueprint?: PageBlueprint;
        errors?: string[];
        error?: string;
      };
      if (!res.ok || !data.ok || !data.blueprint) {
        setErrors(data.errors ?? [data.error ?? "Validation failed"]);
        return;
      }
      goToPreview(data.blueprint);
    } catch (err: unknown) {
      setErrors([
        err instanceof SyntaxError
          ? "Invalid JSON — check commas and quotes"
          : err instanceof Error
            ? err.message
            : "Validation failed",
      ]);
    } finally {
      setValidating(false);
    }
  }

  const showTabs = screenshotAiEnabled;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/pages"
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← Site pages
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page blueprints</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Paste or export blueprint JSON, preview and edit sections, then create a draft
          page — or generate a one-shot SQL script for backup/migration.
        </p>
      </div>

      <p className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-xs text-[var(--muted)]">
        Supported section types: {supportedTypes.join(", ")}
      </p>

      {step === "preview" && blueprint ? (
        <BlueprintPreviewPanel
          blueprint={blueprint}
          warnings={warnings}
          onBlueprintChange={setBlueprint}
          onBack={() => {
            if (inputTab === "screenshot") {
              resetToInput();
            } else {
              setStep("input");
              setBlueprint(null);
            }
          }}
          backLabel={inputTab === "screenshot" ? "New screenshot" : "Edit JSON"}
        />
      ) : (
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
          {showTabs ? (
            <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-4">
              <button
                type="button"
                className={
                  inputTab === "screenshot" ? btnPrimaryMd : btnSecondaryMd
                }
                onClick={() => setInputTab("screenshot")}
              >
                Screenshot to blueprint
              </button>
              <button
                type="button"
                className={inputTab === "paste" ? btnPrimaryMd : btnSecondaryMd}
                onClick={() => setInputTab("paste")}
              >
                Import JSON
              </button>
            </div>
          ) : (
            <h2 className="border-b border-[var(--line)] pb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Import blueprint JSON
            </h2>
          )}

          <div className={showTabs ? "mt-6" : "mt-4"}>
            {showTabs && inputTab === "screenshot" ? (
              <ScreenshotToBlueprintForm
                openaiConfigured
                onBlueprintGenerated={(next, nextWarnings) =>
                  goToPreview(next, nextWarnings)
                }
              />
            ) : (
              <div className="space-y-4">
                <textarea
                  rows={16}
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  placeholder={BLUEPRINT_JSON_EXAMPLE}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-3 font-mono text-xs"
                  spellCheck={false}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={validating || !rawJson.trim()}
                    onClick={validateJson}
                    className={`${btnPrimaryMd} disabled:opacity-60`}
                  >
                    {validating ? "Validating…" : "Validate & preview"}
                  </button>
                  <button
                    type="button"
                    className={btnSecondaryMd}
                    onClick={() => setRawJson(BLUEPRINT_JSON_EXAMPLE)}
                  >
                    Load example
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {errors.length ? (
        <ul className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
