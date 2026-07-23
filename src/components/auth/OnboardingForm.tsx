"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/friendly-error";
import type { Dictionary } from "@/lib/i18n";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "org"}-${suffix}`;
}

export function OnboardingForm({ t }: { t: Dictionary["auth"] }) {
  const o = t.onboarding;
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.rpc("create_org_and_owner", {
        org_name: name,
        org_slug: slugify(name),
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "", t.friendlyErrors),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {o.title}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{o.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="org" className="block text-sm font-medium text-ink">
            {o.nameLabel}
          </label>
          <input
            id="org"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
            placeholder={o.namePlaceholder}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-3 py-2 text-sm text-[var(--tone-danger-fg)]"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full py-2.5">
          {loading ? o.creating : o.cta}
        </Button>
      </form>
    </div>
  );
}
