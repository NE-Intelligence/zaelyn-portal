/**
 * El motor de calendario del editor.
 *
 * Programa fechas, empuja sucesores, mueve ramas completas y calcula lo que
 * cada contenedor abarca. Todo es función pura sobre el documento: entra un
 * `Doc`, sale otro. Así el deshacer es guardar documentos, y ninguna pantalla
 * puede quedarse con una fecha que el motor no calculó.
 *
 * ── LAS REGLAS ─────────────────────────────────────────────────────────
 *
 *  · Una actividad de N días termina N-1 días hábiles después de empezar.
 *  · Un hito no dura: ocurre el día en que termina su último antecesor.
 *  · Quien depende de algo empieza el día hábil siguiente a que eso termine.
 *  · Empujar, nunca jalar: si mueves un antecesor hacia adelante, los
 *    sucesores se recorren; si lo mueves hacia atrás, se quedan donde están
 *    (adelantar trabajo es una decisión, no un efecto secundario).
 *  · Fase y grupo no tienen fecha propia: abarcan a sus hijos.
 *  · El sprint sí: tiene inicio y duración fijos, y sus hijos viven adentro.
 */
import type { Doc, Nodo, TipoNodo } from './tipos'
import { PROGRAMABLES, avanzo, puedeVivir } from './tipos'

// ─────────────────────────────────────────────────────────────── calendario

const D = (s: string) => new Date(`${s}T00:00:00Z`)
const S = (d: Date) => d.toISOString().slice(0, 10)

export const hoyISO = (): string => {
  const d = new Date()
  return S(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())))
}

export const esHabil = (f: string): boolean => { const w = D(f).getUTCDay(); return w !== 0 && w !== 6 }

/** Corre a un día válido: en calendario hábil, un sábado pasa al lunes. */
export function aHabil(f: string, habiles: boolean): string {
  if (!habiles) return f
  const d = D(f)
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1)
  return S(d)
}

/** Suma n días (hábiles si toca). n puede ser negativo. */
export function sumar(f: string, n: number, habiles: boolean): string {
  const d = D(f)
  if (!habiles) { d.setUTCDate(d.getUTCDate() + n); return S(d) }
  const paso = n >= 0 ? 1 : -1
  let quedan = Math.abs(n)
  while (quedan > 0) {
    d.setUTCDate(d.getUTCDate() + paso)
    const w = d.getUTCDay()
    if (w !== 0 && w !== 6) quedan--
  }
  return S(d)
}

/** Días (hábiles si toca) de a hasta b. Negativo si b es antes. */
export function entre(a: string, b: string, habiles: boolean): number {
  if (a === b) return 0
  if (!habiles) return Math.round((D(b).getTime() - D(a).getTime()) / 86_400_000)
  const signo = b > a ? 1 : -1
  const [x, y] = signo > 0 ? [a, b] : [b, a]
  let n = 0
  const d = D(x)
  while (S(d) < y) {
    d.setUTCDate(d.getUTCDate() + 1)
    const w = d.getUTCDay()
    if (w !== 0 && w !== 6) n++
  }
  return n * signo
}

/** Último día de algo que empieza en `ini` y dura `dias`. */
export const finDe = (ini: string, dias: number, habiles: boolean): string =>
  dias > 1 ? sumar(ini, dias - 1, habiles) : ini

// ─────────────────────────────────────────────────────────────── el árbol

export type Arbol = {
  porId: Map<string, Nodo>
  hijos: Map<string | null, Nodo[]>
}

export function arbol(doc: Doc): Arbol {
  const porId = new Map(doc.nodos.map(n => [n.id, n]))
  const hijos = new Map<string | null, Nodo[]>()
  for (const n of doc.nodos) {
    const p = n.padre && porId.has(n.padre) ? n.padre : null
    const l = hijos.get(p) ?? []
    l.push(n)
    hijos.set(p, l)
  }
  for (const l of hijos.values()) l.sort((a, b) => a.orden - b.orden)
  return { porId, hijos }
}

/** El documento en orden de lectura (padre antes que hijos), con su nivel. */
export function aplanado(doc: Doc, colapsados: ReadonlySet<string> = new Set()): Array<{ n: Nodo; nivel: number; wbs: string }> {
  const { hijos } = arbol(doc)
  const out: Array<{ n: Nodo; nivel: number; wbs: string }> = []
  const bajar = (p: string | null, nivel: number, pref: string) => {
    ;(hijos.get(p) ?? []).forEach((n, i) => {
      const wbs = pref ? `${pref}.${i + 1}` : `${i + 1}`
      out.push({ n, nivel, wbs })
      if (!colapsados.has(n.id)) bajar(n.id, nivel + 1, wbs)
    })
  }
  bajar(null, 0, '')
  return out
}

export function descendientes(doc: Doc, id: string): Set<string> {
  const { hijos } = arbol(doc)
  const out = new Set<string>()
  const pila = [id]
  while (pila.length) {
    const x = pila.pop()!
    for (const h of hijos.get(x) ?? []) { out.add(h.id); pila.push(h.id) }
  }
  return out
}

export function ancestro(doc: Doc, id: string, tipo: TipoNodo): Nodo | null {
  const porId = new Map(doc.nodos.map(n => [n.id, n]))
  let p = porId.get(id)?.padre ?? null
  while (p) {
    const n = porId.get(p)
    if (!n) return null
    if (n.tipo === tipo) return n
    p = n.padre
  }
  return null
}

// ─────────────────────────────────────────────────────────────── medir

export type Medida = {
  inicio: string | null
  fin: string | null
  /** Días que abarca (hábiles si toca). */
  dias: number
  /** Esfuerzo sumado de las actividades que contiene (o propio). */
  horas: number
  /** Cuántas actividades e hitos contiene (o 1 si lo es). */
  piezas: number
  /** Cuántas actividades sin responsable contiene. */
  sinDueno: number
  /** Subtareas hechas / totales (actividades). */
  lista: [number, number]
  /** Un hijo se sale del rango propio (sprint). */
  desborda: boolean
}

export function medir(doc: Doc): Map<string, Medida> {
  const { hijos } = arbol(doc)
  const out = new Map<string, Medida>()
  const hab = doc.habiles

  const visitar = (n: Nodo): Medida => {
    const ya = out.get(n.id)
    if (ya) return ya
    const hs = hijos.get(n.id) ?? []
    let m: Medida
    if (n.tipo === 'actividad' || n.tipo === 'hito') {
      const dias = n.tipo === 'hito' ? 0 : Math.max(1, n.dias ?? 1)
      const subs = hs.filter(h => h.tipo === 'subtarea')
      m = {
        inicio: n.inicio ?? null,
        fin: n.inicio ? (n.tipo === 'hito' ? n.inicio : finDe(n.inicio, dias, hab)) : null,
        dias,
        horas: n.horas ?? 0,
        piezas: 1,
        sinDueno: n.tipo === 'actividad' && !n.responsable ? 1 : 0,
        lista: [subs.filter(s => s.hecho).length, subs.length],
        desborda: false,
      }
    } else if (n.tipo === 'subtarea') {
      m = { inicio: null, fin: null, dias: 0, horas: 0, piezas: 0, sinDueno: 0, lista: [0, 0], desborda: false }
    } else {
      let ini: string | null = null; let fin: string | null = null
      let horas = 0; let piezas = 0; let sinDueno = 0
      for (const h of hs) {
        const mh = visitar(h)
        if (mh.inicio && (!ini || mh.inicio < ini)) ini = mh.inicio
        if (mh.fin && (!fin || mh.fin > fin)) fin = mh.fin
        horas += mh.horas; piezas += mh.piezas; sinDueno += mh.sinDueno
      }
      let desborda = false
      if (n.tipo === 'sprint' && n.inicio) {
        const finS = finDe(n.inicio, Math.max(1, n.dias ?? 10), hab)
        desborda = (!!ini && ini < n.inicio) || (!!fin && fin > finS)
        ini = n.inicio
        if (!fin || fin < finS) fin = finS
      }
      m = {
        inicio: ini, fin, dias: ini && fin ? entre(ini, fin, hab) + 1 : 0,
        horas, piezas, sinDueno, lista: [0, 0], desborda,
      }
    }
    out.set(n.id, m)
    return m
  }
  for (const n of doc.nodos) visitar(n)
  return out
}

// ─────────────────────────────────────────────────────────────── programar

/** Orden topológico de los programables por sus dependencias. */
function topologico(nodos: readonly Nodo[]): Nodo[] {
  const prog = nodos.filter(n => PROGRAMABLES.includes(n.tipo))
  const porId = new Map(prog.map(n => [n.id, n]))
  const visto = new Set<string>(); const enCurso = new Set<string>()
  const out: Nodo[] = []
  const v = (n: Nodo) => {
    if (visto.has(n.id) || enCurso.has(n.id)) return
    enCurso.add(n.id)
    for (const d of n.depende ?? []) { const x = porId.get(d); if (x) v(x) }
    enCurso.delete(n.id); visto.add(n.id); out.push(n)
  }
  for (const n of prog) v(n)
  return out
}

/**
 * Pasa hacia adelante: cada programable empieza en la primera fecha que sus
 * antecesores permiten. Los que no tienen fecha la reciben; los que tienen
 * una fecha demasiado temprana se empujan. Los sprints sin fecha toman la de
 * su primer hijo.
 */
export function programar(doc: Doc): Doc {
  const hab = doc.habiles
  const nodos = doc.nodos.map(n => ({ ...n }))
  const porId = new Map(nodos.map(n => [n.id, n]))
  const piso0 = doc.inicio ? aHabil(doc.inicio, hab) : hoyISO()
  const finDeNodo = (n: Nodo): string | null =>
    n.inicio ? (n.tipo === 'hito' ? n.inicio : finDe(n.inicio, Math.max(1, n.dias ?? 1), hab)) : null
  const pisoDe = (n: Nodo): string => {
    // Dentro de un sprint con fecha, nadie empieza antes del sprint.
    let p = n.padre ? porId.get(n.padre) : undefined
    while (p) {
      if (p.tipo === 'sprint' && p.inicio) return p.inicio
      p = p.padre ? porId.get(p.padre) : undefined
    }
    return piso0
  }

  for (const n of topologico(nodos)) {
    let temprano: string | null = null
    for (const d of n.depende ?? []) {
      const a = porId.get(d)
      const f = a ? finDeNodo(a) : null
      if (!f) continue
      const s = n.tipo === 'hito' ? f : sumar(f, 1, hab)
      if (!temprano || s > temprano) temprano = s
    }
    if (!n.inicio) n.inicio = aHabil(temprano && temprano > pisoDe(n) ? temprano : pisoDe(n), hab)
    else if (temprano && n.inicio < temprano) n.inicio = temprano
    if (n.tipo === 'hito') n.dias = 0
  }
  for (const n of nodos) {
    if (n.tipo !== 'sprint' || n.inicio) continue
    const fechas = nodos.filter(h => h.padre === n.id && h.inicio).map(h => h.inicio!).sort()
    n.inicio = fechas[0] ?? piso0
  }
  return { ...doc, nodos }
}

/**
 * Mueve un objeto `delta` días. Un contenedor se lleva a toda su rama.
 * Después se empuja a quien haga falta.
 */
export function mover(doc: Doc, id: string, delta: number): Doc {
  if (!delta) return doc
  const rama = new Set([id, ...descendientes(doc, id)])
  const nodos = doc.nodos.map(n => {
    if (!rama.has(n.id) || !n.inicio) return n
    return { ...n, inicio: aHabil(sumar(n.inicio, delta, doc.habiles), doc.habiles) }
  })
  return programar({ ...doc, nodos })
}

/** Cambia la duración (y empuja). */
export function estirar(doc: Doc, id: string, dias: number): Doc {
  const nodos = doc.nodos.map(n => (n.id === id ? { ...n, dias: Math.max(1, Math.round(dias)) } : n))
  return programar({ ...doc, nodos })
}

/**
 * Corre el proyecto entero a un arranque nuevo, respetando el calendario.
 * Es lo que se hace al usar una plantilla: sus fechas son relativas a su
 * propio lunes de referencia.
 */
export function correrA(doc: Doc, arranque: string): Doc {
  const nuevo = aHabil(arranque, doc.habiles)
  const viejo = doc.inicio ?? doc.nodos.map(n => n.inicio).filter(Boolean).sort()[0] ?? nuevo
  const delta = entre(aHabil(viejo!, doc.habiles), nuevo, doc.habiles)
  const nodos = doc.nodos.map(n => (n.inicio ? { ...n, inicio: aHabil(sumar(n.inicio, delta, doc.habiles), doc.habiles) } : n))
  return programar({ ...doc, inicio: nuevo, nodos })
}

// ─────────────────────────────────────────────────────────────── editar el árbol

let contador = 0
export function nuevoId(doc: Doc): string {
  const usados = new Set(doc.nodos.map(n => n.id))
  let id: string
  do { id = `e${Date.now().toString(36).slice(-5)}${(contador++).toString(36)}` } while (usados.has(id))
  return id
}

/** Reenumera `orden` de los hijos de un padre según el orden dado. */
function reordenar(nodos: Nodo[], padre: string | null, ids: string[]): Nodo[] {
  const pos = new Map(ids.map((id, i) => [id, i]))
  return nodos.map(n => ((n.padre ?? null) === padre && pos.has(n.id) ? { ...n, orden: pos.get(n.id)! } : n))
}

export type Destino = { padre: string | null; antesDe?: string | null }

/** ¿Se puede colocar `tipo` (o el nodo `id`) en ese padre? */
export function cabe(doc: Doc, tipo: TipoNodo, padre: string | null, id?: string): boolean {
  const p = padre ? doc.nodos.find(n => n.id === padre) : null
  if (padre && !p) return false
  if (!puedeVivir(tipo, p ? p.tipo : null)) return false
  if (id && padre && (padre === id || descendientes(doc, id).has(padre))) return false
  return true
}

/** Inserta un nodo nuevo en un destino. */
export function insertar(doc: Doc, nodo: Omit<Nodo, 'orden'>, destino: Destino): Doc {
  const hermanos = doc.nodos.filter(n => (n.padre ?? null) === destino.padre).sort((a, b) => a.orden - b.orden).map(n => n.id)
  const i = destino.antesDe ? hermanos.indexOf(destino.antesDe) : -1
  if (i >= 0) hermanos.splice(i, 0, nodo.id); else hermanos.push(nodo.id)
  const nodos = reordenar([...doc.nodos, { ...nodo, padre: destino.padre, orden: 0 }], destino.padre, hermanos)
  return programar({ ...doc, nodos })
}

/** Mueve un nodo existente a otro lugar del árbol. */
export function recolocar(doc: Doc, id: string, destino: Destino): Doc {
  const n = doc.nodos.find(x => x.id === id)
  if (!n || !cabe(doc, n.tipo, destino.padre, id)) return doc
  const origen = n.padre ?? null
  let nodos = doc.nodos.map(x => (x.id === id ? { ...x, padre: destino.padre } : x))
  const hermanos = nodos.filter(x => (x.padre ?? null) === destino.padre && x.id !== id).sort((a, b) => a.orden - b.orden).map(x => x.id)
  const i = destino.antesDe ? hermanos.indexOf(destino.antesDe) : -1
  if (i >= 0) hermanos.splice(i, 0, id); else hermanos.push(id)
  nodos = reordenar(nodos, destino.padre, hermanos)
  if (origen !== destino.padre) {
    const viejos = nodos.filter(x => (x.padre ?? null) === origen).sort((a, b) => a.orden - b.orden).map(x => x.id)
    nodos = reordenar(nodos, origen, viejos)
  }
  // Al entrar a un sprint con fecha, no puede empezar antes de él.
  return programar({ ...doc, nodos })
}

/** Borra un nodo con toda su rama, y las dependencias que apuntaban ahí. */
export function quitar(doc: Doc, id: string): Doc {
  const fuera = new Set([id, ...descendientes(doc, id)])
  // Lo que ya avanzó en el seguimiento no se quita desde el editor (#178): ni
  // solo, ni dentro de un contenedor que se quita.
  if (doc.nodos.some(n => fuera.has(n.id) && avanzo(n))) return doc
  const nodos = doc.nodos
    .filter(n => !fuera.has(n.id))
    .map(n => (n.depende?.some(d => fuera.has(d)) ? { ...n, depende: n.depende.filter(d => !fuera.has(d)) } : n))
  return { ...doc, nodos }
}

export function cambiar(doc: Doc, id: string, cambios: Partial<Nodo>): Doc {
  const nodos = doc.nodos.map(n => {
    if (n.id !== id) return n
    const x: Nodo = { ...n, ...cambios }
    for (const k of Object.keys(cambios) as Array<keyof Nodo>) {
      const v = x[k]
      if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) delete x[k]
    }
    return x
  })
  return programar({ ...doc, nodos })
}

/** ¿Agregar a → depende de b crearía un ciclo? */
export function cerrariaCiclo(doc: Doc, a: string, b: string): boolean {
  if (a === b) return true
  const dep = new Map(doc.nodos.map(n => [n.id, n.depende ?? []]))
  const pila = [b]; const visto = new Set<string>()
  while (pila.length) {
    const x = pila.pop()!
    if (x === a) return true
    if (visto.has(x)) continue
    visto.add(x)
    pila.push(...(dep.get(x) ?? []))
  }
  return false
}

export function enlazar(doc: Doc, sucesor: string, antecesor: string): Doc {
  const s = doc.nodos.find(n => n.id === sucesor)
  const a = doc.nodos.find(n => n.id === antecesor)
  if (!s || !a || !PROGRAMABLES.includes(s.tipo) || !PROGRAMABLES.includes(a.tipo)) return doc
  if (s.depende?.includes(antecesor) || cerrariaCiclo(doc, sucesor, antecesor)) return doc
  return cambiar(doc, sucesor, { depende: [...(s.depende ?? []), antecesor] })
}

export function desenlazar(doc: Doc, sucesor: string, antecesor: string): Doc {
  const s = doc.nodos.find(n => n.id === sucesor)
  if (!s?.depende) return doc
  return cambiar(doc, sucesor, { depende: s.depende.filter(d => d !== antecesor) })
}

/** Copia para guardar como plantilla: sin responsables, sin palomitas. */
export function comoPlantilla(doc: Doc): Doc {
  return {
    ...doc,
    nodos: doc.nodos.map(n => {
      const { responsable: _r, hecho: _h, ...resto } = n
      return resto
    }),
  }
}

/**
 * La ruta crítica del borrador: las piezas cuya holgura es cero respecto al
 * fin del proyecto. Pasada hacia atrás sobre lo ya programado.
 */
export function rutaCritica(doc: Doc): Set<string> {
  const hab = doc.habiles
  const prog = doc.nodos.filter(n => PROGRAMABLES.includes(n.tipo) && n.inicio)
  if (!prog.length) return new Set()
  const fin = new Map(prog.map(n => [n.id, n.tipo === 'hito' ? n.inicio! : finDe(n.inicio!, Math.max(1, n.dias ?? 1), hab)]))
  const finProyecto = [...fin.values()].sort().at(-1)!
  const sucesores = new Map<string, string[]>()
  for (const n of prog) for (const d of n.depende ?? []) sucesores.set(d, [...(sucesores.get(d) ?? []), n.id])
  const tardio = new Map<string, string>()
  const orden = topologico(prog).reverse()
  for (const n of orden) {
    let lf = finProyecto
    for (const s of sucesores.get(n.id) ?? []) {
      const sn = prog.find(x => x.id === s)
      const ls = tardio.get(s)
      if (!sn || !ls) continue
      const limite = sn.tipo === 'hito' && n.tipo !== 'hito' ? ls : sumar(ls, -1, hab)
      if (limite < lf) lf = limite
    }
    const dur = n.tipo === 'hito' ? 0 : Math.max(1, n.dias ?? 1) - 1
    tardio.set(n.id, sumar(lf, -dur, hab))
  }
  const out = new Set<string>()
  for (const n of prog) if (tardio.get(n.id) === n.inicio) out.add(n.id)
  return out
}

/** El último día del proyecto: el fin más tardío de cualquier pieza. */
export function finProyecto(doc: Doc): string | null {
  let f: string | null = null
  for (const m of medir(doc).values()) if (m.fin && (!f || m.fin > f)) f = m.fin
  return f
}

/** El primer día con algo programado. */
export function inicioProyecto(doc: Doc): string | null {
  let f: string | null = null
  for (const m of medir(doc).values()) if (m.inicio && (!f || m.inicio < f)) f = m.inicio
  return f
}

/**
 * Hacia atrás desde el go-live: corre el proyecto entero para que termine
 * ese día, con el mismo calendario. Es lo que pidió el dueño del producto:
 * «quiero salir en vivo el 31 y me dice arrancas el 25».
 *
 * No comprime nada: mueve. Si el plan no cabe entre hoy y el go-live, el
 * arranque sale en el pasado y la pantalla lo dice — comprimir es decidir qué
 * se acorta, y eso es de quien dirige (o de Zaelyn, en los cambios mayores).
 */
export function terminarEn(doc: Doc, golive: string): Doc {
  const meta = aHabil(golive, doc.habiles)
  const fin = finProyecto(doc)
  if (!fin) return { ...doc, golive: meta, fijar: 'golive' }
  const delta = entre(fin, meta, doc.habiles)
  const nodos = doc.nodos.map(n => (n.inicio ? { ...n, inicio: aHabil(sumar(n.inicio, delta, doc.habiles), doc.habiles) } : n))
  const corrido = programar({ ...doc, nodos })
  return { ...corrido, inicio: inicioProyecto(corrido) ?? corrido.inicio, golive: meta, fijar: 'golive' }
}

/** Desde el arranque: corre al arranque y el go-live pasa a ser el fin calculado. */
export function arrancarEn(doc: Doc, arranque: string): Doc {
  const corrido = correrA(doc, arranque)
  return { ...corrido, golive: finProyecto(corrido), fijar: 'inicio' }
}

/**
 * Vuelve a calcular las fechas lo más temprano que las dependencias dejan
 * (#178). Lo que espera a otro suelta su fecha y se recalcula; lo que no
 * espera a nadie y lo que ya avanzó en el seguimiento conservan la suya.
 *
 * `programar` solo empuja hacia adelante; esto es lo que hace que acortar una
 * duración o quitar una dependencia ACERQUE la fecha final.
 */
export function compactar(doc: Doc): Doc {
  const nodos = doc.nodos.map(n =>
    PROGRAMABLES.includes(n.tipo) && n.depende?.length && !avanzo(n) ? { ...n, inicio: null } : n)
  return programar({ ...doc, nodos })
}
