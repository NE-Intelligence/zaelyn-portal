'use client'
/**
 * El editor de proyectos.
 *
 * Ref: Zaelyn DECISIONS #174
 *
 * Arma un borrador —a mano, desde una plantilla o con Zaelyn— y lo guarda
 * solo cada vez que cambia. El borrador NO es el plan que Zaelyn sigue:
 * Zaelyn lo empieza a seguir cuando se libera (siguiente fase).
 *
 * El estado vive en un solo documento y en su historia: cada cambio produce
 * un documento nuevo, deshacer es volver al anterior, y lo que se guarda es
 * siempre exactamente lo que se ve.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Doc, Ficha, LecturaExcel, Liberado, Metodologia, Nodo, PersonaDelEditor, PlantillaBase, Propuesta, Reorganizacion, Revision as RevisionT, Tarjeta, TipoNodo } from '@/lib/editor/tipos'
import { METODOLOGIA_CORTA, TIPOS_NODO, TIPO_DICE, TIPO_NOMBRE } from '@/lib/editor/tipos'
import {
  arbol, arrancarEn, cabe, compactar, cambiar, comoPlantilla, correrA, desenlazar, enlazar, entre, finProyecto as finDelProyecto, hoyISO,
  inicioProyecto, insertar, medir, nuevoId, programar, quitar, recolocar, rutaCritica, terminarEn, type Destino,
} from '@/lib/editor/programar'
import { empezar, terminar } from '@/lib/editor/arrastre'
import { esfuerzoTexto, jornadaDe } from '@/lib/editor/unidades'
import { Lienzo } from './Lienzo'
import { Tablero } from './Tablero'
import { Inspector } from './Inspector'
import { Asistente } from './Asistente'
import { Liberar } from './Liberar'
import { Revision } from './Revision'
import { claveLectura } from './DesdeExcel'
import { Chispa, IconoTipo, corta, decirError, escribir } from './comun'

type Historia = { pasado: Doc[]; presente: Doc; futuro: Doc[]; clave: string | null; t: number }
type EstadoGuardado = 'nuevo' | 'guardado' | 'sucio' | 'guardando' | 'conflicto' | 'error'

const ZOOM = { dia: 32, semana: 14, mes: 5 } as const

const TITULO_NUEVO: Record<TipoNodo, string> = {
  fase: 'Nueva fase', sprint: 'Nuevo sprint', grupo: 'Nuevo grupo',
  actividad: 'Nueva actividad', subtarea: 'Nueva subtarea', hito: 'Nuevo hito',
}

export function Editor({
  grupo, personas, fichas, base, puede, ia, inicial, abrirZaelyn = false, reabierto = null, abrirRevision = false,
}: {
  /** El grupo del borrador, o null si es de la persona y el grupo se elige al liberar. */
  grupo: { id: string; nombre: string } | null
  personas: PersonaDelEditor[]
  fichas: Ficha[]
  base: PlantillaBase[]
  puede: boolean
  ia: boolean
  inicial: { id: string | null; nombre: string; metodologia: string; version: number | null; doc: Doc; liberado?: Liberado | null }
  /** Recién traído del seguimiento (#178): qué cambió desde el borrador de la vez pasada. */
  reabierto?: { actualizados: number; agregados: number; quitados: number } | null
  abrirZaelyn?: boolean
  /** Recién salido de un Excel (#188): abre con la revisión a la vista. */
  abrirRevision?: boolean
}) {
  const router = useRouter()
  const [h, setH] = useState<Historia>(() => ({ pasado: [], presente: programar(inicial.doc), futuro: [], clave: null, t: 0 }))
  const [vista, setVista] = useState<Doc | null>(null)
  const doc = vista ?? h.presente
  const [id, setId] = useState(inicial.id)
  const [version, setVersion] = useState(inicial.version)
  const [nombre, setNombre] = useState(inicial.nombre)
  const [metodologia, setMetodologia] = useState(inicial.metodologia)
  const [guardado, setGuardado] = useState<EstadoGuardado>(inicial.id ? 'guardado' : 'nuevo')
  const [error, setError] = useState('')
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const [editando, setEditando] = useState<string | null>(null)
  const [colapsados, setColapsados] = useState<Set<string>>(new Set())
  const [modo, setModo] = useState<'gantt' | 'tablero'>('gantt')
  const [zoom, setZoom] = useState<keyof typeof ZOOM>('semana')
  const [panel, setPanel] = useState<'detalle' | 'zaelyn' | 'revision'>(abrirRevision ? 'revision' : abrirZaelyn ? 'zaelyn' : 'detalle')
  const [lectura, setLectura] = useState<LecturaExcel | null>(null)
  const [revisado, setRevisado] = useState<RevisionT | null>(null)
  const [antes, setAntes] = useState<RevisionT | null>(null)
  const [recien, setRecien] = useState<Set<string>>(new Set())
  const [ultima, setUltima] = useState<Propuesta | null>(null)
  const [traido, setTraido] = useState(reabierto)
  const [reorgAplicada, setReorgAplicada] = useState<{ cambios: number; antes: string | null; despues: string | null } | null>(null)
  const [dialogo, setDialogo] = useState<'plantilla' | 'fabrica' | null>(null)
  // Lo que se leyó del Excel, si este borrador acaba de salir de uno.
  useEffect(() => {
    if (!inicial.id) return
    try {
      const x = sessionStorage.getItem(claveLectura(inicial.id))
      if (x) setLectura(JSON.parse(x) as LecturaExcel)
    } catch { /* sin almacenamiento: no se enseña la lectura */ }
  }, [inicial.id])
  const [aviso, setAviso] = useState('')
  const [liberado, setLiberado] = useState<Liberado | null>(inicial.liberado ?? null)
  const [liberando, setLiberando] = useState(false)
  const [versionRemota, setVersionRemota] = useState<number | null>(null)

  const medidas = useMemo(() => medir(doc), [doc])
  const critica = useMemo(() => rutaCritica(doc), [doc])
  const porPersona = useMemo(() => new Map(personas.map(p => [p.id, p])), [personas])
  const seleccionado = seleccion ? doc.nodos.find(n => n.id === seleccion) ?? null : null

  // ── historia
  const comprometer = useCallback((nuevo0: Doc, opciones: { base?: Doc; clave?: string } = {}) => {
    // Con el arranque fijo, el go-live ES el fin del proyecto y se mueve solo.
    const nuevo = nuevo0.fijar === 'golive' ? nuevo0 : { ...nuevo0, golive: finDelProyecto(nuevo0) }
    setVista(null)
    setH(x => {
      const ahora = Date.now()
      if (opciones.clave && opciones.clave === x.clave && ahora - x.t < 1500) {
        return { ...x, presente: nuevo, t: ahora }
      }
      return {
        pasado: [...x.pasado, opciones.base ?? x.presente].slice(-100),
        presente: nuevo, futuro: [], clave: opciones.clave ?? null, t: ahora,
      }
    })
    setGuardado(g => (g === 'nuevo' ? 'nuevo' : 'sucio'))
  }, [])

  const deshacer = useCallback(() => setH(x => {
    const prev = x.pasado.at(-1)
    if (!prev) return x
    setGuardado(g => (g === 'nuevo' ? 'nuevo' : 'sucio'))
    return { pasado: x.pasado.slice(0, -1), presente: prev, futuro: [x.presente, ...x.futuro], clave: null, t: 0 }
  }), [])
  const rehacer = useCallback(() => setH(x => {
    const sig = x.futuro[0]
    if (!sig) return x
    setGuardado(g => (g === 'nuevo' ? 'nuevo' : 'sucio'))
    return { pasado: [...x.pasado, x.presente], presente: sig, futuro: x.futuro.slice(1), clave: null, t: 0 }
  }), [])

  // ── guardar
  const enVuelo = useRef(false)
  const otraVez = useRef(false)
  const guardar = useCallback(async (forzarVersion?: number): Promise<{ id: string; version: number } | null> => {
    if (!puede) return null
    if (enVuelo.current) { otraVez.current = true; return null }
    enVuelo.current = true
    setGuardado('guardando')
    const cuerpo = {
      tipo: 'borrador', id, groupId: grupo?.id ?? null, nombre: nombre.trim() || 'Proyecto sin nombre',
      metodologia, version: forzarVersion ?? version, doc: h.presente,
    }
    const r = await escribir<{ id: string; version: number; tarjeta: Tarjeta }>('guardar', cuerpo)
    enVuelo.current = false
    if (!r.ok) {
      if (r.error === 'VERSION') { setGuardado('conflicto'); setError(decirError(r)); setVersionRemota(Number(r.cuerpo['version']) || null); return null }
      setGuardado('error'); setError(decirError(r)); return null
    }
    setVersion(r.dato.version)
    setError('')
    if (!id) {
      setId(r.dato.id)
      router.replace(grupo ? `/app/g/${grupo.id}/editor/${r.dato.id}` : `/app/editor/${r.dato.id}`, { scroll: false })
    }
    setGuardado(otraVez.current ? 'sucio' : 'guardado')
    otraVez.current = false
    return { id: r.dato.id, version: r.dato.version }
  }, [puede, id, grupo, nombre, metodologia, version, h.presente, router])

  // Guardado automático: un segundo y medio después del último cambio.
  useEffect(() => {
    if (guardado !== 'sucio' || !id || vista) return
    const t = setTimeout(() => { void guardar() }, 1500)
    return () => clearTimeout(t)
  }, [guardado, id, vista, h.presente, nombre, metodologia, guardar])

  useEffect(() => {
    const salir = (e: BeforeUnloadEvent) => {
      if (guardado === 'sucio' || guardado === 'guardando' || (guardado === 'nuevo' && h.presente.nodos.length)) e.preventDefault()
    }
    window.addEventListener('beforeunload', salir)
    return () => window.removeEventListener('beforeunload', salir)
  }, [guardado, h.presente.nodos.length])

  const tocarNombre = (v: string) => { setNombre(v); setGuardado(g => (g === 'nuevo' ? 'nuevo' : 'sucio')) }
  const tocarMetodo = (v: string) => { setMetodologia(v); setGuardado(g => (g === 'nuevo' ? 'nuevo' : 'sucio')) }

  // ── crear objetos
  const destinoPara = useCallback((tipo: TipoNodo): Destino | null => {
    const sel = seleccion ? doc.nodos.find(n => n.id === seleccion) : null
    if (sel && cabe(doc, tipo, sel.id)) return { padre: sel.id, antesDe: null }
    if (sel && cabe(doc, tipo, sel.padre)) {
      const hs = arbol(doc).hijos.get(sel.padre) ?? []
      const i = hs.findIndex(x => x.id === sel.id)
      return { padre: sel.padre, antesDe: hs[i + 1]?.id ?? null }
    }
    if (cabe(doc, tipo, null)) return { padre: null, antesDe: null }
    return null
  }, [doc, seleccion])

  const crear = useCallback((tipo: TipoNodo, destino: Destino | null) => {
    if (!puede) return
    if (!destino) {
      setAviso(tipo === 'subtarea' ? 'Una subtarea vive dentro de una actividad: selecciona una primero.' : `No hay dónde poner un ${TIPO_NOMBRE[tipo].toLowerCase()} aquí.`)
      return
    }
    const nid = nuevoId(doc)
    const nodo: Omit<Nodo, 'orden'> = { id: nid, tipo, padre: destino.padre, titulo: TITULO_NUEVO[tipo] }
    if (tipo === 'actividad') nodo.dias = 1
    if (tipo === 'sprint') nodo.dias = 10
    if (tipo === 'hito') nodo.dias = 0
    comprometer(insertar(doc, nodo, destino))
    setSeleccion(nid)
    if (tipo !== 'subtarea') setEditando(nid)
    setRecien(new Set([nid]))
    setTimeout(() => setRecien(new Set()), 2600)
  }, [doc, puede, comprometer])

  // ── teclado
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) rehacer(); else deshacer(); return }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); rehacer(); return }
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); void guardar(); return }
      if (e.key === 'Escape') { setSeleccion(null); return }
      if (!seleccionado || !puede) return
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); comprometer(quitar(doc, seleccionado.id)); setSeleccion(null); return }
      if (e.key === 'F2') { setEditando(seleccionado.id); return }
      if (e.key === 'Enter') {
        e.preventDefault()
        const hs = arbol(doc).hijos.get(seleccionado.padre) ?? []
        const i = hs.findIndex(x => x.id === seleccionado.id)
        crear(seleccionado.tipo, { padre: seleccionado.padre, antesDe: hs[i + 1]?.id ?? null })
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const hs = arbol(doc).hijos.get(seleccionado.padre) ?? []
        const i = hs.findIndex(x => x.id === seleccionado.id)
        if (e.shiftKey) {
          const padre = seleccionado.padre ? doc.nodos.find(n => n.id === seleccionado.padre) : null
          if (!padre) return
          const abuelos = arbol(doc).hijos.get(padre.padre) ?? []
          const j = abuelos.findIndex(x => x.id === padre.id)
          const d = { padre: padre.padre, antesDe: abuelos[j + 1]?.id ?? null }
          if (cabe(doc, seleccionado.tipo, d.padre, seleccionado.id)) comprometer(recolocar(doc, seleccionado.id, d))
        } else {
          const previo = hs[i - 1]
          if (previo && cabe(doc, seleccionado.tipo, previo.id, seleccionado.id)) {
            comprometer(recolocar(doc, seleccionado.id, { padre: previo.id, antesDe: null }))
          }
        }
      }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [doc, seleccionado, puede, deshacer, rehacer, guardar, comprometer, crear])

  useEffect(() => { if (aviso) { const t = setTimeout(() => setAviso(''), 4200); return () => clearTimeout(t) } }, [aviso])

  // ── propuesta de Zaelyn
  const recibirPropuesta = (p: Propuesta, nombreBrief: string) => {
    if (!nombre.trim() && nombreBrief) setNombre(nombreBrief)
    const nuevo = programar({ ...p.doc, inicio: p.doc.inicio ?? doc.inicio ?? hoyISO() })
    comprometer(nuevo)
    setMetodologia(p.metodologia)
    setUltima(p)
    setSeleccion(null)
    setColapsados(new Set())
    setRecien(new Set(nuevo.nodos.map(n => n.id)))
    setTimeout(() => setRecien(new Set()), 7000)
  }

  // ── cambios de Zaelyn sobre un plan que ya existe (#178)
  const recibirReorganizacion = (r: Reorganizacion) => {
    const antes = finDelProyecto(doc)
    const nuevo = compactar(r.doc)
    comprometer(nuevo)
    setReorgAplicada({
      cambios: r.dif.agregados.length + r.dif.modificados.length + r.dif.quitados.length,
      antes, despues: finDelProyecto(nuevo),
    })
    setUltima(null)
    setRecien(new Set([...r.dif.agregados, ...r.dif.modificados].map(x => x.id)))
    setTimeout(() => setRecien(new Set()), 9000)
  }

  // ── plantillas
  const [nombrePlantilla, setNombrePlantilla] = useState('')
  const [enviandoPlantilla, setEnviandoPlantilla] = useState(false)
  async function guardarPlantilla() {
    setEnviandoPlantilla(true)
    const r = await escribir('guardar', {
      tipo: 'plantilla', nombre: nombrePlantilla.trim() || nombre, metodologia, doc: comoPlantilla(h.presente),
    })
    setEnviandoPlantilla(false)
    if (!r.ok) { setAviso(decirError(r)); return }
    setDialogo(null)
    setAviso('Plantilla guardada. La encuentras al crear un proyecto nuevo, en cualquiera de tus grupos.')
  }
  function usarFabrica(p: PlantillaBase) {
    const base = { ...p.doc, objetivo: doc.objetivo, alcance: doc.alcance } as Doc
    const nuevo = doc.fijar === 'golive' && doc.golive ? terminarEn(base, doc.golive) : arrancarEn(base, doc.inicio ?? hoyISO())
    comprometer(nuevo)
    setMetodologia(p.metodologia)
    setDialogo(null)
    setRecien(new Set(nuevo.nodos.map(n => n.id)))
    setTimeout(() => setRecien(new Set()), 5000)
  }

  // ── cabecera del proyecto
  const finProyecto = useMemo(() => {
    let f: string | null = null
    for (const m of medidas.values()) if (m.fin && (!f || m.fin > f)) f = m.fin
    return f
  }, [medidas])
  const totales = useMemo(() => {
    let piezas = 0; let sinDueno = 0; let horas = 0
    for (const n of doc.nodos) {
      if (n.tipo === 'actividad') { piezas++; if (!n.responsable && !n.puesto) sinDueno++; horas += n.horas ?? 0 }
      if (n.tipo === 'hito') piezas++
    }
    return { piezas, sinDueno, horas }
  }, [doc.nodos])
  const tarde = doc.golive && finProyecto && finProyecto > doc.golive ? entre(doc.golive, finProyecto, doc.habiles) : 0

  const estadoTexto: Record<EstadoGuardado, string> = {
    nuevo: 'Sin guardar', guardado: `Guardado${version ? ` · v${version}` : ''}`, sucio: 'Cambios sin guardar',
    guardando: 'Guardando…', conflicto: 'Conflicto de versión', error: 'No se guardó',
  }

  const fijaGolive = doc.fijar === 'golive'

  async function abrirLiberar() {
    // Se libera lo guardado: si hay cambios pendientes, primero se guardan.
    if (!id || guardado === 'sucio' || guardado === 'nuevo' || guardado === 'error') {
      const r = await guardar()
      if (!r) return
    }
    // La revisión va antes (#188): si hay algo que corregir, se dice aquí y
    // la persona decide si lo ve o libera así.
    const r = await escribir<RevisionT>('revisar', { doc: h.presente, groupId: grupo?.id ?? null })
    if (r.ok && r.dato.errores + r.dato.avisos > 0) { setAntes(r.dato); return }
    setLiberando(true)
  }

  const aplicarArreglos = (lista: Array<{ nodo: string; cambios: { inicio?: string; dias?: number } }>) => {
    let d = h.presente
    for (const a of lista) if (d.nodos.some(n => n.id === a.nodo)) d = cambiar(d, a.nodo, a.cambios)
    comprometer(d)
    setRecien(new Set(lista.map(a => a.nodo)))
    setTimeout(() => setRecien(new Set()), 2600)
  }

  const cambiarDoc = (c: Partial<Doc>, clave?: string) => comprometer(programar({ ...h.presente, ...c }), clave ? { clave } : {})

  return (
    <div className="ed">
      {/* barra del proyecto */}
      <div className="ed-proyecto">
        <div className="ed-pr-nombre">
          <input value={nombre} onChange={e => tocarNombre(e.target.value)} disabled={!puede} placeholder="Nombre del proyecto" aria-label="Nombre del proyecto" />
          <div className="ed-pr-datos">
            <label>
              <span>Metodología</span>
              <select value={metodologia} onChange={e => tocarMetodo(e.target.value)} disabled={!puede}>
                {fichas.map(f => <option key={f.clave} value={f.clave}>{f.nombre}</option>)}
              </select>
            </label>
            <div className="ed-fijar" role="group" aria-label="Qué fecha manda">
              <span>Programar</span>
              <div className="ed-segmentos chico">
                <button className={fijaGolive ? '' : 'on'} disabled={!puede} onClick={() => fijaGolive && comprometer({ ...h.presente, fijar: 'inicio' })}
                  title="Pones el arranque; el go-live sale de sumar">Desde el arranque</button>
                <button className={fijaGolive ? 'on' : ''} disabled={!puede} onClick={() => !fijaGolive && comprometer({ ...h.presente, fijar: 'golive', golive: h.presente.golive ?? finDelProyecto(h.presente) })}
                  title="Pones el go-live; el arranque sale de restar">Hacia atrás desde el go-live</button>
              </div>
            </div>
            <label className={fijaGolive ? 'calculada' : ''} title={fijaGolive ? 'Sale de restar desde el go-live' : 'Mueve todo el proyecto, respetando el calendario'}>
              <span>Arranque{fijaGolive ? ' · calculado' : ''}</span>
              <input type="date" value={(fijaGolive ? inicioProyecto(doc) : doc.inicio) ?? ''} disabled={!puede || fijaGolive}
                onChange={e => e.target.value && comprometer(arrancarEn(h.presente, e.target.value))} />
            </label>
            <label className={fijaGolive ? '' : 'calculada'} title={fijaGolive ? 'Mueve todo para terminar ese día' : 'Sale de sumar desde el arranque'}>
              <span>Go-live{fijaGolive ? '' : ' · calculado'}</span>
              <input type="date" value={(fijaGolive ? doc.golive : finDelProyecto(doc)) ?? ''} disabled={!puede || !fijaGolive}
                onChange={e => e.target.value && comprometer(terminarEn(h.presente, e.target.value))} />
            </label>
            {fijaGolive && inicioProyecto(doc) && inicioProyecto(doc)! < hoyISO() && (
              <span className="ed-alerta">Para salir ese día tendrías que haber arrancado el {corta(inicioProyecto(doc))}</span>
            )}
            <label className="ed-interruptor">
              <input type="checkbox" checked={doc.habiles} disabled={!puede} onChange={e => cambiarDoc({ habiles: e.target.checked })} />
              <span>Solo días hábiles</span>
            </label>
            {/* Cómo se enseña el esfuerzo (#189): se guarda en horas, se ve como prefieras. */}
            <div className="ed-fijar" role="group" aria-label="Esfuerzo en">
              <span>Esfuerzo en</span>
              <div className="ed-segmentos chico">
                <button className={doc.unidad === 'dias' ? '' : 'on'} disabled={!puede}
                  onClick={() => doc.unidad === 'dias' && comprometer({ ...h.presente, unidad: undefined })}>Horas</button>
                <button className={doc.unidad === 'dias' ? 'on' : ''} disabled={!puede}
                  onClick={() => doc.unidad !== 'dias' && comprometer({ ...h.presente, unidad: 'dias' })}>Días</button>
              </div>
            </div>
            <label className="ed-jornada" title="Horas de una jornada: con esto se convierten días de trabajo en horas">
              <span>Jornada (h)</span>
              <input type="number" min={1} max={24} step={0.5} value={jornadaDe(doc)} disabled={!puede}
                onChange={e => { const v = Number(e.target.value); if (v >= 1 && v <= 24) comprometer({ ...h.presente, jornada: v === 8 ? undefined : v }, { clave: 'doc:jornada' }) }} />
            </label>
          </div>
        </div>
        <div className="ed-pr-acciones">
          <span className={`ed-estado e-${guardado}`}>{estadoTexto[guardado]}</span>
          <button className="ed-btn icono" onClick={deshacer} disabled={!h.pasado.length} title="Deshacer (Ctrl+Z)">↶</button>
          <button className="ed-btn icono" onClick={rehacer} disabled={!h.futuro.length} title="Rehacer (Ctrl+Shift+Z)">↷</button>
          {puede && (id
            ? <button className="ed-btn suave" onClick={() => void guardar()} disabled={guardado === 'guardando'}>Guardar</button>
            : <button className="ed-btn primario" onClick={() => void guardar()} disabled={guardado === 'guardando'}>Guardar borrador</button>)}
          {puede && <button className="ed-btn suave" onClick={() => { setNombrePlantilla(nombre); setDialogo('plantilla') }} disabled={!doc.nodos.length}>Guardar como plantilla</button>}
          {puede && <button className="ed-btn liberar on" onClick={abrirLiberar} disabled={!doc.nodos.length || guardado === 'guardando'}>
            <Chispa />{liberado ? 'Liberar cambios' : 'Liberar a Zaelyn'}
          </button>}
        </div>
      </div>

      {(guardado === 'conflicto' || guardado === 'error') && (
        <div className={`ed-banda ${guardado}`}>
          <span>{error}</span>
          {guardado === 'conflicto' && <>
            <button className="ed-btn suave" onClick={() => window.location.reload()}>Recargar la versión nueva</button>
            {versionRemota && <button className="ed-btn suave" onClick={() => { setVersion(versionRemota); void guardar(versionRemota) }}>Quedarme con la mía</button>}
          </>}
          {guardado === 'error' && <button className="ed-btn suave" onClick={() => void guardar()}>Reintentar</button>}
        </div>
      )}
      {liberado && (
        <div className="ed-banda liberado">
          <span>
            Liberado a Zaelyn el {corta(liberado.en.slice(0, 10))}{version && liberado.version && version > liberado.version ? ' · tiene cambios sin liberar' : ' · Zaelyn ya lo sigue'}.
          </span>
          {liberado.groupId && liberado.planId && (
            <a className="ed-btn suave" href={`/app/g/${liberado.groupId}/${liberado.planId}`}>Ver el seguimiento</a>
          )}
        </div>
      )}
      {traido && (
        <div className="ed-banda zaelyn">
          <Chispa className="ch" />
          <span>
            Traje el plan como está hoy en el seguimiento: {traido.actualizados} al día
            {traido.agregados ? `, ${traido.agregados} nueva${traido.agregados === 1 ? '' : 's'} desde el chat` : ''}
            {traido.quitados ? `, ${traido.quitados} cancelada${traido.quitados === 1 ? '' : 's'} fuera` : ''}.
            {' '}Lo que ya avanzó lleva su porcentaje y no se puede quitar. Reorganiza y luego libera los cambios.
          </span>
          <button className="ed-btn suave" onClick={() => setTraido(null)}>Entendido</button>
        </div>
      )}
      {reorgAplicada && (
        <div className="ed-banda zaelyn">
          <Chispa className="ch" />
          <span>
            Apliqué {reorgAplicada.cambios} cambio{reorgAplicada.cambios === 1 ? '' : 's'} de Zaelyn
            {reorgAplicada.antes && reorgAplicada.despues && reorgAplicada.antes !== reorgAplicada.despues
              ? <> · termina el <b>{corta(reorgAplicada.despues)}</b> (antes {corta(reorgAplicada.antes)})</>
              : reorgAplicada.despues ? <> · termina el <b>{corta(reorgAplicada.despues)}</b></> : null}.
            {' '}Nada se guarda hasta que guardes.
          </span>
          <button className="ed-btn suave" onClick={() => { deshacer(); setReorgAplicada(null) }}>Deshacer</button>
          <button className="ed-btn suave" onClick={() => setReorgAplicada(null)}>Cerrar</button>
        </div>
      )}
      {ultima && recien.size > 0 && (
        <div className="ed-banda zaelyn">
          <Chispa className="ch" />
          <span>Zaelyn armó {ultima.doc.nodos.length} objetos con <b>{METODOLOGIA_CORTA[ultima.metodologia]}</b>. Revisa, mueve lo que quieras; si no te convence, deshaz.</span>
          <button className="ed-btn suave" onClick={deshacer}>Deshacer la propuesta</button>
        </div>
      )}

      <div className="ed-cuerpo">
        {/* paleta */}
        <aside className="ed-paleta" aria-label="Objetos">
          <span className="ed-overline">Arrastra</span>
          {TIPOS_NODO.map(t => (
            <button
              key={t}
              className={`ed-pieza t-${t}`}
              draggable={puede}
              disabled={!puede}
              onDragStart={e => empezar(e, { nuevo: t })}
              onDragEnd={terminar}
              onClick={() => crear(t, destinoPara(t))}
              title={`${TIPO_NOMBRE[t]} — ${TIPO_DICE[t]}`}
            >
              <IconoTipo tipo={t} />
              <span>{TIPO_NOMBRE[t]}</span>
            </button>
          ))}
          <span className="ed-sep" />
          {puede && <button className="ed-pieza fabrica" onClick={() => setDialogo('fabrica')} title="Empezar desde una plantilla de metodología">
            <svg viewBox="0 0 24 24" className="ed-icono"><path d="M4 5h16v14H4z M4 9h16 M9 9v10" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
            <span>Plantilla</span>
          </button>}
          <button className={`ed-pieza zaelyn${panel === 'zaelyn' ? ' activa' : ''}`} onClick={() => setPanel('zaelyn')} title="Armar con Zaelyn">
            <Chispa className="ed-icono" /><span>Zaelyn</span>
          </button>
        </aside>

        {/* lienzo */}
        <main className="ed-centro">
          <div className="ed-vistas">
            <div className="ed-segmentos" role="tablist">
              <button className={modo === 'gantt' ? 'on' : ''} onClick={() => setModo('gantt')}>Estructura y Gantt</button>
              <button className={modo === 'tablero' ? 'on' : ''} onClick={() => setModo('tablero')}>Tablero</button>
            </div>
            {modo === 'gantt' && (
              <div className="ed-segmentos chico">
                {(Object.keys(ZOOM) as Array<keyof typeof ZOOM>).map(z => (
                  <button key={z} className={zoom === z ? 'on' : ''} onClick={() => setZoom(z)}>{z === 'dia' ? 'Día' : z === 'semana' ? 'Semana' : 'Mes'}</button>
                ))}
              </div>
            )}
            {modo === 'gantt' && <>
              <button className="ed-btn texto" onClick={() => setColapsados(new Set(doc.nodos.filter(n => n.tipo === 'fase' || n.tipo === 'sprint').map(n => n.id)))}>Contraer</button>
              <button className="ed-btn texto" onClick={() => setColapsados(new Set())}>Expandir</button>
            </>}
            <span className="ed-ayuda">Doble clic renombra · Enter agrega otro · Tab mete adentro · Supr quita</span>
          </div>

          {modo === 'gantt' ? (
            <Lienzo
              doc={doc} medidas={medidas} personas={porPersona} seleccion={seleccion} onSeleccion={setSeleccion}
              colapsados={colapsados} onColapso={i => setColapsados(c => { const n = new Set(c); if (n.has(i)) n.delete(i); else n.add(i); return n })}
              px={ZOOM[zoom]} critica={critica} recien={recien} puede={puede}
              onPreview={setVista} onCommit={(d, b) => comprometer(d, { base: b })}
              onSoltarNuevo={(t, d) => crear(t, d)}
              editando={editando} onEditando={setEditando}
              onRenombrar={(i, titulo) => { const v = titulo.trim(); if (v && v !== doc.nodos.find(n => n.id === i)?.titulo) comprometer(cambiar(h.presente, i, { titulo: v })) }}
            />
          ) : (
            <Tablero
              doc={doc} medidas={medidas} personas={porPersona} seleccion={seleccion} onSeleccion={setSeleccion}
              critica={critica} recien={recien} puede={puede} onCommit={(d, b) => comprometer(d, { base: b })}
            />
          )}

          <div className="ed-pie-estado">
            <span><b className="mono">{totales.piezas}</b> actividades e hitos</span>
            <span className={totales.sinDueno ? 'aviso' : ''}><b className="mono">{totales.sinDueno}</b> sin responsable ni puesto</span>
            <span><b className="mono">{esfuerzoTexto(totales.horas, doc, true)}</b> de esfuerzo estimado</span>
            <span><b className="mono">{critica.size}</b> en ruta crítica</span>
            <span>Termina <b className="mono">{corta(finProyecto)}</b></span>
            {doc.golive && <span className={tarde ? 'tarde' : 'bien'}>
              {tarde ? <>Se pasa <b className="mono">{tarde}</b> días del compromiso ({corta(doc.golive)})</> : <>Cabe en el compromiso ({corta(doc.golive)})</>}
            </span>}
          </div>
        </main>

        {/* panel derecho */}
        <aside className="ed-panel">
          <div className="ed-segmentos panel">
            <button className={panel === 'detalle' ? 'on' : ''} onClick={() => setPanel('detalle')}>Detalle</button>
            <button className={panel === 'zaelyn' ? 'on zaelyn' : 'zaelyn'} onClick={() => setPanel('zaelyn')}><Chispa className="ch" />Zaelyn</button>
            <button className={panel === 'revision' ? 'on' : ''} onClick={() => setPanel('revision')}>
              Revisión{revisado && revisado.errores + revisado.avisos > 0 && <span className={`ed-badge${revisado.errores ? ' error' : ''}`}>{revisado.errores + revisado.avisos}</span>}
            </button>
          </div>
          {/* Siempre montada: así la pestaña lleva la cuenta aunque no esté abierta. */}
          <div hidden={panel !== 'revision'}>
            <Revision
              doc={h.presente} groupId={grupo?.id ?? null} lectura={lectura} puede={puede}
              onAplicar={aplicarArreglos} onIr={setSeleccion} onRevisado={setRevisado}
            />
          </div>
          {panel === 'revision' ? null : panel === 'zaelyn' ? (
            <Asistente
              groupId={grupo?.id ?? null} nombre={nombre} doc={h.presente} metodologia={metodologia}
              fichas={fichas} ia={ia} puede={puede} ultima={ultima} onPropuesta={recibirPropuesta}
              onReorganizar={recibirReorganizacion}
            />
          ) : seleccionado ? (
            <Inspector
              doc={doc} nodo={seleccionado} medida={medidas.get(seleccionado.id)} personas={personas} puede={puede}
              critica={critica.has(seleccionado.id)}
              onCambiar={(i, c) => comprometer(cambiar(h.presente, i, c), { clave: `${i}:${Object.keys(c).join(',')}` })}
              onQuitar={i => { comprometer(quitar(h.presente, i)); if (i === seleccion) setSeleccion(null) }}
              onAgregarDentro={(p, t) => crear(t, { padre: p, antesDe: null })}
              onEnlazar={(s, a) => comprometer(enlazar(h.presente, s, a))}
              onDesenlazar={(s, a) => comprometer(desenlazar(h.presente, s, a))}
              onSeleccion={setSeleccion}
              onSubtarea={(p, titulo) => comprometer(insertar(h.presente, { id: nuevoId(h.presente), tipo: 'subtarea', padre: p, titulo }, { padre: p, antesDe: null }))}
            />
          ) : (
            <div className="ed-sin-sel">
              <b>{doc.nodos.length ? 'Selecciona un objeto' : 'Empieza a armar'}</b>
              <p>{doc.nodos.length
                ? 'Toca una fila, una barra o una tarjeta para ver para qué existe, quién la tiene, cuánto dura y de qué depende.'
                : 'Arrastra una fase desde la paleta, usa una plantilla de metodología, o deja que Zaelyn te proponga el plan completo.'}</p>
              {!doc.nodos.length && puede && (
                <div className="ed-arranques">
                  <button className="ed-btn zaelyn" onClick={() => setPanel('zaelyn')}><Chispa />Armar con Zaelyn</button>
                  <button className="ed-btn suave" onClick={() => setDialogo('fabrica')}>Usar una plantilla</button>
                  <button className="ed-btn suave" onClick={() => crear('fase', { padre: null, antesDe: null })}>Primera fase a mano</button>
                </div>
              )}
              <div className="ed-proyecto-info">
                <label><span>Objetivo del proyecto</span>
                  <textarea rows={3} value={h.presente.objetivo ?? ''} disabled={!puede}
                    onChange={e => cambiarDoc({ objetivo: e.target.value || undefined } as Partial<Doc>, 'doc:objetivo')} placeholder="Para qué existe este proyecto" />
                </label>
                <label><span>Alcance</span>
                  <textarea rows={3} value={h.presente.alcance ?? ''} disabled={!puede}
                    onChange={e => cambiarDoc({ alcance: e.target.value || undefined } as Partial<Doc>, 'doc:alcance')} placeholder="Qué entra y qué no" />
                </label>
              </div>
            </div>
          )}
        </aside>
      </div>

      {aviso && <div className="ed-toast" role="status">{aviso}</div>}

      {liberando && id && version && (
        <Liberar
          id={id} version={version} nombre={nombre} grupoInicial={grupo?.id ?? liberado?.groupId ?? null}
          onCerrar={() => setLiberando(false)}
          onLiberado={(l) => { setLiberado(l); setAviso('Listo: Zaelyn ya sigue el plan. Cada responsable recibirá sus actividades por el chat.') }}
        />
      )}

      {antes && (
        <div className="ed-velo" onClick={() => setAntes(null)}>
          <div className="ed-dialogo" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Antes de liberar</h3>
            <p>
              La revisión encontró {antes.errores ? <b>{antes.errores} error{antes.errores === 1 ? '' : 'es'}</b> : null}
              {antes.errores && antes.avisos ? ' y ' : ''}
              {antes.avisos ? <b>{antes.avisos} aviso{antes.avisos === 1 ? '' : 's'}</b> : null}
              {' '}en el plan: fechas en fin de semana o festivo, dependencias que no se respetan, totales que no cuadran.
              Lo que se libera es lo que Zaelyn va a seguir y avisar.
            </p>
            <ul className="ed-antes-lista">
              {antes.hallazgos.filter(x => x.nivel !== 'info').slice(0, 5).map((x, i) => (
                <li key={i}><b>{x.titulo ?? 'Plan'}</b> — {x.dice}</li>
              ))}
            </ul>
            <div className="ed-dlg-acciones">
              <button className="ed-btn suave" onClick={() => { setAntes(null); setLiberando(true) }}>Liberar así</button>
              <button className="ed-btn primario" onClick={() => { setAntes(null); setPanel('revision') }}>Ver la revisión</button>
            </div>
          </div>
        </div>
      )}

      {dialogo && (
        <div className="ed-velo" onClick={() => setDialogo(null)}>
          <div className="ed-dialogo" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            {dialogo === 'plantilla' ? (
              <>
                <h3>Guardar como plantilla</h3>
                <p>Se guarda la estructura —fases, actividades, duraciones, dependencias, objetivos— sin responsables. Es tuya y la puedes usar en cualquiera de tus grupos.</p>
                <label><span>Nombre de la plantilla</span><input autoFocus value={nombrePlantilla} onChange={e => setNombrePlantilla(e.target.value)} /></label>
                <div className="ed-dlg-acciones">
                  <button className="ed-btn suave" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button className="ed-btn primario" onClick={guardarPlantilla} disabled={enviandoPlantilla}>{enviandoPlantilla ? 'Guardando…' : 'Guardar plantilla'}</button>
                </div>
              </>
            ) : (
              <>
                <h3>Empezar desde una plantilla de metodología</h3>
                <p>{doc.nodos.length ? 'Reemplaza lo que hay en el lienzo (se puede deshacer). ' : ''}Las fechas se corren al arranque del proyecto: {corta(doc.inicio ?? hoyISO())}.</p>
                <div className="ed-fabricas">
                  {base.map(p => (
                    <button key={p.clave} className="ed-fabrica" onClick={() => usarFabrica(p)}>
                      <span className="ed-overline">{METODOLOGIA_CORTA[p.metodologia]}</span>
                      <b>{p.nombre}</b>
                      <span>{p.resumen}</span>
                      <span className="mono">{p.doc.nodos.length} objetos</span>
                    </button>
                  ))}
                </div>
                <div className="ed-dlg-acciones"><button className="ed-btn suave" onClick={() => setDialogo(null)}>Cerrar</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export type { Metodologia }
