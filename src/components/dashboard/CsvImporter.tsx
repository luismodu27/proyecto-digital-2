"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  CSV_TEMPLATE_EN,
  CSV_TEMPLATE_ES,
  MAX_IMPORT_ROWS,
  parseSystemsCsv,
  type ParseResult,
} from "@/lib/import/csv";
import { importSystemsCsv, type ImportOutcome } from "@/lib/data/import-actions";
import { useT } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/config";

/**
 * Importador de inventario por CSV.
 *
 * La previsualización se calcula **en el navegador** con la misma función pura que
 * usa el servidor: quien sube el fichero ve exactamente qué se va a crear y qué
 * filas se van a descartar (con su número de línea) ANTES de escribir nada. El
 * servidor vuelve a parsear por su cuenta — esta pantalla es UX, no validación.
 *
 * Se admite pegar el texto o elegir un fichero. Pegar suele ser lo más rápido para
 * quien ya tiene el inventario abierto en una hoja de cálculo.
 */
export function CsvImporter({ locale }: { locale: Locale }) {
  const t = useT().dashboard.inventory.import;
  const router = useRouter();
  const [text, setText] = useState("");
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed: ParseResult | null = text.trim() ? parseSystemsCsv(text) : null;
  const canSubmit = !!parsed && parsed.rows.length > 0 && !pending;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOutcome(null);
    setText(await file.text());
  }

  function onSubmit() {
    startTransition(async () => {
      const result = await importSystemsCsv(text);
      setOutcome(result);
      if (result.imported > 0) {
        setText("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      }
    });
  }

  const template = locale === "en" ? CSV_TEMPLATE_EN : CSV_TEMPLATE_ES;
  const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(template)}`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-paper-raised p-6">
        <h2 className="font-display text-lg font-semibold text-ink">{t.title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">{t.subtitle}</p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="csv" className="text-sm font-medium text-ink">
            {t.pasteLabel}
          </label>
          <a
            href={templateHref}
            download="attesta-inventario.csv"
            className="text-xs font-medium text-brand hover:text-brand-strong"
          >
            {t.templateLink}
          </a>
        </div>

        <textarea
          id="csv"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOutcome(null);
          }}
          rows={7}
          spellCheck={false}
          placeholder={t.pastePlaceholder}
          className="mt-2 w-full rounded-lg border border-line-strong bg-paper px-4 py-3 font-mono text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
        />

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={onFile}
            aria-label={t.fileLabel}
            className="text-xs text-ink-soft file:mr-3 file:rounded-full file:border file:border-line-strong file:bg-paper file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-paper-sunken"
          />
          <p className="text-xs text-muted">{t.limitNote.replace("{max}", String(MAX_IMPORT_ROWS))}</p>
        </div>
      </div>

      {parsed && (
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-ink">
              {t.previewTitle}
            </h2>
            <p className="text-xs text-muted">
              {t.previewCount
                .replace("{rows}", String(parsed.rows.length))
                .replace("{errors}", String(parsed.errors.length))}
            </p>
          </div>

          {!parsed.headerFound && (
            <p className="mt-3 rounded-lg border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] px-3 py-2 text-xs text-[var(--tone-warn-fg)]">
              {t.noHeaderNotice}
            </p>
          )}
          {parsed.delimiter !== "," && (
            <p className="mt-3 text-xs text-muted">
              {t.delimiterNote.replace(
                "{delimiter}",
                parsed.delimiter === ";" ? ";" : "tab",
              )}
            </p>
          )}
          {parsed.truncated > 0 && (
            <p className="mt-3 text-xs text-[var(--tone-warn-fg)]">
              {t.truncatedNote
                .replace("{max}", String(MAX_IMPORT_ROWS))
                .replace("{n}", String(parsed.truncated))}
            </p>
          )}

          {parsed.rows.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-150 text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-medium text-muted">
                    <th className="pb-2 pr-4">{t.colName}</th>
                    <th className="pb-2 pr-4">{t.colOwner}</th>
                    <th className="pb-2 pr-4">{t.colDomain}</th>
                    <th className="pb-2 pr-4">{t.colVendor}</th>
                    <th className="pb-2">{t.colRole}</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 10).map((r) => (
                    <tr key={r.line} className="border-b border-line/60">
                      <td className="py-2.5 pr-4 font-medium text-ink">{r.name}</td>
                      <td className="py-2.5 pr-4 text-ink-soft">{r.owner ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-ink-soft">{r.domain ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-ink-soft">{r.vendor ?? "—"}</td>
                      <td className="py-2.5 text-xs text-muted">
                        {r.actorRole === "provider" ? t.roleProvider : t.roleDeployer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 10 && (
                <p className="mt-3 text-xs text-muted">
                  {t.andMore.replace("{n}", String(parsed.rows.length - 10))}
                </p>
              )}
            </div>
          )}

          {parsed.errors.length > 0 && (
            <div className="mt-5 rounded-xl border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] p-4">
              <p className="text-xs font-medium text-[var(--tone-warn-fg)]">
                {t.errorsTitle}
              </p>
              <ul className="mt-2 space-y-1">
                {parsed.errors.slice(0, 8).map((e) => (
                  <li key={`${e.line}-${e.code}`} className="text-xs text-[var(--tone-warn-fg)]">
                    <span className="font-mono">L{e.line}</span> · {t.errCodes[e.code]}
                    {e.sample && <span className="text-muted"> — {e.sample}</span>}
                  </li>
                ))}
              </ul>
              {parsed.errors.length > 8 && (
                <p className="mt-2 text-xs text-[var(--tone-warn-fg)]">
                  {t.andMore.replace("{n}", String(parsed.errors.length - 8))}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
              {pending
                ? t.submitting
                : t.submit.replace("{n}", String(parsed.rows.length))}
            </Button>
          </div>
        </div>
      )}

      {outcome && (
        <div
          role="status"
          className={`rounded-2xl border p-5 text-sm ${
            outcome.ok
              ? "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]"
              : "border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]"
          }`}
        >
          {outcome.error ? (
            <p>{t.failures[outcome.error]}</p>
          ) : (
            <>
              <p className="font-medium">
                {t.resultOk.replace("{n}", String(outcome.imported))}
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs">
                {outcome.skippedExisting > 0 && (
                  <li>{t.resultSkipped.replace("{n}", String(outcome.skippedExisting))}</li>
                )}
                {outcome.rejected > 0 && (
                  <li>{t.resultRejected.replace("{n}", String(outcome.rejected))}</li>
                )}
                {outcome.truncated > 0 && (
                  <li>{t.resultTruncated.replace("{n}", String(outcome.truncated))}</li>
                )}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
