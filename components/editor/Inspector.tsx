'use client'
/**
 * El inspector: todo lo que se puede decir de un objeto, y sobre todo PARA
 * QUÉ existe. Objetivo, relevancia y criterio de terminado son lo primero que
 * se lee, no un campo escondido al final: es lo que alguien nuevo en el
 * proyecto necesita para entender por qué esa actividad está ahí.
 */
import { NOMBRE_ESFUERZO, aVista, deVista, esfuerzoTexto } from '@/lib/editor/unidades'
import { useMemo, useState } from 'react'
import type { Doc, Nodo, PersonaDelEditor, TipoNodo } from '@/lib/editor/tipos'
import { PROGRAMABLES, SEGUIMIENTO_DICE, TIPOS_NODO, TIPO_DICE, TIPO_NOMBRE, avanzo, puedeVivir } from '@/lib/editor/tipos'
import { arbol, cerrariaCiclo, type Medida } from '@/lib/editor/programar'
import { Avatar, ChipSeguimiento, IconoTipo, corta } from './comun'
import { nombreDeRol } from '@/lib/plan-uso/tipos'

export function Inspector({
  doc, nodo, medida, personas, puede, critica,
  onCambiar, onQuitar, onAgregarDentro, onEnlazar, onDesenlazar, onSeleccion, onSubtarea, onConvertirEnFase,
}: {
  doc: Doc
  nodo: Nodo
  medida: Medida | undefined
  personas: PersonaDelEditor[]
  puede: boolean
  critica: boolean
  onCambiar: (id: string, c: Partial<Nodo>) => void
  onQuitar: (id: string) => void
  onAgregarDentro: (padre: string, tipo: TipoNodo) => void
  onEnlazar: (sucesor: string, antecesor: string) => void
  onDesenlazar: (sucesor: string, antecesor: string) => void
  onSeleccion: (id: string) => void
  onSubtarea: (padre: string, titulo: string) => void
  /** Una actividad suelta que en realidad es una fase: la envuelve en una. */
  onConvertirEnFase?: (id: string) => void
}) {
  const { hijos, porId } = useMemo(() => arbol(doc), [doc])
  const [nuevaSub, setNuevaSub] = useState('')
  const [buscar, setBuscar] = useState('')
  const n = nodo
  const programable = PROGRAMABLES.includes(n.tipo)
  const contenedor = n.tipo === 'fase' || n.tipo === 'grupo' || n.tipo === 'sprint'
  const subs = (hijos.get(n.id) ?? []).filter(h => h.tipo === 'subtarea')
  const hijosPosibles = TIPOS_NODO.filter(t => puedeVivir(t, n.tipo))
  const sucesores = doc.nodos.filter(x => x.depende?.includes(n.id))
  const puestos = useMemo(() => [...new Set(doc.nodos.map(x => x.puesto).filter((x): x is string => !!x))].sort(), [doc.nodos])

  const candidatos = useMemo(() => {
    if (!programable) return []
    const q = buscar.trim().toLowerCase()
    return doc.nodos
      .filter(x => PROGRAMABLES.includes(x.tipo) && x.id !== n.id && !n.depende?.includes(x.id) && !cerrariaCiclo(doc, n.id, x.id))
      .filter(x => !q || x.titulo.toLowerCase().includes(q))
      .slice(0, 8)
  }, [doc, n, buscar, programable])

  const campo = (k: keyof Nodo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onCambiar(n.id, { [k]: e.target.value } as Partial<Nodo>)

  const ruta: Nodo[] = []
  for (let p = n.padre ? porId.get(n.padre) : undefined; p; p = p.padre ? porId.get(p.padre) : undefined) ruta.unshift(p)

  return (
    <div className={`ed-inspector t-${n.tipo}`}>
      <div className="ed-ins-cab">
        <span className={`ed-chip t-${n.tipo}`}><IconoTipo tipo={n.tipo} />{TIPO_NOMBRE[n.tipo]}</span>
        {critica && <span className="ed-chip critica">Ruta crítica</span>}
        {medida?.desborda && <span className="ed-chip aviso">Algo se sale del sprint</span>}
        <ChipSeguimiento n={n} />
      </div>
      {n.seguimiento && (
        <p className="ed-nota seg">
          En seguimiento: <b>{SEGUIMIENTO_DICE[n.seguimiento.estatus]}{n.seguimiento.avance ? ` · ${n.seguimiento.avance}%` : ''}</b>.
          {' '}El avance lo reporta la gente por el chat; liberar cambios no lo pisa.
        </p>
      )}
      {ruta.length > 0 && (
        <div className="ed-ruta">
          {ruta.map(r => <button key={r.id} onClick={() => onSeleccion(r.id)}>{r.titulo}</button>)}
        </div>
      )}
      <textarea
        className="ed-ins-titulo" value={n.titulo} rows={2} disabled={!puede} placeholder="Título"
        onChange={campo('titulo')}
      />
      <p className="ed-dice">{TIPO_DICE[n.tipo]}</p>

      <fieldset className="ed-para">
        <label>
          <span>Para qué <em>objetivo</em></span>
          <textarea rows={2} value={n.objetivo ?? ''} disabled={!puede} onChange={campo('objetivo')}
            placeholder={contenedor ? '¿Qué tiene que quedar logrado al cerrar esta etapa?' : '¿Qué resuelve esta actividad?'} />
        </label>
        {n.tipo !== 'subtarea' && (
          <label>
            <span>Por qué importa <em>relevancia</em></span>
            <textarea rows={2} value={n.relevancia ?? ''} disabled={!puede} onChange={campo('relevancia')}
              placeholder="¿Qué pasa con el proyecto si esto no se hace o se hace tarde?" />
          </label>
        )}
        {n.tipo !== 'subtarea' && (
          <label>
            <span>Cómo sabemos que terminó <em>criterio</em></span>
            <textarea rows={2} value={n.terminado ?? ''} disabled={!puede} onChange={campo('terminado')}
              placeholder="El entregable o la condición que lo cierra" />
          </label>
        )}
      </fieldset>

      {(programable || n.tipo === 'sprint') && (
        <div className="ed-rejilla">
          {(n.tipo === 'actividad' || n.tipo === 'hito') && (
            <label className="ancho">
              <span>Puesto <em>quién la hace, sin nombre propio</em></span>
              <input list="ed-puestos" value={n.puesto ?? ''} disabled={!puede} placeholder="Ej.: Analista de datos maestros"
                onChange={e => onCambiar(n.id, { puesto: e.target.value || undefined })} />
              <datalist id="ed-puestos">{puestos.map(p => <option key={p} value={p} />)}</datalist>
            </label>
          )}
          {n.tipo === 'actividad' && personas.length > 0 && (
            <label className="ancho">
              <span>Responsable <em>persona del grupo</em></span>
              <div className="ed-resp">
                <Avatar p={personas.find(p => p.id === n.responsable)} />
                <select value={n.responsable ?? ''} disabled={!puede}
                  onChange={e => onCambiar(n.id, { responsable: e.target.value || null })}>
                  <option value="">{n.puesto ? `Se asigna al liberar (${n.puesto})` : 'Sin responsable'}</option>
                  {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}{p.rol ? ` · ${nombreDeRol(p.rol)}` : ''}</option>)}
                </select>
              </div>
            </label>
          )}
          {n.tipo === 'actividad' && (
            <label className="ancho ed-check" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexDirection: 'row' }}>
              <input type="checkbox" checked={!!n.soporte} disabled={!puede} style={{ marginTop: 3 }}
                onChange={e => onCambiar(n.id, { soporte: e.target.checked || undefined })} />
              <span>Soporte post go-live <em>se sigue y se avisa igual, pero entre todas valen {doc.pesoSoporte ?? 5}% del avance</em></span>
            </label>
          )}
          {n.tipo === 'actividad' && (
            <label className="ancho">
              <span>Apoyo <em>quién más participa; le llegan los avisos de la fecha</em></span>
              <input key={`apoyo:${n.id}:${(n.apoyo ?? []).join('|')}`} list="ed-puestos" disabled={!puede}
                defaultValue={(n.apoyo ?? []).join(', ')} placeholder="Ej.: Consultor funcional (separa con comas)"
                onBlur={e => {
                  const v = [...new Set(e.target.value.split(/\s*[,;]\s*/).map(x => x.trim()).filter(Boolean))]
                  if (v.join('|') !== (n.apoyo ?? []).join('|')) onCambiar(n.id, { apoyo: v.length ? v : undefined })
                }} />
            </label>
          )}
          {n.tipo === 'actividad' && personas.length > 0 && (
            <label className="ancho">
              <span>Apoyan <em>personas del grupo</em></span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {(n.apoyan ?? []).map(id => {
                  const p = personas.find(x => x.id === id)
                  if (!p) return null
                  return (
                    <span key={id} className="ed-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Avatar p={p} chico />{p.nombre}
                      {puede && (
                        <button type="button" aria-label={`Quitar a ${p.nombre}`} className="ed-x"
                          onClick={() => onCambiar(n.id, { apoyan: (n.apoyan ?? []).filter(x => x !== id) })}>×</button>
                      )}
                    </span>
                  )
                })}
                <select value="" disabled={!puede}
                  onChange={e => {
                    if (!e.target.value) return
                    onCambiar(n.id, { apoyan: [...new Set([...(n.apoyan ?? []), e.target.value])] })
                  }}>
                  <option value="">{n.apoyan?.length ? 'Agregar otra…' : n.apoyo?.length ? `Se asigna al liberar (${n.apoyo.join(', ')})` : 'Agregar a alguien…'}</option>
                  {personas.filter(p => p.id !== n.responsable && !(n.apoyan ?? []).includes(p.id))
                    .map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
            </label>
          )}
          {n.tipo === 'actividad' && personas.length === 0 && (
            <p className="ed-nota ancho">Este borrador todavía no es de un grupo: pon el puesto y la persona se elige al liberarlo.</p>
          )}
          <label>
            <span>{n.tipo === 'hito' ? 'Fecha' : 'Inicio'}</span>
            <input type="date" value={n.inicio ?? ''} disabled={!puede}
              onChange={e => onCambiar(n.id, { inicio: e.target.value || null })} />
          </label>
          {n.tipo !== 'hito' && (
            <label>
              <span>Duración ({doc.habiles ? 'días hábiles' : 'días'})</span>
              <input type="number" min={1} max={3650} value={n.dias ?? 1} disabled={!puede}
                onChange={e => onCambiar(n.id, { dias: Math.max(1, Number(e.target.value) || 1) })} />
            </label>
          )}
          {n.tipo === 'actividad' && (
            <label>
              <span>Esfuerzo ({NOMBRE_ESFUERZO(doc)})</span>
              <input type="number" min={0} step={doc.unidad === 'dias' ? 0.25 : 0.5} value={n.horas != null ? aVista(n.horas, doc) : ''} disabled={!puede} placeholder="—"
                onChange={e => onCambiar(n.id, { horas: e.target.value === '' ? null : deVista(Math.max(0, Number(e.target.value)), doc) })} />
            </label>
          )}
          <div className="ed-fin">
            <span>Termina</span>
            <b className="mono">{corta(medida?.fin)}</b>
          </div>
        </div>
      )}

      {contenedor && medida && (
        <div className="ed-resumen-ins">
          <div><b className="mono">{corta(medida.inicio)} – {corta(medida.fin)}</b><span>abarca</span></div>
          <div><b className="mono">{medida.dias}</b><span>días</span></div>
          <div><b className="mono">{medida.piezas}</b><span>actividades e hitos</span></div>
          <div><b className="mono">{esfuerzoTexto(medida.horas, doc, true)}</b><span>esfuerzo estimado</span></div>
          {medida.sinDueno > 0 && <div className="aviso"><b className="mono">{medida.sinDueno}</b><span>sin responsable</span></div>}
        </div>
      )}

      {programable && (
        <section className="ed-deps">
          <h4>Depende de</h4>
          {!n.depende?.length && <p className="ed-nada">Puede empezar sin esperar a nadie.</p>}
          {n.depende?.map(d => {
            const a = porId.get(d)
            if (!a) return null
            return (
              <div className="ed-dep" key={d}>
                <button onClick={() => onSeleccion(d)}><IconoTipo tipo={a.tipo} />{a.titulo}</button>
                {puede && <button className="x" onClick={() => onDesenlazar(n.id, d)} aria-label="Quitar dependencia">×</button>}
              </div>
            )
          })}
          {puede && (
            <div className="ed-buscar">
              <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Agregar: busca una actividad o hito…" />
              {buscar && (
                <div className="ed-opciones">
                  {candidatos.map(c => (
                    <button key={c.id} onClick={() => { onEnlazar(n.id, c.id); setBuscar('') }}>
                      <IconoTipo tipo={c.tipo} />{c.titulo}
                    </button>
                  ))}
                  {!candidatos.length && <span className="ed-nada">Nada que encaje sin crear un ciclo.</span>}
                </div>
              )}
            </div>
          )}
          {sucesores.length > 0 && (
            <>
              <h4>La esperan</h4>
              {sucesores.map(s => (
                <div className="ed-dep" key={s.id}><button onClick={() => onSeleccion(s.id)}><IconoTipo tipo={s.tipo} />{s.titulo}</button></div>
              ))}
            </>
          )}
        </section>
      )}

      {n.tipo === 'actividad' && (
        <section className="ed-subs">
          <h4>Subtareas {subs.length > 0 && <span className="mono">{subs.filter(s => s.hecho).length}/{subs.length}</span>}</h4>
          {subs.map(s => (
            <label key={s.id} className="ed-sub">
              <input type="checkbox" checked={!!s.hecho} disabled={!puede} onChange={e => onCambiar(s.id, { hecho: e.target.checked || undefined })} />
              <input className="txt" value={s.titulo} disabled={!puede} onChange={e => onCambiar(s.id, { titulo: e.target.value })} />
              {puede && <button className="x" onClick={() => onQuitar(s.id)} aria-label="Quitar subtarea">×</button>}
            </label>
          ))}
          {puede && (
            <form className="ed-sub nueva" onSubmit={e => { e.preventDefault(); if (nuevaSub.trim()) { onSubtarea(n.id, nuevaSub.trim()); setNuevaSub('') } }}>
              <span className="mas">+</span>
              <input className="txt" value={nuevaSub} onChange={e => setNuevaSub(e.target.value)} placeholder="Agregar subtarea y Enter" />
            </form>
          )}
        </section>
      )}

      <label className="ed-notas">
        <span>Notas</span>
        <textarea rows={3} value={n.notas ?? ''} disabled={!puede} onChange={campo('notas')} placeholder="Supuestos, acuerdos, ligas…" />
      </label>

      {puede && (
        <div className="ed-ins-acciones">
          {onConvertirEnFase && n.tipo === 'actividad' && !n.padre && (
            <div className="ed-convertir">
              <span className="ed-nota">Está suelta, fuera de toda fase. Si en realidad es una fase (como una «Fase 0» de análisis), conviértela: queda una fase con esta actividad adentro, y su avance se conserva.</span>
              <button className="ed-btn suave" onClick={() => onConvertirEnFase(n.id)}>Convertir en fase</button>
            </div>
          )}
          {hijosPosibles.filter(t => t !== 'subtarea').map(t => (
            <button key={t} className="ed-btn suave" onClick={() => onAgregarDentro(n.id, t)}>+ {TIPO_NOMBRE[t]} dentro</button>
          ))}
          {avanzo(n)
            ? <span className="ed-nota">Ya avanzó en el seguimiento: no se quita desde aquí. Si ya no aplica, cancélala con Zaelyn en el chat.</span>
            : (
              <button className="ed-btn peligro" onClick={() => onQuitar(n.id)}>
                Quitar{(hijos.get(n.id) ?? []).length ? ' con todo lo de adentro' : ''}
              </button>
            )}
        </div>
      )}
    </div>
  )
}
