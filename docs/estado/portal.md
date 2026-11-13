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

## Rediseño (decisiones/2026-11-10-rediseno-del-portal) — al 10 nov 2026

Familia visual de la app · Tailwind v4 · todo a la vez · Zaelyn al lado en un riel.

| Fase | Estado |
|---|---|
| R0 línea base | Hecho. Lighthouse local de main antes de tocar nada (PR #22) |
| R1 sistema de diseño | Hecho. Código: `app/zaelyn.css`. Claude Design: «Zaelyn · Sistema de diseño v2», https://claude.ai/artifact/VY12Hn3SJHCmnrPrtWJap1 (tokens día/noche, tipografía, radios, sombras, guía y 6 componentes). El «Zaelyn Proyectos» de octubre queda obsoleto |
| R2 Tailwind + marco | Hecho (#22): Tailwind v4 sin preflight, barras negras, tipografía del sistema, orbe en el hero |
| R3 pantallas | Toda pantalla toma el sistema nuevo por tokens (#22). Nuevas, ya hechas en Tailwind: Kanban, Calendario del proyecto, filtro por persona, panel de detalle con dependencias y frases de cambio, barra «Pregúntale a Zaelyn» |
| R4 Zaelyn al lado | Hecho del lado del portal: riel con el orbe y las conversaciones, Alt+1…9, columna de 400 px; las ventanitas se retiraron. La app embebida se enciende con `ZAELYN_APP_URL` cuando la app tenga el modo `?embebido=1` (specs/portal-con-app-embebida.md) |
| R5 limpieza | Parcial. Pulido del sitio (sin franjas de color, sin degradado en botones ni sellos, rótulos sin mayúsculas). Además: README, CLAUDE.md, TASTE_SKILL y Lighthouse al día. Siguen vivas las 7 hojas viejas (ya solo con tokens); se retiran pantalla por pantalla al pasar cada una a Tailwind |

### Rendimiento (Lighthouse local, móvil)

| Página | Antes | Después |
|---|---|---|
| Portada | 61 · TBT 1,950 ms · 439 KB | 97 · 50 ms · 283 KB |
| /proyectos | 62 | 98 |
| /precios | 63 | 97 |
| /demo | 90 | 97 |
| /demo Gantt | 89 | 96 |

### Pendiente

- Core: «Ver como» por rol necesita que el motor diga qué ve cada rol; hoy hay «ver por persona», que solo filtra.
- Core: que las respuestas de Zaelyn usen `portal.ir` con `?v=&p=&a=` para mover la pantalla (el portal ya lo entiende).
- App: modo `embebido` y los avisos por `postMessage`; luego poner `ZAELYN_APP_URL` en Vercel.
- Portal: migrar a Tailwind, una por una, las pantallas que aún usan hojas viejas (editor, obra, horas, Familia, Personal, cuenta, admin) y borrar cada hoja al vaciarse.
- Dueño: los `[FALTA]` legales, el plan de Vercel (Hobby no permite uso comercial), los secretos viejos en Vercel y el correo de contacto.

## Desde cero (decisiones/2026-11-10-landings-y-portal)

- Hecho: las cuatro landings nuevas (`/`, `/personal`, `/familia`, `/pmo`) con la plantilla única.
- Hecho: el portal con barra lateral (Inicio · Personal · Familia · PMO · Apps · Configuración · Cuenta · Admin) y pestañas abajo en el teléfono; Inicio de la persona; PMO con sus proyectos en renglones; el plan con tres vistas a la mano y «Más»; Apps y Configuración nuevas; Zaelyn como el orbe flotante con las conversaciones sin leer arriba de él. Los ejemplos (/demo…) ya usan gente nueva (Subestación Mirador, Familia Arce, Mariana).
- Siguiente: los dashboards mínimos de Personal y Familia y pasar a Tailwind las pantallas que siguen con hojas viejas (editor, obra, horas, cuenta, admin).
- Falta: inglés y portugués de las landings nuevas; qué se le puede pedir a Zaelyn sobre Kore y TCGBusters (dueño).

## Cristal (decisiones/2026-11-11-cristal) — 11 nov 2026

Capa visual nueva del portal: vidrio pastel editable por persona (paleta, vidrio,
día/noche, movimiento) desde «Apariencia», tipografía editorial (Instrument Serif
+ Inter), aura que respira, tarjetas que flotan y un cuerpo 3D de vidrio al
fondo. Pantalla nueva de Inicio (`/app`, ejemplo en `/demo/inicio`).

Sigue: rediseñar el contenido de cada pantalla (dashboards de Personal y Familia,
PMO), pasar las pantallas viejas a Tailwind y que la app adopte las mismas
paletas pastel (conversación de la app).

## Inicio de ejecución (decisiones/2026-11-11-inicio-de-ejecucion) — 11 nov 2026

`/app` ahora es la lista de todo lo que hay que hacer (Lista / Tarjetas / Semana, filtro por espacio) con agenda, casa, fechas, hábitos, proyectos y apps al lado. Tocar una cosa la abre con Zaelyn. Falta en el Core: marcar estatus directo, orden propio, listas y pendientes de las apps. `ZAELYN_APP_URL=https://app.zaelyn.ai` quedó en Vercel (producción y previews) el 11 nov: la columna de Zaelyn es la app embebida.

## Planes por ámbito (decisiones/2026-11-13-planes-por-ambito) — 13 nov 2026

Landings por nivel y de módulos, `/precios` en ramas, menú por Familia, Grupos y Proyectos con candados, e Inicio con Tableros, Calendario, Lista y Kanban. Sin cambios de diseño.

Pendiente:
- pantalla de Metas (contrato de `/portal/proyectos-personales`);
- resumen por módulo (Core);
- EN y PT de las landings nuevas;
- respuestas de JJR sobre anual, fundador de Profesional y URLs legales.
