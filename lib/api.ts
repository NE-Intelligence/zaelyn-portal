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
import type { GrupoEnPortal, VistaDePlan } from './plan'

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
