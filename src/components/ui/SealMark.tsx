/**
 * SealMark — marca de "sello de atestación" de Attesta.
 * Un sello circular festoneado con un check: evoca certificación / evidencia validada.
 */
export function SealMark({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 2.5c2.3 2.6 5.9 3.7 9.2 2.8 1.4 3.3 4.2 5.7 7.6 6.4-.9 3.3.2 6.9 2.8 9.3-2.6 2.4-3.7 6-2.8 9.3-3.4.7-6.2 3.1-7.6 6.4-3.3-.9-6.9.2-9.2 2.8-2.3-2.6-5.9-3.7-9.2-2.8-1.4-3.3-4.2-5.7-7.6-6.4.9-3.3-.2-6.9-2.8-9.3 2.6-2.4 3.7-6 2.8-9.3 3.4-.7 6.2-3.1 7.6-6.4 3.3.9 6.9-.2 9.2-2.8Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M24 5.4c1.9 2.1 4.8 3 7.5 2.3 1.1 2.7 3.4 4.6 6.2 5.2-.7 2.7.1 5.6 2.2 7.6-2.1 2-2.9 4.9-2.2 7.6-2.8.6-5.1 2.5-6.2 5.2-2.7-.7-5.6.2-7.5 2.3-1.9-2.1-4.8-3-7.5-2.3-1.1-2.7-3.4-4.6-6.2-5.2.7-2.7-.1-5.6-2.2-7.6 2.1-2 2.9-4.9 2.2-7.6 2.8-.6 5.1-2.5 6.2-5.2 2.7.7 5.6-.2 7.5-2.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        opacity="0.4"
      />
      <path
        d="m18.5 24.2 3.8 3.8 7.2-7.6"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
