import { redirect } from 'next/navigation'
import { Barra } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { Editor } from '@/components/editor/Editor'
import { docDelEditor, mesaDelEditor } from '@/lib/api'
import { arrancarEn, hoyISO } from '@/lib/editor/programar'
import type { Doc } from '@/lib/editor/tipos'

export const dynamic = 'force-dynamic'

/**
 * `/app/g/<grupo>/editor/<doc>` — el editor.
 *
 * `nuevo` abre un borrador que todavía no existe: en blanco, desde una
 * plantilla (`?base=` de fábrica o `?plantilla=` mía) o con el panel de
 * Zaelyn abierto (`?ia=1`). Se crea en la base al primer «Guardar borrador».
 */
export default async function PaginaEditor({
  params, searchParams,
}: {
  params: Promise<{ grupo: string; doc: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { grupo, doc: docId } = await params
  const q = await searchParams
  const s = (k: string) => (typeof q[k] === 'string' ? (q[k] as string) : '')

  const m = await mesaDelEditor(grupo)
  if (!m.ok) return <SinSesion fallo={m.fallo} />
  const mesa = m.dato

  let inicial: { id: string | null; nombre: string; metodologia: string; version: number | null; doc: Doc; liberado?: import('@/lib/editor/tipos').Liberado | null }
  if (docId === 'nuevo') {
    if (!mesa.puede) redirect(`/app/g/${grupo}/editor`)
    const arranque = /^\d{4}-\d{2}-\d{2}$/.test(s('arranque')) ? s('arranque') : hoyISO()
    let doc: Doc = { v: 1, inicio: arranque, habiles: true, nodos: [] }
    let metodologia = 'libre'
    let nombre = s('nombre')
    const base = mesa.base.find(b => b.clave === s('base'))
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
    if (r.dato.tipo !== 'borrador' || r.dato.groupId !== grupo) redirect(`/app/g/${grupo}/editor`)
    inicial = { id: r.dato.id, nombre: r.dato.nombre, metodologia: r.dato.metodologia, version: r.dato.version, doc: r.dato.doc, liberado: r.dato.liberado }
  }

  return (
    <>
      <Barra
        migas={[
          { texto: 'Mis grupos', href: '/app' },
          { texto: mesa.grupo.nombre, href: `/app/g/${grupo}` },
          { texto: 'Editor', href: `/app/g/${grupo}/editor` },
          { texto: inicial.nombre || 'Proyecto nuevo' },
        ]}
        sesion modo="editor"
      />
      <Editor
        key={inicial.id ?? 'nuevo'}
        grupo={mesa.grupo}
        personas={mesa.personas}
        fichas={mesa.metodologias}
        base={mesa.base}
        puede={mesa.puede}
        ia={mesa.ia}
        inicial={inicial}
        abrirZaelyn={s('ia') === '1'}
      />
    </>
  )
}
