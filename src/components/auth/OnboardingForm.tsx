"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

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

export function OnboardingForm() {
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
      setError(err instanceof Error ? err.message : "No se pudo crear la organización.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Crea tu organización
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Es tu espacio de trabajo en Attesta. Podrás invitar a tu equipo después.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="org" className="block text-sm font-medium text-ink">
            Nombre de la organización
          </label>
          <input
            id="org"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            placeholder="Acme, S.A."
          />
        </div>

        {error && (
          <p className="rounded-lg border border-[#e6b6b1] bg-[#f7e4e2] px-3 py-2 text-sm text-[#8f271f]">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full py-2.5">
          {loading ? "Creando…" : "Crear y continuar"}
        </Button>
      </form>
    </div>
  );
}
