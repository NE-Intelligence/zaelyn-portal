import { redirect } from 'next/navigation'
import { Barra } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { Editor } from '@/components/editor/Editor'
import { docDelEditor, misProyectos } from '@/lib/api'
import { arrancarEn, hoyISO } from '@/lib/editor/programar'
import type { Doc, Liberado } from '@/lib/editor/tipos'

export const dynamic = 'force-dynamic'

/**
 * `/app/editor/<doc>` — un proyecto mío, sin grupo todavía.
 *
 * `nuevo` lo abre en blanco, desde plantilla (`?base=` o `?plantilla=`) o con
 * Zaelyn (`?ia=1`). Si el borrador resulta ser de un grupo, se va a la ruta
 * del grupo: ahí están sus personas.
 */
export default async function PaginaProyecto({
  params, searchParams,
}: {
  params: Promise<{ doc: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { doc: docId } = await params
  const q = await searchParams
  const s = (k: string) => (typeof q[k] === 'string' ? (q[k] as string) : '')

  const m = await misProyectos()
  if (!m.ok) return <SinSesion fallo={m.fallo} />
  const datos = m.dato

  let inicial: { id: string | null; nombre: string; metodologia: string; version: number | null; doc: Doc; liberado?: Liberado | null }
  if (docId === 'nuevo') {
    const arranque = /^\d{4}-\d{2}-\d{2}$/.test(s('arranque')) ? s('arranque') : hoyISO()
    let doc: Doc = { v: 1, inicio: arranque, habiles: true, nodos: [] }
    let metodologia = 'libre'
    let nombre = s('nombre')
    const base = datos.base.find(b => b.clave === s('base'))
    if (base) {
      doc = arrancarEn(base.doc, arranque)
      metodologia = base.metodologia
    } else if (s('plantilla')) {
      const p = await docDelEditor(s('plantilla'))
      if (p.ok && p.dato.tipo === 'plantilla') {
        doc = arrancarEn(p.dato.doc, arranque)
        metodologia = p.dato.metodologia
        if (!nombre) nombre = p.dato.nombre
      }
    }
    inicial = { id: null, nombre, metodologia, version: null, doc }
  } else {
    const r = await docDelEditor(docId)
    if (!r.ok) return <SinSesion fallo={r.fallo} />
    if (r.dato.tipo !== 'borrador') redirect('/app/editor')
    if (r.dato.groupId) redirect(`/app/g/${r.dato.groupId}/editor/${r.dato.id}`)
    inicial = { id: r.dato.id, nombre: r.dato.nombre, metodologia: r.dato.metodologia, version: r.dato.version, doc: r.dato.doc, liberado: r.dato.liberado }
  }

  return (
    <>
      <Barra area="proyectos"
        migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: 'Mis proyectos', href: '/app/editor' }, { texto: inicial.nombre || 'Proyecto nuevo' }]}
        sesion modo="editor"
      />
      <Editor
        key={inicial.id ?? 'nuevo'}
        grupo={null}
        personas={[]}
        fichas={datos.metodologias}
        base={datos.base}
        puede
        ia={datos.ia}
        inicial={inicial}
        abrirZaelyn={s('ia') === '1'}
      />
    </>
  )
}
