/**
 * El canje. SOLO POR POST.
 *
 * Ref: DECISIONS #172, #167
 *
 * Lo que antes hacía `GET /entrar`, y por eso se gastaban los pases solos:
 * el robot de previsualización de Telegram seguía la dirección del mensaje y
 * se llevaba la sesión. Ver `app/(portal)/entrar/page.tsx` para la historia
 * completa — aquí basta con la regla: un GET no cambia estado.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE, DIAS_SESION, canjear } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const aqui = req.nextUrl.origin
  const no = (r: string) => NextResponse.redirect(`${aqui}/entrar/no?r=${r}`, { status: 303 })

  const form = await req.formData().catch(() => null)
  const pase = String(form?.get('pase') ?? '').trim().toUpperCase()
  if (!pase) return no('falta')

  const r = await canjear(pase)
  if (!r.ok) {
    const porque = { NO_EXISTE: 'no_existe', EXPIRADO: 'expirado', YA_USADO: 'usado' }[r.error]
      ?? (r.error === 'SIN_API' ? 'sin_api' : 'caido')
    return no(porque)
  }

  /**
   * El destino lo decidió Zaelyn al emitir el pase: si la persona pidió «el
   * portal de Andes», cae en Andes y no en la lista a buscarlo otra vez. Se
   * comprueba que sea una ruta de ESTE sitio — un destino manipulado sería
   * una redirección abierta.
   */
  const ruta = r.destino && /^\/app(\/[\w\-/]*)?$/.test(r.destino) ? r.destino : '/app'

  // 303 y no 307: después de un POST, la redirección se sigue con GET. Con
  // 307 el navegador reenviaría el POST a `/app` y eso es un 405.
  const res = NextResponse.redirect(`${aqui}${ruta}`, { status: 303 })
  res.cookies.set({
    name: COOKIE,
    value: r.token,
    httpOnly: true,
    // `Secure` cuando el sitio va por HTTPS, que en zaelyn.ai es siempre.
    // Fijo en true rompía el desarrollo local sin decir por qué.
    secure: req.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: DIAS_SESION * 24 * 60 * 60,
  })
  return res
}
