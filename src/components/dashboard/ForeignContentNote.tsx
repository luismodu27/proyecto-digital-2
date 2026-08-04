/**
 * Aviso de "esto está guardado en otro idioma".
 *
 * El texto regulatorio que Attesta escribe en la base de datos —brechas de un
 * policy pack, motivación de una evaluación, tareas nacidas de una
 * recomendación— queda congelado en el idioma en que se creó (migración 0033).
 * Al cambiar la interfaz de idioma, esas filas siguen como estaban.
 *
 * POR QUÉ NO SE TRADUCE AL VUELO: sería reescribir evidencia. Lo que se guardó es
 * lo que la organización declaró ese día, y el expediente tiene que poder
 * enseñarse tal cual. Así que se muestra literal, se etiqueta con `lang` para el
 * lector de pantalla (WCAG 3.1.2) y se explica aquí — un usuario que ve la
 * pantalla mezclada sin explicación asume que la aplicación está rota.
 *
 * Se renderiza UNA vez por pantalla, no una por fila: `foreignLocales` deduplica.
 * Si nada difiere —o si el idioma no consta, que es el caso de todo lo anterior a
 * la 0033— no devuelve nada.
 */
import { foreignLocales, type StoredLocale } from "@/lib/i18n/stored-locale";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

export function ForeignContentNote({
  items,
  locale,
  t,
  className = "",
}: {
  items: readonly { locale?: StoredLocale }[];
  locale: Locale;
  t: Dictionary["dashboard"]["storedLocale"];
  className?: string;
}) {
  const others = foreignLocales(items, locale);
  if (others.length === 0) return null;

  const names = others.map((l) => t[l]);
  const text =
    names.length === 1
      ? t.noticeOne.replace("{lang}", names[0])
      : t.noticeMany.replace("{langs}", names.join(" · "));

  return (
    <p
      className={`rounded-xl border border-line bg-paper-raised px-4 py-3 text-xs text-muted ${className}`}
    >
      {text}
    </p>
  );
}
