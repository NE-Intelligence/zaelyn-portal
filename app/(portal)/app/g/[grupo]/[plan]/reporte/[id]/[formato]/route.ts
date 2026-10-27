import { enviarAlChat, logoDelPlan, reporteDelPlan, todosLosReportes, type DatosDeReporte } from '@/lib/api'
import { logoZaelyn, type Logos } from '@/lib/reporte/marca'

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

type Armado = { datos: Uint8Array; nombre: string; mime: string; titulo: string }

/** El archivo, o la respuesta de por qué no hay archivo. */
async function armar(grupo: string, plan: string, id: string, formato: string): Promise<Armado | Response> {
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
  const titulo = id === 'todos' ? `Todos los reportes · ${lista[0]!.proyecto.nombre}` : `${lista[0]!.folio} · ${lista[0]!.titulo} · ${lista[0]!.proyecto.nombre}`
  if (formato === 'pptx') {
    // Cada formato carga solo su librería: si una falla, la otra sigue
    // funcionando (un PDF no tiene por qué depender de PowerPoint).
    const { presentacion } = await import('@/lib/reporte/pptx')
    return { datos: new Uint8Array(await presentacion(lista[0]!, logos)), nombre: `${nombre}.pptx`, titulo,
      mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
  }
  const { pdfDeReportes } = await import('@/lib/reporte/pdf')
  return { datos: new Uint8Array(await pdfDeReportes(lista, logos)), nombre: `${nombre}.pdf`, titulo, mime: 'application/pdf' }
}

/**
 * Se DESCARGA (#208). Abrirlo en la página dejaba a quien entra desde el
 * navegador de Telegram con el PDF a la vista y sin forma de guardarlo.
 * `?ver=1` lo abre en el navegador, para quien sí lo quiera así.
 */
export async function GET(req: Request, { params }: { params: Promise<{ grupo: string; plan: string; id: string; formato: string }> }) {
  const { grupo, plan, id, formato } = await params
  const a = await armar(grupo, plan, id, formato)
  if (a instanceof Response) return a
  const ver = new URL(req.url).searchParams.get('ver') === '1'
  return new Response(new Uint8Array(a.datos), { headers: {
    'content-type': a.mime,
    'content-disposition': `${ver ? 'inline' : 'attachment'}; filename="${a.nombre}"`,
    'cache-control': 'private, no-store',
  } })
}

/** Al chat de Telegram de quien lo pide (#208). */
export async function POST(_req: Request, { params }: { params: Promise<{ grupo: string; plan: string; id: string; formato: string }> }) {
  const { grupo, plan, id, formato } = await params
  const a = await armar(grupo, plan, id, formato)
  if (a instanceof Response) return Response.json({ error: a.status === 401 ? 'SIN_SESION' : 'NO_LO_ENCUENTRO' }, { status: a.status })
  const r = await enviarAlChat(a.datos, a.nombre, a.titulo)
  return r === 'OK' ? Response.json({ ok: true }) : Response.json({ error: r }, { status: r === 'SIN_SESION' ? 401 : r === 'SIN_TELEGRAM' ? 409 : 502 })
}
