# El panel de Zaelyn en el portal se configura

**Fecha:** 2026-11-18 · **Frente:** portal

**Contexto.** En la laptop, el panel de Zaelyn (la app embebida) flotaba encima de la página y tapaba las cifras y la lista de proyectos. JJR pidió poder configurarlo:
- tamaño, incluido a todo lo largo de la pantalla;
- que se vea como un iPhone o un Samsung, o que flote;
- letra más chica o más grande;
- que herede lo que ya se personaliza en la app.

Nada de esto aplica en el teléfono.

**Decisión.**
- **Ajustes en el propio panel** (botón en su barra). Se guardan por dispositivo (`localStorage`, `lib/panel.ts`): en la laptop se puede querer una columna y en la tablet un teléfono.
- **Forma:**
  - **Columna** (de fábrica): a todo lo alto, a la derecha; la página y el orbe se recorren, así que nada queda tapado.
  - **Flotante:** una ventana sobre la página, a la izquierda o a la derecha, de alto Medio, Alto o Completo. Se arrastra de su barra.
  - **Teléfono:** un marco de iPhone (isla) o de Android (cámara perforada) en negro, titanio o blanco. Se arrastra; la barra queda arriba del equipo.
- **Ancho:** Angosto 360, Normal 400 o Ancho 480.
- **Letra:** Mínima, Chica (de fábrica), Normal o Grande. Escala el panel completo. Sustituye a «Tamaño de Zaelyn» de Apariencia, que ahora remite al panel.
- **Colores y luz:**
  - «Como el portal» (de fábrica): manda tema y paleta.
  - «Como mi app»: la app usa los suyos.
  - Fondo, tipo de letra, burbujas y densidad vienen siempre de los ajustes de la app.
- **`portal:contexto` y `portal:apariencia`** ahora van como `{ tipo, datos }`, que es lo que la app lee, y también sueltos por compatibilidad.

**Alternativa descartada.** Guardarlo en la cuenta, en el Core: lo que conviene en la laptop no es lo que conviene en la tablet.
