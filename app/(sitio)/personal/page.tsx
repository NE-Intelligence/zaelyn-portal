import type { Metadata } from 'next'
import { LandingNivel } from '@/components/landing/Landing'
import { NIVELES } from '@/lib/landings'
import { metaDeLanding } from '@/lib/meta-landing'

export const metadata: Metadata = metaDeLanding(NIVELES.free.meta, '/personal')

/** La landing de free (decisiones/2026-11-13-planes-por-ambito). */
export default function Pagina() {
  return <LandingNivel clave="free" />
}
