/**
 * `/entrar?pase=...` — la única puerta del portal.
 *
 * Ref: Zaelyn DECISIONS #167
 *
 * ── POR QUÉ ES UN ROUTE HANDLER Y NO UNA PÁGINA ────────────────────────
 *
 * Porque tiene que PONER una cookie, y una página que se renderiza no puede.
 * Pero hay una razón mejor: así el pase no llega nunca a una pantalla. Entra
 * por la URL, se canjea en el servidor, se cambia por una cookie httpOnly y
 * la respuesta es una redirección. El pase no queda en el HTML, no queda en
 * un estado de React y no viaja al navegador.
 *
 * ── Y SE REDIRIGE SIEMPRE, incluso al fallar ───────────────────────────
 *
 * A `/entrar/no` con el motivo. Dejar la URL con el pase en la barra del
 * navegador haría que recargar la página intentara canjearlo otra vez —y el
 * pase es de un solo uso, así que la segunda vez diría «ya usado» sobre algo
 * que sí funcionó. Lo que la persona vería es que el portal se rompió.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE, DIAS_SESION, canjear } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const pase = (req.nextUrl.searchParams.get('pase') ?? '').trim().toUpperCase()
  const aqui = req.nextUrl.origin
  if (!pase) return NextResponse.redirect(`${aqui}/entrar/no?r=falta`)

  const r = await canjear(pase)
  if (!r.ok) {
    const porque = { NO_EXISTE: 'no_existe', EXPIRADO: 'expirado', YA_USADO: 'usado' }[r.error]
      ?? (r.error === 'SIN_API' ? 'sin_api' : 'caido')
    return NextResponse.redirect(`${aqui}/entrar/no?r=${porque}`)
  }

  // El destino lo decidió Zaelyn al emitir el pase: si la persona pidió «el
  // portal de Andes», cae en Andes y no en la lista a buscarlo otra vez.
  // Se valida que sea una ruta de ESTE sitio: un destino absoluto que
  // viniera manipulado sería una redirección abierta.
  const ruta = r.destino && /^\/app(\/[\w\-/]*)?$/.test(r.destino) ? r.destino : '/app'
  const res = NextResponse.redirect(`${aqui}${ruta}`)
  res.cookies.set({
    name: COOKIE,
    value: r.token,
    httpOnly: true,
    /**
     * `Secure` CUANDO EL SITIO VA POR HTTPS, que en zaelyn.ai es siempre.
     *
     * Fijo en `true` rompía el desarrollo local sin decir por qué: el
     * navegador aceptaba la cookie dentro de la redirección —así que la
     * primera pantalla cargaba— y no la guardaba, de modo que la SEGUNDA
     * decía «tu sesión no está abierta». Un fallo que aparece en el segundo
     * clic es de los que se persiguen media tarde.
     *
     * Se decide por el protocolo de ESTA petición y no por NODE_ENV: lo que
     * importa es si la cookie va a viajar cifrada, no en qué modo se compiló.
     */
    secure: req.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: DIAS_SESION * 24 * 60 * 60,
  })
  return res
}
