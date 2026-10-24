import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { horasDelProyecto } from '@/lib/api'
import { AprobarHoras } from '@/components/horas/Aprobar'
import { TIPO_DICE, diaCorto, enHoras, esFecha, horasTexto, mesLargo, moverAncla, rangoDe, type Periodo } from '@/lib/horas'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Horas del proyecto' }

/**
 * `/app/g/<grupo>/horas` — las horas de UN proyecto (#191).
 *
 * Solo para quien lo dirige, y solo este proyecto: ni lo personal de nadie ni
 * lo que cada quien trabaja en otros proyectos. La disponibilidad sale con su
 * tipo y sin decir en qué más estaba la persona.
 */
export default async function HorasDelProyecto({ params, searchParams }: {
  params: Promise<{ grupo: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { grupo } = await params
  const sp = await searchParams
  const periodo: Periodo = sp.p === 'semana' ? 'semana' : 'mes'
  const ancla = esFecha(sp.d) ? sp.d : new Date().toISOString().slice(0, 10)
  const { desde, hasta } = rangoDe(periodo, ancla)
  const r = await horasDelProyecto(grupo, desde, hasta)
  if (!r.ok && r.fallo === 'SIN_PERMISO') {
    return (
      <>
        <Barra area="proyectos" migas={[{ texto: 'Proyecto', href: `/app/g/${grupo}?quedarme=1` }, { texto: 'Horas' }]} sesion />
        <main className="pt-lienzo">
          <div className="pt-vacio" style={{ maxWidth: 560 }}>
            <b>El reporte de horas del proyecto es de quien lo dirige o de su Stakeholder</b>
            <span>Tus propias horas, incluidas las de este proyecto, están en <Link href="/app/horas">Mis horas</Link>.</span>
          </div>
        </main>
        <Pie />
      </>
    )
  }
  if (!r.ok) return <SinSesion fallo={r.fallo === 'SIN_PERMISO' ? 'NO_LO_ENCUENTRO' : r.fallo} />
  const x = r.dato
  const q = (a: string, p: Periodo = periodo) => `/app/g/${grupo}/horas?p=${p}&d=${a}`
  const maxP = Math.max(1, ...x.porPersona.map(p => p.trabajo + p.disponibilidad))
  return (
    <>
      <Barra area="proyectos" migas={[{ texto: x.grupo, href: `/app/g/${grupo}?quedarme=1` }, { texto: 'Horas' }]} sesion />
      <main className="pt-lienzo">
        <div className="pt-cabeza">
          <div className="fila">
            <div>
              <h1>Horas de {x.grupo}</h1>
              <div className="meta">
                <span>{periodo === 'semana' ? `Semana del ${diaCorto(x.desde)}` : `Mes de ${mesLargo(x.desde)}`}</span>
                <span>Trabajo {horasTexto(x.totales.trabajo)}</span>
                {x.totales.disponibilidad > 0 && <span>Disponibilidad {horasTexto(x.totales.disponibilidad)}</span>}
                <span>{x.porPersona.length} persona{x.porPersona.length === 1 ? '' : 's'}</span>
              </div>
            </div>
            <div className="hr-nav">
              <Link className="ed-btn suave" href={q(moverAncla(periodo, ancla, -1))} aria-label="Anterior">←</Link>
              <Link className="ed-btn suave" href={q(new Date().toISOString().slice(0, 10))}>Hoy</Link>
              <Link className="ed-btn suave" href={q(moverAncla(periodo, ancla, 1))} aria-label="Siguiente">→</Link>
              <span className="hr-seg">
                <Link href={q(ancla, 'semana')} aria-current={periodo === 'semana' ? 'page' : undefined}>Semana</Link>
                <Link href={q(ancla, 'mes')} aria-current={periodo === 'mes' ? 'page' : undefined}>Mes</Link>
              </span>
              <Link className="ed-btn suave" href={`/app/g/${grupo}/presupuesto`}>Presupuesto</Link>
              <a className="ed-btn primario" href={`/app/g/${grupo}/horas/excel?desde=${x.desde}&hasta=${x.hasta}`}>Excel del proyecto</a>
            </div>
          </div>
        </div>

        <AprobarHoras envios={x.envios} grupo={grupo} desde={x.desde} hasta={x.hasta} />

        {!x.registros.length ? (
          <div className="pt-vacio" style={{ maxWidth: 620 }}>
            <b>Nadie ha registrado horas en este periodo</b>
            <span>Cada integrante registra las suyas en el chat («trabajé 3 horas en la migración») o en Mis horas del portal. Aquí se juntan solas.</span>
          </div>
        ) : (
          <>
            <div className="hr-rejilla">
              <section className="pt-tarjeta">
                <header><h2>Por persona</h2></header>
                <ul className="hr-dias">
                  {x.porPersona.map(p => (
                    <li key={p.persona}>
                      <span className="hr-dia">{p.persona}</span>
                      <div className="hr-barra">
                        <i className="t" style={{ width: `${(p.trabajo / maxP) * 100}%` }} />
                        <i className="d" style={{ width: `${(p.disponibilidad / maxP) * 100}%` }} />
                      </div>
                      <span className="hr-num mono">{enHoras(p.trabajo)}{p.disponibilidad ? <em> +{enHoras(p.disponibilidad)}</em> : null}</span>
                    </li>
                  ))}
                </ul>
                <p className="hr-ley"><i className="t" /> Trabajo <i className="d" /> Disponibilidad o guardia</p>
              </section>
              <section className="pt-tarjeta">
                <header><h2>Por actividad</h2><span className="pt-overline">estimado vs. real</span></header>
                <table className="hr-tabla">
                  <thead><tr><th>Actividad</th><th>Estimado</th><th>Real</th><th>Diferencia</th></tr></thead>
                  <tbody>
                    {x.porActividad.map(a => {
                      const dif = a.estimado === null ? null : a.real - a.estimado
                      return (
                        <tr key={a.pendienteId ?? a.actividad}>
                          <td>{a.actividad}{a.disponibilidad ? <small className="gris"> · +{enHoras(a.disponibilidad)} h disp.</small> : null}</td>
                          <td className="mono">{a.estimado === null ? '—' : enHoras(a.estimado)}</td>
                          <td className="mono">{enHoras(a.real)}</td>
                          <td className={`mono ${dif !== null && dif > 0 ? 'hr-pasado' : ''}`}>{dif === null ? '—' : `${dif > 0 ? '+' : ''}${enHoras(dif)}`}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p className="gris hr-chat">El estimado es el esfuerzo del plan (horas de la actividad). La diferencia cuenta lo registrado en este periodo.</p>
              </section>
            </div>
            <section className="pt-tarjeta hr-lista">
              <header><h2>Registros</h2></header>
              <table className="hr-tabla">
                <thead><tr><th>Día</th><th>Persona</th><th>Actividad</th><th>Tipo</th><th>Horas</th><th>Nota</th></tr></thead>
                <tbody>
                  {x.registros.map(rg => (
                    <tr key={rg.id}>
                      <td>{diaCorto(rg.fecha)}</td>
                      <td>{rg.persona}</td>
                      <td>{rg.actividad ?? rg.etiqueta ?? 'Sin actividad'}</td>
                      <td>{rg.tipo === 'disponibilidad' ? <span className="ed-chip">{TIPO_DICE.disponibilidad}</span> : TIPO_DICE.trabajo}</td>
                      <td className="mono">{enHoras(rg.minutos)}</td>
                      <td className="gris">{rg.nota ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
      <Pie />
    </>
  )
}
