import type { Metadata } from 'next'
import { display, texto, dato } from '@/lib/fuentes'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zaelyn.ai'),
  title: { default: 'Zaelyn', template: '%s · Zaelyn' },
  description:
    'Sube el Excel que ya tienes y lleva el seguimiento hablando. Proyectos, familia y pendientes en un solo lugar, con un número que no se inventa.',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
}

export const viewport = {
  themeColor: '#07070C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable} ${dato.variable}`}>
      <body>{children}</body>
    </html>
  )
}
