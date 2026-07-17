import Link from "next/link";
import { SealMark } from "./SealMark";

export function Logo({
  className = "",
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-ink ${className}`}
    >
      <SealMark size={30} className="text-brand" />
      <span className="font-display text-xl font-semibold tracking-tight">
        Attesta
      </span>
    </Link>
  );
}
