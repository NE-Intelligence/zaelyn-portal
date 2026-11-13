# El portal y las landings por planes y módulos

**Fecha:** 2026-11-13 · **Frente:** portal

**Contexto.** El Core cambió los planes y los ámbitos (Core: `docs/decisiones/2026-11-13-planes-por-ambito.md`, PR #66–#72):
- Planes: Zaelyn Personal (gratis), Personal+ 7.99, Familia 14.99, Profesional 19.99 y PMO 49.99.
- PMO pasa a ser un módulo que incluye Profesional y Personal+.
- Ámbitos con nombre propio: Metas, Familia, Grupo y Proyecto.
- WhatsApp sale de la venta.

JJR pidió aplicarlo sin tocar el diseño: solo contenido, organización y landings por plan y módulo. Las instrucciones vienen en `specs/portal-rediseno-planes-y-landings.md` del Proyecto.

**Decisión.**
- **Vocabulario.** Kickoff, Sprint y Tribu desaparecen de la interfaz, y WhatsApp sale de landings, precios y «Plan y uso». La prueba es de 15 días con Personal+. A quien ya paga, el portal le muestra lo que dice `/portal/plan`.
- **Precios.** Un solo archivo, `lib/planes.ts` (lista `2026-11`, neto en USD + IVA). Se borró `lib/precios.ts`.
- **Landings**, todas con la misma piel:
  - `/` general.
  - `/personal`, `/personal-plus`, `/familia`, `/profesional` y `/pmo`, con la misma estructura: qué es, objetivo, cuatro beneficios con su teléfono, ventajas, precio con restricciones y cómo contratar.
  - `/modulos` y `/precios` (en ramas, no en escalera).
  - `/proyectos` redirige con 301 a `/pmo`.
  - Los ejemplos son inventados: familia «Ríos», «Subestación Andes».
- **Contratar.** El CTA lleva a `/empezar?plan=X`, de ahí a «Entrar y contratar» en `/app/plan?plan=X`, y de ahí a Stripe. Al cancelar con descuento de fundador, el aviso sale en grande.
- **Menú del portal:**
  - Inicio · Chat · Personal;
  - una entrada por Familia, por Grupo y por Proyecto;
  - Módulos;
  - Cuenta: Plan y uso · Configuración · Perfil · Organización · Admin.

  Lo apagado se ve con candado y «Lo trae …» (`/portal/acceso`).
- **Dashboard integral.** Tiene cuatro vistas: Tableros (de entrada), Calendario (semana y mes), Lista y Kanban. La vista elegida se recuerda en el navegador. Filtros: espacio con su nombre, tipo, fecha y estado. Arriba van los chips de lo contratado y los «+ Nuevo», que ponen la frase en «Dile a Zaelyn». En un Grupo nunca se pinta el avance de otros.

**Lo que NO se hizo, y por qué.**
- **El 3D y el estilo Cristal se quedan.** La instrucción del Core decía «nada de 3D en el portal», pero JJR pidió no tocar el diseño.
- **No se agregó el render de laptop** del hero general: sería un elemento visual nuevo.
- **Metas no tiene pantalla propia.** Falta el contrato de `/portal/proyectos-personales` en este repo; mientras, Metas vive en «Personal y Metas».
- **Sin resumen por módulo.** El Core no expone un endpoint de resumen; el tablero del módulo dice el estado y lleva a «Abrir en el chat».
- **`/precios` y las landings nuevas, solo en español.**

**Preguntas abiertas para JJR** (de la instrucción del Core):
- ¿Pago anual para todos los planes o solo para PMO?
- ¿Cupones de fundador para Profesional?
- URLs definitivas de los documentos legales: hoy apuntan a `/legal/*`.
