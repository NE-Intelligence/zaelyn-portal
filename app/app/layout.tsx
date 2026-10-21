import type { Metadata } from 'next'
import '../portal.css'

export const metadata: Metadata = { title: 'Proyectos' }

/**
 * El marco del portal. Todo cuelga de `.pt`, que trae su propio juego de
 * tokens claro y oscuro: el registro oscuro del sitio no entra aquí.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="pt">{children}</div>
}
