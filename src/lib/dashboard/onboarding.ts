/**
 * Qué superficie de bienvenida se enseña en la primera sesión.
 *
 * Hay tres y competían entre sí:
 *
 *  1. `DashboardWelcome` — pantalla completa, cuando el inventario está vacío.
 *  2. `WelcomeGuide` — modal con el recorrido guiado, hasta que se marca visto.
 *  3. `OnboardingChecklist` — barra de progreso, cuando ya hay algo que seguir.
 *
 * El choque: alguien que entra por primera vez tenía **cero sistemas**, así que
 * recibía la bienvenida a pantalla completa **y el modal encima**. Dos
 * bienvenidas simultáneas, en el momento en que menos se toleran, y una tapando
 * a la otra.
 *
 * La regla: **una sola a la vez**. Con el inventario vacío manda la pantalla de
 * bienvenida, que ya dice lo mismo y además ofrece los caminos para empezar. El
 * recorrido guiado aparece cuando de verdad hay algo por lo que guiar — y ahí
 * convive bien con el checklist, que no compite: uno explica, el otro sigue el
 * avance.
 *
 * Lógica pura para poder probarla: la decisión vive entre el layout (que sabe
 * si la guía está vista) y la página (que sabe cuántos sistemas hay), y sin
 * nombre propio se resolvería con un `&&` suelto en un `.tsx` imposible de
 * cubrir con la suite.
 */
export function shouldShowGuide(o: {
  /** El perfil del usuario ya marcó el recorrido como visto. */
  guideSeen: boolean;
  /** Cuántos sistemas de IA tiene la organización. */
  systemCount: number;
}): boolean {
  if (o.guideSeen) return false;
  // Con el inventario vacío manda la pantalla de bienvenida: el modal encima
  // sería la segunda bienvenida simultánea.
  return o.systemCount > 0;
}
