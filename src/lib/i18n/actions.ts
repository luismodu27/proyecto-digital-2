"use server";

/**
 * Server Action para persistir el idioma en la cookie `NEXT_LOCALE`.
 * La usa el toggle EN/ES del dashboard/auth (modo cookie, sin cambiar la URL).
 */
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { coerceLocale, LOCALE_COOKIE } from "./config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocale(next: string, revalidate = "/") {
  const locale = coerceLocale(next);
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: ONE_YEAR,
  });
  revalidatePath(revalidate);
}
