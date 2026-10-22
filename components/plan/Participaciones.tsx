/**
 * «Mis participaciones» (Zaelyn DECISIONS #180): todo lo que haces, en todos
 * los grupos de todas las cuentas, por lo que haces en cada uno — y quién
 * paga tu lugar. Más el tablero del Stakeholder si lo eres en algún proyecto.
 */
import Link from 'next/link'
import { PAGA, type Ejecutivo, type Participacion, type VistaParticipaciones } from '@/lib/plan-uso/tipos'

const CAJONES: Array<{ k: Participacion['cajon']; titulo: string; dice: string }> = [
  { k: 'diriges', titulo: 'Diriges', dice: 'Donde eres Sponsor o Líder: decides.' },
  { k: 'ejecutas', titulo: 'Ejecutas', dice: 'Donde te toca hacer: tus actividades.' },
  { k: 'supervisas', titulo: 'Supervisas', dice: 'Donde eres Stakeholder: ves y comunicas.' },
  { k: 'sigues', titulo: 'Das seguimiento', dice: 'Donde eres Monitor: ves e informas.' },
]

const VEREDICTO: Record<Ejecutivo['veredicto'], string> = {
  al_dia: 'Al día', atrasado: 'Atrasado', adelantado: 'Adelantado', sin_fechas: 'Sin fechas',
}

const ddmm = (f: string | null) => (f ? `${f.slice(8, 10)}/${f.slice(5, 7)}` : '')

function Tarjeta({ p }: { p: Participacion }) {
  return (
    <Link href={`/app/g/${p.groupId}`} className="mp-tarjeta">
      <header><b>{p.grupo}</b><span className="mp-rol">{p.nombreRol}</span></header>
      <small>{PAGA(p.paga)}{p.ocupaLugar === false ? ' · sin costo: tienes PMO' : ''}</small>
      <div className="mp-cuentas">
        <span>{p.proyectosActivos} proyecto{p.proyectosActivos === 1 ? '' : 's'} activo{p.proyectosActivos === 1 ? '' : 's'}</span>
        {p.misAbiertas > 0 && <span>{p.misAbiertas} tuya{p.misAbiertas === 1 ? '' : 's'} abierta{p.misAbiertas === 1 ? '' : 's'}</span>}
        {p.misVencidas > 0 && <span className="mal">{p.misVencidas} vencida{p.misVencidas === 1 ? '' : 's'}</span>}
      </div>
    </Link>
  )
}

export function Participaciones({ v }: { v: VistaParticipaciones }) {
  const ps = v.participaciones
  return (
    <div className="pu">
      <header className="pu-cab">
        <div>
          <span className="pu-rotulo">Tu cuenta</span>
          <h1>Mis participaciones</h1>
          <p>Tu rol en cada proyecto lo da quien lo dirige. Lo que pagan otros no toca tu plan.</p>
        </div>
      </header>

      {v.tablero.length > 0 && (
        <section className="pu-seccion">
          <h2>Tablero de Stakeholder</h2>
          <p className="pu-nota">{v.tablero.length === 1 ? 'Tu proyecto' : `Tus ${v.tablero.length} proyectos`} como Stakeholder, de todos los Sponsors. Lo mismo te llega en un solo resumen cada lunes a las 9.</p>
          {v.tablero.map(t => (
            <div className="tb-fila" key={t.groupId}>
              <div>
                <h3><Link href={`/app/g/${t.groupId}`}>{t.grupo}</Link></h3>
                <span className={`tb-ver ${t.veredicto}`}>{VEREDICTO[t.veredicto]}</span>
                <p className="pu-nota" style={{ marginTop: 6 }}>{PAGA(t.paga)}</p>
              </div>
              <div className="tb-avance">
                {t.punto.total ? (
                  <>
                    <span><b>{t.punto.comprobado}%</b> comprobado · {t.punto.declarado}% declarado</span>
                    {t.punto.esperado !== null && <span>{t.punto.esperado}% esperado hoy</span>}
                    <div className="pu-barra"><span style={{ width: `${Math.min(100, t.punto.comprobado)}%` }} /></div>
                    <span>{t.punto.cerrados} de {t.punto.total} actividades cerradas</span>
                  </>
                ) : <span>Sin actividades todavía.</span>}
              </div>
              <ul className="tb-lista">
                {t.hitos.length > 0 && <li className="tit">Hitos, próximas 2 semanas</li>}
                {t.hitos.map((h, i) => <li key={`h${i}`}>{ddmm(h.vence)} — {h.texto}</li>)}
                <li className="tit">Requiere atención</li>
                {t.criticos.length ? t.criticos.map((c, i) => <li key={`c${i}`}>{c.texto} <span>({c.quien ?? 'sin dueño'})</span></li>) : <li>Nada crítico.</li>}
              </ul>
            </div>
          ))}
        </section>
      )}

      {!ps.length && <section className="pu-seccion"><p className="pu-nota">Todavía no estás en ningún grupo.</p></section>}

      {CAJONES.map(c => {
        const del = ps.filter(p => p.cajon === c.k)
        if (!del.length) return null
        return (
          <section className="pu-seccion" key={c.k}>
            <h2>{c.titulo} <span className="pu-nota">· {del.length}</span></h2>
            <p className="pu-nota">{c.dice}</p>
            <div className="mp-cajones">{del.map(p => <Tarjeta key={p.groupId} p={p} />)}</div>
          </section>
        )
      })}
    </div>
  )
}
