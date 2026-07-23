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

export function NewEntityForm({
  t,
  friendlyErrors,
}: {
  t: {
    nameLabel: string;
    namePlaceholder: string;
    createCta: string;
    creatingCta: string;
    createdToast: string;
  };
  friendlyErrors: Dictionary["auth"]["friendlyErrors"];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.rpc("create_org_and_owner", {
        org_name: name,
        org_slug: slugify(name),
      });
      if (error) throw error;
      setName("");
      setDone(true);
      // La nueva entidad empieza en plan gratuito: NO cambiamos de organización
      // (perderíamos el acceso Enterprise de la org activa). Solo refrescamos la
      // lista para que aparezca.
      router.refresh();
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "", friendlyErrors),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <label htmlFor="new-org" className="block text-sm font-medium text-ink">
          {t.nameLabel}
        </label>
        <input
          id="new-org"
          type="text"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setDone(false);
          }}
          className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
          placeholder={t.namePlaceholder}
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
      {done && !error && (
        <p
          role="status"
          className="rounded-lg border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] px-3 py-2 text-sm text-[var(--tone-good-fg)]"
        >
          {t.createdToast}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full py-2.5">
        {loading ? t.creatingCta : t.createCta}
      </Button>
    </form>
  );
}
