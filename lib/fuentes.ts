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
