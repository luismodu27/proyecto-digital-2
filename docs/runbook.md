# Runbook operativo de Attesta

> Qué hacer cuando algo va mal, y qué hay que tener preparado **antes** de que
> vaya mal. Escrito para el fundador, no para un equipo de guardia: los pasos son
> los que se pueden dar desde el panel de Vercel y el de Supabase, sin consola.
>
> Este documento existe porque el registro de auditoría inmutable y la cadena de
> hashes **no valen nada sin una copia de seguridad de la que restaurar**. Un
> expediente demostrablemente íntegro que se ha perdido entero es tan inútil como
> uno manipulado.

---

## 1. Lo que hay que tener resuelto antes de vender

| Asunto | Estado | Quién |
|---|---|---|
| Copias de seguridad de la base de datos | Las hace Supabase; **falta comprobar la restauración** | Fundador |
| Objetivo de pérdida máxima (RPO) y de tiempo de recuperación (RTO) | Sin fijar | Fundador |
| Restauración probada de verdad, al menos una vez | **Nunca probada** | Fundador |
| Autenticación del dominio de correo (SPF, DKIM, DMARC) | Sin configurar | Fundador |
| Verificación semanal de la cadena de auditoría | Automática (`/api/audit-verify`) | Hecho |
| Purga de organizaciones dadas de baja | Automática, diaria (`/api/org-purge`) | Hecho |
| Reconciliación con Stripe | Automática, diaria (`/api/stripe/reconcile`) | Hecho |

**La fila que más pesa es la tercera.** Una copia de seguridad que nunca se ha
restaurado no es una copia de seguridad: es una suposición. El día que haga falta
es el peor momento para descubrir que el volcado estaba incompleto, que faltaba
una extensión o que nadie sabía dónde estaba el botón.

---

## 2. Copias de seguridad y restauración

### Lo que hay hoy

Supabase hace copias automáticas del proyecto. En los planes de pago incluye
**restauración a un punto en el tiempo**; en el plan gratuito, copias diarias con
retención corta. **Comprueba cuál tienes** en *Database → Backups* del panel de
Supabase: la diferencia entre "puedo volver a hace 5 minutos" y "puedo volver a
ayer" es toda la conversación sobre pérdida máxima de datos.

### Qué fijar (y por qué el cliente lo va a preguntar)

- **RPO — cuántos datos puedes permitirte perder.** Con copias diarias, hasta 24
  horas de trabajo. Para un cliente que acaba de meter su inventario entero, eso
  es un día de trabajo perdido.
- **RTO — cuánto puedes tardar en volver.** Restaurar un proyecto de Supabase son
  minutos, pero hay que sumar detectar el problema, decidir y comprobar.

Cuando los fijes, **anótalos en el DPA**: es exactamente lo que pregunta la
revisión de proveedores de un cliente mid-market.

### Ensayo de restauración (hazlo una vez, y repítelo al año)

1. Crea un proyecto de Supabase **nuevo y vacío** (no toques el de producción).
2. Restaura ahí la última copia.
3. Comprueba tres cosas, no una:
   - que el número de organizaciones y de sistemas de IA cuadra;
   - que `select * from public.verify_all_audit_chains()` devuelve `ok = true`
     para todas — si la cadena no cuadra, la copia está incompleta;
   - que puedes iniciar sesión con un usuario de prueba.
4. Apunta cuánto has tardado. **Ese** es tu RTO real, no el que diga un folleto.
5. Borra el proyecto de ensayo.

---

## 3. Autenticación del dominio de correo (SPF, DKIM, DMARC)

### Por qué importa más de lo que parece

Sin dominio propio autenticado, los correos **se envían igual** —la API responde
correctamente, los registros dicen "enviado"— y acaban en spam. Lo que se pierde
ahí no es un boletín:

- **invitaciones al equipo**: alguien no puede entrar y no sabe por qué;
- **restablecimientos de contraseña**: alguien se queda fuera de su cuenta;
- **recordatorios de vencimiento**: el producto deja de hacer lo que se contrató.

El síntoma visible desde dentro es **ninguno**. Por eso la aplicación ahora lo
detecta sola: si el remitente sigue en el dominio de pruebas, sale un aviso en el
panel interno de telemetría y una línea en los registros del servidor.

### Pasos

1. En Resend, *Domains → Add Domain*, con tu dominio propio.
2. Resend da tres registros DNS. Añádelos donde tengas el dominio:
   - **SPF** (`TXT`) — dice qué servidores pueden enviar en tu nombre.
   - **DKIM** (`TXT`) — firma cada correo; es lo que demuestra que es tuyo.
   - **MX** de retorno (si Resend lo pide) — para los rebotes.
3. Espera a que Resend los marque como verificados (minutos a horas).
4. **DMARC** (`TXT` en `_dmarc.tudominio.com`). Empieza en observación:
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@tudominio.com
   ```
   `p=none` no bloquea nada: solo pide informes. Cuando lleves unas semanas
   viendo que todo tu correo legítimo pasa, sube a `p=quarantine` y luego a
   `p=reject`. **No empieces en `reject`**: si algo está mal configurado, dejas de
   entregar correo sin enterarte, que es justo el problema que venías a arreglar.
5. Pon `RESEND_FROM` en Vercel con tu remitente (`Attesta <hola@tudominio.com>`).
6. Comprueba que el aviso del panel interno de telemetría **ha desaparecido**.

---

## 4. Qué hacer si…

### La cadena de auditoría sale rota

Llega un correo del cron semanal diciendo en qué organización.

1. **No borres ni edites nada.** El valor de ese registro es precisamente que no
   se puede tocar, y una "limpieza" destruye la prueba.
2. Mira en Supabase quién ha tenido acceso directo a la base de datos: la única
   forma de romper la cadena es escribir saltándose la aplicación.
3. Comprueba si coincide con una restauración de copia de seguridad: restaurar a
   un punto anterior puede dejar la cadena inconsistente de forma legítima.
4. Si no hay explicación inocente, es un incidente de seguridad: documenta hora,
   organización y fila afectada **antes** de tocar nada.

### Un cliente dice que pagó y sigue en el plan gratuito

1. Ejecuta la reconciliación a mano: abre `/api/stripe/reconcile` con tu sesión de
   administrador de plataforma. Repara la deriva y te dice qué encontró.
2. Si aparece como "huérfana", es que a esa suscripción le falta el
   `organization_id` en sus metadatos: el checkout se creó mal. Arréglalo en
   Stripe añadiendo el metadato y vuelve a lanzar la reconciliación.
3. Mira el registro de eventos de Stripe en el panel de Stripe: si hay entregas
   fallidas, el endpoint del webhook está mal configurado o el secreto de firma no
   coincide con el de Vercel.

### Una organización solicitó la baja por error

Mientras esté dentro del plazo de gracia (7 días), el propietario lo cancela él
mismo desde *Organizaciones*. Pasado el plazo **no hay vuelta atrás desde la
aplicación**: la única salida es restaurar una copia de seguridad, con todo lo que
eso implica para el resto de clientes. Por eso el plazo existe.

### La aplicación devuelve pantallas vacías

Busca en los registros de Vercel las líneas que empiezan por `{"src":"attesta"`.
Clasifican solas el problema:

- `migration-pending` — falta aplicar una migración. Es el estado esperado justo
  después de un despliegue y antes de pegar el SQL.
- `permission` — problema de permisos en la base de datos (RLS).
- `incident` — cualquier otra cosa: ahí sí hay que mirar.

---

## 5. Tareas automáticas y qué significa que no corran

| Ruta | Cuándo | Si no corre |
|---|---|---|
| `/api/reminders/run` | Lunes 08:00 | Nadie recibe su resumen semanal. Molesto, no grave. |
| `/api/reg-watch/vigia` | Lunes 06:00 | El radar regulatorio no busca novedades. |
| `/api/audit-verify` | Lunes 07:00 | Una manipulación tardaría más en detectarse. |
| `/api/org-purge` | A diario, 03:00 | **Se incumple un plazo del DPA**: hay datos que debían borrarse y siguen ahí. |
| `/api/stripe/reconcile` | A diario, 04:00 | Un cliente que pagó puede seguir sin su plan. |

Las dos últimas son las que no pueden estar caídas en silencio: no avisan de
nada, **hacen** algo que hemos prometido por contrato.
