import { ImageResponse } from "next/og";

export const alt =
  "Attesta — Gobernanza continua de IA para el mid-market, lista para auditoría";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagen de previsualización (Open Graph / Twitter) generada con la identidad de
 * Attesta: marfil, jade y bronce. Se usa al compartir el enlace en redes/chat.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf8f2",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Barra superior: sello + marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: "#0b6b4e",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#14201a" }}>
            Attesta
          </div>
        </div>

        {/* Titular */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              color: "#14201a",
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 900,
            }}
          >
            Gobernanza continua de IA, lista para auditoría.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#3c4a42", maxWidth: 860 }}>
            Inventaría tu IA, clasifica su riesgo (EU AI Act + EE. UU.) y genera
            evidencia — sin equipo de compliance.
          </div>
        </div>

        {/* Pie */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", width: 40, height: 4, background: "#a9793f" }} />
          <div style={{ display: "flex", fontSize: 24, color: "#6f7970", letterSpacing: 1 }}>
            RRHH · EU AI Act · Preparación para auditoría
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
