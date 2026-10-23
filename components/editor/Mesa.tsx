'use client'
/**
 * La mesa del editor: los borradores del grupo, mis plantillas y las tres
 * formas de empezar un proyecto (en blanco, desde plantilla, con Zaelyn).
 */
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Mesa as MesaT, Tarjeta } from '@/lib/editor/tipos'
import { METODOLOGIA_CORTA } from '@/lib/editor/tipos'
import { hoyISO } from '@/lib/editor/programar'
import { Chispa, corta, decirError, escribir } from './comun'
import { nombreDeRol } from '@/lib/plan-uso/tipos'

const hace = (iso: string) => {
  const min = Math.round((Date.now() - Date.parse(iso)) / 60_000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return `hace ${d} día${d === 1 ? '' : 's'}`
}

export function Mesa({ mesa }: { mesa: MesaT }) {
  const router = useRouter()
  const g = mesa.grupo.id
  const [nombre, setNombre] = useState('')
  const [arranque, setArranque] = useState(hoyISO())
  const [plantilla, setPlantilla] = useState<string>(mesa.base[0] ? `base:${mesa.base[0].clave}` : '')
  const [aviso, setAviso] = useState('')

  const ir = (extra: Record<string, string>) => {
    const q = new URLSearchParams({ ...(nombre.trim() ? { nombre: nombre.trim() } : {}), arranque, ...extra })
    router.push(`/app/g/${g}/editor/nuevo?${q.toString()}`)
  }

  async function bajar(t: Tarjeta) {
    if (!window.confirm(`¿Quitar «${t.nombre}»? Deja de aparecer aquí.`)) return
    const r = await escribir('baja', { id: t.id })
    if (!r.ok) { setAviso(decirError(r)); return }
    router.refresh()
  }

  return (
    <div className="ed-mesa">
      <div className="pt-cabeza">
        <div className="fila">
          <div>
            <span className="pt-overline">Editor de proyectos</span>
            <h1>{mesa.grupo.nombre}</h1>
            <div className="meta">
              <span>Arma el plan aquí; Zaelyn lo sigue cuando lo liberas.</span>
              {mesa.rol && <span>Tu rol: {nombreDeRol(mesa.rol)}</span>}
            </div>
          </div>
          <Link className="ed-btn suave" href={`/app/g/${g}`}>Ver los planes que Zaelyn sigue</Link>
        </div>
      </div>

      {!mesa.puede && (
        <div className="ed-aviso" style={{ marginBottom: 20 }}>
          Tu rol en este grupo es de consulta: puedes abrir los borradores, no crearlos ni cambiarlos.
          Para armar planes hace falta ser líder o administrador del grupo.
        </div>
      )}
      {aviso && <div className="ed-error" style={{ marginBottom: 16 }}>{aviso}</div>}

      {mesa.puede && (
        <section className="ed-nuevo">
          <div className="ed-nuevo-datos">
            <label><span>Nombre del proyecto</span><input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej.: Subestación norte" /></label>
            <label><span>Arranque</span><input type="date" value={arranque} onChange={e => setArranque(e.target.value || hoyISO())} /></label>
          </div>
          <div className="ed-caminos">
            <button className="ed-camino zaelyn" onClick={() => ir({ ia: '1' })}>
              <span className="ed-orbe"><Chispa /></span>
              <b>Con Zaelyn</b>
              <span>Cuéntale objetivo, alcance y fecha comprometida. Te recomienda metodología y arma el plan completo, con para qué sirve cada actividad.</span>
              {!mesa.ia && <em>No conectado en este servidor</em>}
            </button>
            <div className="ed-camino">
              <span className="ed-orbe gris">
                <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z M4 9h16 M9 9v10" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
              </span>
              <b>Desde plantilla</b>
              <select value={plantilla} onChange={e => setPlantilla(e.target.value)}>
                {mesa.plantillas.length > 0 && (
                  <optgroup label="Mis plantillas">
                    {mesa.plantillas.map(p => <option key={p.id} value={`mia:${p.id}`}>{p.nombre}</option>)}
                  </optgroup>
                )}
                <optgroup label="Metodologías">
                  {mesa.base.map(p => <option key={p.clave} value={`base:${p.clave}`}>{p.nombre}</option>)}
                </optgroup>
              </select>
              <span>Las fechas se corren a tu arranque con el mismo calendario.</span>
              <button className="ed-btn primario" disabled={!plantilla} onClick={() => {
                const [tipo, clave] = plantilla.split(':')
                ir(tipo === 'mia' ? { plantilla: clave! } : { base: clave! })
              }}>Usar plantilla</button>
            </div>
            <button className="ed-camino" onClick={() => ir({})}>
              <span className="ed-orbe gris">+</span>
              <b>En blanco</b>
              <span>Arma objeto por objeto: arrastra fases, sprints, grupos, actividades e hitos desde la paleta.</span>
            </button>
          </div>
        </section>
      )}

      <section className="ed-seccion">
        <h2>Borradores del grupo <span className="mono">{mesa.borradores.length}</span></h2>
        {!mesa.borradores.length ? (
          <div className="pt-vacio" style={{ maxWidth: 560 }}>
            <b>Todavía no hay borradores</b>
            <span>Lo que se arme aquí aparece en esta lista para todo el grupo.</span>
          </div>
        ) : (
          <div className="ed-tarjetas">
            {mesa.borradores.map(t => (
              <article key={t.id} className="ed-doc">
                <Link href={`/app/g/${g}/editor/${t.id}`} className="ed-doc-link">
                  <span className="ed-chip">{METODOLOGIA_CORTA[t.metodologia] ?? t.metodologia}</span>
                  <b>{t.nombre}</b>
                  <span className="mono">{t.nodos} objetos · {corta(t.inicia)} – {corta(t.termina)}</span>
                  <span className="cuando">Editado {hace(t.movidoEn)} · v{t.version}</span>
                </Link>
                {mesa.puede && <button className="ed-btn texto" onClick={() => bajar(t)}>Quitar</button>}
              </article>
            ))}
          </div>
        )}
      </section>

      {mesa.plantillas.length > 0 && (
        <section className="ed-seccion">
          <h2>Mis plantillas <span className="mono">{mesa.plantillas.length}</span></h2>
          <div className="ed-tarjetas">
            {mesa.plantillas.map(t => (
              <article key={t.id} className="ed-doc plantilla">
                <div className="ed-doc-link">
                  <span className="ed-chip">{METODOLOGIA_CORTA[t.metodologia] ?? t.metodologia}</span>
                  <b>{t.nombre}</b>
                  <span className="mono">{t.nodos} objetos</span>
                  <span className="cuando">Guardada {hace(t.movidoEn)}</span>
                </div>
                <div className="ed-doc-acc">
                  {mesa.puede && <button className="ed-btn suave" onClick={() => ir({ plantilla: t.id, ...(nombre ? {} : { nombre: t.nombre }) })}>Usar</button>}
                  <button className="ed-btn texto" onClick={() => bajar(t)}>Quitar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * Mis proyectos: lo que armo sin grupo (el grupo se elige al liberar), lo
 * de mis grupos, y mis plantillas. Zaelyn DECISIONS #177.
 */
export function MesaPersonal({ datos }: { datos: import('@/lib/editor/tipos').MisProyectos }) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [arranque, setArranque] = useState(hoyISO())
  const [plantilla, setPlantilla] = useState<string>(
    datos.plantillas[0] ? `mia:${datos.plantillas[0].id}` : datos.base[0] ? `base:${datos.base[0].clave}` : '')
  const [aviso, setAviso] = useState('')

  const ir = (extra: Record<string, string>) => {
    const q = new URLSearchParams({ ...(nombre.trim() ? { nombre: nombre.trim() } : {}), arranque, ...extra })
    router.push(`/app/editor/nuevo?${q.toString()}`)
  }
  async function bajar(t: Tarjeta) {
    if (!window.confirm(`¿Quitar «${t.nombre}»? Deja de aparecer aquí.`)) return
    const r = await escribir('baja', { id: t.id })
    if (!r.ok) { setAviso(decirError(r)); return }
    router.refresh()
  }
  const grupoDe = new Map(datos.grupos.map(g => [g.id, g.nombre]))
  const Liberado = ({ t }: { t: Tarjeta }) => t.liberado
    ? <span className="ed-chip t-hito">Liberado en {grupoDe.get(t.liberado.groupId ?? '') ?? 'un grupo'}{t.version > t.liberado.version ? ' · con cambios' : ''}</span>
    : <span className="ed-chip t-subtarea">Borrador</span>

  return (
    <div className="ed-mesa">
      <div className="pt-cabeza">
        <div className="fila">
          <div>
            <span className="pt-overline">Editor de proyectos</span>
            <h1>Mis proyectos</h1>
            <div className="meta"><span>Arma el proyecto aquí; al liberarlo eliges el grupo —o creas uno— y Zaelyn lo empieza a seguir.</span></div>
          </div>
          <Link className="ed-btn suave" href="/app/proyectos">Proyectos</Link>
        </div>
      </div>
      {aviso && <div className="ed-error" style={{ marginBottom: 16 }}>{aviso}</div>}

      <section className="ed-nuevo">
        <div className="ed-nuevo-datos">
          <label><span>Nombre del proyecto</span><input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej.: Crear materiales para centro" /></label>
          <label><span>Arranque</span><input type="date" value={arranque} onChange={e => setArranque(e.target.value || hoyISO())} /></label>
        </div>
        <div className="ed-caminos">
          <button className="ed-camino zaelyn" onClick={() => ir({ ia: '1' })}>
            <span className="ed-orbe"><Chispa /></span>
            <b>Con Zaelyn</b>
            <span>Le cuentas objetivo, alcance y fechas; te recomienda metodología y arma el plan con puestos y para qué sirve cada actividad.</span>
            {!datos.ia && <em>No conectado en este servidor</em>}
          </button>
          <div className="ed-camino">
            <span className="ed-orbe gris"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z M4 9h16 M9 9v10" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></span>
            <b>Desde plantilla</b>
            <select value={plantilla} onChange={e => setPlantilla(e.target.value)}>
              {datos.plantillas.length > 0 && (
                <optgroup label="Mis plantillas">
                  {datos.plantillas.map(p => <option key={p.id} value={`mia:${p.id}`}>{p.nombre}</option>)}
                </optgroup>
              )}
              <optgroup label="Metodologías">
                {datos.base.map(p => <option key={p.clave} value={`base:${p.clave}`}>{p.nombre}</option>)}
              </optgroup>
            </select>
            <span>Luego eliges si manda el arranque o el go-live, y todo se reacomoda.</span>
            <button className="ed-btn primario" disabled={!plantilla} onClick={() => {
              const [tipo, clave] = plantilla.split(':')
              ir(tipo === 'mia' ? { plantilla: clave! } : { base: clave! })
            }}>Usar plantilla</button>
          </div>
          <button className="ed-camino" onClick={() => ir({})}>
            <span className="ed-orbe gris">+</span>
            <b>En blanco</b>
            <span>Arma objeto por objeto: fases, sprints, grupos, actividades, subtareas e hitos.</span>
          </button>
        </div>
      </section>

      <section className="ed-seccion">
        <h2>Mis borradores <span className="mono">{datos.borradores.length}</span></h2>
        {!datos.borradores.length ? (
          <div className="pt-vacio" style={{ maxWidth: 560 }}><b>Todavía no armas ningún proyecto aquí</b><span>Empieza con Zaelyn, desde una plantilla o en blanco.</span></div>
        ) : (
          <div className="ed-tarjetas">
            {datos.borradores.map(t => (
              <article key={t.id} className="ed-doc">
                <Link href={`/app/editor/${t.id}`} className="ed-doc-link">
                  <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="ed-chip">{METODOLOGIA_CORTA[t.metodologia] ?? t.metodologia}</span>
                    <Liberado t={t} />
                  </span>
                  <b>{t.nombre}</b>
                  <span className="mono">{t.nodos} objetos · {corta(t.inicia)} – {corta(t.termina)}</span>
                  <span className="cuando">Editado {hace(t.movidoEn)} · v{t.version}</span>
                </Link>
                <button className="ed-btn texto" onClick={() => bajar(t)}>Quitar</button>
              </article>
            ))}
          </div>
        )}
      </section>

      {datos.deGrupos.length > 0 && (
        <section className="ed-seccion">
          <h2>Borradores en mis grupos <span className="mono">{datos.deGrupos.length}</span></h2>
          <div className="ed-tarjetas">
            {datos.deGrupos.map(t => (
              <article key={t.id} className="ed-doc">
                <Link href={`/app/g/${t.groupId}/editor/${t.id}`} className="ed-doc-link">
                  <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="ed-chip">{t.grupo}</span>
                    <Liberado t={t} />
                  </span>
                  <b>{t.nombre}</b>
                  <span className="mono">{t.nodos} objetos · {corta(t.inicia)} – {corta(t.termina)}</span>
                  <span className="cuando">Editado {hace(t.movidoEn)}</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {datos.plantillas.length > 0 && (
        <section className="ed-seccion">
          <h2>Mis plantillas <span className="mono">{datos.plantillas.length}</span></h2>
          <div className="ed-tarjetas">
            {datos.plantillas.map(t => (
              <article key={t.id} className="ed-doc plantilla">
                <div className="ed-doc-link">
                  <span className="ed-chip">{METODOLOGIA_CORTA[t.metodologia] ?? t.metodologia}</span>
                  <b>{t.nombre}</b>
                  <span className="mono">{t.nodos} objetos</span>
                  <span className="cuando">Guardada {hace(t.movidoEn)}</span>
                </div>
                <div className="ed-doc-acc">
                  <button className="ed-btn suave" onClick={() => ir({ plantilla: t.id, ...(nombre ? {} : { nombre: t.nombre }) })}>Usar</button>
                  <button className="ed-btn texto" onClick={() => bajar(t)}>Quitar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
