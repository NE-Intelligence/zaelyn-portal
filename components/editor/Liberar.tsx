'use client'
/**
 * Liberar a Zaelyn: elegir (o crear) el grupo, asignar cada puesto a una
 * persona, invitar a quien falte, ver exactamente qué va a entrar, y soltar.
 *
 * Ref: Zaelyn DECISIONS #177
 *
 * Todo lo que se ve aquí sale de la MISMA función del motor que después
 * escribe (`liberar` con `aplicarlo` falso y verdadero): lo que se enseña es
 * lo que se aplica.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GrupoDestino, Liberado, MisProyectos, VistaLiberar } from '@/lib/editor/tipos'
import { ROLES_DE_PROYECTO, ROL_DICE } from '@/lib/editor/tipos'
import { nombreDeRol } from '@/lib/plan-uso/tipos'
import { Avatar, Chispa, corta, decirError, escribir } from './comun'

type Invitacion = { codigo: string; expira: string; enlace: string | null }
type Plan = { modo: 'nuevo'; nombre: string } | { modo: 'existente'; planId: string }

export function Liberar({ id, version, nombre, grupoInicial, onCerrar, onLiberado }: {
  id: string
  version: number
  nombre: string
  grupoInicial: string | null
  onCerrar: () => void
  onLiberado: (l: Liberado) => void
}) {
  const [grupos, setGrupos] = useState<GrupoDestino[] | null>(null)
  const [grupoId, setGrupoId] = useState<string | null>(grupoInicial)
  const [plan, setPlan] = useState<Plan>({ modo: 'nuevo', nombre })
  const [planTocado, setPlanTocado] = useState(false)
  const [asignacion, setAsignacion] = useState<Record<string, string | null>>({})
  const [vista, setVista] = useState<VistaLiberar | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [choque, setChoque] = useState<string | null>(null)
  const [nuevoGrupo, setNuevoGrupo] = useState<{ nombre: string; clase: string } | null>(null)
  const [nuevaPersona, setNuevaPersona] = useState<{ nombre: string; rol: string; paraPuesto: string | null } | null>(null)
  const [invitaciones, setInvitaciones] = useState<Record<string, Invitacion>>({})
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<{ planId: string; grupo: string; creados: number; actualizados: number } | null>(null)
  const pedido = useRef(0)
  const [refrescar, setRefrescar] = useState(0)

  const cargarGrupos = useCallback(async (seleccionar?: string) => {
    const r = await escribir<MisProyectos>('mios', {})
    if (!r.ok) { setError(decirError(r)); return }
    const ok = r.dato.grupos.filter(g => g.puede)
    setGrupos(ok)
    if (seleccionar) setGrupoId(seleccionar)
    else if (!grupoInicial && ok.length === 1) setGrupoId(ok[0]!.id)
  }, [grupoInicial])

  useEffect(() => { void cargarGrupos() }, [cargarGrupos])

  // La vista previa se recalcula con cada decisión.
  useEffect(() => {
    if (!grupoId) { setVista(null); return }
    const n = ++pedido.current
    setCargando(true)
    const t = setTimeout(async () => {
      const r = await escribir<VistaLiberar>('liberar-vista', { id, groupId: grupoId, plan, asignacion })
      if (n !== pedido.current) return
      setCargando(false)
      if (!r.ok) {
        if (r.error === 'PLAN_EXISTE') { setChoque(String(r.cuerpo['detalle'] ?? '')); setError(''); return }
        setError(decirError(r)); setVista(null); return
      }
      setChoque(r.dato.choque); setError('')
      setVista(r.dato)
      // La primera vez en este grupo: si ya se liberó aquí, se propone
      // actualizar ese plan; y se adoptan los puestos que el grupo recuerda.
      if (!planTocado && r.dato.anterior && plan.modo === 'nuevo') {
        setPlan({ modo: 'existente', planId: r.dato.anterior.planId })
      }
      // Solo si hay algo que adoptar: devolver un objeto nuevo siempre
      // volvería a disparar este mismo efecto, sin fin.
      setAsignacion(a => {
        const faltan = r.dato.puestos.filter(p => !(p.huella in a) && p.asignado)
        if (!faltan.length) return a
        const b = { ...a }
        for (const p of faltan) b[p.huella] = p.asignado
        return b
      })
    }, 250)
    return () => clearTimeout(t)
  }, [id, grupoId, plan, asignacion, planTocado, refrescar])

  const grupo = useMemo(() => grupos?.find(g => g.id === grupoId) ?? null, [grupos, grupoId])
  const personas = vista?.personas ?? []

  async function crearGrupo() {
    if (!nuevoGrupo?.nombre.trim()) return
    setEnviando(true)
    const r = await escribir<{ id: string; nombre: string }>('grupo-crear', nuevoGrupo)
    setEnviando(false)
    if (!r.ok) { setError(decirError(r)); return }
    setNuevoGrupo(null)
    setPlanTocado(false)
    setPlan({ modo: 'nuevo', nombre })
    await cargarGrupos(r.dato.id)
  }

  async function agregarPersona() {
    if (!nuevaPersona?.nombre.trim() || !grupoId) return
    setEnviando(true)
    const r = await escribir<{ id: string; nombre: string; rol: string }>('persona', {
      groupId: grupoId, nombre: nuevaPersona.nombre, rol: nuevaPersona.rol,
    })
    setEnviando(false)
    if (!r.ok) { setError(decirError(r)); return }
    const para = nuevaPersona.paraPuesto
    setNuevaPersona(null)
    // Reasignar fuerza a recalcular la vista, que trae la persona nueva.
    setAsignacion(a => (para ? { ...a, [para]: r.dato.id } : { ...a }))
    setRefrescar(n => n + 1)
  }

  async function invitar(personaId: string) {
    if (!grupoId) return
    const r = await escribir<Invitacion>('invitar', { groupId: grupoId, personaId })
    if (!r.ok) { setError(decirError(r)); return }
    setInvitaciones(x => ({ ...x, [personaId]: r.dato }))
  }

  async function soltar() {
    if (!grupoId || !vista) return
    setEnviando(true); setError('')
    const r = await escribir<{ planId: string; aplicado: { creados: number; actualizados: number } | null }>('liberar', {
      id, groupId: grupoId, plan, asignacion, version,
    })
    setEnviando(false)
    if (!r.ok) { setError(decirError(r)); return }
    setListo({ planId: r.dato.planId, grupo: vista.grupo.nombre, creados: r.dato.aplicado?.creados ?? 0, actualizados: r.dato.aplicado?.actualizados ?? 0 })
    onLiberado({ groupId: grupoId, planId: r.dato.planId, en: new Date().toISOString(), version })
  }

  const copiar = (t: string) => { void navigator.clipboard?.writeText(t).catch(() => {}) }
  const textoInvitacion = (p: { nombre: string }, inv: Invitacion) =>
    `Hola ${p.nombre}: te invito al grupo «${vista?.grupo.nombre}» en Zaelyn, donde vamos a llevar «${nombre}».\n`
    + (inv.enlace ? `Abre ${inv.enlace} o escríbele a Zaelyn este código: ${inv.codigo}` : `Escríbele a Zaelyn en Telegram este código: ${inv.codigo}`)
    + `\n(Vale hasta el ${corta(inv.expira.slice(0, 10))}.)`

  if (listo) {
    return (
      <div className="ed-velo">
        <div className="ed-dialogo ed-liberar listo" role="dialog" aria-modal="true">
          <span className="ed-orbe"><Chispa /></span>
          <h3>Zaelyn ya sigue «{nombre}» en {listo.grupo}</h3>
          <p>
            {listo.creados ? `${listo.creados} actividades e hitos entraron al plan` : ''}
            {listo.creados && listo.actualizados ? ' y ' : ''}
            {listo.actualizados ? `${listo.actualizados} se actualizaron` : ''}
            {!listo.creados && !listo.actualizados ? 'No había nada distinto que actualizar' : ''}.
            {' '}A partir de ahora cada responsable recibe sus pendientes por el chat, y el avance se reporta hablando con Zaelyn.
          </p>
          {Object.keys(invitaciones).length > 0 && <p>Recuerda mandar los códigos que generaste: hasta que los tecleen, sus actividades esperan con su nombre.</p>}
          <div className="ed-dlg-acciones">
            <button className="ed-btn suave" onClick={onCerrar}>Seguir en el editor</button>
            <a className="ed-btn primario" href={`/app/g/${grupoId}/${listo.planId}`}>Ver el seguimiento</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ed-velo" onClick={onCerrar}>
      <div className="ed-dialogo ed-liberar" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="ed-lib-cab">
          <div>
            <span className="ed-overline">Liberar a Zaelyn</span>
            <h3>{nombre}</h3>
          </div>
          <button className="x grande" onClick={onCerrar} aria-label="Cerrar">×</button>
        </div>

        <div className="ed-lib-cuerpo">
          {/* 1 · el grupo */}
          <section className="ed-lib-paso">
            <h4><span className="num">1</span>¿En qué grupo lo va a seguir Zaelyn?</h4>
            {!grupos ? <p className="ed-nada">Cargando tus grupos…</p> : (
              <div className="ed-lib-grupos">
                {grupos.map(g => (
                  <button key={g.id} className={`ed-lib-grupo${g.id === grupoId ? ' on vivo' : ''}`}
                    onClick={() => { setGrupoId(g.id); setPlanTocado(false); setPlan({ modo: 'nuevo', nombre }); setAsignacion({}) }}>
                    <b>{g.nombre}</b>
                    <span>{g.planes.length ? `${g.planes.length} plan${g.planes.length === 1 ? '' : 'es'}` : 'sin planes'} · {nombreDeRol(g.rol)}</span>
                  </button>
                ))}
                {nuevoGrupo ? (
                  <div className="ed-lib-grupo nuevo on">
                    <input autoFocus placeholder="Nombre del grupo" value={nuevoGrupo.nombre}
                      onChange={e => setNuevoGrupo({ ...nuevoGrupo, nombre: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') void crearGrupo() }} />
                    <select value={nuevoGrupo.clase} onChange={e => setNuevoGrupo({ ...nuevoGrupo, clase: e.target.value })}>
                      <option value="work">Trabajo o proyecto</option>
                      <option value="family">Familia</option>
                      <option value="other">Otro</option>
                    </select>
                    <div className="fila">
                      <button className="ed-btn texto" onClick={() => setNuevoGrupo(null)}>Cancelar</button>
                      <button className="ed-btn primario" onClick={() => void crearGrupo()} disabled={enviando || !nuevoGrupo.nombre.trim()}>Crear</button>
                    </div>
                  </div>
                ) : (
                  <button className="ed-lib-grupo mas" onClick={() => setNuevoGrupo({ nombre: '', clase: 'work' })}>
                    <b>+ Grupo nuevo</b><span>Lo creas aquí e invitas a tu equipo</span>
                  </button>
                )}
              </div>
            )}
          </section>

          {grupo && (
            <>
              {/* 2 · el plan */}
              <section className="ed-lib-paso">
                <h4><span className="num">2</span>¿Como plan nuevo o actualizando uno?</h4>
                <div className="ed-lib-plan">
                  <label className={plan.modo === 'nuevo' ? 'on' : ''}>
                    <input type="radio" checked={plan.modo === 'nuevo'} onChange={() => { setPlanTocado(true); setPlan({ modo: 'nuevo', nombre }) }} />
                    <span>Plan nuevo</span>
                    {plan.modo === 'nuevo' && (
                      <input className="txt" value={plan.nombre} onChange={e => { setPlanTocado(true); setPlan({ modo: 'nuevo', nombre: e.target.value }) }} />
                    )}
                  </label>
                  {grupo.planes.length > 0 && (
                    <label className={plan.modo === 'existente' ? 'on' : ''}>
                      <input type="radio" checked={plan.modo === 'existente'}
                        onChange={() => { setPlanTocado(true); setPlan({ modo: 'existente', planId: vista?.anterior?.planId ?? grupo.planes[0]!.id }) }} />
                      <span>Actualizar un plan que Zaelyn ya sigue</span>
                      {plan.modo === 'existente' && (
                        <select value={plan.planId} onChange={e => { setPlanTocado(true); setPlan({ modo: 'existente', planId: e.target.value }) }}>
                          {grupo.planes.map(p => <option key={p.id} value={p.id}>{p.nombre}{vista?.anterior?.planId === p.id ? ' · donde se liberó antes' : ''}</option>)}
                        </select>
                      )}
                    </label>
                  )}
                </div>
                {choque && (
                  <div className="ed-aviso">
                    Este grupo ya tiene un plan llamado «{choque}».{' '}
                    <button className="ed-btn texto" onClick={() => {
                      const x = grupo.planes.find(p => p.nombre === choque)
                      setPlanTocado(true)
                      if (x) setPlan({ modo: 'existente', planId: x.id })
                    }}>Actualizar ése</button> o cámbiale el nombre al nuevo.
                  </div>
                )}
              </section>

              {/* 3 · quién hace qué */}
              <section className="ed-lib-paso">
                <h4><span className="num">3</span>¿Quién toma cada puesto?</h4>
                {vista?.conservaResponsables && <p className="ed-nota">Las actividades que ya tienen responsable lo conservan; aquí solo van las que traen puesto.</p>}
                {vista && !vista.puestos.length && (
                  <p className="ed-nada">{vista.conservaResponsables ? 'Todas las actividades tienen su responsable.' : 'Las actividades no traen puesto: entran sin responsable y se asignan después por el chat. Puedes ponerles puesto en el inspector.'}</p>
                )}
                {vista && vista.puestos.length > 0 && (
                  <div className="ed-lib-puestos">
                    {vista.puestos.map(p => {
                      const sel = asignacion[p.huella] ?? p.asignado ?? ''
                      const per = personas.find(x => x.id === sel)
                      return (
                        <div className={`ed-lib-puesto${sel ? '' : ' falta'}`} key={p.huella}>
                          <div className="q">
                            <b>{p.puesto}</b>
                            <span>{p.actividades} actividad{p.actividades === 1 ? '' : 'es'}</span>
                          </div>
                          <div className="quien">
                            <Avatar p={per} chico />
                            <select value={sel} onChange={e => setAsignacion(a => ({ ...a, [p.huella]: e.target.value || null }))}>
                              <option value="">Sin asignar</option>
                              {personas.map(x => <option key={x.id} value={x.id}>{x.nombre}{x.rol ? ` · ${nombreDeRol(x.rol)}` : ''}{x.tieneCuenta ? '' : ' · sin cuenta'}</option>)}
                            </select>
                            {grupo.administra && (
                              <button className="ed-btn texto" onClick={() => setNuevaPersona({ nombre: '', rol: 'integrante', paraPuesto: p.huella })}>+ Persona</button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {nuevaPersona && (
                  <div className="ed-lib-nueva">
                    <input autoFocus placeholder="Nombre (como lo verá el equipo)" value={nuevaPersona.nombre}
                      onChange={e => setNuevaPersona({ ...nuevaPersona, nombre: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') void agregarPersona() }} />
                    <select value={nuevaPersona.rol} onChange={e => setNuevaPersona({ ...nuevaPersona, rol: e.target.value })}>
                      {ROLES_DE_PROYECTO.map(r => <option key={r} value={r}>{nombreDeRol(r)} — {ROL_DICE[r]}</option>)}
                    </select>
                    <button className="ed-btn texto" onClick={() => setNuevaPersona(null)}>Cancelar</button>
                    <button className="ed-btn primario" onClick={() => void agregarPersona()} disabled={enviando || nuevaPersona.nombre.trim().length < 2}>Agregar</button>
                  </div>
                )}
              </section>

              {/* 4 · el equipo e invitaciones */}
              <section className="ed-lib-paso">
                <h4>
                  <span className="num">4</span>El equipo del grupo
                  {grupo.administra && !nuevaPersona && (
                    <button className="ed-btn texto" onClick={() => setNuevaPersona({ nombre: '', rol: 'integrante', paraPuesto: null })}>+ Agregar persona</button>
                  )}
                </h4>
                <p className="ed-nota">Quien no tiene cuenta entra tecleando su código en Telegram; su cuenta se engancha a su nombre y conserva lo que ya tiene asignado.</p>
                <div className="ed-lib-equipo">
                  {personas.map(x => {
                    const inv = invitaciones[x.id]
                    return (
                      <div className="ed-lib-persona" key={x.id}>
                        <Avatar p={x} chico />
                        <span className="n">{x.nombre}</span>
                        <span className="r">{x.rol ? nombreDeRol(x.rol) : '—'}</span>
                        {x.tieneCuenta ? <span className="ok">con cuenta</span>
                          : inv ? (
                            <span className="codigo">
                              <b className="mono">{inv.codigo}</b>
                              <button className="ed-btn texto" onClick={() => copiar(textoInvitacion(x, inv))}>Copiar invitación</button>
                            </span>
                          ) : grupo.administra
                            ? <button className="ed-btn suave" onClick={() => void invitar(x.id)}>Generar código</button>
                            : <span className="r">sin cuenta</span>}
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* 5 · lo que entra */}
              <section className="ed-lib-paso">
                <h4><span className="num">5</span>Así entra a Zaelyn {cargando && <span className="ed-nota">· calculando…</span>}</h4>
                {vista && (
                  <div className="ed-lib-resumen">
                    <div><b className="mono">{vista.resumen.renglones}</b><span>actividades e hitos</span></div>
                    <div><b className="mono">{vista.resumen.nuevos}</b><span>nuevos</span></div>
                    <div><b className="mono">{vista.resumen.cambios}</b><span>con cambios</span></div>
                    <div className={vista.resumen.sinDueno ? 'aviso' : ''}><b className="mono">{vista.resumen.sinDueno}</b><span>sin responsable</span></div>
                    <div><b className="mono">{corta(vista.fechas.inicia)} – {corta(vista.fechas.termina)}</b><span>arranque y fin</span></div>
                  </div>
                )}
                {vista && vista.resumen.desaparecidos > 0 && (
                  <div className="ed-aviso">{vista.resumen.desaparecidos} actividades abiertas del plan ya no vienen en el borrador. No se cancelan: siguen abiertas en Zaelyn hasta que alguien las cierre.</div>
                )}
                {vista && vista.resumen.detalle.length > 0 && (
                  <ul className="ed-lib-cambios">
                    {vista.resumen.detalle.slice(0, 6).map((d, i) => <li key={i}><b>{d.texto}</b> · {d.campos.join(', ')}</li>)}
                  </ul>
                )}
                <p className="ed-nota">Entran las actividades y los hitos con su fase, fechas, horas, responsable y dependencias. Grupos y subtareas se quedan en el borrador por ahora. Lo que la gente ya reportó por el chat no se toca.</p>
              </section>
            </>
          )}
          {error && <div className="ed-error">{error}</div>}
        </div>

        <div className="ed-lib-pie">
          <button className="ed-btn suave" onClick={onCerrar}>Cancelar</button>
          <button className="ed-btn zaelyn" onClick={() => void soltar()} disabled={!vista || !!choque || cargando || enviando}>
            <Chispa />{enviando ? 'Liberando…' : plan.modo === 'existente' ? 'Actualizar el plan en Zaelyn' : 'Liberar a Zaelyn'}
          </button>
        </div>
      </div>
    </div>
  )
}
