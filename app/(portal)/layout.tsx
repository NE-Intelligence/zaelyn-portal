import type { Metadata } from 'next'
import '../portal.css'
import '../editor.css'
import '../familia.css'
import '../persona.css'
import '../horas.css'
import '../zaelyn.css'
import '../cristal.css'
import { Fondo3D } from '@/components/cristal/Fondo3D'
import { Flotar } from '@/components/cristal/Flotar'

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
  // Cristal (decisiones/2026-11-11-cristal): el cuerpo 3D al fondo y la
  // inclinación de las tarjetas viven una sola vez, para todo el portal.
  return (
    <div className="pt">
      <Fondo3D />
      <Flotar />
      {children}
    </div>
  )
}
