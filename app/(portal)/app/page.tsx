import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { misGrupos, soyAdmin, yoMismo } from '@/lib/api'
import { textos } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Portal' }

/**
 * `/app` — la portada del portal (#186): una tarjeta por área.
 *
 * Antes aquí convivían Personal, los proyectos uno por uno, la familia y la
 * cuenta en una sola lista larga, y no se distinguía qué era qué. Ahora la
 * portada solo orienta: cuánto hay en cada área y la puerta para entrar.
 * Cada área tiene su propia casa con su detalle.
 *
 * NINGUNA TARJETA DICE UN PORCENTAJE: medir cada plan para pintar una
 * portada sería hacer cuentas aquí, y el atajo de hechas/total no es avance.
 */
export default async function Inicio() {
  const [r, yo, admin, lang] = await Promise.all([misGrupos(), yoMismo(7), soyAdmin(), idiomaActual()])
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  const t = textos(lang)

  const grupos = r.dato.grupos
  const proyectos = grupos.filter((g) => g.clase === 'work' || g.clase === 'other')
  const familias = grupos.filter((g) => g.clase === 'family')
  const planes = proyectos.reduce((n, g) => n + g.planes.length, 0)
  const vencidas = proyectos.reduce((n, g) => n + g.planes.reduce((m, p) => m + p.vencidos, 0), 0)
  const choques = yo.ok ? yo.dato.alertas.filter((a) => a.tipo === 'choque').length : 0
  const vencidasYo = yo.ok ? yo.dato.compromisos.pendientes.filter((p) => p.vencida).length : 0

  return (
    <>
      <Barra area="inicio" sesion />
      <main className="pt-lienzo">
        <div className="pt-hub-cabeza">
          <h1>{t('po.hola.h1')}</h1>
          <p>{t('po.hola.sub')}</p>
        </div>

        <div className="pt-areas-rejilla">
          {/* PERSONAL — lo que cruza a las otras dos */}
          <section className="pt-area" data-area="personal">
            <header>
              <h2>{t('po.personal')}</h2>
              {!yo.ok && yo.fallo === 'SIN_PLAN' && <span className="pt-chip">{t('po.sin.plan')}</span>}
            </header>
            <p>{t('po.pe.d')}</p>
            {yo.ok && (
              <>
                <div className="pt-cifras">
                  <span>{yo.dato.dias[0]?.entradas.length ?? 0} {t('po.hoy')}</span>
                  {choques > 0 && <span className="mal">{choques} {t('po.choques')}</span>}
                  {vencidasYo > 0 && <span className="mal">{vencidasYo} {t('po.vencidas')}</span>}
                </div>
                {yo.dato.foco.length > 0 && (
                  <ol className="pe-foco-lista">
                    {yo.dato.foco.slice(0, 3).map((f, i) => (
                      <li key={i}><span className="n">{i + 1}</span><div><b>{f.texto}</b><span>{f.grupo ?? '—'}</span></div></li>
                    ))}
                  </ol>
                )}
              </>
            )}
            <div className="pt-area-acc">
              <Link className="pt-area-boton" href="/app/personal">{t('po.abrir')}</Link>
              {!yo.ok && <Link className="pt-area-boton suave" href="/demo/personal">{t('po.ejemplo.ver')}</Link>}
            </div>
          </section>

          {/* FAMILIA */}
          <section className="pt-area" data-area="familia">
            <header>
              <h2>{t('po.familia')}</h2>
              {familias.length === 0 && <span className="pt-chip">{t('po.sin.grupo')}</span>}
            </header>
            <p>{t('po.fa.d')}</p>
            {familias.length > 0 && (
              <div className="pt-lista-enlaces">
                {familias.map((g) => (
                  <Link key={g.id} href={`/app/f/${g.id}`}><span>{g.nombre}</span><small>→</small></Link>
                ))}
              </div>
            )}
            <div className="pt-area-acc">
              <Link className="pt-area-boton" href="/app/familia">{t('po.abrir')}</Link>
              {familias.length === 0 && <Link className="pt-area-boton suave" href="/demo/familia">{t('po.ejemplo.ver')}</Link>}
            </div>
          </section>

          {/* PROYECTOS */}
          <section className="pt-area" data-area="proyectos">
            <header>
              <h2>{t('po.proyectos')}</h2>
              {proyectos.length === 0 && <span className="pt-chip">{t('po.sin.grupo')}</span>}
            </header>
            <p>{t('po.pr.d')}</p>
            {proyectos.length > 0 && (
              <div className="pt-cifras">
                <span>{proyectos.length} {t('po.grupos')}</span>
                <span>{planes} {t('po.planes')}</span>
                {vencidas > 0 && <span className="mal">{vencidas} {t('po.vencidas')}</span>}
              </div>
            )}
            <div className="pt-area-acc">
              <Link className="pt-area-boton" href="/app/proyectos">{t('po.abrir')}</Link>
              <Link className="pt-area-boton suave" href="/app/editor/nuevo">{t('po.pr.nuevo')}</Link>
            </div>
          </section>

          {/* CUENTA */}
          <section className="pt-area" data-area="cuenta">
            <header><h2>{t('po.cuenta')}</h2></header>
            <p>{t('po.cu.d')}</p>
            <div className="pt-lista-enlaces">
              <Link href="/app/plan"><span>{t('po.cu.plan')}</span><small>→</small></Link>
              <Link href="/app/participaciones"><span>{t('po.cu.part')}</span><small>→</small></Link>
              <Link href="/app/organizacion"><span>{t('po.cu.org')}</span><small>→</small></Link>
            </div>
          </section>

          {admin && (
            <section className="pt-area" data-area="admin">
              <header><h2>{t('po.admin')}</h2></header>
              <p>{t('po.ad.d')}</p>
              <div className="pt-area-acc">
                <Link className="pt-area-boton" href="/admin">{t('po.abrir')}</Link>
              </div>
            </section>
          )}
        </div>
      </main>
      <Pie />
    </>
  )
}
