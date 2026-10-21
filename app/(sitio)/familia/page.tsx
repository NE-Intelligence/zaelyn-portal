import { Area } from '@/components/sitio/Area'
import { textos } from '@/lib/copy'

const t = textos('es')

export const metadata = {
  title: t('fa.meta.titulo'),
  description: t('fa.meta.desc'),
  openGraph: { title: t('fa.meta.titulo'), description: t('fa.meta.desc'), url: '/familia', images: ['/og.png'] },
}

export default function Familia() {
  return (
    <Area
      h1a="fa.h1a"
      h1b="fa.h1b"
      sub="fa.sub"
      hoy={['fa.c1', 'fa.c2', 'fa.c3', 'fa.c4', 'fa.c5']}
      falta={['fa.f1', 'fa.f2', 'fa.f3']}
    />
  )
}
