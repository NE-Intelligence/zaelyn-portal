# BACKLOG — pendientes del portal (zaelyn.ai)

**Actualizado:** 2026-10-29

Una línea por pendiente: etiqueta, qué, y entre paréntesis la fuente y la fecha.
`[producto]` lo decide el dueño · `[técnico]` se construye · `[operación]` se
hace en una consola o con un tercero. **(dueño)** = solo lo puede hacer él.

Este repo es público. Los pendientes de seguridad del portal se llevan en el
backlog privado del motor (`NE-Intelligence/Zaelyn`, `docs/BACKLOG.md`,
sección «Primero: seguridad y blindaje»); van antes que todo lo de abajo. Las
decisiones de producto del portal están en `NE-Intelligence/Zaelyn`,
`docs/DECISIONS.md` (marca y contenido: #222) y el contexto general en
`docs/PRODUCTO.md` de ese repo.

## Operación

- [operación] **(dueño)** Llenar los `[FALTA]` de `lib/legal/` (domicilio de NE México, correo de privacidad, proveedor de transcripción de voz, ciudad de jurisdicción) y pasar los textos por un abogado; hoy se publican con los huecos a la vista. (reorganización, 23 oct; auditoría, 25 oct 2026)
- [operación] **(dueño)** Pasar el proyecto de Vercel `zaelyn-portal` a un plan que permita uso comercial (Hobby no lo permite y el portal ya cobra). (auditoría de infraestructura, 20 oct 2026)
- [operación] **(dueño)** Borrar del proyecto de Vercel los secretos del bot anterior que el código ya no lee. (22 oct 2026)
- [operación] **(dueño)** Confirmar el correo de contacto público (el `.env.example` viejo sugería `hola@zaelyn.ai`; no se sabe si existe). (22 oct 2026)

## Producto y marca

- [producto] **(dueño)** Logotipo en vector y versión para fondo claro; hoy solo hay raster blanco sobre negro. (21–23 oct 2026)
- [producto] Traducciones completas a inglés y portugués; hoy el español está completo y los otros dos listos para llenar. (22–23 oct 2026)
- [producto] Fotos en Familia (logros, eventos) en espera de la decisión sobre fotos de menores. (23 oct 2026)

## Técnico

- [técnico] `TASTE_SKILL.md` dice «Tailwind para el 90%» y el portal decidió no usar Tailwind: actualizarlo o retirarlo. (22 oct 2026)
- [técnico] Vista «esperando resolución» para prórrogas y cesiones (hoy solo aparecen en la bitácora; resolver sigue siendo solo por chat). (22–27 oct 2026)
- [técnico] Personal: memoria/búsqueda y «tu semana». (23 oct 2026)
- [técnico] `README.md`: la tabla de rutas está corta (faltan `/precios`, `/nosotros`, `/legal`, `/empezar`, `/demo/familia`, `/demo/personal`, `/app/f/…`, `/app/personal`, `/app/plan`, `/app/horas`, `/admin`). (28 oct 2026)
