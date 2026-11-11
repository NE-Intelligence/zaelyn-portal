# El Inicio es la vista de ejecución

**Fecha:** 2026-11-11 · **Frente:** portal

**Contexto.** El Inicio enseñaba tres tarjetas (Personal, Familia, PMO) con una cifra cada una y no decía qué hacer. JJR lo quiere como la foto operativa de la persona: qué tiene que hacer hoy, venga de donde venga (personal, familia, proyectos, apps), en una lista priorizada, en tarjetas o en calendario, marcar como hecho, ver lo de los hijos, recordatorios, eventos y cumpleaños, y que todo sea conversacional. También notó que Zaelyn dentro del portal no se ve igual que la app.

**Decisión.**
- `/app` (y `/demo/inicio`) es **una sola lista de todo lo que hay que hacer**, con tres formas de verla:
  - **Lista:** agrupada en Se te pasó · Hoy · Mañana · Esta semana · Más adelante · Sin fecha.
  - **Tarjetas:** una por espacio.
  - **Semana:** siete columnas.

  Se filtra por Personal, Familia, Proyectos y Apps.
- **De dónde sale:** `GET /portal/agenda` (la misma agenda de la app, 14 días) más lo que solo trae `/portal/persona`:
  - lo vencido;
  - los encargos de la casa;
  - el calendario de fuera;
  - los avisos.

  Al lado se ven la agenda de hoy, la casa (`/portal/familia/<g>`: quién lleva y quién recoge), las fechas que vienen, los hábitos, los proyectos y las apps (`/portal/modulos`).
- **Tocar una cosa (o su círculo) la abre con Zaelyn** (`POST /portal/chat/abrir`): su tarjeta trae Completada, Fechas, Posponer o Cancelar. Marcar, mover o borrar es lo mismo en el portal, en la app y en Telegram. La barra «Dile a Zaelyn» manda la frase a la conversación.
- **El orden** es una regla de presentación sobre lo que el motor ya midió: vencido, luego por día y hora, y lo hecho al final. No se inventan prioridades.
- **Zaelyn en el portal = la app:** la columna usa `app.zaelyn.ai?embebido=1` cuando existe `ZAELYN_APP_URL`. Al cargar y en cada cambio, el portal le manda `portal:apariencia { tema, paleta }` para que se pinte igual.

**Pedidos al Core** (no se simulan en el portal):
1. Marcar como hecho sin pasar por la tarjeta: `POST /portal/agenda/estado { tipo, id, estatus }`.
2. Orden propio de la persona («sube esto primero»), guardado y devuelto en la agenda.
3. Listas y hobbies como datos.
4. Lo pendiente dentro de las apps (pedido por enviar en TCGBusters, rutina en Kore) como renglones de la agenda con espacio `app`.

**Alternativa descartada.** Que el portal marque estatus por su cuenta o guarde el orden en el navegador: rompe «el portal no calcula ni escribe», y el teléfono vería otra cosa.
