import { Area } from '@/components/sitio/Area'
import { textos } from '@/lib/copy'

const t = textos('es')

export const metadata = {
  title: t('pe.meta.titulo'),
  description: t('pe.meta.desc'),
  openGraph: { title: t('pe.meta.titulo'), description: t('pe.meta.desc'), url: '/personal', images: ['/og.png'] },
}

export default function Personal() {
  return (
    <Area
      h1a="pe.h1a"
      h1b="pe.h1b"
      sub="pe.sub"
      hoy={['pe.c1', 'pe.c2', 'pe.c3', 'pe.c4', 'pe.c5']}
      falta={['pe.f1', 'pe.f2', 'pe.f3']}
    />
  )
}
