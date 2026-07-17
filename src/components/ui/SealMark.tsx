import Image from "next/image";

/**
 * SealMark — marca de "sello de atestación" de Attesta.
 * Sello con monograma "A" y check integrado (evidencia validada).
 */
export function SealMark({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/sealmark.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden
      priority
    />
  );
}
