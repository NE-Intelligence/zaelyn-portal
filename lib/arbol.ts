/**
 * El plan como árbol: proyecto → fase → grupo → subgrupo → actividad (#201).
 *
 * Una sola función arma los renglones que dibujan el árbol de avance del
 * Resumen y el Gantt, en el mismo orden y con la misma sangría. Los números
 * de cada nivel vienen del motor (fases, grupos y renglones ya medidos); aquí
 * solo se ordena y se sangra. Las fechas de una fase son la primera y la
 * última de sus actividades: calendario, no medición.
 */
import type { Estatus, Renglon, VistaDePlan } from './plan'

export type TipoFila = 'proyecto' | 'fase' | 'grupo' | 'actividad' | 'hito'

export type FilaDeArbol = {
  k: string
  tipo: TipoFila
  nivel: number
  /** Las llaves de todos sus ancestros, del más alto al más bajo. */
  padres: string[]
  nombre: string
  clave: string | null
  real: number
  esperado: number | null
  cerradas: number
  total: number
  inicia: string | null
  vence: string | null
  quien: string | null
  personaId: string | null
  apoyos: string[]
  estatus: Estatus | null
  espera: string | null
  manda: boolean
  soporte: boolean
  hitos: number
  /** El color de su fase. */
  orden: number | null
  /** El tramo para abrir el Tablero filtrado: [fase, ...grupos]. */
  tramo: Array<string | null> | null
}

const min = (xs: Array<string | null>): string | null => xs.filter((x): x is string => !!x).sort()[0] ?? null
const max = (xs: Array<string | null>): string | null => xs.filter((x): x is string => !!x).sort().at(-1) ?? null

export function filasDelArbol(v: VistaDePlan, conProyecto = true): FilaDeArbol[] {
  const e = v.estado
  const p = e.punto
  const out: FilaDeArbol[] = []
  const raiz = 'p'
  if (conProyecto) {
    out.push({
      k: raiz, tipo: 'proyecto', nivel: 0, padres: [], nombre: e.plan?.nombre ?? e.grupo.nombre, clave: null,
      real: p.declarado, esperado: p.esperado, cerradas: p.cerrados, total: p.total,
      inicia: min(e.renglones.map(r => r.inicia ?? r.vence)), vence: v.ruta.venceElPlan ?? max(e.renglones.map(r => r.vence)),
      quien: null, personaId: null, apoyos: [], estatus: null, espera: null, manda: false, soporte: false,
      hitos: e.renglones.filter(r => r.hito).length, orden: null, tramo: null,
    })
  }
  const base = conProyecto ? [raiz] : []
  const sinFases = v.fases.length === 1 && v.fases[0]!.nombre === null
  const grupos = new Map((v.grupos ?? []).map(g => [JSON.stringify([g.fase ?? null, ...g.ruta]), g]))

  for (const f of v.fases) {
    const rs = e.renglones.filter(r => (r.fase ?? null) === f.nombre && r.estatus !== 'cancelado')
    const kf = `f:${f.nombre ?? ''}`
    const padresF = sinFases ? base : [...base, kf]
    const nivelF = conProyecto ? 1 : 0
    if (!sinFases) {
      out.push({
        k: kf, tipo: 'fase', nivel: nivelF + (sinFases ? 0 : 0), padres: base, nombre: f.nombre ?? 'Fuera de fase', clave: null,
        real: f.punto.declarado, esperado: f.punto.esperado, cerradas: f.total - f.abiertos, total: f.total,
        inicia: min(rs.map(r => r.inicia ?? r.vence)), vence: max(rs.map(r => r.vence)),
        quien: null, personaId: null, apoyos: [], estatus: null, espera: null, manda: false, soporte: false,
        hitos: f.hitos, orden: f.orden, tramo: [f.nombre],
      })
    }
    const nivelBase = sinFases ? nivelF : nivelF + 1
    let antes: string[] = []
    for (const r of rs) {
      const ruta = r.grupo ?? []
      let comun = 0
      while (comun < ruta.length && comun < antes.length && ruta[comun] === antes[comun]) comun++
      for (let n = comun; n < ruta.length; n++) {
        const sub = ruta.slice(0, n + 1)
        const g = grupos.get(JSON.stringify([f.nombre, ...sub]))
        if (!g) continue
        out.push({
          k: `g:${JSON.stringify([f.nombre, ...sub])}`, tipo: 'grupo', nivel: nivelBase + n,
          padres: [...padresF, ...sub.slice(0, -1).map((_, i) => `g:${JSON.stringify([f.nombre, ...sub.slice(0, i + 1)])}`)],
          nombre: g.nombre, clave: null,
          real: g.punto.declarado, esperado: g.punto.esperado, cerradas: g.total - g.abiertos, total: g.total,
          inicia: g.inicia, vence: g.vence,
          quien: null, personaId: null, apoyos: [], estatus: null, espera: null, manda: false, soporte: false,
          hitos: g.hitos, orden: f.orden, tramo: [f.nombre, ...sub],
        })
      }
      antes = ruta
      out.push(deActividad(r, nivelBase + ruta.length,
        [...padresF, ...ruta.map((_, i) => `g:${JSON.stringify([f.nombre, ...ruta.slice(0, i + 1)])}`)], f.orden))
    }
  }
  return out
}

function deActividad(r: Renglon, nivel: number, padres: string[], orden: number | null): FilaDeArbol {
  return {
    k: `a:${r.id}`, tipo: r.hito ? 'hito' : 'actividad', nivel, padres,
    nombre: r.texto, clave: r.clave,
    real: r.avance, esperado: r.abierto ? r.esperado : null,
    cerradas: r.estatus === 'hecho' ? 1 : 0, total: 1,
    inicia: r.inicia, vence: r.vence, quien: r.quien, personaId: r.personaId,
    apoyos: (r.apoyos ?? []).map(a => a.nombre),
    estatus: r.estatus, espera: r.abierto ? r.espera : null, manda: r.manda && r.abierto,
    soporte: !!r.soporte, hitos: r.hito ? 1 : 0, orden, tramo: null,
  }
}

/**
 * Cómo va un renglón contra lo que tocaba hoy, para el color.
 *
 * Los mismos 5 puntos de tolerancia que usa el motor para decir «en tiempo»;
 * vencido sin cerrar es atrasado aunque su porcentaje diga otra cosa.
 */
export type Ritmo = 'hecho' | 'atrasado' | 'riesgo' | 'bien' | 'futuro'
export function ritmoDe(f: Pick<FilaDeArbol, 'real' | 'esperado' | 'estatus' | 'vence' | 'total' | 'cerradas'>, hoy: string): Ritmo {
  if (f.estatus === 'hecho' || (f.total > 0 && f.cerradas === f.total)) return 'hecho'
  if (f.estatus && f.vence && f.vence < hoy) return 'atrasado'
  if (f.esperado === null || f.esperado === 0) return f.real > 0 ? 'bien' : 'futuro'
  if (f.real + 5 < f.esperado) return 'atrasado'
  if (f.real < f.esperado) return 'riesgo'
  return 'bien'
}
export const RITMO_NOMBRE: Record<Ritmo, string> = {
  hecho: 'Terminado', atrasado: 'Atrasado', riesgo: 'Ligeramente atrás', bien: 'En tiempo', futuro: 'Por empezar',
}
