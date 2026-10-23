import Link from 'next/link'
import { idiomaActual } from '@/lib/preferencias'
import { legal, ORDEN_LEGAL } from '@/lib/legal'

export async function generateMetadata() {
  const L = legal(await idiomaActual())
  return { title: L.ui.indice }
}

/** `/legal` — los cuatro documentos en un índice (#186). */
export default async function Legal() {
  const L = legal(await idiomaActual())
  return (
    <main className="st-banda st-seccion">
      <div className="st-caja st-caja-angosta">
        <p className="st-rotulo">{L.ui.etq}</p>
        <h1 className="st-h1-doc">{L.ui.indice}</h1>
        <p className="st-nota">{L.ui.version}</p>
        <div className="st-legal-lista">
          {ORDEN_LEGAL.map((k) => (
            <Link key={k} href={`/legal/${k}`} className="st-legal-tarjeta">
              <b>{L.docs[k].titulo}</b>
              <span>{L.docs[k].resumen}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
