import { ImageResponse } from 'next/og'
import { elPlan, fichaDelPlan, logoDelPlan } from '@/lib/api'
import { COLOR, logoZaelyn } from '@/lib/reporte/marca'
import { fuentesOg } from '@/lib/reporte/og'

/**
 * La tarjeta para redes (#202): kickoff, avance, cierre de fase, go-live y
 * cierre, con la marca de Zaelyn PMO siempre.
 *
 * ── LO QUE NO SE PUBLICA SIN PERMISO, Y LO QUE NO SE CELEBRA ───────────
 *
 * El nombre y el logo del cliente solo salen si la ficha dice que el cliente
 * lo autorizó. Y «vamos muy bien» solo se escribe si el proyecto va en tiempo:
 * con el proyecto atrasado la tarjeta dice el avance, sin celebrarlo, porque
 * el cliente sabe cómo va y una publicación que diga otra cosa le resta a
 * quien la firma.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DE = (b: ArrayBuffer, mime: string) => `data:${mime};base64,${Buffer.from(b).toString('base64')}`

export async function GET(req: Request, { params }: { params: Promise<{ grupo: string; plan: string }> }) {
  const { grupo, plan } = await params
  const q = new URL(req.url).searchParams
  const etapa = (['kickoff', 'avance', 'fase', 'golive', 'cierre'] as const).find(x => x === q.get('etapa')) ?? 'avance'
  const horizontal = q.get('formato') === 'horizontal'
  const [v, f] = await Promise.all([elPlan(grupo, plan), fichaDelPlan(grupo, plan)])
  if (!v.ok || !f.ok) return new Response('No encontrado', { status: 404 })
  const e = v.dato.estado
  const ficha = f.dato.ficha
  const conCliente = q.get('cliente') === '1' && ficha.publicarCliente
  const [lSponsor, lCliente, zaelyn] = await Promise.all([
    q.get('logo') === '1' ? logoDelPlan(grupo, plan, 'sponsor') : null,
    conCliente ? logoDelPlan(grupo, plan, 'cliente') : null,
    logoZaelyn(),
  ])
  const fase = etapa === 'fase' ? v.dato.fases.find(x => x.nombre === q.get('fase')) ?? null : null
  const punto = fase ? fase.punto : e.punto
  const bien = punto.esperado === null || punto.declarado + 5 >= punto.esperado
  const nombre = e.plan?.nombre ?? e.grupo.nombre

  const T: Record<typeof etapa, { arriba: string; grande: string; abajo: string }> = {
    kickoff: { arriba: 'Kickoff', grande: 'Arrancamos el proyecto', abajo: nombre },
    avance: bien
      ? { arriba: 'Hoy presentamos avance', grande: 'Vamos muy bien', abajo: nombre }
      : { arriba: 'Avance del proyecto', grande: nombre, abajo: '' },
    fase: { arriba: 'Cierre de fase', grande: `Cerramos ${fase?.nombre ?? 'una fase'}`, abajo: `${nombre} · ${punto.declarado}% del proyecto` },
    golive: { arriba: 'Go-live', grande: '¡Estamos en producción!', abajo: nombre },
    cierre: { arriba: 'Cierre de proyecto', grande: 'Proyecto concluido', abajo: nombre },
  }
  const t = T[etapa]
  if (etapa === 'fase') t.abajo = `${nombre} · avance del proyecto ${e.punto.declarado}%`
  const W = horizontal ? 1200 : 1080
  const Hh = horizontal ? 627 : 1080
  const conNumero = etapa === 'avance'

  const img = new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', fontFamily: 'Prompt',
                    background: `linear-gradient(135deg, ${COLOR.noche} 0%, #1d2440 60%, #2a1c3d 100%)`, color: '#fff', padding: horizontal ? 56 : 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: horizontal ? 70 : 90 }}>
          {lSponsor ? <div style={{ display: 'flex', background: '#fff', borderRadius: 16, padding: '10px 18px' }}><img src={DE(lSponsor.datos, lSponsor.mime)} style={{ height: horizontal ? 46 : 60, objectFit: 'contain' }} /></div> : <div style={{ display: 'flex' }} />}
          {conCliente && lCliente ? <div style={{ display: 'flex', background: '#fff', borderRadius: 16, padding: '10px 18px' }}><img src={DE(lCliente.datos, lCliente.mime)} style={{ height: horizontal ? 46 : 60, objectFit: 'contain' }} /></div> : <div style={{ display: 'flex' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: horizontal ? 26 : 34, color: '#ffb38a', fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' }}>{t.arriba}</div>
          <div style={{ display: 'flex', fontFamily: 'MuseoModerno', fontSize: horizontal ? 64 : 84, fontWeight: 700, lineHeight: 1.08, marginTop: 14 }}>{t.grande}</div>
          {t.abajo && <div style={{ display: 'flex', fontSize: horizontal ? 30 : 40, color: '#c9cfe0', marginTop: 18 }}>{t.abajo}</div>}
          {conCliente && ficha.cliente && <div style={{ display: 'flex', fontSize: horizontal ? 24 : 30, color: '#9aa3ba', marginTop: 10 }}>{`Cliente: ${ficha.cliente}`}</div>}
          {conNumero && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, marginTop: horizontal ? 18 : 34 }}>
              <div style={{ display: 'flex', fontFamily: 'MuseoModerno', fontSize: horizontal ? 110 : 150, fontWeight: 700, lineHeight: 1, color: bien ? '#7ea0ff' : '#fff' }}>{`${punto.declarado}%`}</div>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: horizontal ? 12 : 18 }}>
                <div style={{ display: 'flex', fontSize: horizontal ? 28 : 36, fontWeight: 600 }}>de avance real</div>
                {punto.esperado !== null && <div style={{ display: 'flex', fontSize: horizontal ? 24 : 30, color: '#c9cfe0' }}>{`sobre ${punto.esperado}% planeado a hoy`}</div>}
              </div>
            </div>
          )}
          {conNumero && (
            <div style={{ display: 'flex', position: 'relative', width: '100%', height: horizontal ? 18 : 24, background: 'rgba(255,255,255,.16)', borderRadius: 24, marginTop: horizontal ? 22 : 36 }}>
              <div style={{ display: 'flex', width: `${Math.max(0, Math.min(100, punto.declarado))}%`, height: '100%', background: bien ? '#4f7bff' : '#9aa3ba', borderRadius: 24 }} />
              {punto.esperado !== null && <div style={{ display: 'flex', position: 'absolute', left: `${punto.esperado}%`, top: -8, width: 4, height: (horizontal ? 18 : 24) + 16, background: '#fff' }} />}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,.18)', paddingTop: horizontal ? 18 : 26 }}>
          <div style={{ display: 'flex', fontSize: horizontal ? 22 : 28, color: '#c9cfe0' }}>Todo bajo control con Zaelyn PMO</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={`data:image/png;base64,${zaelyn.toString('base64')}`} style={{ height: horizontal ? 40 : 52 }} />
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: horizontal ? 15 : 19, color: '#8a93aa', marginTop: 8 }}>by NE National Expertise · Houston / Monterrey</div>
      </div>
    ),
    { width: W, height: Hh, fonts: await fuentesOg(), headers: { 'cache-control': 'private, no-store' } },
  )
  if (q.get('descargar') === '1') {
    const b = await img.arrayBuffer()
    return new Response(b, { headers: { 'content-type': 'image/png', 'content-disposition': `attachment; filename="zaelyn-${etapa}.png"` } })
  }
  return img
}
