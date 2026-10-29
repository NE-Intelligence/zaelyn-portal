# Varias conversaciones a la vez sin pisarse

**Fecha:** 2026-10-29 · **Frente:** método (todos los repos de NE)

**Contexto.** JJR trabaja varios frentes del mismo repo a la vez, cada uno en su
conversación. El 29 oct 2026 dos conversaciones de Zaelyn tomaron la misma
decisión #228 y el mismo consecutivo de migración 094, y cada PR chocaba con el
anterior en `DECISIONS.md` y `HANDOFF.md`, porque todas escribían al final del
mismo archivo y numeraban sumando uno al último que vieron.

**Decisión.**
- Una decisión por archivo en `docs/decisiones/AAAA-MM-DD-tema.md`; `docs/DECISIONS.md` queda como archivo histórico.
- El estado del trabajo, un archivo por frente en `docs/estado/`; `docs/HANDOFF.md` queda como foto al 29 oct 2026.
- La versión de una migración es la hora UTC real al crearla.
- El CI rechaza entradas nuevas en los dos archivos históricos y migraciones con la misma versión, diciendo cómo corregirlo.
- Si un PR choca con `main`, auto-integrar lo comenta en el PR para que la conversación dueña lo resuelva.

**Alternativa descartada.** Una sola conversación por repo a la vez: no choca, pero frena a JJR, que quiere avanzar varios frentes en paralelo.
