<!--
  Plantilla de PR de Attesta. Rellena las secciones y borra los comentarios de ayuda.
  Flujo: se desarrolla en una rama de trabajo y se abre PR hacia `main`; la CI (verify:
  lint + typecheck + build) y el preview de Vercel corren aquí. Se mergea a `main`
  (producción) solo tras revisión. Nada llega a `main` sin pasar por un PR.
-->

## Qué cambia
<!-- Resumen en 1–3 líneas de lo que hace este PR. -->

## Por qué
<!-- Motivación: qué problema resuelve o qué pidió el fundador. -->

## Verificación
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] Backend real (si aplica): probado por `curl` con usuarios `*@attesta-test.dev`.

## Checklist del proyecto
- [ ] **Migración de Supabase**: si añade una, está concatenada en `supabase/setup.sql` y avisada al fundador (se aplican a mano).
- [ ] **Contenido regulatorio/legal**: es determinista y validado por el `compliance-domain-expert` (ningún texto legal redactado por un LLM).
- [ ] **Copy de marca**: sin términos prohibidos (certificado / aprobado / cumple / garantiza / sello / libre de riesgo / asesoría legal); los verbos son de la organización.
- [ ] **Bilingüe**: si toca UI o contenido, ES y EN quedan a la par.

## Capturas / preview
<!-- Si hay cambios de UI, adjunta capturas o enlaza el preview de Vercel del PR. -->
