/**
 * Traduce mensajes de error crudos (Supabase Auth, RPC, red) a un texto claro
 * para el usuario, en el idioma activo. Nunca mostramos el error técnico tal cual.
 * Compartido por el login/registro (AuthForm) y el onboarding (OnboardingForm),
 * que le pasan el slice `auth.friendlyErrors` del diccionario.
 */
export type FriendlyErrorMessages = {
  invalidCredentials: string;
  emailNotConfirmed: string;
  alreadyRegistered: string;
  passwordShould: string;
  invalidEmailFormat: string;
  signupsDisabled: string;
  rateLimit: string;
  duplicateOrg: string;
  invalidToken: string;
  network: string;
  generic: string;
};

export function friendlyError(
  message: string,
  m: FriendlyErrorMessages,
): string {
  const s = message.toLowerCase();
  if (s.includes("invalid login credentials")) return m.invalidCredentials;
  if (s.includes("email not confirmed")) return m.emailNotConfirmed;
  if (s.includes("already registered") || s.includes("already exists"))
    return m.alreadyRegistered;
  if (s.includes("password should be")) return m.passwordShould;
  if (s.includes("invalid format") || s.includes("unable to validate email"))
    return m.invalidEmailFormat;
  if (s.includes("signups") && s.includes("disabled")) return m.signupsDisabled;
  if (s.includes("for security purposes") || s.includes("rate limit"))
    return m.rateLimit;
  // Errores típicos al crear la organización (RPC create_org_and_owner).
  if (s.includes("duplicate") || s.includes("unique")) return m.duplicateOrg;
  if (s.includes("expired") || s.includes("invalid") || s.includes("token"))
    return m.invalidToken;
  if (s.includes("fetch") || s.includes("network")) return m.network;
  return m.generic;
}
