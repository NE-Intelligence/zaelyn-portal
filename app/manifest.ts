import type { MetadataRoute } from 'next'

/**
 * Zaelyn instalable en el teléfono (PWA, fase 2 · Zaelyn DECISIONS #219, #228).
 *
 * Abre directo en el portal, a pantalla completa, con el ícono de la marca
 * (la æ sobre negro, la regla del logotipo de #222). Con esto, en Android
 * aparece «Instalar app»; en iPhone, Compartir → «Agregar a inicio», que es
 * además lo que iOS exige para dejar que la web mande avisos.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zaelyn',
    short_name: 'Zaelyn',
    description: 'Tu asistente para la familia, los proyectos y tu día.',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'es',
    icons: [
      { src: '/icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icono-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
