import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad aplicadas a todas las rutas. Attesta es un SaaS de
 * gobernanza que custodia datos de clientes: estas cabeceras son la base que
 * revisa cualquier cuestionario de seguridad enterprise, y Vercel no las añade
 * por defecto.
 *
 * Pendiente (requiere prueba en navegador): una Content-Security-Policy estricta
 * con nonce. No se incluye aún porque una CSP mal calibrada rompería el script
 * inline de tema (layout.tsx), Stripe.js y las llamadas a Supabase; hay que
 * validarla en navegador antes de activarla.
 */
const securityHeaders = [
  // Fuerza HTTPS durante 2 años en el dominio y sus subdominios. `preload`
  // habilita la inclusión en la lista de precarga HSTS de los navegadores
  // (enviar el dominio en hstspreload.org una vez el dominio propio esté en uso).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Anti-clickjacking: la app no puede embeberse en un iframe de terceros.
  { key: "X-Frame-Options", value: "DENY" },
  // El navegador no adivina el tipo MIME (evita ejecutar contenido disfrazado).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No filtrar la URL completa como referer hacia otros orígenes.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva APIs sensibles del navegador que la app no usa.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // No revelar la versión de Next en la cabecera X-Powered-By.
  poweredByHeader: false,
  experimental: {
    /*
      El tope por defecto de una Server Action es 1 MB, y el vault de evidencia
      recibe PDFs escaneados. Sin subirlo, cualquier documento real se rechaza
      con un error genérico de Next que no dice el motivo — y el usuario deduce
      que el producto está roto, no que su archivo pesa mucho.

      Coincide a propósito con `MAX_FILE_BYTES` (25 MB) y con el CHECK de la
      migración 0038: son tres sitios que declaran el mismo límite y, si
      divergen, el que quede más bajo rechaza antes de que el mensaje bueno
      llegue a verse. Al cambiar uno, cambiar los tres.
    */
    serverActions: { bodySizeLimit: "25mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
