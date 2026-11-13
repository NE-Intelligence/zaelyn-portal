import type { Metadata } from 'next'
import { LandingModulos } from '@/components/landing/Landing'
import { metaDeLanding } from '@/lib/meta-landing'

export const metadata: Metadata = metaDeLanding(
  { titulo: 'Módulos de Zaelyn · Kore, TCGBusters y los que vienen', descripcion: 'Zaelyn habla con tus otras apps. Kore y TCGBusters, gratis desde Personal.' },
  '/modulos',
)

/** `/modulos` (decisiones/2026-11-13-planes-por-ambito). */
export default function Pagina() {
  return <LandingModulos />
}
