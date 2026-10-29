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

## P-0001 · Blindaje del portal antes de abrir el chat (fase 0)

**Fecha:** 2026-10-29

**Contexto.** El chat y la voz dentro del portal (fase 1) convierten al portal
en un lugar desde el que se ejecutan acciones. La auditoría del 25 oct dejó
abiertos, en el portal, una ejecución remota crítica en Next 16.2.1, un POST
de canje sin revisar origen (fijación de sesión), sin CSP, una redirección
abierta en `/idioma` y errores 500 del motor llegando tal cual al navegador.

**Decisión.**
- Next 16.4.3. `image-size` (dependencia de `pptxgenjs` que el código ni
  carga) forzado a 2.0.4 con `overrides`.
- `proxy.ts`: TODO método que no sea de lectura exige mismo origen
  (`Origin`, o `Sec-Fetch-Site` si no hay `Origin`). Una regla en un lugar,
  en vez de una revisión por ruta que alguna olvida.
- CSP con nonce por petición (todas las páginas ya eran dinámicas):
  scripts solo con nonce, `connect-src 'self'`, `frame-ancestors 'none'`.
  Estilos con `'unsafe-inline'` porque los componentes usan `style={…}`.
  HSTS, nosniff, `X-Frame-Options`, `Permissions-Policy` (micrófono solo
  del propio sitio).
- `/idioma` compara el ORIGEN ya resuelto, no el texto.
- Un 5xx del motor llega al navegador como `{ error: 'CAIDO' }`.
- `lib/contrato.ts` comprueba en ejecución el plan que llega del motor.
- CI: `npm run typecheck`, `npm test` y `npm audit --audit-level=high`.

**Alternativa descartada.** CSP sin nonce con `'unsafe-inline'` en scripts:
deja pasar cualquier script inyectado, que es justo lo que la CSP debe
detener.

**Pendiente del motor.** El límite de peticiones a `/portal/editor/proponer`
vive en el motor (el portal en Vercel no tiene memoria compartida).

## P-0002 · El chat de Zaelyn dentro del portal (fase 1)

**Fecha:** 2026-10-29 · motor: Zaelyn DECISIONS #227

**Decisión.** Botón «Hablar con Zaelyn» en toda pantalla con sesión (nunca en
el ejemplo); en el teléfono ocupa la pantalla entera. Texto, botones y voz
(grabación con un toque, hasta 2 minutos). El navegador habla con
`app/api/chat/*` y este servidor reenvía al motor con la cookie como Bearer:
el token sigue sin llegar al JavaScript. Al llegar una respuesta, la página se
vuelve a pedir al servidor (`router.refresh()`): lo que se pidió por voz o por
texto se ve en el tablero con las cuentas del motor, y el portal sigue sin
calcular ni mutar nada. La conversación visible vive en `sessionStorage`; el
buzón del motor caduca en un día.

**Alternativa descartada.** Que el navegador hablara directo con el motor:
obligaba a darle el token al JavaScript de la página y a abrir CORS.
