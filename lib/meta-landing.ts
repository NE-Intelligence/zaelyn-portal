import type { Metadata } from 'next'

/** Los metadatos de una landing, iguales en todas. */
export function metaDeLanding(m: { titulo: string; descripcion: string }, url: string): Metadata {
  return {
    title: { absolute: m.titulo },
    description: m.descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Zaelyn',
      title: m.titulo,
      description: m.descripcion,
      url,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'zælyn' }],
    },
  }
}
