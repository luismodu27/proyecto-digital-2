import type { MetadataRoute } from "next";

/**
 * Manifest mínimo. No perseguimos una PWA instalable —Attesta es una app de
 * escritorio con uso ocasional en móvil, no una herramienta de campo— sino
 * las tres cosas que un manifest ausente rompe: el nombre al añadir a la
 * pantalla de inicio (hoy saldría la URL), el color de fondo del arranque, y
 * el icono cuando alguien la ancla.
 *
 * Va sin `display: "standalone"` a propósito: sacar la app del navegador
 * esconde la barra de direcciones, y en un producto donde el usuario firma
 * evidencia conviene que siga viendo en qué dominio está.
 *
 * Es estático y monolingüe (español, la lengua por defecto): el manifest se
 * sirve en una sola URL y no ve la cookie de idioma, así que localizarlo
 * exigiría una ruta por lengua y un `<link rel="manifest">` dinámico. No lo
 * vale para un texto que solo aparece al anclar la app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Attesta — Gobernanza continua de IA",
    short_name: "Attesta",
    description:
      "Inventaría tus sistemas de IA, clasifica su riesgo y genera evidencia lista para auditoría.",
    start_url: "/dashboard",
    background_color: "#faf8f2",
    theme_color: "#faf8f2",
    // `src/app/icon.png` (convención de fichero de Next) se sirve en
    // `/icon.png`. Es el único icono que hay: 256×256 basta para la pantalla
    // de inicio, y `purpose: "any"` evita que Android lo recorte como si
    // fuera maskable (no lo es: no tiene zona de seguridad).
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png", purpose: "any" },
    ],
  };
}
