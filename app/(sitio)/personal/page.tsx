import type { Metadata } from 'next'
import { Landing } from '@/components/landing/Landing'
import { LANDINGS } from '@/lib/landings'

const L = LANDINGS.personal

export const metadata: Metadata = {
  title: { absolute: L.meta.titulo },
  description: L.meta.descripcion,
  openGraph: {
    type: 'website',
    siteName: 'Zaelyn',
    title: L.meta.titulo,
    description: L.meta.descripcion,
    url: '/personal',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'zælyn' }],
  },
}

/** La landing de Zaelyn Personal. Plantilla única: components/landing/Landing.tsx (decisiones/2026-11-10-landings-y-portal). */
export default function Pagina() {
  return <Landing l={L} />
}
