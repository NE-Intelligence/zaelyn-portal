'use client'
/**
 * Piezas chicas del editor: íconos por tipo, avatar, fechas cortas y el
 * cliente de escritura.
 */
import type { Doc, Nodo, PersonaDelEditor, TipoNodo } from '@/lib/editor/tipos'
import { SEGUIMIENTO_DICE } from '@/lib/editor/tipos'
import type { AccionEditor } from '@/lib/api'

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const ANO = new Date().getFullYear()

export function corta(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [a, m, d] = iso.split('-').map(Number)
  if (!a || !m || !d) return '—'
  return `${d} ${MES[m - 1]}${a !== ANO ? ` ${String(a).slice(2)}` : ''}`
}

export const mesCorto = (m: number) => MES[m] ?? ''

export function iniciales(nombre: string): string {
  const limpio = nombre.replace(/^@/, '').trim()
  const partes = limpio.split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase()
  return (partes[0]![0]! + partes[1]![0]!).toUpperCase()
}

/** Color estable por persona, de la paleta de grupos del sistema. */
export function tono(id: string): string {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return `var(--grp-${(h % 6) + 1})`
}

export function Avatar({ p, chico = false }: { p: PersonaDelEditor | undefined; chico?: boolean }) {
  if (!p) return null
  return (
    <span className={`ed-avatar${chico ? ' chico' : ''}`} style={{ background: tono(p.id) }} title={p.nombre}>
      {iniciales(p.nombre)}
    </span>
  )
}

/** Íconos de trazo, uno por tipo. Mismo grosor, mismo tamaño. */
export function IconoTipo({ tipo }: { tipo: TipoNodo }) {
  const c = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className="ed-icono" aria-hidden="true">
      {tipo === 'fase' && <><rect x="3" y="5" width="18" height="14" rx="3" {...c} /><path d="M3 10h18" {...c} /></>}
      {tipo === 'sprint' && <><path d="M20 12a8 8 0 1 1-2.3-5.6" {...c} /><path d="M20 4v4h-4" {...c} /></>}
      {tipo === 'grupo' && <><rect x="3" y="4" width="8" height="7" rx="2" {...c} /><rect x="13" y="4" width="8" height="7" rx="2" {...c} /><rect x="3" y="13" width="18" height="7" rx="2" {...c} /></>}
      {tipo === 'actividad' && <><rect x="4" y="7" width="16" height="10" rx="3" {...c} /></>}
      {tipo === 'subtarea' && <><path d="M5 12l3 3 6-7" {...c} /><path d="M15 16h4" {...c} /></>}
      {tipo === 'hito' && <path d="M12 3l7 9-7 9-7-9z" {...c} />}
    </svg>
  )
}

export function Chispa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2.6l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9L4 10.6l5.9-2.1z" fill="currentColor" />
    </svg>
  )
}

export type RespuestaEditor<T> = { ok: true; dato: T } | { ok: false; status: number; error: string; cuerpo: Record<string, unknown> }

/** POST a la ruta del editor de este mismo sitio. */
export async function escribir<T>(accion: AccionEditor, cuerpo: unknown): Promise<RespuestaEditor<T>> {
  try {
    const r = await fetch(`/api/editor/${accion}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
    if (r.status === 204) return { ok: true, dato: undefined as T }
    const j = (await r.json().catch(() => ({}))) as Record<string, unknown>
    // La propuesta contesta en goteo (ver la ruta en Zaelyn): el 200 sale
    // antes de saber el resultado, así que un fallo viene dentro del cuerpo.
    if (!r.ok || j['error']) return { ok: false, status: r.status, error: String(j['error'] ?? r.status), cuerpo: j }
    return { ok: true, dato: j as T }
  } catch {
    return { ok: false, status: 0, error: 'RED', cuerpo: {} }
  }
}

/** Lo que dice un error del motor, en una frase para la persona. */
export function decirError(e: { status: number; error: string; cuerpo: Record<string, unknown> }): string {
  const problemas = e.cuerpo['problemas'] as Array<{ dice: string }> | undefined
  switch (e.error) {
    case 'SIN_SESION': case 'SESION_VENCIDA': return 'Tu sesión se cerró. Pídele a Zaelyn un enlace nuevo y vuelve a entrar.'
    case 'LIMITE': {
      // Un tope de la cuenta PMO (#179): cuánto, qué lo resuelve y dónde.
      const DICE: Record<string, string> = {
        proyectos: 'proyectos activos', ejecutores: 'Ejecutores', lideres: 'Líderes',
        informados: 'lugares de Stakeholder o Monitor', creditos: 'créditos de IA de este mes', avisos: 'avisos de WhatsApp',
      }
      const c = e.cuerpo['complemento'] as { nombre?: string; precioUsd?: number } | undefined
      const que = DICE[String(e.cuerpo['que'])] ?? 'lugares'
      const base = `La cuenta ya usa ${String(e.cuerpo['usados'])} de ${String(e.cuerpo['tope'])} ${que}.`
      const precio = c?.nombre ? ` ${c.nombre} cuesta ${Number(c.precioUsd).toFixed(2)} USD al mes.` : ''
      return e.cuerpo['esSponsor']
        ? `${base}${precio} Agrégalo en «Plan y uso» (menú de tus grupos).`
        : `${base}${precio} Quien paga la cuenta puede agregarlo.`
    }
    case 'SIN_PERMISO': return 'Tu rol en este grupo no alcanza para editar planes. Pídele a quien administra que te haga líder.'
    case 'VERSION': return 'Alguien (quizá tú en otra pestaña) guardó una versión más nueva.'
    case 'INVALIDO': return `Zaelyn no aceptó el documento: ${problemas?.slice(0, 3).map(p => p.dice).join('; ') ?? String(e.cuerpo['detalle'] ?? 'forma inválida')}.`
    case 'SIN_PLAN': return 'Armar con Zaelyn es parte del plan de Proyectos. Tu plan actual no lo incluye.'
    case 'SIN_PRESUPUESTO': return 'Hoy ya se usó el presupuesto de IA de tu plan. Mañana se reinicia; mientras, puedes armar a mano o desde una plantilla.'
    case 'SIN_IA': return 'La ayuda de Zaelyn para armar no está conectada en este servidor.'
    case 'FALLO': return `Zaelyn no pudo armar la propuesta (${String(e.cuerpo['detalle'] ?? 'sin detalle')}). Vuelve a intentarlo.`
    case 'NO_LO_ENCUENTRO': return String(e.cuerpo['detalle'] ?? 'Eso ya no existe o no es de un grupo tuyo.')
    case 'PLAN_EXISTE': return `Ese grupo ya tiene un plan llamado «${String(e.cuerpo['detalle'] ?? '')}». Ponle otro nombre o actualiza ese plan.`
    case 'VACIO': return 'El borrador no tiene actividades ni hitos que liberar.'
    case 'YA_EXISTE': return 'Ya tienes un grupo con ese nombre.'
    case 'DEMASIADOS': return 'Llegaste al máximo de grupos.'
    case 'LLENO': return `El grupo ya tiene el máximo de personas de tu plan (${String(e.cuerpo['max'] ?? '')}).`
    case 'YA_TIENE_CUENTA': return 'Esa persona ya entró con su cuenta: no necesita código.'
    case 'RED': case 'CAIDO': return 'No hay conexión con Zaelyn ahora mismo.'
    default: return `Algo falló (${e.error}).`
  }
}

export const vacio = (inicio: string | null): Doc => ({ v: 1, inicio, habiles: true, nodos: [] })

/** Cómo va en el seguimiento, para un plan reabierto (#178). */
export function ChipSeguimiento({ n }: { n: Nodo }) {
  const s = n.seguimiento
  if (!s) return null
  const txt = s.estatus === 'hecho' ? 'Hecha'
    : s.estatus === 'en_curso' || s.avance > 0 ? `${s.avance}%`
      : SEGUIMIENTO_DICE[s.estatus]
  return <span className={`ed-seg st-${s.estatus}${s.avance > 0 && s.estatus !== 'hecho' ? ' avanza' : ''}`} title={`En seguimiento: ${SEGUIMIENTO_DICE[s.estatus]}${s.avance ? ` · ${s.avance}%` : ''}`}>{txt}</span>
}
