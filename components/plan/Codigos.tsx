'use client'
/**
 * Códigos de prueba (Zaelyn DECISIONS #182): la casilla para canjear uno y,
 * para el equipo de Zaelyn, el generador de invitaciones de un mes.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { escribir } from '@/components/editor/comun'

export function CanjearCodigo({ prueba }: { prueba: { expira: string; tipo: string } | null }) {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)
  const [enviando, setEnviando] = useState(false)
  async function canjear() {
    setEnviando(true); setMsg(null)
    const r = await escribir<{ ok: boolean; mensaje: string }>('codigo', { codigo })
    setEnviando(false)
    if (r.ok) { setMsg({ ok: true, texto: r.dato.mensaje }); setCodigo(''); router.refresh() }
    else setMsg({ ok: false, texto: String(r.cuerpo['mensaje'] ?? 'No pude canjear ese código.') })
  }
  const vence = prueba ? new Date(prueba.expira).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : null
  return (
    <section className="pu-seccion">
      <h2>¿Tienes un código?</h2>
      {vence && (
        <div className="pu-aviso">
          {prueba!.tipo === 'invitacion' ? 'Tu invitación' : 'Tu prueba'} de Zaelyn completa vence el <b>{vence}</b>. Después tu cuenta sigue gratis en Kickoff, o puedes contratar PMO aquí mismo.
        </div>
      )}
      <p className="pu-nota">La guía de inicio trae un código para 3 días de Zaelyn completa. Si alguien del equipo de Zaelyn te invitó, su código te completa el mes.</p>
      <div className="og-form">
        <label>Código<input className="og-codigo" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} maxLength={24} placeholder="ZAELYN3" /></label>
        <button className="ed-btn primario" disabled={enviando || codigo.trim().length < 4} onClick={() => void canjear()}>
          {enviando ? 'Activando…' : 'Activar código'}
        </button>
      </div>
      {msg && <div className={msg.ok ? 'pu-aviso' : 'ed-error'} style={{ whiteSpace: 'pre-line' }}>{msg.texto}</div>}
    </section>
  )
}

export function Invitaciones({ lista }: { lista: Array<{ codigo: string; nota: string | null; usado: boolean; vence: string | null; creado: string }> }) {
  const router = useRouter()
  const [nota, setNota] = useState('')
  const [cuantas, setCuantas] = useState(1)
  const [nuevas, setNuevas] = useState<Array<{ codigo: string; liga: string }>>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  async function generar() {
    setEnviando(true); setError('')
    const r = await escribir<{ codigos: Array<{ codigo: string; liga: string }> }>('invitaciones', { cuantas, nota })
    setEnviando(false)
    if (!r.ok) { setError('No pude generar las invitaciones.'); return }
    setNuevas(r.dato.codigos); setNota(''); router.refresh()
  }
  return (
    <section className="pu-seccion">
      <h2>Invitaciones de un mes</h2>
      <p className="pu-nota">Solo el equipo de Zaelyn ve esto. Cada código es de un solo uso: completa un mes de Zaelyn completa desde la primera prueba de quien lo use. Vence en 60 días si nadie lo usa.</p>
      <div className="og-form">
        <label>Para quién (opcional)<input value={nota} onChange={e => setNota(e.target.value)} maxLength={80} placeholder="Laura · despacho" /></label>
        <label>Cuántas<input type="number" min={1} max={20} value={cuantas} onChange={e => setCuantas(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} /></label>
        <button className="ed-btn primario" disabled={enviando} onClick={() => void generar()}>{enviando ? 'Generando…' : 'Generar'}</button>
      </div>
      {error && <div className="ed-error">{error}</div>}
      {nuevas.length > 0 && (
        <div className="pu-aviso">
          {nuevas.map(n => <div key={n.codigo}><b className="og-codigo">{n.codigo}</b> · {n.liga}</div>)}
          <small>Manda el código o la liga: al tocarla se abre Zaelyn en Telegram y se activa sola.</small>
        </div>
      )}
      {lista.length > 0 && (
        <ul className="pu-ajenas">
          {lista.map(i => (
            <li key={i.codigo}>
              <span className="og-codigo">{i.codigo}</span>
              <span>{i.nota ?? 'Sin nombre'}</span>
              <span className="pu-chip">{i.usado ? 'Usada' : 'Sin usar'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
