/**
 * El Inicio de la persona, en Cristal (decisiones/2026-11-11-cristal). Solo
 * pinta lo que le pasan: `/app` con los datos del motor y `/demo/inicio` con
 * gente inventada. Las cifras ya vienen contadas; aquí no se mide nada.
 */
import Link from 'next/link'

export type DatosInicio = {
  fecha: string
  saludo: string
  quien: string | null
  foco: { texto: string; porque: string | null } | null
  personal: { hoy: number; vencidas: number; choques: number } | null
  familia: { nombre: string; href: string } | { cuantas: number; href: string } | null
  pmo: { proyectos: number; vencidas: number; href: string } | null
  hoy: Array<{ hora: string; texto: string; lugar: string }>
  hrefs: { personal: string; apps: string }
}

const TILE = 'cr-tarjeta cr-flota flex min-h-[220px] flex-col gap-3 p-7 text-tinta no-underline'

function Punto({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="flex items-center gap-2 text-[13px] tracking-[0.01em] text-tinta-2">
      <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 0 4px color-mix(in srgb, ${color} 18%, transparent)` }} aria-hidden="true" />
      {texto}
    </span>
  )
}

export function Inicio({ d }: { d: DatosInicio }) {
  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-12 px-6 pt-14 pb-24 text-tinta sm:px-14">
      <header className="flex flex-col gap-3">
        <span className="text-[13px] tracking-[0.04em] text-tinta-3 uppercase">{d.fecha}</span>
        <h1>
          {d.saludo}
          {d.quien && <>, <span className="cr-cursiva">{d.quien}</span></>}
        </h1>
      </header>

      {d.foco && (
        <section className="flex max-w-[720px] items-start gap-4">
          <span className="z-orbe respira size-12 flex-none" aria-hidden="true" />
          <p className="cr-vidrio rounded-[26px] rounded-tl-[10px] px-6 py-5 text-[17px] leading-[1.5]">
            {d.foco.texto}
            {d.foco.porque && <span className="text-tinta-2"> · {d.foco.porque}</span>}
          </p>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-3" aria-label="Tus soluciones">
        <Link href={d.hrefs.personal} className={TILE} style={{ ['--cr-d' as string]: '0s' }}>
          <span className="cr-brillo" aria-hidden="true" />
          <Punto color="var(--z-personal)" texto="Personal" />
          {d.personal ? (
            <>
              <span className="cr-cifra mt-auto text-[84px]">{d.personal.hoy}</span>
              <span className="text-[14.5px] text-tinta-2">
                {d.personal.hoy === 1 ? 'cosa hoy' : 'cosas hoy'}
                {d.personal.vencidas > 0 && <> · <span className="text-det-tinta">{d.personal.vencidas} {d.personal.vencidas === 1 ? 'vencida' : 'vencidas'}</span></>}
                {d.personal.choques > 0 && <> · {d.personal.choques} {d.personal.choques === 1 ? 'choque' : 'choques'}</>}
              </span>
            </>
          ) : (
            <span className="mt-auto text-[15px] leading-[1.5] text-tinta-2">Tu día cruzado con todos tus grupos llega con Sprint. En el chat ya lo tienes.</span>
          )}
        </Link>

        <Link href={d.familia?.href ?? '/app/familia'} className={TILE} style={{ ['--cr-d' as string]: '-3s' }}>
          <span className="cr-brillo" aria-hidden="true" />
          <Punto color="var(--z-familia)" texto="Familia" />
          {d.familia ? (
            <>
              <span className="cr-titulo mt-auto text-[40px] leading-[1.05]">
                {'nombre' in d.familia ? d.familia.nombre : `${d.familia.cuantas} familias`}
              </span>
              <span className="text-[14.5px] text-tinta-2">La semana de tu casa</span>
            </>
          ) : (
            <span className="mt-auto text-[15px] leading-[1.5] text-tinta-2">Todavía no tienes una familia en Zaelyn. Díselo en el chat: «crea mi familia».</span>
          )}
        </Link>

        <Link href={d.pmo?.href ?? '/app/proyectos'} className={TILE} style={{ ['--cr-d' as string]: '-6s' }}>
          <span className="cr-brillo" aria-hidden="true" />
          <Punto color="var(--z-proyectos)" texto="PMO" />
          {d.pmo ? (
            <>
              <span className="cr-cifra mt-auto text-[84px]">{d.pmo.proyectos}</span>
              <span className="text-[14.5px] text-tinta-2">
                {d.pmo.proyectos === 1 ? 'proyecto' : 'proyectos'}
                {d.pmo.vencidas > 0 && <> · <span className="text-det-tinta">{d.pmo.vencidas} {d.pmo.vencidas === 1 ? 'actividad vencida' : 'actividades vencidas'}</span></>}
              </span>
            </>
          ) : (
            <span className="mt-auto text-[15px] leading-[1.5] text-tinta-2">Arma tu primer proyecto en el editor o súbelo desde Excel.</span>
          )}
        </Link>
      </section>

      {d.hoy.length > 0 && (
        <section className="cr-vidrio flex flex-col rounded-[28px] px-7 py-5">
          <h2 className="cr-titulo pt-1 pb-2 text-[28px]">Hoy</h2>
          {d.hoy.slice(0, 8).map((e, i) => (
            <div key={i} className="flex items-center gap-5 border-b border-[color-mix(in_srgb,var(--z-ink)_8%,transparent)] py-4 last:border-0">
              <span className="w-16 flex-none text-[13px] text-tinta-3 tabular-nums">{e.hora}</span>
              <span className="min-w-0 flex-1 truncate text-[15.5px]">{e.texto}</span>
              <span className="flex-none text-[13px] text-tinta-3">{e.lugar}</span>
            </div>
          ))}
          {d.hoy.length > 8 && <Link href={d.hrefs.personal} className="pt-3 pb-1 text-[14px] font-semibold text-tinta no-underline">Ver todo tu día ›</Link>}
        </section>
      )}

      <section className="flex flex-wrap items-center gap-3">
        <span className="mr-1.5 text-[13px] text-tinta-3">Apps</span>
        {['Kore', 'TCGBusters'].map(a => (
          <Link key={a} href={d.hrefs.apps} className="cr-chip no-underline">{a}</Link>
        ))}
      </section>
    </main>
  )
}
