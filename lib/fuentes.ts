/**
 * Las fuentes van EN el repositorio, no se piden a Google en cada build.
 *
 * `next/font/google` las descarga al compilar, así que una red caída o un
 * bloqueo de salida tumba el despliegue. Con `next/font/local` el build no
 * depende de nadie y el visitante no toca un tercer dominio. Las tres son
 * OFL y sus licencias están junto a los archivos.
 */
import localFont from 'next/font/local'

export const display = localFont({
  src: [
    { path: './fuentes/museomoderno-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fuentes/museomoderno-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fuentes/museomoderno-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fuentes/museomoderno-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--fuente-display',
  display: 'swap',
  fallback: ['Trebuchet MS', 'sans-serif'],
})

export const texto = localFont({
  src: [
    { path: './fuentes/prompt-latin-200-normal.woff2', weight: '200', style: 'normal' },
    { path: './fuentes/prompt-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fuentes/prompt-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fuentes/prompt-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fuentes/prompt-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--fuente-texto',
  display: 'swap',
  fallback: ['Avenir Next', 'system-ui', 'sans-serif'],
})

export const dato = localFont({
  src: [
    { path: './fuentes/jetbrains-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fuentes/jetbrains-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--fuente-dato',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
})
