import type { Metadata } from 'next'
import Landing from '@/components/landing2026/Landing'
import { textos } from '@/lib/copy-landing'
import './landing-2026.css'

/**
 * La portada de zaelyn.ai.
 *
 * Es un Server Component a propósito: lo único interactivo son dos hojas
 * (`Campo`, el campo de filamentos, y `Menu`, el desplegable angosto), que
 * llevan su propio 'use client'. El resto se sirve estático.
 *
 * Hoy solo existe el español. El texto vive completo en `lib/copy-landing.ts`
 * y lo que falte en otro idioma cae en español, así que abrir inglés o
 * portugués es llenar un objeto; el selector los muestra apagados hasta
 * entonces y esta página no cambia.
 */

const t = textos('es')

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zaelyn.ai'),
  title: t('meta.titulo'),
  description: t('meta.desc'),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Zaelyn',
    title: t('meta.titulo'),
    description: t('meta.desc'),
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'zælyn' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta.titulo'),
    description: t('meta.desc'),
    images: ['/og.png'],
  },
}

export default function Portada() {
  return <Landing lang="es" />
}
