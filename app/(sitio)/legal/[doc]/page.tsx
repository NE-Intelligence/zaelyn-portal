import Link from 'next/link'
import { notFound } from 'next/navigation'
import { idiomaActual } from '@/lib/preferencias'
import { legal, ORDEN_LEGAL, type ClaveLegal, type Parrafo } from '@/lib/legal'

const esDoc = (x: string): x is ClaveLegal => (ORDEN_LEGAL as string[]).includes(x)

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params
  if (!esDoc(doc)) return {}
  const L = legal(await idiomaActual())
  return { title: L.docs[doc].titulo, description: L.docs[doc].resumen }
}

/** Un hueco [FALTA: …] se pinta como hueco: visible, no disimulado. */
function Texto({ s }: { s: string }) {
  const partes = s.split(/(\[FALTA:[^\]]*\])/g)
  return <>{partes.map((p, i) => (p.startsWith('[FALTA:') ? <mark key={i} className="st-falta-in">{p}</mark> : p))}</>
}

function Bloque({ p }: { p: Parrafo }) {
  if (Array.isArray(p)) return <ul>{p.map((x, i) => <li key={i}><Texto s={x} /></li>)}</ul>
  return <p><Texto s={p} /></p>
}

/** `/legal/<doc>` — un documento con su índice lateral (#186). */
export default async function DocLegal({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params
  if (!esDoc(doc)) notFound()
  const L = legal(await idiomaActual())
  const d = L.docs[doc]
  return (
    <main className="st-banda st-seccion">
      <div className="st-caja st-doc">
        <aside className="st-doc-indice">
          <Link href="/legal" className="st-doc-volver">← {L.ui.volver}</Link>
          <p className="st-rotulo">{L.ui.contenido}</p>
          <nav>
            {d.secciones.map((s) => <a key={s.id} href={`#${s.id}`}>{s.t}</a>)}
          </nav>
          <p className="st-rotulo" style={{ marginTop: '1.4rem' }}>{L.ui.otros}</p>
          <nav>
            {ORDEN_LEGAL.filter((k) => k !== doc).map((k) => <Link key={k} href={`/legal/${k}`}>{L.docs[k].titulo}</Link>)}
          </nav>
        </aside>
        <article className="st-doc-cuerpo">
          <p className="st-rotulo">{L.ui.etq}</p>
          <h1 className="st-h1-doc">{d.titulo}</h1>
          <p className="st-doc-resumen">{d.resumen}</p>
          <p className="st-nota">{L.ui.version} · {L.ui.preliminar}</p>
          {d.secciones.map((s) => (
            <section key={s.id} id={s.id}>
              <h2>{s.t}</h2>
              {s.p.map((p, i) => <Bloque key={i} p={p} />)}
            </section>
          ))}
        </article>
      </div>
    </main>
  )
}
