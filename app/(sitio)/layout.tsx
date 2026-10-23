import { Encabezado, PieSitio } from '@/components/sitio/Marco'
import { idiomaActual, temaActual } from '@/lib/preferencias'
import '../sitio.css'

/**
 * El marco del sitio público. Día y noche (#186): los tokens de `.st`
 * cambian con `data-tema` o con el sistema operativo, y el logotipo se
 * compone en tipografía cuando el fondo es claro.
 */
export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const [lang, tema] = await Promise.all([idiomaActual(), temaActual()])
  return (
    <div className="st" style={{ minHeight: '100dvh' }}>
      <Encabezado lang={lang} tema={tema} />
      {children}
      <PieSitio lang={lang} />
    </div>
  )
}
