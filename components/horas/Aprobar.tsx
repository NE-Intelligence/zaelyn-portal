'use client'
/**
 * Los envíos de horas de un proyecto (#192): aprobar o rechazar lo que espera,
 * y bajar el documento de lo ya resuelto. Quién puede aprobar —y que nadie
 * apruebe lo suyo— lo decide el motor; aquí solo se pide.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { escribir } from '@/components/editor/comun'
import { ESTADO_ENVIO, diaCorto, enHoras, type EnvioHoras } from '@/lib/horas'

export function AprobarHoras({ envios, grupo, desde, hasta }: { envios: EnvioHoras[]; grupo: string; desde: string; hasta: string }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [rechazando, setRechazando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  const [msg, setMsg] = useState('')
  const pendientes = envios.filter(e => e.estado === 'enviado')
  const resueltos = envios.filter(e => e.estado !== 'enviado' && e.estado !== 'retirado')
  const hayAprobados = envios.some(e => e.estado === 'aprobado')

  async function resolver(id: string, veredicto: 'aprobado' | 'rechazado') {
    setOcupado(id); setMsg('')
    const r = await escribir<{ folio: string }>('horas-resolver', { id, veredicto, motivo: veredicto === 'rechazado' ? motivo : null })
    setOcupado(null)
    if (!r.ok) {
      setMsg(r.error === 'PROPIO' ? 'Son tus propias horas: las aprueba alguien más del proyecto.'
        : r.error === 'YA_RESUELTO' ? 'Ese envío ya estaba resuelto.' : 'No se pudo. Vuelve a intentarlo.')
      return
    }
    setRechazando(null); setMotivo('')
    setMsg(veredicto === 'aprobado' ? `Aprobado: ${r.dato.folio}. Ya tiene huella y su PDF.` : `Rechazado: ${r.dato.folio}. Le avisé para que corrija.`)
    router.refresh()
  }

  return (
    <section className="pt-tarjeta hr-lista">
      <header>
        <h2>Aprobación</h2>
        {hayAprobados && (
          <div className="hr-excel">
            <a className="ed-btn suave chico" href={`/app/g/${grupo}/horas/aprobadas?desde=${desde}&hasta=${hasta}&formato=pdf`}>PDF de lo aprobado</a>
            <a className="ed-btn suave chico" href={`/app/g/${grupo}/horas/aprobadas?desde=${desde}&hasta=${hasta}&formato=xlsx`}>Excel de lo aprobado</a>
          </div>
        )}
      </header>
      {msg && <div className="hr-ok">{msg}</div>}
      {!pendientes.length && !resueltos.length && <p className="gris">Nadie ha mandado horas a aprobar en este periodo.</p>}
      {pendientes.length > 0 && (
        <>
          <h3 className="hr-sub">Esperan tu aprobación</h3>
          <ul className="hr-pendientes">
            {pendientes.map(e => (
              <li key={e.id}>
                <div className="hr-que">
                  <b>{e.persona}</b> · {diaCorto(e.desde)} – {diaCorto(e.hasta)} · <span className="mono">{enHoras(e.trabajo)} h</span>
                  {e.disponibilidad ? <span className="hr-disp"> +{enHoras(e.disponibilidad)} h disp.</span> : null}
                  <small className="gris">{e.folio}</small>
                </div>
                <div className="hr-acciones">
                  <a className="ed-btn texto chico" href={`/app/horas/envio/${e.id}?formato=pdf`}>Ver PDF</a>
                  <button className="ed-btn suave chico" disabled={ocupado !== null} onClick={() => setRechazando(rechazando === e.id ? null : e.id)}>Rechazar</button>
                  <button className="ed-btn primario chico" disabled={ocupado !== null} onClick={() => resolver(e.id, 'aprobado')}>{ocupado === e.id ? '…' : 'Aprobar'}</button>
                </div>
                {rechazando === e.id && (
                  <div className="hr-rechazo">
                    <input maxLength={300} placeholder="¿Por qué? (opcional, se lo digo)" value={motivo} onChange={ev => setMotivo(ev.target.value)} />
                    <button className="ed-btn peligro chico" disabled={ocupado !== null} onClick={() => resolver(e.id, 'rechazado')}>Rechazar</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {resueltos.length > 0 && (
        <>
          <h3 className="hr-sub">Resueltos</h3>
          <table className="hr-tabla">
            <thead><tr><th>Folio</th><th>Persona</th><th>Periodo</th><th>Horas</th><th>Estado</th><th /></tr></thead>
            <tbody>
              {resueltos.map(e => (
                <tr key={e.id}>
                  <td className="mono">{e.folio}</td>
                  <td>{e.persona}</td>
                  <td>{diaCorto(e.desde)} – {diaCorto(e.hasta)}</td>
                  <td className="mono">{enHoras(e.trabajo)}</td>
                  <td><span className={`hr-estado e-${e.estado}`}>{ESTADO_ENVIO[e.estado]}</span>{e.resueltoPor && <small className="gris"> · {e.resueltoPor}</small>}{e.motivo && <small className="hr-motivo">«{e.motivo}»</small>}</td>
                  <td className="hr-acciones">{e.estado === 'aprobado' && <>
                    <a className="ed-btn suave chico" href={`/app/horas/envio/${e.id}?formato=pdf`}>PDF</a>
                    <a className="ed-btn suave chico" href={`/app/horas/envio/${e.id}?formato=xlsx`}>Excel</a>
                  </>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}
