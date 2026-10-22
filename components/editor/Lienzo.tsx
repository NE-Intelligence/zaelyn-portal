'use client'
/**
 * El lienzo: estructura a la izquierda, Gantt a la derecha, una sola fila por
 * objeto. Todo se arrastra.
 *
 *  · La fila (por su asa) se arrastra para reordenar o meter dentro de otro.
 *    Lo que no puede vivir ahí se pinta en rojo y no se suelta.
 *  · La barra se arrastra para mover; su orilla derecha, para cambiar la
 *    duración; el punto de su extremo, para tender una dependencia hasta otra
 *    barra. Mover un contenedor mueve toda su rama, y los sucesores se
 *    recorren solos.
 *  · La paleta suelta objetos nuevos en cualquier fila o en el espacio libre.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Doc, Nodo, PersonaDelEditor, TipoNodo } from '@/lib/editor/tipos'
import { CONTENEDORES, PROGRAMABLES, TIPO_NOMBRE } from '@/lib/editor/tipos'
import {
  aHabil, aplanado, arbol, cabe, enlazar, entre, estirar, hoyISO, mover, recolocar,
  sumar, type Destino, type Medida,
} from '@/lib/editor/programar'
import { carga, empezar, terminar, tipoDe, MARCA } from '@/lib/editor/arrastre'
import { Avatar, ChipSeguimiento, IconoTipo, corta, mesCorto } from './comun'

const FILA = 38

type Zona = 'antes' | 'dentro' | 'despues'
type Indicador = { id: string | null; zona: Zona; ok: boolean } | null

type Gesto =
  | { modo: 'mover' | 'estirar'; id: string; x0: number; base: Doc; ini: string; fin: string; movido: boolean }
  | { modo: 'enlazar'; id: string; base: Doc; x: number; y: number; x1: number; y1: number }

const calSumar = (f: string, n: number) => sumar(f, n, false)
const calEntre = (a: string, b: string) => entre(a, b, false)

export function Lienzo({
  doc, medidas, personas, seleccion, onSeleccion, colapsados, onColapso, px, critica, recien,
  puede, onPreview, onCommit, onSoltarNuevo, editando, onEditando, onRenombrar,
}: {
  doc: Doc
  medidas: Map<string, Medida>
  personas: Map<string, PersonaDelEditor>
  seleccion: string | null
  onSeleccion: (id: string | null) => void
  colapsados: Set<string>
  onColapso: (id: string) => void
  px: number
  critica: Set<string>
  recien: Set<string>
  puede: boolean
  onPreview: (d: Doc) => void
  onCommit: (d: Doc, base: Doc) => void
  onSoltarNuevo: (tipo: TipoNodo, destino: Destino) => void
  editando: string | null
  onEditando: (id: string | null) => void
  onRenombrar: (id: string, titulo: string) => void
}) {
  const filas = useMemo(() => aplanado(doc, colapsados), [doc, colapsados])
  const { hijos } = useMemo(() => arbol(doc), [doc])
  const [indicador, setIndicador] = useState<Indicador>(null)
  const [gesto, setGesto] = useState<Gesto | null>(null)
  const cuerpo = useRef<HTMLDivElement>(null)
  // La columna de estructura se angosta en un teléfono: con 400 px no
  // quedaría nada del Gantt a la vista.
  const [IZQ, setIzq] = useState(400)
  useEffect(() => {
    const medir = () => setIzq(window.innerWidth < 640 ? 230 : 400)
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  // ── el rango del calendario
  const hoy = hoyISO()
  const rango = useMemo(() => {
    let a = doc.inicio ?? hoy
    let b = doc.golive ?? a
    for (const m of medidas.values()) {
      if (m.inicio && m.inicio < a) a = m.inicio
      if (m.fin && m.fin > b) b = m.fin
    }
    a = calSumar(a, -4)
    b = calSumar(b, 14)
    if (calEntre(a, b) < 70) b = calSumar(a, 70)
    return { a, b, dias: calEntre(a, b) + 1 }
  }, [doc.inicio, doc.golive, medidas, hoy])
  const x = (f: string) => calEntre(rango.a, f) * px
  const ancho = rango.dias * px

  // ── colores por fase raíz
  const colorDe = useMemo(() => {
    const raiz = new Map<string, number>()
    let i = 0
    for (const n of hijos.get(null) ?? []) if (CONTENEDORES.includes(n.tipo)) raiz.set(n.id, i++ % 6)
    const porId = new Map(doc.nodos.map(n => [n.id, n]))
    return (n: Nodo) => {
      let r: Nodo | undefined = n
      while (r?.padre) r = porId.get(r.padre)
      const k = r ? raiz.get(r.id) : undefined
      return k === undefined ? 'var(--brand)' : `var(--grp-${k + 1})`
    }
  }, [doc.nodos, hijos])

  const filaDe = useMemo(() => new Map(filas.map((f, i) => [f.n.id, i])), [filas])

  // ── arrastre de filas y de la paleta (nativo)
  function destinoPara(objetivo: Nodo, zona: Zona): Destino {
    if (zona === 'dentro') return { padre: objetivo.id, antesDe: null }
    if (zona === 'antes') return { padre: objetivo.padre, antesDe: objetivo.id }
    const hs = hijos.get(objetivo.padre) ?? []
    const i = hs.findIndex(h => h.id === objetivo.id)
    return { padre: objetivo.padre, antesDe: hs[i + 1]?.id ?? null }
  }

  function evaluar(objetivo: Nodo | null, zona: Zona): { destino: Destino; ok: boolean } | null {
    const c = carga()
    if (!c) return null
    const tipo = tipoDe(c)
    const id = 'id' in c ? c.id : undefined
    if (!objetivo) return { destino: { padre: null, antesDe: null }, ok: cabe(doc, tipo, null, id) }
    if (id === objetivo.id) return { destino: destinoPara(objetivo, zona), ok: false }
    const intento = (z: Zona) => {
      const d = destinoPara(objetivo, z)
      return { destino: d, ok: cabe(doc, tipo, d.padre, id) }
    }
    const r = intento(zona)
    if (r.ok || zona !== 'dentro') return r
    return intento('despues')
  }

  function sobreFila(e: React.DragEvent, n: Nodo) {
    if (!puede || !e.dataTransfer.types.includes(MARCA)) return
    e.preventDefault()
    const zona = zonaDe(e)
    const ev = evaluar(n, zona)
    if (!ev) return
    const zonaReal: Zona = ev.destino.padre === n.id ? 'dentro' : ev.destino.antesDe === n.id ? 'antes' : 'despues'
    e.dataTransfer.dropEffect = ev.ok ? 'move' : 'none'
    setIndicador({ id: n.id, zona: zonaReal, ok: ev.ok })
  }

  /** La zona sale del evento mismo, no del estado: el `drop` puede llegar
   *  antes de que React pinte el último `dragover`. */
  function zonaDe(e: React.DragEvent): Zona {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - r.top
    return y < r.height * 0.28 ? 'antes' : y > r.height * 0.72 ? 'despues' : 'dentro'
  }

  function soltar(e: React.DragEvent, n: Nodo | null) {
    e.preventDefault()
    e.stopPropagation()
    const c = carga()
    setIndicador(null)
    if (!c || !puede) { terminar(); return }
    const ev = n ? evaluar(n, zonaDe(e)) : evaluar(null, 'despues')
    terminar()
    if (!ev?.ok) return
    if ('nuevo' in c) onSoltarNuevo(c.nuevo, ev.destino)
    else {
      // La recolocación la hace quien guarda la historia.
      onCommit(recolocar(doc, c.id, ev.destino), doc)
    }
  }

  // ── gestos sobre las barras (punteros)
  function bajar(e: React.PointerEvent, n: Nodo, modo: 'mover' | 'estirar' | 'enlazar') {
    if (!puede || e.button !== 0) return
    e.stopPropagation()
    onSeleccion(n.id)
    const m = medidas.get(n.id)
    const ini = (n.tipo === 'sprint' ? n.inicio : m?.inicio) ?? null
    const fin = m?.fin ?? ini
    if (!ini || !fin) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    if (modo === 'enlazar') {
      const caja = cuerpo.current!.getBoundingClientRect()
      const px0 = x(fin) + px + IZQ
      const py0 = (filaDe.get(n.id) ?? 0) * FILA + FILA / 2
      setGesto({ modo, id: n.id, base: doc, x: px0, y: py0, x1: e.clientX - caja.left + cuerpo.current!.scrollLeft, y1: e.clientY - caja.top + cuerpo.current!.scrollTop })
    } else {
      setGesto({ modo, id: n.id, x0: e.clientX, base: doc, ini, fin, movido: false })
    }
  }

  function mover_(e: React.PointerEvent) {
    if (!gesto) return
    if (gesto.modo === 'enlazar') {
      const caja = cuerpo.current!.getBoundingClientRect()
      setGesto({ ...gesto, x1: e.clientX - caja.left + cuerpo.current!.scrollLeft, y1: e.clientY - caja.top + cuerpo.current!.scrollTop })
      return
    }
    const dDias = Math.round((e.clientX - gesto.x0) / px)
    if (!dDias && !gesto.movido) return
    const hab = gesto.base.habiles
    const n = gesto.base.nodos.find(z => z.id === gesto.id)!
    let vista: Doc
    if (gesto.modo === 'mover') {
      const meta = aHabil(calSumar(gesto.ini, dDias), hab)
      vista = mover(gesto.base, gesto.id, entre(gesto.ini, meta, hab))
    } else {
      let finNuevo = calSumar(gesto.fin, dDias)
      if (finNuevo < gesto.ini) finNuevo = gesto.ini
      if (hab) while (new Date(`${finNuevo}T00:00:00Z`).getUTCDay() % 6 === 0 && finNuevo > gesto.ini) finNuevo = calSumar(finNuevo, -1)
      const dias = entre(gesto.ini, finNuevo, hab) + 1
      vista = estirar(gesto.base, n.id, dias)
    }
    if (!gesto.movido) setGesto({ ...gesto, movido: true })
    onPreview(vista)
  }

  function subir(e: React.PointerEvent) {
    if (!gesto) return
    const g = gesto
    setGesto(null)
    if (g.modo === 'enlazar') {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-barra]') as HTMLElement | null
      const destino = el?.dataset['barra']
      if (destino && destino !== g.id) {
        const nuevo = enlazar(g.base, destino, g.id)
        if (nuevo !== g.base) onCommit(nuevo, g.base)
      }
      return
    }
    if (g.movido) onCommit(doc, g.base)
  }

  // ── el encabezado del calendario
  const meses = useMemo(() => {
    const out: Array<{ x: number; ancho: number; texto: string }> = []
    let f = rango.a
    while (f <= rango.b) {
      const d = new Date(`${f}T00:00:00Z`)
      const fin = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).toISOString().slice(0, 10)
      const hasta = fin > rango.b ? rango.b : fin
      out.push({ x: x(f), ancho: (calEntre(f, hasta) + 1) * px, texto: `${mesCorto(d.getUTCMonth())} ${String(d.getUTCFullYear()).slice(2)}` })
      f = calSumar(hasta, 1)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango, px])

  const marcas = useMemo(() => {
    const out: Array<{ x: number; texto: string; finde: boolean; lunes: boolean }> = []
    for (let i = 0; i < rango.dias; i++) {
      const f = calSumar(rango.a, i)
      const w = new Date(`${f}T00:00:00Z`).getUTCDay()
      out.push({ x: i * px, texto: f.slice(8), finde: w === 0 || w === 6, lunes: w === 1 })
    }
    return out
  }, [rango, px])

  // ── las flechas
  const flechas = useMemo(() => {
    const out: Array<{ d: string; critica: boolean; de: string; a: string }> = []
    for (const n of doc.nodos) {
      if (!n.depende?.length) continue
      const fa = filaDe.get(n.id)
      const mn = medidas.get(n.id)
      if (fa === undefined || !mn?.inicio) continue
      for (const d of n.depende) {
        const fd = filaDe.get(d)
        const md = medidas.get(d)
        if (fd === undefined || !md?.fin) continue
        const dn = doc.nodos.find(z => z.id === d)
        const x0 = IZQ + x(md.fin) + (dn?.tipo === 'hito' ? px / 2 + 7 : px)
        const y0 = fd * FILA + FILA / 2
        const x1 = IZQ + x(mn.inicio) + (n.tipo === 'hito' ? px / 2 - 8 : 0)
        const y1 = fa * FILA + FILA / 2
        const codo = Math.max(x0 + 8, Math.min(x1 - 8, x0 + 14))
        out.push({
          d: x1 >= codo + 4
            ? `M${x0},${y0} H${codo} V${y1} H${x1 - 2}`
            : `M${x0},${y0} h8 V${(y0 + y1) / 2} H${x1 - 14} V${y1} H${x1 - 2}`,
          critica: critica.has(n.id) && critica.has(d), de: d, a: n.id,
        })
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.nodos, filaDe, medidas, px, rango, critica, IZQ])

  const alto = Math.max(filas.length * FILA + FILA * 3, 320)

  return (
    <div className="ed-lienzo">
      <div
        className="ed-scroll"
        ref={cuerpo}
        onPointerMove={mover_}
        onPointerUp={subir}
        onPointerCancel={() => setGesto(null)}
      >
        <div className="ed-tabla" style={{ width: IZQ + ancho }}>
          {/* encabezado */}
          <div className="ed-cab">
            <div className="ed-cab-izq" style={{ width: IZQ }}>
              <span>Estructura</span>
              <span className="mono">{filas.length} objetos</span>
            </div>
            <div className="ed-cab-cal" style={{ width: ancho }}>
              <div className="ed-meses">
                {meses.map((m, i) => <span key={i} style={{ left: m.x, width: m.ancho }}>{m.texto}</span>)}
              </div>
              <div className="ed-dias">
                {marcas.map((m, i) => (px >= 16 || m.lunes) && (
                  <span key={i} className={m.finde ? 'finde' : ''} style={{ left: m.x, width: px >= 16 ? px : px * 7 }}>
                    {m.texto}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* fondo: fines de semana, hoy y go-live */}
          <div className="ed-fondo" style={{ left: IZQ, width: ancho, height: alto }}>
            {px >= 6 && marcas.filter(m => m.finde).map((m, i) => <span key={i} className="finde" style={{ left: m.x, width: px }} />)}
            {hoy >= rango.a && hoy <= rango.b && <span className="hoy" style={{ left: x(hoy) + px / 2 }}><b>hoy</b></span>}
            {doc.golive && <span className="golive" style={{ left: x(doc.golive) + px / 2 }}><b>go-live</b></span>}
          </div>

          {/* filas */}
          <div className="ed-filas" style={{ minHeight: alto }}
            onDragOver={e => { if (puede && e.dataTransfer.types.includes(MARCA)) { e.preventDefault(); if (e.target === e.currentTarget) setIndicador({ id: null, zona: 'despues', ok: !!evaluar(null, 'despues')?.ok }) } }}
            onDrop={e => { if (e.target === e.currentTarget) soltar(e, null) }}
            onClick={e => { if (e.target === e.currentTarget) onSeleccion(null) }}
          >
            {filas.map(({ n, nivel, wbs }) => {
              const m = medidas.get(n.id)
              const tieneHijos = (hijos.get(n.id) ?? []).length > 0
              const ind = indicador?.id === n.id ? indicador : null
              const p = n.responsable ? personas.get(n.responsable) : undefined
              const sel = seleccion === n.id
              return (
                <div
                  key={n.id}
                  className={`ed-fila t-${n.tipo}${sel ? ' sel' : ''}${ind ? ` ind-${ind.zona}${ind.ok ? '' : ' no'}` : ''}${recien.has(n.id) ? ' recien' : ''}`}
                  style={{ height: FILA }}
                  onDragOver={e => sobreFila(e, n)}
                  onDragLeave={() => setIndicador(i => (i?.id === n.id ? null : i))}
                  onDrop={e => soltar(e, n)}
                  onClick={() => onSeleccion(n.id)}
                >
                  <div
                    className="ed-celda"
                    style={{ width: IZQ, paddingLeft: 8 + nivel * 18 }}
                    draggable={puede && editando !== n.id}
                    onDragStart={e => { empezar(e, { id: n.id, tipo: n.tipo }) }}
                    onDragEnd={() => { terminar(); setIndicador(null) }}
                  >
                    <span className="ed-asa" aria-hidden="true">⋮⋮</span>
                    <button
                      className={`ed-caret${tieneHijos ? '' : ' vacio'}${colapsados.has(n.id) ? ' cerrado' : ''}`}
                      onClick={e => { e.stopPropagation(); if (tieneHijos) onColapso(n.id) }}
                      aria-label={colapsados.has(n.id) ? 'Abrir' : 'Cerrar'}
                      tabIndex={tieneHijos ? 0 : -1}
                    >▾</button>
                    <span className={`ed-tipo t-${n.tipo}`} title={TIPO_NOMBRE[n.tipo]} style={{ color: colorDe(n) }}><IconoTipo tipo={n.tipo} /></span>
                    <span className="ed-wbs mono">{wbs}</span>
                    {editando === n.id ? (
                      <input
                        className="ed-titulo-input"
                        autoFocus
                        defaultValue={n.titulo}
                        onFocus={e => e.currentTarget.select()}
                        onClick={e => e.stopPropagation()}
                        onBlur={e => { onRenombrar(n.id, e.currentTarget.value); onEditando(null) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { onRenombrar(n.id, e.currentTarget.value); onEditando(null) }
                          if (e.key === 'Escape') onEditando(null)
                          e.stopPropagation()
                        }}
                      />
                    ) : (
                      <span
                        className={`ed-titulo${n.tipo === 'subtarea' && n.hecho ? ' hecha' : ''}`}
                        onDoubleClick={e => { if (puede) { e.stopPropagation(); onEditando(n.id) } }}
                        title={n.objetivo ? `Para qué: ${n.objetivo}` : n.titulo}
                      >{n.titulo || <i>Sin título</i>}</span>
                    )}
                    <span className="ed-meta">
                      <ChipSeguimiento n={n} />
                      {!p && n.puesto && <span className="ed-puesto" title={`Puesto: ${n.puesto}`}>{n.puesto}</span>}
                      {n.tipo === 'actividad' && !n.responsable && !n.puesto && <span className="ed-falta" title="Sin responsable ni puesto">sin dueño</span>}
                      {p && <Avatar p={p} chico />}
                      {n.tipo === 'hito' ? <span className="ed-dur mono">◆ {corta(m?.inicio)}</span>
                        : n.tipo === 'subtarea' ? null
                          : <span className="ed-dur mono">{m?.dias ?? 0} d</span>}
                    </span>
                  </div>

                  <div className="ed-pista" style={{ width: ancho }}>
                    {m?.inicio && m.fin && n.tipo !== 'subtarea' && (
                      <Barra
                        n={n} m={m} x={x} px={px} color={colorDe(n)} sel={sel}
                        critica={critica.has(n.id)} recien={recien.has(n.id)}
                        arrastrando={gesto?.id === n.id} puede={puede}
                        onBajar={bajar}
                      />
                    )}
                  </div>
                </div>
              )
            })}
            {indicador?.id === null && <div className={`ed-suelo${indicador.ok ? '' : ' no'}`}>Soltar aquí, al final del proyecto</div>}
            {!filas.length && (
              <div className="ed-vacio-lienzo">
                <b>El lienzo está vacío</b>
                <span>Arrastra una fase o una actividad desde la paleta, empieza desde una plantilla, o pídele a Zaelyn que te arme el plan.</span>
              </div>
            )}
          </div>

          {/* flechas */}
          <svg className="ed-flechas" style={{ width: IZQ + ancho, height: alto }} aria-hidden="true">
            <defs>
              <marker id="ed-punta" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--line-strong)" /></marker>
              <marker id="ed-punta-c" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--critica)" /></marker>
            </defs>
            {flechas.map((f, i) => (
              <path key={i} d={f.d} className={`${f.critica ? 'critica' : ''}${seleccion === f.a || seleccion === f.de ? ' viva' : ''}`}
                markerEnd={`url(#${f.critica ? 'ed-punta-c' : 'ed-punta'})`} />
            ))}
            {gesto?.modo === 'enlazar' && (
              <path d={`M${gesto.x},${gesto.y} C${gesto.x + 40},${gesto.y} ${gesto.x1 - 40},${gesto.y1} ${gesto.x1},${gesto.y1}`} className="tendiendo" />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}


function Barra({ n, m, x, px, color, sel, critica, recien, arrastrando, puede, onBajar }: {
  n: Nodo; m: Medida; x: (f: string) => number; px: number; color: string; sel: boolean
  critica: boolean; recien: boolean; arrastrando: boolean; puede: boolean
  onBajar: (e: React.PointerEvent, n: Nodo, modo: 'mover' | 'estirar' | 'enlazar') => void
}) {
  const ini = x(m.inicio!)
  const w = Math.max(px, x(m.fin!) - ini + px)
  const vivo = sel || recien || arrastrando
  const estilo = { '--c': color } as React.CSSProperties

  if (n.tipo === 'hito') {
    return (
      <div className={`ed-hito${vivo ? ' vivo' : ''}${critica ? ' critica' : ''}`} style={{ ...estilo, left: ini + px / 2 - 9 }}
        data-barra={n.id} onPointerDown={e => onBajar(e, n, 'mover')} title={`${n.titulo} · ${corta(m.inicio)}`}>
        <span className="rombo" />
        {puede && <span className="ed-punto" onPointerDown={e => onBajar(e, n, 'enlazar')} title="Arrastra hasta otra barra para crear una dependencia" />}
        <span className="ed-etq-fuera">{n.titulo}</span>
      </div>
    )
  }
  if (n.tipo === 'fase' || n.tipo === 'grupo') {
    return (
      <div className={`ed-resumen t-${n.tipo}${vivo ? ' vivo' : ''}`} style={{ ...estilo, left: ini, width: w }}
        data-resumen={n.id} onPointerDown={e => onBajar(e, n, 'mover')} title={`${n.titulo} · ${corta(m.inicio)} – ${corta(m.fin)} · ${m.dias} d`}>
      </div>
    )
  }
  const programable = PROGRAMABLES.includes(n.tipo)
  return (
    <div
      className={`ed-barra t-${n.tipo}${vivo ? ' vivo' : ''}${critica ? ' critica' : ''}${m.desborda ? ' desborda' : ''}`}
      style={{ ...estilo, left: ini, width: w }}
      data-barra={programable ? n.id : undefined}
      onPointerDown={e => onBajar(e, n, 'mover')}
      title={`${n.titulo} · ${corta(m.inicio)} – ${corta(m.fin)} · ${m.dias} d${m.horas ? ` · ${m.horas} h` : ''}`}
    >
      <span className="ed-etq">{w > 70 ? n.titulo : ''}</span>
      {w <= 70 && <span className="ed-etq-fuera">{n.titulo}</span>}
      {puede && <span className="ed-orilla" onPointerDown={e => onBajar(e, n, 'estirar')} title="Arrastra para cambiar la duración" />}
      {puede && programable && <span className="ed-punto" onPointerDown={e => onBajar(e, n, 'enlazar')} title="Arrastra hasta otra barra para crear una dependencia" />}
    </div>
  )
}

export const ALTO_FILA = FILA
