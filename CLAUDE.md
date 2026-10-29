@AGENTS.md

# zaelyn-portal — configuración de proyecto

El sitio público de **zaelyn.ai** y el portal de proyectos de Zaelyn. Antes de
tocar código, lee `README.md` (los dos registros de marca, las rutas y cómo
entra alguien) y `AGENTS.md` (esta versión de Next.js cambia APIs).

## Canal — dónde vive y a dónde escribe este repo

Estándar NE Producto (`docs/DECISIONS.md`, NE-0001). Esto se verifica antes de cualquier escritura.

| Qué | Valor |
|---|---|
| Repositorio | `NE-Intelligence/zaelyn-portal` — rama `main` |
| Supabase | **No aplica directo.** El portal no tiene cliente de Supabase ni toca la base: le pregunta a Zaelyn por HTTP (`ZAELYN_API`). Los datos viven en el proyecto de Zaelyn, `ne-botia` (ref `uzukxopnxpruzkcfmcrh`), y solo Zaelyn escribe ahí |
| Despliegue | Vercel, proyecto `zaelyn-portal`, dominio `zaelyn.ai`. No hay `vercel.json`: la configuración vive en el proyecto de Vercel |
| API de la que depende | `ZAELYN_API` → hoy `https://ne-botios-staging.fly.dev` (repo `NE-Intelligence/Zaelyn`) |

### Stack real detectado

- Next.js **16.2.1** con App Router (`app/(sitio)`, `app/(portal)`, `app/admin`, `app/api`), React 19, TypeScript estricto.
- Estilos: CSS propio con tokens (`app/sitio.css`, `app/portal.css`…), **sin Tailwind ni shadcn**.
- Reportes: `@react-pdf/renderer` (PDF) y `pptxgenjs` (PowerPoint).
- Sin base de datos, sin Supabase Auth: la identidad es la cuenta de Telegram/WhatsApp; se entra con un pase de un solo uso emitido por Zaelyn.
- Node: no hay `engines` en `package.json`; `@types/node ^20`.

**Desviaciones del estándar NE DevIA** (Node 20, Next.js 14+ App Router, cliente Supabase sin ORM, Tailwind + shadcn, Supabase Auth, Fly/Vercel, Anthropic):
sin Tailwind ni shadcn (CSS propio con tokens, decisión de marca descrita en `README.md`); sin Supabase ni Supabase Auth (por diseño: el portal solo lee de la API de Zaelyn); sin llamadas a Anthropic (las hace Zaelyn). Además `package.json` se llama `verif` y no declara `engines`.

### Comandos (de `package.json`)

| Para | Comando |
|---|---|
| Instalar | `npm ci` |
| Desarrollo | `npx next dev` (no hay script `dev`) |
| Build | `npm run build` |
| Tipos | `npx tsc --noEmit` (no hay script) |
| Pruebas / lint | No existen scripts de `test` ni de `lint` |

### Reglas de canal (no negociables)

- Nunca escribir en otro repositorio ni en otro proyecto de Supabase. Este repo no escribe en ninguna base: si algo lo necesita, va por la API de Zaelyn y se cambia en `NE-Intelligence/Zaelyn`.
- Todo cambio entra por **pull request a `main`**; nunca push directo a `main`. JJR valida en el preview de Vercel del PR.
- Las migraciones de Supabase solo existen como archivos versionados en el repo que es dueño de la base (`NE-Intelligence/Zaelyn`, `supabase/migrations/`); nunca a mano desde la consola.
- Nunca se commitean secretos; inventario en `docs/SECRETOS.md`.
- Cada PR dice **qué** cambia y **por qué** (`.github/PULL_REQUEST_TEMPLATE.md`).
