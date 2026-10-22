import type { Metadata } from 'next'
import '../portal.css'
import '../editor.css'

export const metadata: Metadata = { title: 'Proyectos' }

/**
 * El marco del portal. Todo cuelga de `.pt`, que trae su propio juego de
 * tokens claro y oscuro: el registro oscuro del sitio no entra aquí.
 *
 * ── POR QUÉ ES UN GRUPO DE RUTAS Y NO EL LAYOUT DE `/app` ──────────────
 *
 * Porque `/demo` y la pantalla de «ese pase no sirvió» son del portal
 * también, y cuando colgaban fuera de este marco salían SIN una sola regla
 * de estilo: fondo negro del sitio, texto negro encima, y la chispa del SVG
 * convertida en una estrella gigante por no tener tamaño. Se veía roto de
 * una forma que no sugería la causa. El grupo pone a las tres bajo el mismo
 * techo sin cambiarles la URL.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="pt">{children}</div>
}
