import type { Metadata } from 'next'
import { LandingNivel } from '@/components/landing/Landing'
import { NIVELES } from '@/lib/landings'
import { metaDeLanding } from '@/lib/meta-landing'

export const metadata: Metadata = metaDeLanding(NIVELES.base.meta, '/personal-plus')

/** La landing de base (decisiones/2026-11-13-planes-por-ambito). */
export default function Pagina() {
  return <LandingNivel clave="base" />
}
