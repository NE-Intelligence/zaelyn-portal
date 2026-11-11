import { redirect } from 'next/navigation'

/**
 * La landing de proyectos ahora es `/pmo` (decisiones/2026-11-10-landings-y-portal).
 * Esta dirección se queda porque circula en mensajes y guías.
 */
export default function Proyectos() {
  redirect('/pmo')
}
