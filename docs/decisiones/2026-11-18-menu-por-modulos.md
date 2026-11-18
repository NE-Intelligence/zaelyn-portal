# La barra lateral es un árbol de módulos

**Fecha:** 2026-11-18 · **Frente:** portal

**Contexto.** JJR no entendía la barra lateral:
- Personal se veía como un grupo;
- Familia, Grupos y Proyectos parecían módulos con espacios adentro, pero el título no llevaba a ningún lado;
- no se encontraba PMO;
- «Módulos» solo tenía Kore y TCGBusters;
- «Chat» sobraba, porque el panel de Zaelyn ya está a un toque.

**Decisión.** Un solo patrón para todo lo que se contrata:

```
Inicio
MÓDULOS
  Personal
  Familia      ▸ cada familia
  Profesional  ▸ cada grupo de trabajo
  PMO          ▸ cada proyecto
  Kore · TCGBusters (de /portal/modulos)
CUENTA
  Plan y uso · Configuración · Admin
```

- Cada módulo tiene su ícono y lleva a su tablero:
  - Personal → `/app/personal`;
  - Familia → `/app/familia`;
  - PMO → `/app/proyectos`, que ahora se titula «PMO · tus proyectos»;
  - Profesional → su primer grupo, porque todavía no hay tablero propio.
- **Los espacios cuelgan con sangría y una línea guía.** Son una familia por familia (sí puede haber más de una) y un grupo o un proyecto por cada uno. Cada módulo se pliega con su flecha y el portal recuerda cómo lo dejaste.
- **Lo que el plan no trae se ve con candado** y lleva a Plan y uso. Si alguien tiene espacios del módulo por invitación, se ven aunque su plan no lo traiga.
- **Sale «Chat».** El perfil se abre desde el nombre de abajo.

**Alternativa descartada.** Títulos de sección con los espacios debajo: se leían como módulos que no se podían abrir.
