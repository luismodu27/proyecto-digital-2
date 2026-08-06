"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

/**
 * Generador del par de claves de firma del vault, DENTRO del producto.
 *
 * POR QUÉ EXISTE ESTE COMPONENTE, que a primera vista parece un lujo. La
 * alternativa era pedirle al fundador que pegara un fragmento de criptografía en
 * la consola del navegador. Chrome muestra ahí un aviso —«no pegues código que
 * no entiendas»— que es CORRECTO: es el vector de ataque real que usa el fraude
 * por soporte técnico falso. Pedirle a alguien que desactive esa protección para
 * seguir nuestras instrucciones es enseñarle exactamente el hábito que un día le
 * costará la cuenta. Y si el producto se lo enseña a su fundador, se lo acabará
 * enseñando a sus clientes.
 *
 * Aquí el código va en el repositorio, revisado y desplegado como el resto, no
 * pegado a mano en una consola.
 *
 * LA CLAVE PRIVADA NO SALE DE ESTE NAVEGADOR. Se genera con Web Crypto en la
 * máquina de quien pulsa el botón y no se envía a ningún sitio: no hay `fetch`,
 * no se guarda, no se registra. El servidor de Attesta nunca la ve — solo la verá
 * cuando el fundador la pegue en las variables de entorno de Vercel, que es donde
 * debe estar.
 *
 * Solo se muestra a `platform_admins` y solo cuando NO hay clave configurada: es
 * una herramienta de puesta en marcha, no una función del producto.
 */
export function SigningKeyGenerator({
  t,
}: {
  t: Dictionary["dashboard"]["vault"]["keygen"];
}) {
  const [claves, setClaves] = useState<{
    keyId: string;
    privada: string;
    publica: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  async function generar() {
    setError(null);
    try {
      const kp = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
        "sign",
        "verify",
      ])) as CryptoKeyPair;
      const b64 = (buf: ArrayBuffer) => {
        let s = "";
        for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
        return btoa(s);
      };
      const pkcs8 = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
      const raw = await crypto.subtle.exportKey("raw", kp.publicKey);
      const digest = await crypto.subtle.digest("SHA-256", raw);
      const keyId = Array.from(new Uint8Array(digest).slice(0, 16))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
      setClaves({ keyId, privada: b64(pkcs8), publica: b64(raw) });
    } catch {
      // Navegador sin Ed25519 (Safari antiguo, Firefox por debajo de la 130).
      setError(t.unsupported);
    }
  }

  async function copiar(texto: string, cual: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(cual);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // Sin permiso de portapapeles: el valor está a la vista y se puede
      // seleccionar a mano. No merece un error en pantalla.
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-[var(--tone-info-bd)] bg-[var(--tone-info-bg)] p-6">
      <h2 className="font-display text-lg font-semibold text-[var(--tone-info-fg)]">
        {t.title}
      </h2>
      <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[var(--tone-info-fg)]">
        {t.body}
      </p>
      <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[var(--tone-info-fg)]">
        {t.privacyNote}
      </p>

      {!claves ? (
        <>
          <button
            type="button"
            onClick={generar}
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            {t.cta}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-sm text-[var(--tone-danger-fg)]">
              {error}
            </p>
          )}
        </>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="rounded-lg border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] px-4 py-3 text-sm font-medium text-[var(--tone-warn-fg)]">
            {t.warning}
          </p>

          <p className="text-sm text-[var(--tone-info-fg)]">
            {t.keyIdLabel}: <span className="font-mono font-semibold">{claves.keyId}</span>
          </p>

          {(
            [
              ["VAULT_SIGNING_KEY", claves.privada, t.privateLabel],
              ["VAULT_SIGNING_KEY_PUBLIC", claves.publica, t.publicLabel],
            ] as const
          ).map(([nombre, valor, etiqueta]) => (
            <div key={nombre} className="rounded-xl border border-line bg-paper p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-semibold text-ink">{nombre}</p>
                  <p className="text-xs text-muted">{etiqueta}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copiar(valor, nombre)}
                  className="rounded-lg border border-line-strong bg-paper-sunken px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  {copiado === nombre ? t.copied : t.copy}
                </button>
              </div>
              {/*
                El valor se enseña con `break-all` y sin recortar: si se recortara
                para que quedase bonito, alguien copiaría media clave y el fallo
                aparecería mucho después, al descargar un paquete.
              */}
              <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-muted">
                {valor}
              </p>
            </div>
          ))}

          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[var(--tone-info-fg)]">
            {t.steps.map((paso) => (
              <li key={paso}>{paso}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
