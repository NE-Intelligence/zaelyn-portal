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

## NE-0002 · Las pruebas autorizan el merge: auto-integrar

**Fecha:** 2026-10-28

**Contexto.** Con NE-0001 todo entra por PR, pero el merge seguía esperando a
que una persona lo apretara (o lo autorizara por chat). Cada desarrollo
terminado se quedaba detenido hasta ese clic; el flujo era tan manual como
copiar el commit en la terminal.

**Decisión.** `.github/workflows/auto-integrar.yml`: cuando el CI de un PR a
`main` termina en verde, GitHub lo integra solo (squash) y borra la rama.
Las pruebas del CI son la autorización. No integra solo si el PR es
borrador, lleva la etiqueta `requiere-jjr`, tiene commits más nuevos que la
corrida verde, o trae una migración que borra datos (DROP TABLE / SCHEMA /
TYPE, DROP COLUMN, TRUNCATE, DELETE FROM): a ésa le pone `requiere-jjr` y
comenta las líneas.

**Alternativa descartada.** Un revisor con IA (Claude en GitHub Actions)
antes del merge: es un gasto mensual nuevo y JJR lo descartó. La revisión
contra el Decálogo la hace la sesión que escribe el código antes de abrir el
PR; el CI es la puerta.

**Consecuencia.** Lo que pase el CI llega a producción sin intervención. Por
eso el CI tiene que ser honesto: una prueba que se salta es una puerta
abierta.
