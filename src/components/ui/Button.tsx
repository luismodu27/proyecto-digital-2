import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50";

const sizes = "px-5 py-2.5";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  outline:
    "border border-line-strong text-ink hover:border-ink hover:bg-paper-sunken",
  ghost: "text-ink-soft hover:text-ink hover:bg-paper-sunken",
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<typeof Link>) {
  return (
    <Link
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
