'use client'
/**
 * El tablero: una columna por fase (o por sprint suelto), y en cada columna
 * las actividades e hitos que contiene. Arrastrar una tarjeta a otra columna
 * la cambia de fase; soltarla sobre otra tarjeta la acomoda junto a ella.
 */
import { useMemo, useState } from 'react'
import type { Doc, Nodo, PersonaDelEditor } from '@/lib/editor/tipos'
import { CONTENEDORES, PROGRAMABLES } from '@/lib/editor/tipos'
import { arbol, cabe, recolocar, type Medida } from '@/lib/editor/programar'
import { carga, empezar, terminar, tipoDe, MARCA } from '@/lib/editor/arrastre'
import { Avatar, ChipSeguimiento, IconoTipo, corta } from './comun'

export function Tablero({ doc, medidas, personas, seleccion, onSeleccion, critica, recien, puede, onCommit }: {
  doc: Doc
  medidas: Map<string, Medida>
  personas: Map<string, PersonaDelEditor>
  seleccion: string | null
  onSeleccion: (id: string | null) => void
  critica: Set<string>
  recien: Set<string>
  puede: boolean
  onCommit: (d: Doc, base: Doc) => void
}) {
  const { hijos } = useMemo(() => arbol(doc), [doc])
  const [sobre, setSobre] = useState<string | null>(null)

  const columnas = useMemo(() => {
    const raiz = (hijos.get(null) ?? []).filter(n => n.tipo === 'fase' || n.tipo === 'sprint')
    const tarjetasDe = (id: string): Array<{ n: Nodo; ruta: string }> => {
      const out: Array<{ n: Nodo; ruta: string }> = []
      const bajar = (p: string, ruta: string) => {
        for (const h of hijos.get(p) ?? []) {
          if (PROGRAMABLES.includes(h.tipo)) out.push({ n: h, ruta })
          else if (CONTENEDORES.includes(h.tipo)) bajar(h.id, ruta ? `${ruta} › ${h.titulo}` : h.titulo)
        }
      }
      bajar(id, '')
      return out
    }
    const cols = raiz.map(c => ({ c, tarjetas: tarjetasDe(c.id) }))
    const sueltas = (hijos.get(null) ?? []).filter(n => !(n.tipo === 'fase' || n.tipo === 'sprint'))
    const sinFase: Array<{ n: Nodo; ruta: string }> = []
    for (const s of sueltas) {
      if (PROGRAMABLES.includes(s.tipo)) sinFase.push({ n: s, ruta: '' })
      else {
        const sub = (() => { const o: Array<{ n: Nodo; ruta: string }> = []; const b = (p: string, r: string) => { for (const h of hijos.get(p) ?? []) { if (PROGRAMABLES.includes(h.tipo)) o.push({ n: h, ruta: r }); else if (CONTENEDORES.includes(h.tipo)) b(h.id, `${r} › ${h.titulo}`) } }; b(s.id, s.titulo); return o })()
        sinFase.push(...sub)
      }
    }
    return { cols, sinFase }
  }, [hijos])

  function soltarEn(e: React.DragEvent, col: Nodo | null, antes: Nodo | null) {
    e.preventDefault()
    e.stopPropagation()
    setSobre(null)
    const c = carga()
    terminar()
    if (!c || !('id' in c) || !puede) return
    const destino = antes
      ? { padre: antes.padre, antesDe: antes.id }
      : { padre: col ? col.id : null, antesDe: null }
    if (!cabe(doc, tipoDe(c), destino.padre, c.id)) return
    onCommit(recolocar(doc, c.id, destino), doc)
  }

  const permitir = (e: React.DragEvent, clave: string) => {
    if (!puede || !e.dataTransfer.types.includes(MARCA)) return
    e.preventDefault()
    setSobre(clave)
  }

  const Tarjeta = ({ n, ruta }: { n: Nodo; ruta: string }) => {
    const m = medidas.get(n.id)
    const p = n.responsable ? personas.get(n.responsable) : undefined
    const subs = (hijos.get(n.id) ?? []).filter(h => h.tipo === 'subtarea')
    return (
      <div
        className={`ed-tarjeta t-${n.tipo}${seleccion === n.id ? ' sel vivo' : ''}${recien.has(n.id) ? ' vivo' : ''}${critica.has(n.id) ? ' critica' : ''}${sobre === `t:${n.id}` ? ' encima' : ''}`}
        draggable={puede}
        onDragStart={e => empezar(e, { id: n.id, tipo: n.tipo })}
        onDragEnd={() => { terminar(); setSobre(null) }}
        onDragOver={e => permitir(e, `t:${n.id}`)}
        onDrop={e => soltarEn(e, null, n)}
        onClick={e => { e.stopPropagation(); onSeleccion(n.id) }}
      >
        {ruta && <span className="ruta">{ruta}</span>}
        <span className="tit"><span className="ic"><IconoTipo tipo={n.tipo} /></span>{n.titulo}</span>
        {n.objetivo && <span className="para">{n.objetivo}</span>}
        <span className="pie">
          <span className="mono">{n.tipo === 'hito' ? `◆ ${corta(m?.inicio)}` : `${corta(m?.inicio)} · ${m?.dias ?? 0} d`}</span>
          {subs.length > 0 && <span className="mono">☑ {subs.filter(s => s.hecho).length}/{subs.length}</span>}
          {critica.has(n.id) && <span className="crit">crítica</span>}
          <ChipSeguimiento n={n} />
          {p ? <Avatar p={p} chico /> : n.puesto ? <span className="ed-puesto">{n.puesto}</span> : n.tipo === 'actividad' ? <span className="ed-falta">sin dueño</span> : null}
        </span>
      </div>
    )
  }

  return (
    <div className="ed-tablero" onClick={() => onSeleccion(null)}>
      {columnas.cols.map(({ c, tarjetas }) => {
        const m = medidas.get(c.id)
        return (
          <section key={c.id} className={`ed-columna${sobre === `c:${c.id}` ? ' encima' : ''}${seleccion === c.id ? ' sel' : ''}`}
            onDragOver={e => permitir(e, `c:${c.id}`)} onDrop={e => soltarEn(e, c, null)}>
            <header onClick={e => { e.stopPropagation(); onSeleccion(c.id) }}>
              <span className="ic"><IconoTipo tipo={c.tipo} /></span>
              <b>{c.titulo}</b>
              <span className="mono">{tarjetas.length}</span>
            </header>
            <div className="rango mono">{corta(m?.inicio)} – {corta(m?.fin)} · {m?.horas ? `${Math.round(m.horas)} h` : 'sin horas'}</div>
            {c.objetivo && <p className="obj">{c.objetivo}</p>}
            <div className="lista">
              {tarjetas.map(t => <Tarjeta key={t.n.id} {...t} />)}
              {!tarjetas.length && <div className="hueco">Suelta actividades aquí</div>}
            </div>
          </section>
        )
      })}
      {(columnas.sinFase.length > 0 || !columnas.cols.length) && (
        <section className={`ed-columna suelta${sobre === 'c:raiz' ? ' encima' : ''}`}
          onDragOver={e => permitir(e, 'c:raiz')} onDrop={e => soltarEn(e, null, null)}>
          <header><b>Sin fase</b><span className="mono">{columnas.sinFase.length}</span></header>
          <div className="lista">
            {columnas.sinFase.map(t => <Tarjeta key={t.n.id} {...t} />)}
            {!columnas.sinFase.length && <div className="hueco">Crea fases o sprints para tener columnas</div>}
          </div>
        </section>
      )}
    </div>
  )
}
