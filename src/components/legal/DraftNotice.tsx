import type { Dictionary } from "@/lib/i18n";
import type { LegalEntityEnv } from "@/lib/legal/entity";
import { missingEntityFields } from "@/lib/legal/entity";

/**
 * Aviso de que el documento todavía es un borrador.
 *
 * ES DELIBERADAMENTE FEO Y ESTÁ ARRIBA DEL TODO. La tentación es ponerlo discreto
 * al pie, y sería un error: el propósito entero de este bloque es que resulte
 * imposible enseñar la página en una reunión sin que alguien lo mencione. Un aviso
 * de privacidad a medias que *parece* terminado es peor que no tener ninguno,
 * porque genera una confianza que no se ha ganado.
 *
 * Enumera además QUÉ falta, con el nombre de la variable de entorno: así el aviso
 * no es solo una advertencia, es la instrucción para hacerlo desaparecer.
 */
export function DraftNotice({ t }: { t: Dictionary["legal"] }) {
  const missing = missingEntityFields(process.env as LegalEntityEnv);
  if (missing.length === 0) return null;

  return (
    <div className="border-b border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)]">
      <div className="container-page py-4">
        <p className="text-sm font-semibold text-[var(--tone-warn-fg)]">
          {t.draftTitle}
        </p>
        <p className="mt-1 max-w-[80ch] text-sm leading-relaxed text-[var(--tone-warn-fg)]">
          {t.draftBody}
        </p>
        <p className="mt-2 font-mono text-xs text-[var(--tone-warn-fg)]">
          {t.draftMissing}: {missing.join(" · ")}
        </p>
      </div>
    </div>
  );
}
