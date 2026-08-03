/**
 * Ajuste de organización que el usuario NO puede cambiar: se enseña el valor y
 * se dice por qué no hay botón.
 *
 * Existe como componente compartido —y no como dos bloques parecidos en
 * vigilancia e incidentes— porque la decisión que encapsula es de producto y
 * conviene que sea la misma en todas partes: **mostrar el valor, ocultar solo el
 * control**. Un ajuste escondido del todo convierte una restricción de permisos
 * en un misterio: la lista de revisiones pendientes parece arbitraria si no se
 * ve la cadencia, y el radar parece incompleto si no se ve el nexo.
 */
export function ReadonlySetting({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised px-5 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value}</p>
      <p className="mt-1 text-[11px] text-muted">{note}</p>
    </div>
  );
}
