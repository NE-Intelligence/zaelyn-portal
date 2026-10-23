import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { misGrupos } from '@/lib/api'
import { nombreDeRol } from '@/lib/plan-uso/tipos'
import { textos } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Familia' }

/**
 * `/app/familia` — la casa de Familia (#186).
 *
 * Con un solo grupo de familia, la pestaña lleva directo a su semana: una
 * lista de uno es un clic de más. Con varios (casas separadas, la familia
 * extendida), se elige. Sin ninguno, se explica cómo empezar.
 */
export default async function FamiliaCasa() {
  const [r, lang] = await Promise.all([misGrupos(), idiomaActual()])
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  const t = textos(lang)
  const familias = r.dato.grupos.filter((g) => g.clase === 'family')
  if (familias.length === 1) redirect(`/app/f/${familias[0].id}`)

  return (
    <>
      <Barra area="familia" sesion />
      <main className="pt-lienzo">
        <div className="pt-hub-cabeza">
          <h1>{t('po.fa.h1')}</h1>
          {familias.length > 0 && <p>{t('po.fa.sub')}</p>}
        </div>

        {familias.length === 0 ? (
          <article className="pt-area" data-area="familia" style={{ maxWidth: 640 }}>
            <header><h2>{t('po.fa.vacio.t')}</h2></header>
            <p>{t('po.fa.vacio.p')}</p>
            <div className="pt-area-acc">
              <Link className="pt-area-boton" href="/demo/familia">{t('po.ejemplo.ver')}</Link>
              <Link className="pt-area-boton suave" href="/app/plan">{t('po.cu.plan')}</Link>
            </div>
          </article>
        ) : (
          <div className="pt-areas-rejilla">
            {familias.map((g) => (
              <article className="pt-area" data-area="familia" key={g.id}>
                <header>
                  <h2>{g.nombre}</h2>
                  {g.rol && <span className="pt-chip">{nombreDeRol(g.rol)}</span>}
                </header>
                <div className="pt-atajos">
                  {([['calendario', 'Calendario'], ['traslados', 'Traslados'], ['quehaceres', 'Quehaceres'], ['medallero', 'Medallero'], ['fechas', 'Fechas']] as const).map(([v, x]) => (
                    <Link key={v} href={`/app/f/${g.id}?v=${v}`}>{x}</Link>
                  ))}
                </div>
                <div className="pt-area-acc">
                  <Link className="pt-area-boton" href={`/app/f/${g.id}`}>{t('po.abrir')}</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Pie />
    </>
  )
}
