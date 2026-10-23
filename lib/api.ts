/**
 * El cliente de Zaelyn. Corre SOLO en el servidor.
 *
 * ── POR QUÉ NO LLAMA EL NAVEGADOR ──────────────────────────────────────
 *
 * Porque el token de sesión viviría ahí. Una cookie `httpOnly` no la puede
 * leer ningún script, y como la petición sale del servidor de Next, el token
 * nunca entra al navegador: un XSS en esta página no se lleva la sesión, y no
 * hace falta CORS porque el navegador nunca habla con la API de Zaelyn.
 *
 * El precio es que todas las páginas del portal son de servidor. Es un precio
 * bajo: el portal solo muestra, no hay un solo control que escriba.
 */
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { GrupoEnPortal, VistaDePlan } from './plan'
import type { Abierto, Mesa, MisProyectos } from './editor/tipos'

/** La cookie donde vive la sesión. Solo la lee este servidor. */
export const COOKIE = 'zpt'
export const DIAS_SESION = 14

const base = (): string => {
  const u = process.env.ZAELYN_API
  if (!u) throw new Error('FALTA_ZAELYN_API')
  return u.replace(/\/+$/, '')
}

/** ¿Está configurada la API? Sin esto la pantalla lo dice en vez de tronar. */
export const hayApi = (): boolean => !!process.env.ZAELYN_API

export type Fallo = 'SIN_SESION' | 'NO_LO_ENCUENTRO' | 'SIN_API' | 'CAIDO'

/**
 * Una lectura de la API con la sesión puesta.
 *
 * `no-store` siempre: un plan es estado vivo, y una pantalla de proyecto que
 * sirve una copia de hace diez minutos sin decirlo es peor que una lenta.
 */
async function leer<T>(ruta: string): Promise<{ ok: true; dato: T } | { ok: false; fallo: Fallo }> {
  if (!hayApi()) return { ok: false, fallo: 'SIN_API' }
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return { ok: false, fallo: 'SIN_SESION' }
  try {
    const r = await fetch(`${base()}${ruta}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (r.status === 401 || r.status === 403) return { ok: false, fallo: 'SIN_SESION' }
    if (r.status === 404) return { ok: false, fallo: 'NO_LO_ENCUENTRO' }
    if (!r.ok) return { ok: false, fallo: 'CAIDO' }
    return { ok: true, dato: (await r.json()) as T }
  } catch {
    // Y se dice que la API no contesta, en vez de enseñar una pantalla vacía
    // que se lee como «no tienes nada».
    return { ok: false, fallo: 'CAIDO' }
  }
}

export const misGrupos = () => leer<{ grupos: GrupoEnPortal[] }>('/portal/grupos')

export type Bienvenida = {
  telegram: { usuario: string; enlace: string } | null
  whatsapp: { enlace: string } | null
}

/**
 * A qué chat mandar a quien no tiene sesión. SIN sesión, claro.
 *
 * ── POR QUÉ NO ESTÁ ESCRITO AQUÍ EL NOMBRE DEL BOT ─────────────────────
 *
 * Porque no está escrito en ninguna parte: sale del token de Telegram, que
 * vive en los secretos de Fly. Ponerlo a mano aquí sería copiarlo de
 * BotFather —ahí se cuela la errata que nadie revisa— y quedaría desfasado
 * el día que cambie. Zaelyn es lo único que sabe qué bot es, así que se lo
 * preguntamos.
 *
 * Si no contesta, se devuelve el hueco y la pantalla se queda con las
 * instrucciones escritas. Un botón roto es peor que ningún botón.
 */
let recordado: { en: number; datos: Bienvenida } | null = null

export async function bienvenida(): Promise<Bienvenida> {
  const vacia: Bienvenida = { telegram: null, whatsapp: null }
  if (!hayApi()) return vacia

  const UNA_HORA = 3_600_000
  if (recordado && Date.now() - recordado.en < UNA_HORA) return recordado.datos

  try {
    /**
     * ── UN FALLO NO SE GUARDA UNA HORA, Y ÉSE FUE EL DEFECTO ─────────────
     *
     * La primera versión pedía esto con `next: { revalidate: 3600 }`, y Next
     * cachea la respuesta SEA CUAL SEA: cuando el motor todavía no tenía la
     * ruta, el portal se guardó el 404 y siguió enseñando la pantalla sin
     * botón durante una hora **después** de que el motor ya estaba listo.
     * Desplegar dejaba de arreglar el síntoma, que es la peor clase de caché.
     *
     * Así que la petición no se cachea y el acierto sí: el nombre del bot no
     * cambia, pero un hueco tiene que poder llenarse en el siguiente intento.
     */
    const r = await fetch(`${base()}/portal/bienvenida`, { cache: 'no-store' })
    if (!r.ok) return vacia
    const datos = (await r.json()) as Bienvenida
    if (datos.telegram) recordado = { en: Date.now(), datos }
    return datos
  } catch {
    return vacia
  }
}

export const elPlan = (groupId: string, planId?: string) =>
  leer<VistaDePlan>(`/portal/grupo/${encodeURIComponent(groupId)}`
    + (planId ? `?plan=${encodeURIComponent(planId)}` : ''))

/** El canje del pase. No lleva sesión: ES la que la crea. */
export async function canjear(pase: string): Promise<
  { ok: true; token: string; expira: string; destino: string | null }
  | { ok: false; error: string }
> {
  if (!hayApi()) return { ok: false, error: 'SIN_API' }
  try {
    const r = await fetch(`${base()}/portal/canjear`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pase }),
      cache: 'no-store',
    })
    if (!r.ok) {
      const cuerpo = (await r.json().catch(() => ({}))) as { error?: string }
      return { ok: false, error: cuerpo.error ?? String(r.status) }
    }
    return { ok: true, ...(await r.json()) }
  } catch {
    return { ok: false, error: 'CAIDO' }
  }
}

export async function salir(): Promise<void> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token || !hayApi()) return
  await fetch(`${base()}/portal/salir`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  }).catch(() => {})
}

// ─────────────────────────────────────────────── el editor de proyectos (#174)

export const mesaDelEditor = (groupId: string) =>
  leer<Mesa>(`/portal/editor/grupo/${encodeURIComponent(groupId)}`)

export const docDelEditor = (id: string) =>
  leer<Abierto>(`/portal/editor/doc/${encodeURIComponent(id)}`)

/**
 * Una ESCRITURA del editor, reenviada tal cual a Zaelyn con la sesión puesta.
 *
 * La llama la ruta `app/api/editor/[accion]` —el navegador habla con este
 * servidor, nunca con Zaelyn—. Devuelve el código y el cuerpo de Zaelyn sin
 * interpretarlos: quien decide si un documento es válido es el motor.
 */
export type AccionEditor =
  | 'guardar' | 'baja' | 'proponer' | 'mios'
  | 'liberar-vista' | 'liberar' | 'grupo-crear' | 'persona' | 'invitar'
  | 'reabrir' | 'reorganizar' | 'plan-comprar'
  | 'org-crear' | 'org-invitar' | 'org-unirse' | 'org-quitar' | 'org-editar' | 'org-etiquetar' | 'org-comprar'
  | 'fiscal' | 'codigo' | 'invitaciones'

/** A qué ruta de Zaelyn va cada acción. Lista cerrada: no es un proxy abierto. */
function rutaDe(accion: AccionEditor, cuerpo: Record<string, unknown>): { metodo: 'GET' | 'POST'; ruta: string } | null {
  const g = typeof cuerpo['groupId'] === 'string' ? encodeURIComponent(cuerpo['groupId']) : ''
  switch (accion) {
    case 'plan-comprar': return { metodo: 'POST', ruta: '/portal/plan/comprar' }
    case 'fiscal': return { metodo: 'POST', ruta: '/portal/fiscal' }
    case 'codigo': return { metodo: 'POST', ruta: '/portal/codigo' }
    case 'invitaciones': return { metodo: 'POST', ruta: '/portal/invitaciones' }
    case 'org-crear': case 'org-invitar': case 'org-unirse': case 'org-quitar':
    case 'org-editar': case 'org-etiquetar': case 'org-comprar':
      return { metodo: 'POST', ruta: `/portal/organizacion/${accion.slice(4)}` }
    case 'guardar': case 'baja': case 'proponer': case 'reabrir': case 'reorganizar':
      return { metodo: 'POST', ruta: `/portal/editor/${accion}` }
    case 'mios': return { metodo: 'GET', ruta: '/portal/editor/mios' }
    case 'liberar-vista': return { metodo: 'POST', ruta: '/portal/editor/liberar/vista' }
    case 'liberar': return { metodo: 'POST', ruta: '/portal/editor/liberar' }
    case 'grupo-crear': return { metodo: 'POST', ruta: '/portal/grupos/crear' }
    case 'persona': return g ? { metodo: 'POST', ruta: `/portal/grupo/${g}/persona` } : null
    case 'invitar': return g ? { metodo: 'POST', ruta: `/portal/grupo/${g}/invitar` } : null
  }
}

/**
 * Una ESCRITURA del editor, reenviada a Zaelyn con la sesión puesta.
 *
 * La llama la ruta `app/api/editor/[accion]` —el navegador habla con este
 * servidor, nunca con Zaelyn—. Devuelve el código y el cuerpo de Zaelyn sin
 * interpretarlos: quien decide si algo es válido es el motor.
 */
export async function escribirEditor(
  accion: AccionEditor, cuerpo: string,
): Promise<{ status: number; cuerpo: string }> {
  if (!hayApi()) return { status: 503, cuerpo: JSON.stringify({ error: 'SIN_API' }) }
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return { status: 401, cuerpo: JSON.stringify({ error: 'SIN_SESION' }) }
  let datos: Record<string, unknown> = {}
  try { datos = cuerpo ? JSON.parse(cuerpo) as Record<string, unknown> : {} } catch { return { status: 400, cuerpo: JSON.stringify({ error: 'INVALIDO' }) } }
  const destino = rutaDe(accion, datos)
  if (!destino) return { status: 400, cuerpo: JSON.stringify({ error: 'INVALIDO' }) }
  try {
    const r = await fetch(`${base()}${destino.ruta}`, {
      method: destino.metodo,
      headers: { authorization: `Bearer ${token}`, ...(destino.metodo === 'POST' ? { 'content-type': 'application/json' } : {}) },
      ...(destino.metodo === 'POST' ? { body: cuerpo } : {}),
      cache: 'no-store',
      // La propuesta del modelo tarda; el resto contesta en segundos.
      signal: AbortSignal.timeout(accion === 'proponer' ? 150_000 : 30_000),
    })
    return { status: r.status, cuerpo: r.status === 204 ? '' : await r.text() }
  } catch {
    return { status: 502, cuerpo: JSON.stringify({ error: 'CAIDO' }) }
  }
}

/** La semana de una familia, ya medida por Zaelyn (#183). */
export const laFamilia = (groupId: string) =>
  leer<import('@/lib/familia').EstadoDeFamilia>(`/portal/familia/${encodeURIComponent(groupId)}?dias=14`)

export const misProyectos = () => leer<MisProyectos>('/portal/editor/mios')
export const planYUso = () => leer<import('@/lib/plan-uso/tipos').VistaPlan>('/portal/plan')
export const participaciones = () => leer<import('@/lib/plan-uso/tipos').VistaParticipaciones>('/portal/participaciones')
export const organizacion = () => leer<{ organizacion: import('@/lib/plan-uso/tipos').VistaOrganizacion | null; cobro: boolean }>('/portal/organizacion')

/**
 * Dónde estoy parado, en todos mis grupos (#184).
 *
 * Va aparte de `leer` por una sola respuesta: el 402. Kickoff tiene todo esto
 * en el chat y el portal Personal es de Sprint en adelante, así que «no lo
 * tienes en tu plan» es una respuesta normal —con su pantalla—, no un fallo.
 */
export async function yoMismo(dias = 7): Promise<
  | { ok: true; dato: import('@/lib/persona').EstadoDePersona }
  | { ok: false; fallo: Fallo }
  | { ok: false; fallo: 'SIN_PLAN'; plan: { clave: string; nombre: string } }
> {
  if (!hayApi()) return { ok: false, fallo: 'SIN_API' }
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return { ok: false, fallo: 'SIN_SESION' }
  try {
    const r = await fetch(`${base()}/portal/persona?dias=${dias}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (r.status === 402) {
      const j = (await r.json().catch(() => ({}))) as { plan?: { clave: string; nombre: string } }
      return { ok: false, fallo: 'SIN_PLAN', plan: j.plan ?? { clave: 'free', nombre: 'Zaelyn Kickoff' } }
    }
    if (r.status === 401 || r.status === 403) return { ok: false, fallo: 'SIN_SESION' }
    if (r.status === 404) return { ok: false, fallo: 'NO_LO_ENCUENTRO' }
    if (!r.ok) return { ok: false, fallo: 'CAIDO' }
    return { ok: true, dato: (await r.json()) as import('@/lib/persona').EstadoDePersona }
  } catch {
    return { ok: false, fallo: 'CAIDO' }
  }
}

// ──────────────────────────────────────────── administración (#186)

/**
 * ¿Quien tiene la sesión es administrador de Zaelyn?
 *
 * Lo decide el motor (tabla `administradores`), no el portal: aquí no hay
 * lista de correos ni de identificadores. Sin sesión ni se pregunta. Se
 * memoriza por petición con `cache` porque la barra y la página lo piden.
 */
export const soyAdmin = cache(async (): Promise<boolean> => {
  if (!(await cookies()).get(COOKIE)?.value) return false
  const r = await leer<{ admin: boolean }>('/portal/admin/soy')
  return r.ok && r.dato.admin === true
})

export const tableroAdmin = (desde?: string, hasta?: string) => {
  const q = new URLSearchParams()
  if (desde) q.set('desde', desde)
  if (hasta) q.set('hasta', hasta)
  const s = q.toString()
  return leer<import('@/lib/admin/tipos').TableroAdmin>(`/portal/admin/tablero${s ? `?${s}` : ''}`)
}
