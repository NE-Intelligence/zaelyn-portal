import { permanentRedirect } from 'next/navigation'

/**
 * La landing de proyectos es `/pmo` (decisiones/2026-11-13-planes-por-ambito).
 * Esta dirección se queda porque circula en mensajes y guías: 301.
 */
export default function Proyectos() {
  permanentRedirect('/pmo')
}
