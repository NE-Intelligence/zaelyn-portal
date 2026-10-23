import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { misGrupos } from '@/lib/api'
import { ROL_PUEDE, VISTA_NOMBRE } from '@/lib/plan'
import { nombreDeRol } from '@/lib/plan-uso/tipos'
import { fecha } from '@/components/portal/atomos'
import { textos } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Proyectos' }

/**
 * `/app/proyectos` — la casa de Proyectos (#186): los grupos de trabajo, sus
 * planes con atajos directos a cada vista, y el editor.
 *
 * Los grupos de familia ya no aparecen aquí: tienen su propia casa.
 */
export default async function Proyectos() {
  const [r, lang] = await Promise.all([misGrupos(), idiomaActual()])
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  const t = textos(lang)
  const trabajo = r.dato.grupos.filter((g) => g.clase === 'work')
  const otros = r.dato.grupos.filter((g) => g.clase !== 'work' && g.clase !== 'family')

  return (
    <>
      <Barra area="proyectos" sesion />
      <main className="pt-lienzo">
        <div className="pt-cabeza">
          <div className="fila">
            <div className="pt-hub-cabeza" style={{ minWidth: 0 }}>
              <h1>{t('po.pr.h1')}</h1>
              <p>{t('po.pr.sub')}</p>
            </div>
            <div className="ed-cab-acciones">
              <Link href="/app/editor" className="ed-btn suave">{t('po.pr.mios')}</Link>
              <Link href="/app/editor/nuevo" className="ed-btn primario">{t('po.pr.nuevo')}</Link>
            </div>
          </div>
        </div>

        {trabajo.length + otros.length === 0 && (
          <div className="pt-vacio" style={{ maxWidth: 560 }}>
            <b>{t('po.pr.vacio.t')}</b>
            <span>{t('po.pr.vacio.p')}</span>
            <Link href="/demo" style={{ color: 'var(--brand)' }}>{t('po.ejemplo.ver')} →</Link>
          </div>
        )}

        {[...trabajo, ...otros.filter((g) => g.planes.length > 0)].length > 0 && (
          <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))' }}>
            {[...trabajo, ...otros.filter((g) => g.planes.length > 0)].map((g) => (
              <article className="pt-grupo" key={g.id}>
                <header>
                  <h2>{g.nombre}</h2>
                  {g.rol && (
                    <span style={{ marginLeft: 'auto' }} className="pt-rol" title={ROL_PUEDE[g.rol] ?? undefined}>
                      {nombreDeRol(g.rol)}
                    </span>
                  )}
                </header>
                <Link href={`/app/g/${g.id}/editor`} className="ed-entrada">
                  <span>{t('po.pr.editor')}</span>
                  <small>{t('po.pr.editor.d')}</small>
                </Link>
                {g.planes.length === 0 && (
                  <div className="pt-vacio">
                    <b>{t('po.pr.sinplanes')}</b>
                    <span>Ármalo en el editor —a mano, desde una plantilla o con Zaelyn—, o dile «crea el plan Obra civil en {g.nombre}».</span>
                  </div>
                )}
                {g.planes.map((p) => (
                  <div className="pt-plan" key={p.id}>
                    <Link href={`/app/g/${g.id}/${p.id}`} className="t" style={{ color: 'inherit' }}>
                      <span>{p.nombre}</span>
                      {p.vencidos > 0 && (
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--st-detenida-ink)' }}>
                          {p.vencidos} {t('po.vencidas')}
                        </span>
                      )}
                    </Link>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                      {p.abiertos} {t('po.abiertas')}
                      {p.hasta && ` · ${fecha(p.hasta)}`}
                    </div>
                    <div className="pt-atajos">
                      {(['tablero', 'gantt', 'ruta', 'equipo'] as const).map((x) => (
                        <Link key={x} href={`/app/g/${g.id}/${p.id}?v=${x}`}>{VISTA_NOMBRE[x]}</Link>
                      ))}
                    </div>
                  </div>
                ))}
              </article>
            ))}
          </div>
        )}

        {otros.filter((g) => g.planes.length === 0).length > 0 && (
          <section className="pt-seccion-area">
            <h2 className="pt-overline">{t('po.pr.otros')}</h2>
            <p style={{ margin: 0, color: 'var(--ink-2)' }}>{t('po.pr.otros.d')}</p>
            <div className="pt-lista-enlaces" style={{ maxWidth: 560 }}>
              {otros.filter((g) => g.planes.length === 0).map((g) => (
                <Link key={g.id} href={`/app/g/${g.id}/editor`}><span>{g.nombre}</span><small>{t('po.pr.editor')} →</small></Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Pie />
    </>
  )
}
