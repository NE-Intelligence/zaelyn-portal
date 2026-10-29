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
import { faltasDePlan } from './contrato'
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

// ── la sección General y los reportes (#202) ───────────────────────────────

export type TipoContacto = 'sponsor' | 'cliente' | 'equipo' | 'otro'
export type Contacto = { tipo: TipoContacto; nombre: string; rol: string; empresa: string; email: string; telefono: string }
export type ClaveDeFacturacion = { tipo: 'fase' | 'grupo' | 'actividad'; tramo: Array<string | null> | null; pendienteId: string | null; nombre: string; concepto: string }
export type Ficha = {
  cliente: string; sponsor: string; liderProyecto: string; objetivo: string; alcance: string; descripcion: string
  contactos: Contacto[]; facturacion: ClaveDeFacturacion[]; publicarCliente: boolean
}
export type VistaDeFicha = { ficha: Ficha; logos: { sponsor: boolean; cliente: boolean }; puede: boolean }
export type TipoReporte = 'kickoff' | 'semanal' | 'fase_inicio' | 'fase_cierre' | 'golive' | 'cierre' | 'facturacion'
export type Ritmo = 'hecho' | 'atrasado' | 'riesgo' | 'bien' | 'futuro'
export type ActividadDeReporte = { texto: string; quien: string | null; tramo: string; inicia: string | null; vence: string | null; real: number; esperado: number | null; fecha: string | null; diasTarde: number }
export type Textos = { resumen: string; logros: string; causas: string; acciones: string; siguientes: string; comentarios: string }
export type DatosDeReporte = {
  folio: string; tipo: TipoReporte; titulo: string; emitido: string; emitidoPor: string; hoy: string
  periodo: { desde: string; hasta: string }
  proyecto: { nombre: string; grupo: string; inicia: string | null; termina: string | null; fase: string | null }
  ficha: Ficha
  avance: { real: number; esperado: number | null; comprobado: number; veredicto: 'sin_fechas' | 'atrasado' | 'al_dia' | 'adelantado'; cerradas: number; total: number; base: 'minutos' | 'duracion' | 'cantidad'; pesoSoporte: number | null }
  lectura: Array<{ tono: 'bien' | 'atencion' | 'falta'; titulo: string; texto: string }>
  arbol: Array<{ nombre: string; nivel: number; tipo: 'fase' | 'grupo'; real: number; esperado: number | null; cerradas: number; total: number; vence: string | null; ritmo: Ritmo }>
  realizado: ActividadDeReporte[]; siguiente: ActividadDeReporte[]; atrasados: ActividadDeReporte[]
  hitos: Array<{ texto: string; vence: string | null; cumplido: boolean; tramo: string }>
  facturacion: Array<{ nombre: string; concepto: string; tipo: 'fase' | 'grupo' | 'actividad'; estado: 'cumplido' | 'en_curso' | 'pendiente'; real: number; cerradas: number; total: number; fecha: string | null; minutos: number }>
  minutosPeriodo: number | null
  textos: Textos
}
export type ReporteEnLista = { id: string; folio: string; tipo: TipoReporte; titulo: string; emitido: string; emitidoPor: string; periodo: { desde: string; hasta: string }; real: number }

const ids = (g: string, p: string) => `${encodeURIComponent(g)}/${encodeURIComponent(p)}`
export const fichaDelPlan = (g: string, p: string) => leer<VistaDeFicha>(`/portal/ficha/${ids(g, p)}`)
export const reportesDelPlan = (g: string, p: string) => leer<ReporteEnLista[]>(`/portal/reportes/${ids(g, p)}`)
export const reporteDelPlan = (g: string, p: string, id: string) => leer<DatosDeReporte>(`/portal/reportes/${ids(g, p)}/${encodeURIComponent(id)}`)
export const todosLosReportes = (g: string, p: string) => leer<DatosDeReporte[]>(`/portal/reportes/${ids(g, p)}/todos`)

/**
 * Un archivo generado aquí, al chat de Telegram de quien tiene la sesión
 * (#208). El navegador de Telegram abre los PDF en la página y no deja
 * guardarlos; en el chat sí.
 */
export async function enviarAlChat(datos: ArrayBuffer | Uint8Array, nombre: string, pie: string): Promise<'OK' | 'SIN_TELEGRAM' | 'SIN_SESION' | 'FALLO'> {
  if (!hayApi()) return 'FALLO'
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return 'SIN_SESION'
  try {
    const r = await fetch(`${base()}/portal/enviar-archivo`, {
      method: 'POST', cache: 'no-store',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ base64: Buffer.from(datos instanceof Uint8Array ? datos : new Uint8Array(datos)).toString('base64'), nombre, pie }),
    })
    if (r.ok) return 'OK'
    if (r.status === 401 || r.status === 403) return 'SIN_SESION'
    const j = (await r.json().catch(() => ({}))) as { error?: string }
    return j.error === 'SIN_TELEGRAM' ? 'SIN_TELEGRAM' : 'FALLO'
  } catch {
    return 'FALLO'
  }
}

/** Un logo del proyecto, en bytes, con la sesión puesta. Null si no hay. */
export async function logoDelPlan(g: string, p: string, cual: 'sponsor' | 'cliente'): Promise<{ mime: string; datos: ArrayBuffer } | null> {
  if (!hayApi()) return null
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  try {
    const r = await fetch(`${base()}/portal/ficha/${ids(g, p)}/logo/${cual}`, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!r.ok) return null
    return { mime: r.headers.get('content-type') ?? 'image/png', datos: await r.arrayBuffer() }
  } catch {
    return null
  }
}

export async function elPlan(groupId: string, planId?: string) {
  const r = await leer<VistaDePlan>(`/portal/grupo/${encodeURIComponent(groupId)}`
    + (planId ? `?plan=${encodeURIComponent(planId)}` : ''))
  if (!r.ok) return r
  // El contrato se comprueba antes de pintar (lib/contrato.ts). Si no cuadra,
  // la pantalla dice «no disponible» y el registro dice qué campo.
  const faltas = faltasDePlan(r.dato)
  if (faltas.length) {
    console.error(JSON.stringify({ evento: 'contrato.roto', ruta: '/portal/grupo', faltas: faltas.slice(0, 20) }))
    return { ok: false as const, fallo: 'CAIDO' as const }
  }
  return r
}

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
  | 'reabrir' | 'reorganizar' | 'plan-comprar' | 'plan-cancelar' | 'fiscal-solicitar'
  | 'org-crear' | 'org-invitar' | 'org-unirse' | 'org-quitar' | 'org-editar' | 'org-etiquetar' | 'org-comprar'
  | 'fiscal' | 'codigo' | 'invitaciones'
  | 'excel' | 'revisar'
  | 'horas' | 'horas-borrar' | 'horas-enviar' | 'horas-resolver' | 'horas-retirar'
  | 'presupuesto-tarifa' | 'presupuesto-monto'
  | 'ficha' | 'ficha-logo' | 'reporte-vista' | 'reporte-emitir'

/** A qué ruta de Zaelyn va cada acción. Lista cerrada: no es un proxy abierto. */
function rutaDe(accion: AccionEditor, cuerpo: Record<string, unknown>): { metodo: 'GET' | 'POST'; ruta: string } | null {
  const g = typeof cuerpo['groupId'] === 'string' ? encodeURIComponent(cuerpo['groupId']) : ''
  switch (accion) {
    case 'plan-comprar': return { metodo: 'POST', ruta: '/portal/plan/comprar' }
    case 'plan-cancelar': return { metodo: 'POST', ruta: '/portal/plan/cancelar' }
    case 'fiscal-solicitar': return { metodo: 'POST', ruta: '/portal/fiscal/solicitar' }
    case 'fiscal': return { metodo: 'POST', ruta: '/portal/fiscal' }
    case 'codigo': return { metodo: 'POST', ruta: '/portal/codigo' }
    case 'invitaciones': return { metodo: 'POST', ruta: '/portal/invitaciones' }
    case 'org-crear': case 'org-invitar': case 'org-unirse': case 'org-quitar':
    case 'org-editar': case 'org-etiquetar': case 'org-comprar':
      return { metodo: 'POST', ruta: `/portal/organizacion/${accion.slice(4)}` }
    case 'excel': case 'revisar':
    case 'guardar': case 'baja': case 'proponer': case 'reabrir': case 'reorganizar':
      return { metodo: 'POST', ruta: `/portal/editor/${accion}` }
    case 'mios': return { metodo: 'GET', ruta: '/portal/editor/mios' }
    case 'horas': return { metodo: 'POST', ruta: '/portal/horas' }
    case 'horas-borrar': return { metodo: 'POST', ruta: '/portal/horas/borrar' }
    case 'horas-enviar': return { metodo: 'POST', ruta: '/portal/horas/enviar' }
    case 'horas-resolver': return { metodo: 'POST', ruta: '/portal/horas/resolver' }
    case 'horas-retirar': return { metodo: 'POST', ruta: '/portal/horas/retirar' }
    case 'presupuesto-tarifa': return { metodo: 'POST', ruta: '/portal/presupuesto/tarifa' }
    case 'presupuesto-monto': return { metodo: 'POST', ruta: '/portal/presupuesto/monto' }
    case 'ficha': return { metodo: 'POST', ruta: '/portal/ficha' }
    case 'ficha-logo': return { metodo: 'POST', ruta: '/portal/ficha/logo' }
    case 'reporte-vista': return { metodo: 'POST', ruta: '/portal/reporte/vista' }
    case 'reporte-emitir': return { metodo: 'POST', ruta: '/portal/reporte/emitir' }
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
      signal: AbortSignal.timeout(accion === 'proponer' ? 150_000 : accion === 'excel' ? 60_000 : 30_000),
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

/**
 * Los lugares de fundador (#190). PÚBLICO: la página de precios lo pregunta
 * sin sesión. Si el motor no contesta, se dice que no hay tramo abierto —
 * prometer un descuento que no se va a aplicar es peor que no anunciarlo.
 */
export async function fundadores(): Promise<import('@/lib/plan-uso/tipos').Fundadores> {
  const cerrado = { abierto: false, tramo: null, quedan: 0 } as const
  if (!hayApi()) return cerrado
  try {
    const r = await fetch(`${base()}/portal/fundadores`, { cache: 'no-store' })
    if (!r.ok) return cerrado
    return (await r.json()) as import('@/lib/plan-uso/tipos').Fundadores
  } catch {
    return cerrado
  }
}

// ──────────────────────────────────────────── registro de horas (#191)

const consulta = (x: Record<string, string | undefined>) => {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(x)) if (v) q.set(k, v)
  return q.toString()
}

export const misHoras = (desde: string, hasta: string) =>
  leer<import('@/lib/horas').VistaHoras>(`/portal/horas?${consulta({ desde, hasta })}`)

/** El reporte de UN proyecto. 403 si no lo diriges: se distingue de «no existe». */
export async function horasDelProyecto(groupId: string, desde: string, hasta: string): Promise<
  | { ok: true; dato: import('@/lib/horas').ReporteProyecto }
  | { ok: false; fallo: Fallo | 'SIN_PERMISO' }
> {
  if (!hayApi()) return { ok: false, fallo: 'SIN_API' }
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return { ok: false, fallo: 'SIN_SESION' }
  try {
    const r = await fetch(`${base()}/portal/horas/proyecto/${encodeURIComponent(groupId)}?${consulta({ desde, hasta })}`, {
      headers: { authorization: `Bearer ${token}` }, cache: 'no-store',
    })
    if (r.status === 403) return { ok: false, fallo: 'SIN_PERMISO' }
    if (r.status === 401) return { ok: false, fallo: 'SIN_SESION' }
    if (r.status === 404) return { ok: false, fallo: 'NO_LO_ENCUENTRO' }
    if (!r.ok) return { ok: false, fallo: 'CAIDO' }
    return { ok: true, dato: (await r.json()) as import('@/lib/horas').ReporteProyecto }
  } catch {
    return { ok: false, fallo: 'CAIDO' }
  }
}

/**
 * Un Excel del motor, pasado tal cual al navegador. Solo las dos rutas de
 * horas: no es un proxy de descargas.
 */
export async function descargarHoras(
  cual:
    | { tipo: 'mias'; desde: string; hasta: string; groupId?: string }
    | { tipo: 'proyecto'; groupId: string; desde: string; hasta: string }
    | { tipo: 'envio'; id: string; formato: 'pdf' | 'xlsx' }
    | { tipo: 'aprobadas'; groupId: string; desde: string; hasta: string; formato: 'pdf' | 'xlsx' }
    | { tipo: 'presupuesto'; groupId: string },
): Promise<Response> {
  if (!hayApi()) return new Response('No disponible', { status: 503 })
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return new Response('Sin sesión', { status: 401 })
  const ruta = cual.tipo === 'mias'
    ? `/portal/horas/excel?${consulta({ desde: cual.desde, hasta: cual.hasta, groupId: cual.groupId })}`
    : cual.tipo === 'presupuesto'
      ? `/portal/presupuesto/${encodeURIComponent(cual.groupId)}?formato=xlsx`
    : cual.tipo === 'envio'
      ? `/portal/horas/envio/${encodeURIComponent(cual.id)}?formato=${cual.formato}`
      : cual.tipo === 'aprobadas'
        ? `/portal/horas/proyecto/${encodeURIComponent(cual.groupId)}/aprobadas?${consulta({ desde: cual.desde, hasta: cual.hasta, formato: cual.formato })}`
        : `/portal/horas/proyecto/${encodeURIComponent(cual.groupId)}?${consulta({ desde: cual.desde, hasta: cual.hasta, formato: 'xlsx' })}`
  try {
    const r = await fetch(`${base()}${ruta}`, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!r.ok) return new Response(r.status === 403 ? 'Solo quien dirige el proyecto' : 'No disponible', { status: r.status })
    return new Response(r.body, {
      headers: {
        'content-type': r.headers.get('content-type') ?? 'application/octet-stream',
        'content-disposition': r.headers.get('content-disposition') ?? 'attachment; filename="horas.xlsx"',
        'cache-control': 'no-store',
      },
    })
  } catch {
    return new Response('No disponible', { status: 502 })
  }
}

export type VerificacionHoras =
  | { valido: false }
  | { valido: true; folio: string; estado: string; desde: string; hasta: string; trabajoMin: number; disponibilidadMin: number; aprobadoEn: string }

/** Verificar un documento de horas aprobado. Sin sesión: lo puede abrir quien recibió el PDF. */
export async function verificarHoras(folio: string, huella: string): Promise<VerificacionHoras | null> {
  if (!hayApi()) return null
  try {
    const r = await fetch(`${base()}/portal/horas/verificar?${consulta({ folio, huella })}`, { cache: 'no-store' })
    if (r.status === 422) return { valido: false }
    if (!r.ok) return null
    return (await r.json()) as VerificacionHoras
  } catch {
    return null
  }
}

/** La foto de un avance para la tarjeta de Telegram (#200). Sin sesión: el token es la llave. */
export type FilaDeTarjeta = { nombre: string; nivel: number; fase: boolean; real: number; esperado: number | null; cerradas: number; total: number; hitos: number }
export type DatosDeTarjeta = {
  titulo: string; subtitulo: string; hoy: string
  veredicto: 'sin_fechas' | 'atrasado' | 'al_dia' | 'adelantado'
  real: number; esperado: number | null; comprobado: number; cerradas: number; total: number
  base: 'minutos' | 'duracion' | 'cantidad'; pesoSoporte: number | null; vence: string | null
  filas: FilaDeTarjeta[]; resto: number
}
export async function tarjetaDeAvance(token: string): Promise<DatosDeTarjeta | null> {
  if (!hayApi() || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  try {
    const r = await fetch(`${base()}/portal/tarjeta/${token}`, { cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as DatosDeTarjeta
  } catch {
    return null
  }
}

/** El presupuesto de UN proyecto (#195). Solo quien lo dirige; 403 se distingue de «no existe». */
export async function elPresupuesto(groupId: string): Promise<
  | { ok: true; dato: import('@/lib/presupuesto').EstadoPresupuesto }
  | { ok: false; fallo: Fallo | 'SIN_PERMISO' }
> {
  if (!hayApi()) return { ok: false, fallo: 'SIN_API' }
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return { ok: false, fallo: 'SIN_SESION' }
  try {
    const r = await fetch(`${base()}/portal/presupuesto/${encodeURIComponent(groupId)}`, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (r.status === 403) return { ok: false, fallo: 'SIN_PERMISO' }
    if (r.status === 401) return { ok: false, fallo: 'SIN_SESION' }
    if (r.status === 404) return { ok: false, fallo: 'NO_LO_ENCUENTRO' }
    if (!r.ok) return { ok: false, fallo: 'CAIDO' }
    return { ok: true, dato: (await r.json()) as import('@/lib/presupuesto').EstadoPresupuesto }
  } catch {
    return { ok: false, fallo: 'CAIDO' }
  }
}

// ── El chat del portal (fase 1, Zaelyn DECISIONS #227) ─────────────────
//
// El navegador habla con `app/api/chat/*` y ESTE servidor reenvía con la
// cookie convertida en Bearer: el token nunca llega al JavaScript de la
// página, igual que en el resto del portal.

/** Reenvía una petición del chat al motor. Devuelve código y cuerpo tal cual (salvo 5xx). */
export async function reenviarChat(
  ruta: '/portal/chat/mensaje' | '/portal/chat/voz' | '/portal/chat/recibir',
  init: { metodo: 'GET' | 'POST'; cuerpo?: BodyInit; tipo?: string; cabeceras?: Record<string, string>; consulta?: string },
): Promise<{ status: number; cuerpo: string }> {
  if (!hayApi()) return { status: 503, cuerpo: JSON.stringify({ error: 'SIN_API' }) }
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return { status: 401, cuerpo: JSON.stringify({ error: 'SIN_SESION' }) }
  try {
    const r = await fetch(`${base()}${ruta}${init.consulta ? `?${init.consulta}` : ''}`, {
      method: init.metodo,
      headers: {
        authorization: `Bearer ${token}`,
        ...(init.tipo ? { 'content-type': init.tipo } : {}),
        ...(init.cabeceras ?? {}),
      },
      ...(init.cuerpo !== undefined ? { body: init.cuerpo } : {}),
      cache: 'no-store',
      signal: AbortSignal.timeout(28_000),
    })
    // Un 5xx trae detalle del motor, que es para el registro y no para la
    // pantalla (fase 0).
    if (r.status >= 500) return { status: 502, cuerpo: JSON.stringify({ error: 'CAIDO' }) }
    return { status: r.status, cuerpo: r.status === 204 ? '' : await r.text() }
  } catch {
    return { status: 502, cuerpo: JSON.stringify({ error: 'CAIDO' }) }
  }
}
