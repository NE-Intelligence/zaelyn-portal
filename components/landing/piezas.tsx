/** Piezas compartidas de las landings y de `/precios`. */
import Link from 'next/link'
import { AMBITO, plan, usd, type ClavePlan } from '@/lib/planes'

const TITULO = { letterSpacing: '-0.04em' }
const BTN = 'inline-flex h-[52px] items-center justify-center rounded-full px-[26px] text-[16px] font-semibold no-underline transition-shadow'
export const BTN_PRI = `${BTN} bg-pri text-sobre-pri hover:shadow-z2`
export const BTN_SEC = `${BTN} bg-superficie text-tinta shadow-[inset_0_0_0_1px_var(--z-line)] hover:shadow-[inset_0_0_0_1px_var(--z-line-strong)]`

export function Punto({ color }: { color: string }) {
  return <span className="size-2.5 flex-none rounded-full" style={{ background: color }} aria-hidden="true" />
}

/** A dónde lleva «Contratar»: el plan viaja en la URL (§3.6). */
export const hrefContratar = (c: ClavePlan) => (c === 'free' ? '/empezar' : `/empezar?plan=${c}`)

/** La tarjeta de precio de un plan, con lo que incluye y sus restricciones. */
export function TarjetaPlan({ clave, fuerte }: { clave: ClavePlan; fuerte?: boolean }) {
  const p = plan(clave)
  return (
    <div className={`flex flex-col gap-3 rounded-[24px] bg-superficie p-7 ${fuerte ? 'shadow-[inset_0_0_0_1.5px_var(--z-ink)]' : 'shadow-z1'}`}>
      <span className="flex items-center gap-2 text-[15px] text-tinta-3"><Punto color={AMBITO[p.ambito].color} />{p.para}</span>
      <span className="min-h-[2.6em] text-[22px] leading-[1.2] font-semibold">{p.nombre}</span>
      <span className="text-[40px] leading-none font-semibold" style={TITULO}>
        {p.precio ? usd(p.precio) : 'Gratis'}
        {p.precio > 0 && <span className="ml-1.5 text-[14px] font-normal text-tinta-3" style={{ letterSpacing: 0 }}>USD al mes + IVA</span>}
      </span>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-tinta-2">Incluye</span>
        <ul className="m-0 grid list-none gap-1 p-0 text-[15px] leading-[1.45] text-tinta-2">
          {p.incluye.map(r => <li key={r}>{r}</li>)}
        </ul>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-tinta-2">Restricciones</span>
        <ul className="m-0 grid list-none gap-1 p-0 text-[14px] leading-[1.45] text-tinta-3">
          {p.restricciones.map(r => <li key={r}>{r}</li>)}
        </ul>
      </div>
      <Link href={hrefContratar(clave)} className={`${fuerte ? BTN_PRI : BTN_SEC} mt-auto h-11 text-[15px]`}>{p.cta}</Link>
    </div>
  )
}

