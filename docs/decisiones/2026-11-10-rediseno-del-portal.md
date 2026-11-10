# Rediseño del portal: familia de la app, Tailwind v4 y Zaelyn como el teléfono al lado

**Fecha:** 2026-11-10 · **Frente:** portal

**Contexto.** Al dueño no le gusta el aspecto actual del portal (8 nov: «le falta
elegancia»). La app de conversación (`zaelyn-app`, app.zaelyn.ai) quedó en estilo
Muse: blanco, gris y negro, una sola tipografía, tarjetas como burbujas y
opciones como diálogos sutiles. El portal tiene ~3,800 líneas de CSS en 7 hojas,
189 colores sueltos en `portal.css` y ~280 estilos en línea: no se puede
rediseñar cambiando solo la paleta.

**Decisión.**
- **Dirección visual:** el portal entra a la familia de la app. Misma sobriedad,
  adaptada a pantallas densas (Gantt, tablas, presupuesto). El color se reserva
  para el estado y el módulo, nunca de adorno; el degradado morado→cian sigue
  siendo solo momento de marca. El sistema de diseño es uno para la app y el
  portal, con un registro «denso» para el portal.
- **Stack:** Tailwind v4 + shadcn/ui, leyendo los tokens con `@theme`. Se vuelve
  al estándar NE DevIA y se retira la desviación de estilos. Las 7 hojas
  actuales se van a medida que cada pantalla migra; al final no queda ninguna.
- **Alcance:** todo a la vez, en una fase larga: marco común, sitio público y
  portal (Proyectos, PMO, obra, horas, editor, Familia, Personal, cuenta, admin).
  Las vistas que faltan (Kanban, calendario, barra que mueve la pantalla, «Ver
  como», panel de detalle) nacen ya en el diseño nuevo.
- **Zaelyn en el portal = la app.** La columna derecha es «el teléfono al
  lado»: se ve y se comporta idéntica a la app porque **es** la app
  (app.zaelyn.ai embebida en modo `embebido`), no una copia. Lo que mejore en la
  app aparece en el portal el mismo día.
  - Riel vertical en el borde de la columna: el orbe de Zaelyn fijo arriba y,
    debajo, apiladas, las conversaciones abiertas o con no leídos (iniciales y
    contador). Un toque cambia el teléfono a esa conversación. Atajos
    `Ctrl+1…9`.
  - Tres tamaños: cerrado (solo el riel, 56 px), teléfono (≈400 px, empuja el
    contenido desde 1100 px) y foco (la conversación al centro). En el
    teléfono real, el portal abre la app a pantalla completa.
  - Cuando Zaelyn cambia algo, la app avisa al portal (`postMessage` con origen
    verificado) y el portal vuelve a pedir la página al servidor, como hoy.
  - Reemplaza las ventanitas de abajo de `2026-10-30-panel-y-ventanas`: con el
    riel caben todas las conversaciones sin tapar el Gantt.

**Lo que necesita la app** (lo hace la conversación de `zaelyn-app`; aquí no se
escribe en ese repo): modo `?embebido=1` sin sus pestañas inferiores; permitir
`frame-ancestors https://zaelyn.ai https://www.zaelyn.ai` solo en ese modo;
rutas directas a cada conversación; eventos `zaelyn:cambio` y `zaelyn:no-leidos`
hacia el portal; y la misma sesión, para que nadie entre dos veces. Detalle en
el doc del Proyecto `specs/portal-con-app-embebida.md`.

**Alternativas descartadas.**
- Copiar los componentes de la app al portal: en dos semanas ya no serían
  idénticos.
- Paquete compartido de tarjetas entre los dos repos: es la opción que se
  planteó el 8 nov. Mantiene dos chats que hay que conectar al Core, versionar y
  desplegar por separado, y aun así la navegación de la app (Chats, Agenda,
  Archivos) no viajaría. Se puede retomar si el iframe resulta lento.
- Seguir con CSS propio: deja fuera 21st.dev, Magic UI y shadcn, y la deuda de
  colores sueltos se tendría que limpiar a mano de todos modos.
