import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { cuentaWeb, planYUso, soyAdmin } from '@/lib/api'
import { CuentaWeb } from '@/components/portal/CuentaWeb'
import { textos } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Cuenta' }

/** `/app/cuenta` — todo lo de la suscripción en un solo lugar (#186). */
export default async function Cuenta() {
  const [r, admin, lang, web] = await Promise.all([planYUso(), soyAdmin(), idiomaActual(), cuentaWeb()])
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  const t = textos(lang)
  const tarjetas: { href: string; t: string; d: string }[] = [
    { href: '/app/plan', t: t('po.cu.plan'), d: t('po.cu.plan.d') },
    { href: '/app/participaciones', t: t('po.cu.part'), d: t('po.cu.part.d') },
    { href: '/app/organizacion', t: t('po.cu.org'), d: t('po.cu.org.d') },
    { href: '/legal/datos', t: t('po.cu.legal'), d: t('po.cu.legal.d') },
  ]
  if (admin) tarjetas.push({ href: '/admin', t: t('po.admin'), d: t('po.ad.d') })

  return (
    <>
      <Barra area="cuenta" sesion modo="cuenta" />
      <main className="pt-lienzo">
        <div className="pt-hub-cabeza">
          <h1>{t('po.cu.h1')}</h1>
          <p>{t('po.cu.sub')} <b>{r.dato.plan.nombre}</b></p>
        </div>
        {web.ok && (
          <section className="pt-area cw-marco" data-area="cuenta" id="acceso">
            <header><h2>Acceso web y avisos</h2></header>
            <CuentaWeb inicial={web.dato} />
          </section>
        )}
        <div className="pt-areas-rejilla">
          {tarjetas.map((x) => (
            <Link key={x.href} href={x.href} className="pt-area" data-area={x.href === '/admin' ? 'admin' : 'cuenta'} style={{ textDecoration: 'none', color: 'inherit' }}>
              <header><h2>{x.t}</h2><span className="pt-chip">→</span></header>
              <p>{x.d}</p>
            </Link>
          ))}
          <div className="pt-area" data-area="cuenta">
            <header><h2>{t('po.cu.sesiones')}</h2></header>
            <p>{t('po.cu.sesiones.d')}</p>
          </div>
        </div>
      </main>
      <Pie modo="cuenta" />
    </>
  )
}
