/**
 * SealMark — marca de "sello de atestación" de Attesta.
 * Sello con monograma "A" y check integrado. La imagen se invierte según el
 * tema (clara en modo claro, invertida en oscuro) vía la variable --seal-img.
 */
export function SealMark({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-contain bg-center bg-no-repeat ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "var(--seal-img)",
      }}
    />
  );
}
