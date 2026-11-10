# Frente: portal (estado unificado y rediseño)

**Al 10 nov 2026.** Este archivo junta en un solo lugar lo que quedó repartido
entre conversaciones (web, PMO, Familia, Personal, editor, precios). Lo
verificado aquí sale del repo, de los PR y de Vercel, no de la memoria del chat.

## Dónde estamos parados

- **Producción = `main` = `60d59ed`** (PR #19, 31 oct 2026), desplegado en
  Vercel `zaelyn-portal` y en `zaelyn.ai`. CI y auto-integrar en verde.
- **No hay PR abiertos.** Las 19 PR están integradas. Las ramas que siguen en
  GitHub (`chore/auto-integrar`, `chore/estandar-ne-producto`,
  `docs/contexto-historico`, `fase-pmo/modo-en-portal`, `fase25/mensajes`,
  `portal-2026`) ya están en `main` o son copias viejas: se pueden borrar.
- **Desde el 31 oct no ha entrado nada al portal.** Lo que se avanzó del 1 al
  10 nov fue en el motor y en `NE-Intelligence/zaelyn-app` (app.zaelyn.ai).
- `docs/HANDOFF.md` **no existe en este repo** aunque `docs/estado/README.md` lo
  cita; la foto del 29 oct vive en el motor. El estado vive en `docs/estado/`.

## Lo que está construido (≈50 pantallas, ≈26 mil líneas)

| Área | Rutas | Estado |
|---|---|---|
| Sitio público | `/`, `/proyectos`, `/familia`, `/personal`, `/precios`, `/nosotros`, `/legal/[doc]`, `/empezar`, `/verificar` | En vivo. `/legal` con `[FALTA]` del dueño |
| Entrada | `/entrar` (passkey, correo, Telegram), `/entrar/canjear` (POST), `/entrar/no`, `/salir` (POST), `/app/acceso`, `/app/cuenta` | En vivo |
| Proyectos | `/app/g/<g>/<p>?v=` con **7 vistas**: Resumen, Tablero, Gantt, Ruta crítica, Equipo, Bitácora, General y reportes (PDF, PPTX, tarjeta social) | En vivo |
| PMO | Seguimiento (modo), «Zaelyn sugiere», roles PMO/Supervisor, Ajustes del grupo, archivados | En vivo |
| Obra | Cargar desde Excel, presupuesto por partida, materiales, estimaciones | En vivo |
| Horas y presupuesto | `/app/horas`, `/app/g/<g>/horas`, `/app/g/<g>/presupuesto` (con Excel) | En vivo |
| Editor de planes | `/app/editor`, `/app/g/<g>/editor` (lienzo, inspector, asistente IA, desde Excel, liberar, reabrir) | En vivo (fase 1) |
| Familia | `/app/f/<g>` con 6 vistas, `/demo/familia` | En vivo |
| Personal | `/app/personal` con 4 vistas, `/demo/personal` | En vivo |
| Zaelyn en el portal | Panel lateral, chat y voz, tablas en el chat, mensajes entre personas en ventanitas | En vivo |
| Cuenta y cobro | `/app/plan`, `/app/plan/comprar/<clave>`, `/app/organizacion`, `/app/participaciones` | En vivo |
| Administración | `/admin` (resumen, ventas, libro, usuarios, uso, conciliación, reportes) | Construido |

## Lo que NO está (diseñado en el sistema de diseño y el prototipo de oct)

Kanban por estado · calendario mensual del proyecto · barra «Pregúntale a
Zaelyn» que mueve la pantalla (`accion`) · lente «Ver como» por rol · panel de
detalle de actividad con dependencias y la frase de cambio.

## Correcciones al documento de contexto del 10 nov

- El repo es `NE-Intelligence/zaelyn-portal`, no `NEDevIA/…` (ese nombre solo redirige).
- Las vistas del plan son 7 (falta «General y reportes» en el documento).
- Los roles construidos son los del pricing por asiento: Sponsor, Líder/PMO,
  Ejecutor, Supervisor y Stakeholder/Monitor. Los cuatro niveles
  «Observa · Ejecuta · Lidera · Administra» eran la propuesta anterior.
- El documento no menciona obra, horas, presupuesto, ajustes del grupo,
  organización, participaciones, compra de asientos ni `/admin`, que ya existen.
- El chat ya no es botón flotante: es panel lateral (decisiones/2026-10-30-panel-y-ventanas).

## Deuda que el rediseño tiene que absorber

- Estilos: ~3,800 líneas de CSS en 7 hojas, 189 colores sueltos solo en
  `portal.css` y ~280 `style={{…}}` en componentes. No hay una sola fuente de tokens.
- Stack: sin Tailwind ni shadcn (desviación registrada); `ne-diseno` pide
  Tailwind v4 leyendo los tokens con `@theme`. Se decide al arrancar el rediseño.
- `README.md` con la tabla de rutas corta; `TASTE_SKILL.md` contradice la decisión de estilos.
- Dueño: `[FALTA]` legales, Vercel Hobby (no permite uso comercial y el portal
  ya cobra), secretos viejos en Vercel, correo de contacto.

## Siguiente: rediseño (decisiones/2026-11-10-rediseno-del-portal)

Familia visual de la app · Tailwind v4 + shadcn · todo a la vez · Zaelyn como
la app embebida con riel de conversaciones.

| Fase | Entrega | Punto de control |
|---|---|---|
| R0 | Línea base Lighthouse (móvil y escritorio) y lista de lo que no se rompe | — |
| R1 | Sistema de diseño único app + portal en Claude Design: tokens, registro denso, 20 componentes, maquetas de Resumen, Gantt, Kanban, sitio y el riel | JJR aprueba el aspecto |
| R2 | Tailwind v4 + shadcn con los tokens; marco común (barra negra, navegación, riel) | Preview |
| R3 | Migración de pantallas: sitio, Proyectos y sus vistas nuevas, PMO, obra, horas, editor, Familia, Personal, cuenta, admin | Preview por área |
| R4 | Zaelyn embebida (depende de la app: modo `embebido`) y retiro de las ventanitas | JJR en compu y teléfono |
| R5 | Limpieza: fuera las 7 hojas viejas, README, TASTE_SKILL, Lighthouse antes/después | Cierre |
