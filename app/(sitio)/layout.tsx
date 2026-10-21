import { Encabezado, PieSitio } from '@/components/sitio/Marco'
import '../sitio.css'

/**
 * El marco del sitio público. Oscuro siempre: el logotipo es luz sobre negro
 * y sobre blanco no sobrevive, así que la decisión de tema la toma la marca.
 */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="st" style={{ minHeight: '100dvh' }}>
      <Encabezado lang="es" />
      {children}
      <PieSitio lang="es" />
    </div>
  )
}
