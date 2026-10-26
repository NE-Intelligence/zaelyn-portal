import { logoDelPlan, reporteDelPlan, todosLosReportes, type DatosDeReporte } from '@/lib/api'
import { logoZaelyn, type Logos } from '@/lib/reporte/marca'
import { pdfDeReportes } from '@/lib/reporte/pdf'
import { presentacion } from '@/lib/reporte/pptx'

/**
 * Un reporte emitido como PDF o PowerPoint, o todos en un PDF (#202).
 *
 * Se dibuja desde la foto que guardó el motor al emitirlo: descargarlo hoy o
 * en seis meses da el mismo documento. Los logos son los vigentes.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const nombreDe = (d: DatosDeReporte) =>
  `${d.folio} ${d.titulo} ${d.proyecto.nombre}`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 _-]+/g, '').replace(/\s+/g, '-').slice(0, 90)

export async function GET(_req: Request, { params }: { params: Promise<{ grupo: string; plan: string; id: string; formato: string }> }) {
  const { grupo, plan, id, formato } = await params
  if (formato !== 'pdf' && formato !== 'pptx') return new Response('No encontrado', { status: 404 })
  if (id === 'todos' && formato !== 'pdf') return new Response('No encontrado', { status: 404 })
  const r = id === 'todos' ? await todosLosReportes(grupo, plan) : await reporteDelPlan(grupo, plan, id)
  if (!r.ok) return new Response(r.fallo === 'SIN_SESION' ? 'Tu sesión se cerró' : 'No encontrado', { status: r.fallo === 'SIN_SESION' ? 401 : 404 })
  const lista = Array.isArray(r.dato) ? r.dato : [r.dato]
  if (!lista.length) return new Response('Todavía no hay reportes emitidos', { status: 404 })
  const [sponsor, cliente, zaelyn] = await Promise.all([logoDelPlan(grupo, plan, 'sponsor'), logoDelPlan(grupo, plan, 'cliente'), logoZaelyn()])
  const logos: Logos = {
    sponsor: sponsor ? { datos: Buffer.from(sponsor.datos), mime: sponsor.mime } : null,
    cliente: cliente ? { datos: Buffer.from(cliente.datos), mime: cliente.mime } : null,
    zaelyn,
  }
  const nombre = id === 'todos' ? `Reportes-${nombreDe(lista[0]!).split('-').slice(2).join('-')}` : nombreDe(lista[0]!)
  if (formato === 'pptx') {
    const b = await presentacion(lista[0]!, logos)
    return new Response(new Uint8Array(b), { headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'content-disposition': `attachment; filename="${nombre}.pptx"`, 'cache-control': 'private, no-store',
    } })
  }
  const b = await pdfDeReportes(lista, logos)
  return new Response(new Uint8Array(b), { headers: {
    'content-type': 'application/pdf', 'content-disposition': `inline; filename="${nombre}.pdf"`, 'cache-control': 'private, no-store',
  } })
}
