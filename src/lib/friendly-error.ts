/**
 * Traduce mensajes de error crudos (Supabase Auth, RPC, red) a un texto claro
 * en español para el usuario. Nunca mostramos el error técnico tal cual en la UI.
 * Compartido por el login/registro (AuthForm) y el onboarding (OnboardingForm).
 */
export function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Confirma tu correo antes de iniciar sesión.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Ya existe una cuenta con este correo. Inicia sesión.";
  if (m.includes("password should be"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("invalid format") || m.includes("unable to validate email"))
    return "El correo no tiene un formato válido.";
  if (m.includes("signups") && m.includes("disabled"))
    return "El registro por correo está deshabilitado. Contacta al administrador.";
  if (m.includes("for security purposes") || m.includes("rate limit"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  // Errores típicos al crear la organización (RPC create_org_and_owner).
  if (m.includes("duplicate") || m.includes("unique"))
    return "Ese nombre de organización ya está en uso. Prueba con otro.";
  if (m.includes("expired") || m.includes("invalid") || m.includes("token"))
    return "El código es incorrecto o expiró. Revisa el correo o reenvíalo.";
  if (m.includes("fetch") || m.includes("network"))
    return "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.";
  return "Algo salió mal. Inténtalo de nuevo.";
}
