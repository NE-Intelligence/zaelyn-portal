'use client'

/**
 * Entrar a Zaelyn desde la web: passkey, código al correo, o Telegram.
 *
 * Ref: Zaelyn DECISIONS #229
 *
 * Si el correo no tiene cuenta, el mismo flujo la crea: después del código se
 * escoge el @ y listo — la zona se toma del navegador. Al final se ofrece la
 * passkey, que es la forma rápida de volver a entrar.
 *
 * Ningún paso ve el token de sesión: lo pone el servidor como cookie
 * (`app/api/acceso`). Esta pantalla solo sabe «entraste» o «no».
 */
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'

type Paso = 'inicio' | 'correo' | 'codigo' | 'arroba' | 'passkey'

const MENSAJE: Record<string, string> = {
  CORREO: 'Ese correo no se ve bien. Revísalo.',
  CODIGO: 'Ese código no sirve o ya venció. Pide otro.',
  DEMASIADOS: 'Demasiados intentos. Espera unos minutos.',
  CORREO_NO_CONECTADO: 'La entrada por correo todavía no está conectada. Entra por Telegram o con tu passkey.',
  HANDLE_INVALIDO: 'Ese @ no sirve: de 3 a 20 letras, números o guion bajo.',
  HANDLE_OCUPADO: 'Ese @ ya es de alguien. Prueba otro.',
  CORREO_TOMADO: 'Ese correo ya tiene cuenta. Entra con él.',
  BOLETO: 'Se venció el paso. Vuelve a pedir tu código.',
  PASSKEY: 'No pude comprobar tu passkey. Prueba con tu correo.',
  SIN_PASSKEYS: 'Las passkeys no están disponibles ahora. Entra con tu correo.',
  CAIDO: 'Zaelyn no contesta ahora mismo. Intenta en un momento.',
}
const explicar = (e: unknown) => MENSAJE[String(e)] ?? MENSAJE['CAIDO']!

async function pedir(ruta: string, cuerpo: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  try {
    const r = await fetch(ruta, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) })
    return { status: r.status, json: (await r.json().catch(() => ({}))) as Record<string, unknown> }
  } catch {
    return { status: 0, json: { error: 'CAIDO' } }
  }
}

export function Acceso({ telegram, destino = '/app' }: { telegram?: ReactNode; destino?: string }) {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>('inicio')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [boleto, setBoleto] = useState('')
  const [arroba, setArroba] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const ir = () => { router.push(destino); router.refresh() }

  const conPasskey = async () => {
    setError(null); setOcupado(true)
    try {
      const o = await pedir('/api/acceso/passkey-opciones', {})
      if (o.status !== 200) return setError(explicar(o.json['error']))
      const respuesta = await startAuthentication({ optionsJSON: o.json as never })
      const e = await pedir('/api/acceso/passkey-entrar', { respuesta })
      if (e.status === 200) return ir()
      setError(explicar(e.json['error']))
    } catch {
      // La persona canceló el diálogo del sistema, o no tiene passkey aquí.
      setError('No se completó la passkey. Si es tu primera vez en este equipo, entra con tu correo.')
    } finally { setOcupado(false) }
  }

  const mandarCodigo = async () => {
    setError(null); setOcupado(true)
    const r = await pedir('/api/acceso/codigo', { email, locale: navigator.language })
    setOcupado(false)
    if (r.status === 202) { setPaso('codigo'); setCodigo('') } else setError(explicar(r.json['error']))
  }

  const verificar = async () => {
    setError(null); setOcupado(true)
    const r = await pedir('/api/acceso/verificar', { email, codigo })
    setOcupado(false)
    if (r.status !== 200) return setError(explicar(r.json['error']))
    if (r.json['estado'] === 'sesion') return ir()
    setBoleto(String(r.json['boleto'] ?? ''))
    setArroba(email.split('@')[0]!.replace(/[^a-z0-9_]/gi, '_').slice(0, 20).toLowerCase())
    setPaso('arroba')
  }

  const crear = async () => {
    setError(null); setOcupado(true)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const r = await pedir('/api/acceso/alta', { boleto, handle: arroba, tz, locale: navigator.language })
    setOcupado(false)
    if (r.status !== 200) return setError(explicar(r.json['error']))
    setPaso('passkey')
  }

  const activarPasskey = async () => {
    setError(null); setOcupado(true)
    try {
      const o = await pedir('/api/cuenta/passkey-opciones', {})
      if (o.status !== 200) return setError(explicar(o.json['error']))
      const respuesta = await startRegistration({ optionsJSON: o.json as never })
      const r = await pedir('/api/cuenta/passkey-registrar', { respuesta, nombre: nombreDeEquipo() })
      if (r.status === 200) return ir()
      setError(explicar(r.json['error']))
    } catch {
      setError('No se completó. Puedes activarla después en tu cuenta.')
    } finally { setOcupado(false) }
  }

  return (
    <div className="ac-caja">
      {paso === 'inicio' && (
        <>
          <button type="button" className="pt-boton ac-ancho" onClick={conPasskey} disabled={ocupado}>
            Entrar con passkey
          </button>
          <button type="button" className="pt-boton pt-boton-sec ac-ancho" onClick={() => { setError(null); setPaso('correo') }}>
            Entrar o crear cuenta con mi correo
          </button>
          {telegram && <div className="ac-o"><span>o</span></div>}
          {telegram}
        </>
      )}

      {paso === 'correo' && (
        <form className="ac-form" onSubmit={e => { e.preventDefault(); void mandarCodigo() }}>
          <label htmlFor="ac-correo">Tu correo</label>
          <input id="ac-correo" type="email" autoComplete="email" inputMode="email" required
            value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
          <p className="nota">Te mando un código de seis números. Si no tienes cuenta, la creamos.</p>
          <button className="pt-boton ac-ancho" type="submit" disabled={ocupado || !email}>Mandarme el código</button>
          <button type="button" className="ac-volver" onClick={() => setPaso('inicio')}>Volver</button>
        </form>
      )}

      {paso === 'codigo' && (
        <form className="ac-form" onSubmit={e => { e.preventDefault(); void verificar() }}>
          <label htmlFor="ac-codigo">El código que llegó a {email}</label>
          <input id="ac-codigo" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required
            value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="ac-codigo" />
          <button className="pt-boton ac-ancho" type="submit" disabled={ocupado || codigo.length !== 6}>Entrar</button>
          <button type="button" className="ac-volver" onClick={() => void mandarCodigo()} disabled={ocupado}>Mandar otro</button>
        </form>
      )}

      {paso === 'arroba' && (
        <form className="ac-form" onSubmit={e => { e.preventDefault(); void crear() }}>
          <label htmlFor="ac-arroba">Escoge tu @</label>
          <div className="ac-arroba"><span>@</span>
            <input id="ac-arroba" required minLength={3} maxLength={20} value={arroba}
              onChange={e => setArroba(e.target.value)} autoCapitalize="none" autoCorrect="off" />
          </div>
          <p className="nota">Es como te van a llamar en tus grupos y proyectos. Es único y es tuyo en todos lados.</p>
          <button className="pt-boton ac-ancho" type="submit" disabled={ocupado}>Crear mi cuenta</button>
        </form>
      )}

      {paso === 'passkey' && (
        <div className="ac-form">
          <b>Listo, ya tienes cuenta.</b>
          <p className="nota">Activa la entrada con huella o Face ID en este equipo: la próxima vez entras con un toque.</p>
          <button type="button" className="pt-boton ac-ancho" onClick={activarPasskey} disabled={ocupado}>Activar passkey</button>
          <button type="button" className="ac-volver" onClick={ir}>Ahora no</button>
        </div>
      )}

      {error && <p className="ac-error" role="alert">{error}</p>}
    </div>
  )
}

/** Un nombre reconocible para la passkey en la lista de la cuenta. */
export function nombreDeEquipo(): string {
  const ua = navigator.userAgent
  const so = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android'
    : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Este equipo'
  const nav = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : ''
  return nav ? `${so} · ${nav}` : so
}
