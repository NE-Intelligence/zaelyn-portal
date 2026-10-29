'use client'

/**
 * Acceso web, avisos y canales, en la cuenta.
 *
 * Ref: Zaelyn DECISIONS #229
 *
 *  - Correo: la llave de recuperación. Quien llegó por Telegram lo agrega
 *    aquí, desde su sesión (nunca se junta una cuenta con otra por correo).
 *  - Passkeys: entrar con huella o Face ID; se agregan y se quitan.
 *  - Avisos en este dispositivo: Zaelyn suena aquí aunque el portal esté
 *    cerrado. «Recibir mis avisos aquí» además lo hace tu canal principal.
 *  - Vincular Telegram: un código que se manda al bot.
 */
import { startRegistration } from '@simplewebauthn/browser'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { nombreDeEquipo } from './Acceso'
import type { CuentaWeb as Datos } from '@/lib/api'

async function pedir(ruta: string, cuerpo?: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  try {
    const r = await fetch(ruta, cuerpo === undefined ? { cache: 'no-store' } : {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo),
    })
    return { status: r.status, json: (await r.json().catch(() => ({}))) as Record<string, unknown> }
  } catch { return { status: 0, json: { error: 'CAIDO' } } }
}

const ERRORES: Record<string, string> = {
  CORREO: 'Ese correo no se ve bien.',
  CODIGO: 'Ese código no sirve o ya venció.',
  CORREO_TOMADO: 'Ese correo ya es de otra cuenta.',
  CORREO_NO_CONECTADO: 'El correo todavía no está conectado. Vuelve a intentarlo más tarde.',
  DEMASIADOS: 'Demasiados intentos. Espera unos minutos.',
  FALTA_CORREO: 'Primero agrega tu correo: es como recuperas tu cuenta si pierdes el teléfono.',
  SIN_AVISOS: 'Los avisos al navegador todavía no están conectados.',
}
const explicar = (e: unknown) => ERRORES[String(e)] ?? 'Algo falló. Intenta en un momento.'

/** La llave VAPID de base64url a bytes, como la pide el navegador. */
function aBytes(b64: string): Uint8Array {
  const p = '='.repeat((4 - (b64.length % 4)) % 4)
  const s = atob((b64 + p).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, c => c.charCodeAt(0))
}

export function CuentaWeb({ inicial, alTerminar }: { inicial: Datos; alTerminar?: string }) {
  const router = useRouter()
  const [d, setD] = useState(inicial)
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [esperandoCodigo, setEsperandoCodigo] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [avisosAqui, setAvisosAqui] = useState<'no' | 'si' | 'bloqueado' | 'sin-soporte'>('no')
  const [enlace, setEnlace] = useState<{ codigo: string; telegram: string | null } | null>(null)

  const recargar = async () => {
    const r = await pedir('/api/cuenta/web')
    if (r.status === 200) setD(r.json as unknown as Datos)
    router.refresh()
  }

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setAvisosAqui('sin-soporte'); return }
    if (Notification.permission === 'denied') { setAvisosAqui('bloqueado'); return }
    void navigator.serviceWorker.getRegistration().then(async reg => {
      const sub = await reg?.pushManager.getSubscription()
      if (sub) setAvisosAqui('si')
    })
  }, [])

  const mandar = async () => {
    setMsg(null); setOcupado(true)
    const r = await pedir('/api/cuenta/correo', { email })
    setOcupado(false)
    if (r.status === 202) { setEsperandoCodigo(true); setCodigo('') } else setMsg(explicar(r.json['error']))
  }
  const verificar = async () => {
    setMsg(null); setOcupado(true)
    const r = await pedir('/api/cuenta/correo-verificar', { email, codigo })
    setOcupado(false)
    if (r.status !== 200) return setMsg(explicar(r.json['error']))
    setEsperandoCodigo(false); setMsg('Correo agregado.')
    // En «completa tu acceso», con el correo ya está: se sigue a donde iba.
    if (alTerminar) { router.push(alTerminar); router.refresh(); return }
    await recargar()
  }

  const agregarPasskey = async () => {
    setMsg(null); setOcupado(true)
    try {
      const o = await pedir('/api/cuenta/passkey-opciones', {})
      if (o.status !== 200) return setMsg(explicar(o.json['error']))
      const respuesta = await startRegistration({ optionsJSON: o.json as never })
      const r = await pedir('/api/cuenta/passkey-registrar', { respuesta, nombre: nombreDeEquipo() })
      setMsg(r.status === 200 ? 'Passkey activada en este equipo.' : explicar(r.json['error']))
      await recargar()
    } catch {
      setMsg('No se completó la passkey.')
    } finally { setOcupado(false) }
  }
  const quitarPasskey = async (id: string) => {
    if (!confirm('¿Quitar esta passkey? Ese equipo ya no podrá entrar con ella.')) return
    await pedir('/api/cuenta/passkey-borrar', { id })
    await recargar()
  }

  const activarAvisos = async (principal: boolean) => {
    setMsg(null); setOcupado(true)
    try {
      const k = await pedir('/api/cuenta/push-clave')
      if (k.status !== 200) return setMsg(explicar(k.json['error']))
      const permiso = await Notification.requestPermission()
      if (permiso !== 'granted') { setAvisosAqui('bloqueado'); return setMsg('El navegador no dio permiso para avisos.') }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true, applicationServerKey: aBytes(String(k.json['clave'])) as BufferSource,
      })
      const r = await pedir('/api/cuenta/push-suscribir', { ...sub.toJSON(), nombre: nombreDeEquipo(), principal })
      if (r.status !== 200) return setMsg(explicar(r.json['error']))
      setAvisosAqui('si')
      setMsg(principal ? 'Listo: tus avisos llegan aquí.' : 'Avisos activados en este equipo.')
      await recargar()
    } catch {
      setMsg('No se pudieron activar los avisos en este navegador.')
    } finally { setOcupado(false) }
  }
  const desactivarAvisos = async () => {
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    if (sub) {
      await pedir('/api/cuenta/push-baja', { endpoint: sub.endpoint })
      await sub.unsubscribe()
    }
    setAvisosAqui('no'); await recargar()
  }

  const vincular = async () => {
    const r = await pedir('/api/cuenta/vincular', {})
    if (r.status === 200) setEnlace({ codigo: String(r.json['codigo']), telegram: (r.json['telegram'] as string | null) ?? null })
    else setMsg(explicar(r.json['error']))
  }

  const tieneTelegram = d.canales.includes('telegram')

  return (
    <div className="cw">
      <section className="cw-bloque">
        <h3>Correo</h3>
        {d.email ? (
          <p><b>{d.email}</b> · comprobado. Con él entras y recuperas tu cuenta.</p>
        ) : esperandoCodigo ? (
          <form className="ac-form" onSubmit={e => { e.preventDefault(); void verificar() }}>
            <label htmlFor="cw-codigo">El código que llegó a {email}</label>
            <input id="cw-codigo" className="ac-codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))} />
            <button className="pt-boton" type="submit" disabled={ocupado || codigo.length !== 6}>Comprobar</button>
          </form>
        ) : (
          <form className="ac-form" onSubmit={e => { e.preventDefault(); void mandar() }}>
            <label htmlFor="cw-correo">Agrega tu correo para entrar sin Telegram y recuperar tu cuenta</label>
            <input id="cw-correo" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <button className="pt-boton" type="submit" disabled={ocupado || !email}>Mandarme el código</button>
          </form>
        )}
      </section>

      <section className="cw-bloque">
        <h3>Passkeys</h3>
        {d.passkeys.length ? (
          <ul className="cw-lista">
            {d.passkeys.map(p => (
              <li key={p.id}>
                <span>{p.nombre}</span>
                <small>{p.usada ? `usada ${new Date(p.usada).toLocaleDateString()}` : `creada ${new Date(p.creada).toLocaleDateString()}`}</small>
                <button type="button" className="ac-volver" onClick={() => void quitarPasskey(p.id)}>Quitar</button>
              </li>
            ))}
          </ul>
        ) : <p className="nota">Entra con huella o Face ID, sin códigos.</p>}
        <button type="button" className="pt-boton pt-boton-sec" onClick={agregarPasskey} disabled={ocupado || !d.email}>
          Agregar passkey en este equipo
        </button>
        {!d.email && <p className="nota">Primero agrega tu correo.</p>}
      </section>

      <section className="cw-bloque">
        <h3>Avisos en este dispositivo</h3>
        {avisosAqui === 'sin-soporte' ? (
          <p className="nota">Este navegador no recibe avisos. En iPhone, primero agrega Zaelyn a tu pantalla de inicio (Compartir → «Agregar a inicio») y ábrela desde ahí.</p>
        ) : avisosAqui === 'bloqueado' ? (
          <p className="nota">Los avisos están bloqueados para este sitio en tu navegador. Actívalos en su configuración y vuelve aquí.</p>
        ) : avisosAqui === 'si' ? (
          <>
            <p>Zaelyn te avisa en este equipo.</p>
            <div className="cw-fila">
              <button type="button" className="pt-boton" onClick={() => void activarAvisos(true)} disabled={ocupado}>Recibir mis recordatorios aquí</button>
              <button type="button" className="ac-volver" onClick={() => void desactivarAvisos()}>Desactivar en este equipo</button>
            </div>
          </>
        ) : (
          <div className="cw-fila">
            <button type="button" className="pt-boton" onClick={() => void activarAvisos(true)} disabled={ocupado || !d.push}>Recibir mis avisos aquí</button>
            {!d.push && <p className="nota">Los avisos al navegador se están conectando.</p>}
          </div>
        )}
      </section>

      <section className="cw-bloque">
        <h3>Canales</h3>
        <p>Conectado: {d.canales.map(c => ({ telegram: 'Telegram', whatsapp: 'WhatsApp', web: 'Web', daemon: 'Escritorio' } as Record<string, string>)[c] ?? c).join(' · ') || '—'}</p>
        {!tieneTelegram && (
          enlace ? (
            <p>
              Manda <b className="cw-codigo">{enlace.codigo}</b> a Zaelyn en Telegram (vale 10 minutos).
              {enlace.telegram && <> <a href={enlace.telegram} target="_blank" rel="noopener noreferrer">Abrir Telegram</a></>}
            </p>
          ) : (
            <button type="button" className="pt-boton pt-boton-sec" onClick={() => void vincular()}>Vincular Telegram</button>
          )
        )}
      </section>

      {msg && <p className="ac-error" role="status">{msg}</p>}
      {alTerminar && d.email && (
        <button type="button" className="pt-boton" onClick={() => { router.push(alTerminar); router.refresh() }}>Continuar</button>
      )}
    </div>
  )
}
