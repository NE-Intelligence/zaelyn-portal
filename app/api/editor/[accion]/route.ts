/**
 * Las escrituras del editor de proyectos. SOLO POST (#172).
 *
 * Ref: Zaelyn DECISIONS #174
 *
 * El navegador manda aquí y este servidor reenvía a Zaelyn con la cookie
 * convertida en Bearer: el token nunca llega al JavaScript de la página.
 * Una lista cerrada de acciones, para que esta ruta no se
 * vuelva un proxy abierto hacia cualquier rincón de la API.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { escribirEditor, type AccionEditor } from '@/lib/api'

export const dynamic = 'force-dynamic'
// La propuesta del modelo puede tardar más de un minuto.
export const maxDuration = 160

const ACCIONES = new Set<string>([
  'guardar', 'baja', 'proponer', 'mios', 'liberar-vista', 'liberar', 'grupo-crear', 'persona', 'invitar',
  'reabrir', 'reorganizar', 'plan-comprar',
  'org-crear', 'org-invitar', 'org-unirse', 'org-quitar', 'org-editar', 'org-etiquetar', 'org-comprar',
])
type Accion = AccionEditor

export async function POST(req: NextRequest, ctx: { params: Promise<{ accion: string }> }) {
  const { accion } = await ctx.params
  if (!ACCIONES.has(accion as Accion)) return NextResponse.json({ error: 'NO_EXISTE' }, { status: 404 })
  // Mismo origen o nada: una página ajena no puede hacer que tu navegador
  // guarde o tire un borrador con tu cookie.
  const origen = req.headers.get('origin')
  if (origen && origen !== req.nextUrl.origin) {
    return NextResponse.json({ error: 'ORIGEN' }, { status: 403 })
  }
  const cuerpo = await req.text()
  if (cuerpo.length > 2_000_000) return NextResponse.json({ error: 'DEMASIADO_GRANDE' }, { status: 413 })
  const r = await escribirEditor(accion as Accion, cuerpo)
  if (r.status === 204) return new NextResponse(null, { status: 204 })
  return new NextResponse(r.cuerpo, { status: r.status, headers: { 'content-type': 'application/json' } })
}
