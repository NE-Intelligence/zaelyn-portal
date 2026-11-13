import type { Metadata } from 'next'
import { LandingGeneral } from '@/components/landing/Landing'
import { GENERAL } from '@/lib/landings'
import { metaDeLanding } from '@/lib/meta-landing'

export const metadata: Metadata = metaDeLanding(GENERAL.meta, '/')

/** La landing general de Zaelyn (decisiones/2026-11-13-planes-por-ambito). */
export default function Pagina() {
  return <LandingGeneral />
}
