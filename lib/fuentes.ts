/**
 * Las fuentes van EN el repositorio, no se piden a Google en cada build.
 *
 * `next/font/google` las descarga al compilar, así que una red caída o un
 * bloqueo de salida tumba el despliegue. Con `next/font/local` el build no
 * depende de nadie y el visitante no toca un tercer dominio. Las tres son
 * OFL y sus licencias están junto a los archivos.
 *
 * Desde el rediseño (decisiones/2026-11-10-rediseno-del-portal) la interfaz usa
 * la tipografía del sistema, como la app; MuseoModerno queda solo para el
 * nombre «zælyn» compuesto en tipografía. Prompt y JetBrains Mono siguen en
 * `lib/fuentes/` porque los reportes en PDF las usan.
 */
import localFont from 'next/font/local'

export const display = localFont({
  src: [
    { path: './fuentes/museomoderno-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fuentes/museomoderno-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--fuente-display',
  display: 'swap',
  fallback: ['Trebuchet MS', 'sans-serif'],
})

/**
 * Cristal (decisiones/2026-11-11-cristal): Inter variable para la interfaz y
 * Instrument Serif para los titulares y las cifras grandes —el toque editorial
 * que hace que se vea caro—. Las dos OFL, con su licencia al lado.
 */
export const inter = localFont({
  src: [{ path: './fuentes/inter-latin-wght-normal.woff2', weight: '100 900', style: 'normal' }],
  variable: '--fuente-ui',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
})

export const serif = localFont({
  src: [
    { path: './fuentes/instrument-serif-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fuentes/instrument-serif-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--fuente-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})
