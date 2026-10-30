# Zaelyn en panel lateral y conversaciones en ventanitas

**Fecha:** 2026-10-30 · **Frente:** web

**Contexto.** El chat de Zaelyn era un botón flotante («Hablar con Zaelyn») con
un panel que tapaba la pantalla, y las conversaciones con personas solo vivían
en la pestaña Mensajes. JJR pidió un panel lateral que se expanda cuando se
quiera hablar con Zaelyn, conversaciones abajo como chats (minimizadas con su
nombre, varias abiertas a la vez) y, en el teléfono, algo como WhatsApp.

**Decisión.**
- Zaelyn es un **panel lateral derecho** (400 px) que se abre y cierra con
  «✦ Zaelyn» en la barra. En pantallas de 1100 px o más **empuja** el
  contenido (no lo tapa), para ver el tablero cambiar mientras se le habla.
  Se queda abierto al cambiar de página (`localStorage`). En el teléfono ocupa
  la pantalla. Ya no hay botón flotante.
- Las conversaciones con personas viven **abajo, en ventanitas** (como
  Messenger) en computadora y tablet: «💬 Mensajes» con el total de no leídos
  abre la lista; cada conversación abre una ventana. Caben **3 abiertas**
  (1 por debajo de 1200 px); las demás quedan minimizadas como pestañas con su
  nombre y no leídos. Si alguien escribe en una conversación cerrada, su
  pestaña aparece sola. Se acomodan a la izquierda del panel de Zaelyn.
- En el **teléfono**, la pestaña Mensajes es como WhatsApp: lista a pantalla
  completa con iniciales, último mensaje, hora y no leídos; la conversación se
  abre encima, tapando la barra. **Zaelyn va fija hasta arriba** de la lista
  como un chat más.
- La conversación es un solo componente (`Conversacion.tsx`) que usan la
  bandeja y las ventanitas: misma lógica, mismas reglas de @zaelyn (#230).

**Alternativa descartada.** Ventanas ilimitadas: con el panel de Zaelyn abierto
no caben más de 3 en una laptop sin taparse; más allá se minimizan. El panel
encima del contenido (sin empujar): tapaba justo lo que Zaelyn acababa de cambiar.
