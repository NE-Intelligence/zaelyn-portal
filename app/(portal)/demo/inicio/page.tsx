import { Barra } from '@/components/portal/Marco'
import { Inicio } from '@/components/portal/Inicio'

export const metadata = { title: 'Inicio · ejemplo' }

/**
 * `/demo/inicio` — el Inicio con gente inventada (decisiones/2026-11-11-cristal):
 * Mariana, la Familia Arce y la Subestación Mirador no existen. Sirve para
 * enseñar el portal sin cuenta y para revisar el diseño.
 */
export default function InicioDeEjemplo() {
  return (
    <>
      <Barra area="inicio" ejemplo />
      <Inicio d={{
        fecha: 'Miércoles 11 de noviembre',
        saludo: 'Buenos días',
        quien: 'Mariana',
        foco: { texto: 'A las 2:00 te chocan la revisión con Vértice y recoger a Paula.', porque: '¿le pido a Diego que vaya?' },
        personal: { hoy: 5, vencidas: 1, choques: 1 },
        familia: { nombre: 'Familia Arce', href: '/demo/familia' },
        pmo: { proyectos: 3, vencidas: 2, href: '/demo' },
        hoy: [
          { hora: '9:00', texto: 'Junta diaria de obra', lugar: 'Subestación Mirador' },
          { hora: '2:00', texto: 'Revisión de ingeniería con Vértice', lugar: 'Agenda' },
          { hora: '2:00', texto: 'Recoger a Paula de la secundaria', lugar: 'Familia Arce' },
          { hora: '6:30', texto: 'Natación de Emilio', lugar: 'Familia Arce' },
          { hora: 'Hoy', texto: 'Memoria de cálculo de tierras', lugar: 'Vence' },
        ],
        hrefs: { personal: '/demo/personal', apps: '/demo/inicio' },
      }} />
    </>
  )
}
