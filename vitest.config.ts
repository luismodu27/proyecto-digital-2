import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Tests de la LÓGICA PURA de Attesta (`npm test`).
 *
 * Qué cubren y por qué: `build`, `lint` y `tsc` no detectan que alguien edite mal
 * una regla legal — un `if` invertido en la clasificación de riesgo compila
 * perfectamente y produce un veredicto equivocado sobre el EU AI Act. Estos tests
 * son la red de seguridad del contenido "cero LLM": codifican la EXPECTATIVA
 * regulatoria (Art. 5 manda sobre todo, el perfilado del Art. 6.3 anula las
 * excepciones, las obligaciones son del *deployer*…) y la paridad ES/EN.
 *
 * Solo módulos puros: nada de componentes ni de Supabase. Entorno `node`, sin
 * jsdom, para que la suite corra en milisegundos y nadie la desactive en CI.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
