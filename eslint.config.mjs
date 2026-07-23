import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Frontera legal (ver src/lib/i18n/config.ts): los diccionarios de i18n solo
  // contienen chrome de UI. Prohibido que importen contenido regulatorio
  // determinista validado por el experto — no se traduce sin su validación.
  {
    files: ["src/lib/i18n/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/policy-packs",
                "**/policy-packs/**",
                "**/risk-assessment",
                "**/recommendations",
                "**/regulatory-watch",
              ],
              message:
                "La frontera legal: el contenido regulatorio determinista no entra en i18n. Traducirlo requiere validación del experto de compliance.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
