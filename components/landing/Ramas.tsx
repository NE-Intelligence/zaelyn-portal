/**
 * Los precios como ramas, no como escalera (decisiones/2026-11-13-planes-por-ambito):
 * la base (Personal y Personal+), dos ramas hermanas que salen de Personal+
 * (Familia y Profesional) y PMO, el módulo especializado que incluye
 * Profesional y Personal+. Se usa en la landing general y en `/precios`.
 */
import { FAMILIA_A_MITAD, usd } from '@/lib/planes'
import { TarjetaPlan } from './piezas'

function Rama({ titulo, nota, children }: { titulo: string; nota: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[19px] font-semibold">{titulo}</span>
        <span className="text-[15px] text-tinta-3">{nota}</span>
      </div>
      <div className="grid items-stretch gap-4 md:grid-cols-2">{children}</div>
    </div>
  )
}

export function Ramas() {
  return (
    <div className="flex w-full flex-col gap-12">
      <p className="m-0 text-center text-[17px] text-tinta-2">Cada nivel y cada módulo se contrata por separado; tomas solo lo que usas. Precios netos en USD al mes; el IVA o el sales tax van aparte.</p>
      <Rama titulo="La base" nota="Personal es gratis; Personal+ le suma portal e IA.">
        <TarjetaPlan clave="free" />
        <TarjetaPlan clave="base" fuerte />
      </Rama>
      <Rama titulo="Dos ramas hermanas" nota="Salen de Personal+: elige la de tu casa o la de tu trabajo.">
        <TarjetaPlan clave="family" />
        <TarjetaPlan clave="profesional" />
      </Rama>
      <Rama titulo="Módulo especializado" nota="PMO incluye Profesional y Personal+.">
        <TarjetaPlan clave="pro" fuerte />
        <div className="flex flex-col gap-3 rounded-[24px] bg-superficie p-7 shadow-z1">
          <span className="text-[15px] text-tinta-3">¿Familia y trabajo?</span>
          <span className="text-[22px] leading-[1.2] font-semibold">Paga la rama más cara completa y la otra a mitad.</span>
          <span className="text-[40px] leading-none font-semibold" style={{ letterSpacing: '-0.04em' }}>
            {usd(FAMILIA_A_MITAD)}<span className="ml-1.5 text-[14px] font-normal tracking-normal text-tinta-3">USD al mes + IVA</span>
          </span>
          <span className="text-[15px] leading-[1.5] text-tinta-2">Familia como complemento de Profesional o de PMO.</span>
        </div>
      </Rama>
    </div>
  )
}
