import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { tarjetaDeAvance, type DatosDeTarjeta, type FilaDeTarjeta } from '@/lib/api'

/**
 * La tarjeta de avance como PNG (#200).
 *
 * Telegram la BAJA desde sus servidores con la dirección que le pasa el
 * motor; por eso va sin sesión y el token de un día es la llave. Los números
 * no se recalculan aquí: son la foto del mismo estado que contestó el chat.
 *
 * Next dibuja con un subconjunto de CSS (flexbox, sin grid): cada caja con
 * más de un hijo lleva `display: flex`.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Las fuentes de la marca, en WOFF (el dibujante no lee WOFF2). Se leen una vez. */
let fuentes: Promise<Array<{ name: string; data: Buffer; weight: 400 | 600 | 700; style: 'normal' }>> | null = null
const lasFuentes = () => {
  fuentes ??= (async () => {
    const f = (n: string) => readFile(join(process.cwd(), 'lib', 'fuentes', n))
    return [
      { name: 'Prompt', data: await f('prompt-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
      { name: 'Prompt', data: await f('prompt-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
      { name: 'MuseoModerno', data: await f('museomoderno-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
    ]
  })()
  return fuentes
}

const C = {
  fondo: '#f4f5f8', tarjeta: '#ffffff', tinta: '#12151b', tinta2: '#4f5766', tinta3: '#646c7d',
  linea: '#e3e6ec', riel: '#eceef3', marca: '#2f55f4', zaelyn: '#c2410c',
  bien: '#1fa36b', bienFondo: '#dcf4e8', bienTinta: '#0d6340',
  mal: '#d92d20', malFondo: '#fde7e5', malTinta: '#a3221a',
  gris: '#eceef3', grisTinta: '#4a5161',
}
const FASES = ['#2f55f4', '#0f9d8a', '#8b5cf6', '#e89a0c', '#d6409f']

const ANCHO = 1080
const ALTO_FILA = 74

const VEREDICTO: Record<DatosDeTarjeta['veredicto'], { texto: string; fondo: string; tinta: string }> = {
  al_dia: { texto: 'En tiempo', fondo: C.bienFondo, tinta: C.bienTinta },
  adelantado: { texto: 'Adelantado', fondo: C.bienFondo, tinta: C.bienTinta },
  atrasado: { texto: 'Atrasado', fondo: C.malFondo, tinta: C.malTinta },
  sin_fechas: { texto: 'Sin fechas', fondo: C.gris, tinta: C.grisTinta },
}

const fecha = (iso: string | null): string => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][(m ?? 1) - 1]} ${y}`
}

function Barra({ real, esperado, alto, color }: { real: number; esperado: number | null; alto: number; color: string }) {
  return (
    <div style={{ display: 'flex', position: 'relative', width: '100%', height: alto, background: C.riel, borderRadius: alto }}>
      <div style={{ display: 'flex', width: `${Math.max(0, Math.min(100, real))}%`, height: alto, background: color, borderRadius: alto }} />
      {esperado !== null && (
        <div style={{ display: 'flex', position: 'absolute', left: `${Math.max(0, Math.min(100, esperado))}%`,
                      top: -5, width: 3, height: alto + 10, background: C.tinta, marginLeft: -1 }} />
      )}
    </div>
  )
}

function Fila({ f, orden }: { f: FilaDeTarjeta; orden: number }) {
  const color = f.fase ? FASES[orden % FASES.length]! : C.marca
  const abajo = f.esperado !== null && f.real + 5 < f.esperado
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, paddingLeft: (f.nivel - 1) * 34, height: ALTO_FILA, justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 9 }}>
        {f.fase && <div style={{ display: 'flex', width: 6, height: 24, background: color, borderRadius: 3, marginRight: 12 }} />}
        <div style={{ display: 'flex', flex: 1, fontSize: f.nivel === 1 ? 27 : 24, fontWeight: f.nivel === 1 ? 600 : 400,
                      color: C.tinta, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 640 - (f.nivel - 1) * 34 }}>
          {f.nombre}
        </div>
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: abajo ? C.malTinta : C.tinta, marginLeft: 16 }}>{`${f.real}%`}</div>
        <div style={{ display: 'flex', fontSize: 20, color: C.tinta3, marginLeft: 12, width: 170, justifyContent: 'flex-end' }}>
          {`${f.esperado !== null ? `esp ${f.esperado}% · ` : ''}${f.cerradas}/${f.total}`}
        </div>
      </div>
      <Barra real={f.real} esperado={f.esperado} alto={f.nivel === 1 ? 14 : 10} color={color} />
    </div>
  )
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const d = await tarjetaDeAvance(token)
  if (!d) return new Response('No encontrada', { status: 404 })

  const v = VEREDICTO[d.veredicto]
  let fases = -1
  const filas = d.filas.map(f => ({ f, orden: f.fase ? ++fases : Math.max(0, fases) }))
  // El título puede ocupar dos renglones; el alto se calcula, no se adivina
  // al dibujar: el dibujante encoge lo que no cabe y lo encima.
  const titulo = d.titulo.length > 80 ? `${d.titulo.slice(0, 79)}…` : d.titulo
  const renglonesTitulo = titulo.length > 40 ? 2 : 1
  const alto = 340 + renglonesTitulo * 52 + filas.length * ALTO_FILA + (d.resto ? 40 : 0) + 90
  const peso = d.base === 'minutos' ? 'Ponderado por horas estimadas'
    : d.base === 'duracion' ? 'Ponderado por duración · los hitos no pesan' : 'Cada actividad pesa igual'

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: C.fondo, padding: 36, fontFamily: 'Prompt' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: C.tarjeta,
                      borderRadius: 28, border: `1px solid ${C.linea}`, padding: '40px 48px' }}>
          {/* encabezado */}
          <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', fontSize: 24, color: C.tinta3 }}>{d.subtitulo}</div>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 600, color: v.tinta, background: v.fondo,
                          padding: '8px 18px', borderRadius: 999 }}>{v.texto}</div>
          </div>
          <div style={{ display: 'flex', flexShrink: 0, fontSize: 40, fontWeight: 600, color: C.tinta, marginTop: 10, lineHeight: 1.3 }}>
            {titulo}
          </div>

          {/* el número */}
          <div style={{ display: 'flex', flexShrink: 0, alignItems: 'flex-end', marginTop: 22 }}>
            <div style={{ display: 'flex', fontFamily: 'MuseoModerno', fontSize: 96, fontWeight: 700, color: C.marca, lineHeight: 1 }}>{`${d.real}%`}</div>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 26, marginBottom: 8 }}>
              <div style={{ display: 'flex', fontSize: 26, color: C.tinta2 }}>
                {d.esperado !== null ? `Hoy tocaba ${d.esperado}%` : 'Sin fechas para el esperado'}
              </div>
              <div style={{ display: 'flex', fontSize: 22, color: C.tinta3, marginTop: 4 }}>
                {`${d.cerradas} de ${d.total} cerradas${d.vence ? ` · termina ${fecha(d.vence)}` : ''}`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexShrink: 0, marginTop: 20, marginBottom: 26 }}>
            <Barra real={d.real} esperado={d.esperado} alto={18} color={C.marca} />
          </div>

          {/* el árbol */}
          {filas.length > 0 && <div style={{ display: 'flex', height: 1, background: C.linea, marginBottom: 10 }} />}
          {filas.map(({ f, orden }, k) => <Fila key={k} f={f} orden={orden} />)}
          {d.resto > 0 && (
            <div style={{ display: 'flex', fontSize: 20, color: C.tinta3, marginTop: 8 }}>
              {`… y ${d.resto} niveles más; pídeselos a Zaelyn por su nombre`}
            </div>
          )}

          {/* pie */}
          <div style={{ display: 'flex', marginTop: 'auto', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: 19, color: C.tinta3 }}>
            <div style={{ display: 'flex' }}>
              {`${peso}${d.pesoSoporte != null ? ` · soporte post go-live ${d.pesoSoporte}%` : ''} · ${fecha(d.hoy)}`}
            </div>
            <div style={{ display: 'flex', fontFamily: 'MuseoModerno', fontSize: 26, fontWeight: 700, color: C.zaelyn }}>zaelyn</div>
          </div>
        </div>
      </div>
    ),
    {
      width: ANCHO,
      height: alto,
      headers: { 'cache-control': 'private, max-age=300' },
      fonts: await lasFuentes(),
    },
  )
}
