import Link from 'next/link'
import { Barra, Pie } from './Marco'
import { Entrar } from './Entrar'
import type { Fallo } from '@/lib/api'

/**
 * Lo que se ve cuando no se puede ver.
 *
 * ── CUATRO MOTIVOS Y CUATRO TEXTOS, NO UNA PANTALLA EN BLANCO ──────────
 *
 * «No tienes grupos», «no te deja entrar» y «el servidor no contesta» son
 * tres cosas distintas y la persona hace algo distinto con cada una. Una
 * pantalla vacía las junta en la peor de las tres: se lee como «aquí no hay
 * nada tuyo», que es lo único que no es cierto en ninguno de los casos.
 *
 * `NO_LO_ENCUENTRO` dice lo mismo que diría si el grupo no existiera, y eso
 * es deliberado del lado de Zaelyn (#167): a quien no puede ver un grupo no
 * se le confirma que exista.
 */
export function SinSesion({ fallo }: { fallo: Fallo }) {
  const texto: Record<Fallo, { titulo: string; cuerpo: React.ReactNode }> = {
    SIN_SESION: {
      titulo: 'Tu sesión no está abierta',
      cuerpo: (
        <>
          El portal no tiene registro ni contraseña: <b>la llave es tu chat</b>. No
          hay nada que dar de alta — tu cuenta de Telegram ya es tu identidad, y
          desde ahí Zaelyn te deja entrar.
        </>
      ),
    },
    NO_LO_ENCUENTRO: {
      titulo: 'No encuentro eso',
      cuerpo: (
        <>
          Puede que el plan no exista, o que no sea de un grupo tuyo. Vuelve a
          <Link href="/app" style={{ color: 'var(--brand)' }}> tus grupos</Link> y
          entra desde ahí.
        </>
      ),
    },
    SIN_API: {
      titulo: 'El portal todavía no está conectado',
      cuerpo: (
        <>
          Falta decirle a este sitio dónde vive Zaelyn. Mientras tanto puedes ver
          <Link href="/demo" style={{ color: 'var(--brand)' }}> el ejemplo completo</Link>,
          que es la misma pantalla con datos inventados.
        </>
      ),
    },
    CAIDO: {
      titulo: 'Zaelyn no contesta ahora mismo',
      cuerpo: (
        <>
          No es que no tengas nada: es que no pude preguntárselo. Vuelve a cargar
          en un momento. Si sigue así, pregúntale por el chat —eso va por otro
          camino y puede estar bien.
        </>
      ),
    },
  }
  const t = texto[fallo]

  return (
    <>
      <Barra migas={[{ texto: 'Portal' }]} />
      <main className="pt-lienzo">
        <div className="pt-vacio" style={{ maxWidth: 620 }}>
          <b>{t.titulo}</b>
          <span>{t.cuerpo}</span>
          {/* EL BOTÓN SOLO DONDE SIRVE. En «no lo encuentro» ya hay sesión, y
              ofrecer entrar otra vez mandaría a alguien a resolver un problema
              que no tiene. */}
          {fallo === 'SIN_SESION' && <Entrar />}
          <Link href="/proyectos" style={{ color: 'var(--brand)', marginTop: 6 }}>
            Cómo funciona Zaelyn para proyectos
          </Link>
        </div>
      </main>
      <Pie />
    </>
  )
}
