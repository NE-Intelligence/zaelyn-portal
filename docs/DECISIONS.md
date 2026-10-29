# zaelyn-portal — decisiones

Registro de solo agregar: nunca se reescribe una entrada; si una decisión
cambia, se agrega otra que la supersede.

Cada entrada lleva: **fecha**, **contexto**, **decisión** y **alternativa
descartada y por qué**. Una entrada por decisión, el mismo día en que se toma.
Las decisiones de producto que el portal comparte con el motor también están
en `NE-Intelligence/Zaelyn`, `docs/DECISIONS.md` (los números `#n` de los
commits remiten allá).

---

## NE-0001 · Estándar NE Producto: org NE-Intelligence, cambios solo por PR, GitHub como fuente de verdad de tareas

**Fecha:** 2026-10-28

**Contexto.** Los repos de producto se trabajaban desde copias locales en la
Mac y se subían con push directo a `main` (este repo está en la lista de
`scripts/auto-push.sh` de Zaelyn). Los tokens de GitHub por host se pisaban
entre proyectos y se perdía el acceso.

**Decisión.** Todos los repos de producto viven en la organización
`NE-Intelligence`. Los cambios entran solo por pull request a `main`. GitHub es
la fuente de verdad de las tareas. Cada repo declara su canal (repo exacto,
proyecto de Supabase y destino de despliegue) en `CLAUDE.md`.

**Alternativa descartada.** Trabajar desde copias locales en la Mac con push
manual, porque los tokens por host se pisaban entre proyectos y se perdía el
acceso.
