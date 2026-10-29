import type { Metadata } from 'next'
import { display, texto, dato } from '@/lib/fuentes'
import { LANG_HTML, idiomaActual, temaActual } from '@/lib/preferencias'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zaelyn.ai'),
  title: { default: 'Zaelyn', template: '%s · Zaelyn' },
  description:
    'Tu asistente personal, familiar y de proyectos. Se habla en el chat y se ve en el portal. Zaelyn by NE National Expertise.',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  // Instalable en iPhone como app (fase 2): sin barra de Safari al abrirla
  // desde la pantalla de inicio. El manifiesto lo pone `app/manifest.ts`.
  appleWebApp: { capable: true, title: 'Zaelyn', statusBarStyle: 'black' },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F6FA' },
    { media: '(prefers-color-scheme: dark)', color: '#07070C' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

/**
 * El idioma y el tema se deciden AQUÍ, en el servidor, con las cookies de
 * preferencia (#186): la primera pintura ya sale bien, sin destello. Sin
 * cookie de tema no se pone `data-tema` y manda el sistema operativo.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, tema] = await Promise.all([idiomaActual(), temaActual()])
  return (
    <html
      lang={LANG_HTML[lang]}
      data-tema={tema === 'sistema' ? undefined : tema}
      className={`${display.variable} ${texto.variable} ${dato.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
