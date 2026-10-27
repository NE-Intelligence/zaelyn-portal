'use client'
/**
 * La sección General del proyecto y sus reportes (#202).
 *
 * Datos del proyecto, logos, contactos y equipo, entregables clave para
 * facturación; los reportes formales (PDF y presentación) con su historial,
 * y la tarjeta para redes. Lo escribe quien dirige; el resto lo ve.
 */
import { useMemo, useState } from 'react'
import type {
  ClaveDeFacturacion, Contacto, DatosDeReporte, Ficha, ReporteEnLista, TipoContacto, TipoReporte, VistaDeFicha,
} from '@/lib/api'
import type { FilaDeArbol } from '@/lib/arbol'
import type { Veredicto } from '@/lib/plan'
import { decirError, escribir } from '../editor/comun'

const TIPOS: Array<{ v: TipoReporte; t: string }> = [
  { v: 'semanal', t: 'Avance semanal' },
  { v: 'kickoff', t: 'Kickoff' },
  { v: 'fase_inicio', t: 'Inicio de fase' },
  { v: 'fase_cierre', t: 'Cierre de fase' },
  { v: 'golive', t: 'Go-live' },
  { v: 'cierre', t: 'Cierre del proyecto' },
  { v: 'facturacion', t: 'Soporte de facturación' },
]
const NOMBRE_TIPO = Object.fromEntries(TIPOS.map(x => [x.v, x.t])) as Record<TipoReporte, string>
const TIPO_CONTACTO: Record<TipoContacto, string> = { sponsor: 'Sponsor', cliente: 'Cliente', equipo: 'Equipo', otro: 'Otro' }
const ETAPAS = [
  { v: 'kickoff', t: 'Kickoff' }, { v: 'avance', t: 'Avance' }, { v: 'fase', t: 'Cierre de fase' },
  { v: 'golive', t: 'Go-live' }, { v: 'cierre', t: 'Cierre' },
] as const

const vacio: Contacto = { tipo: 'equipo', nombre: '', rol: '', empresa: '', email: '', telefono: '' }
const fechaCorta = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][(m ?? 1) - 1]} ${y}`
}
const restar = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10)
const claveDe = (c: { tipo: string; tramo: Array<string | null> | null; pendienteId: string | null }) =>
  c.tipo === 'actividad' ? `a:${c.pendienteId}` : `t:${JSON.stringify(c.tramo)}`

export function General({
  grupo, plan, base, inicial, reportes: reportesIniciales, filas, fases, hoy, veredicto,
}: {
  grupo: string; plan: string; base: string
  inicial: VistaDeFicha; reportes: ReporteEnLista[]
  filas: FilaDeArbol[]; fases: string[]; hoy: string; veredicto: Veredicto
}) {
  const puede = inicial.puede
  const [f, setF] = useState<Ficha>(inicial.ficha)
  const [logos, setLogos] = useState(inicial.logos)
  const [version, setVersion] = useState(0)
  const [estado, setEstado] = useState<'' | 'guardando' | 'guardado'>('')
  const [error, setError] = useState('')
  const [reportes, setReportes] = useState(reportesIniciales)
  const [conActividades, setConActividades] = useState(false)
  const [dialogo, setDialogo] = useState<null | 'pdf' | 'pptx'>(null)

  const cambiar = <K extends keyof Ficha>(k: K, v: Ficha[K]) => { setF(x => ({ ...x, [k]: v })); setEstado('') }

  async function guardar() {
    setEstado('guardando'); setError('')
    const r = await escribir('ficha', { groupId: grupo, planId: plan, ficha: f })
    if (!r.ok) { setEstado(''); setError(decirError(r)); return }
    setEstado('guardado')
  }

  async function subirLogo(cual: 'sponsor' | 'cliente', archivo: File | undefined) {
    if (!archivo) return
    setError('')
    if (!/^image\/(png|jpeg)$/.test(archivo.type)) { setError('El logo tiene que ser PNG o JPG.'); return }
    if (archivo.size > 600_000) { setError('El logo pesa más de 600 KB. Usa una versión más ligera.'); return }
    const base64 = await new Promise<string>((ok, mal) => {
      const lector = new FileReader()
      lector.onload = () => ok(String(lector.result))
      lector.onerror = () => mal(lector.error)
      lector.readAsDataURL(archivo)
    })
    const r = await escribir('ficha-logo', { groupId: grupo, planId: plan, cual, base64 })
    if (!r.ok) { setError(r.error === 'INVALIDO' ? 'Ese archivo no es una imagen PNG o JPG válida.' : decirError(r)); return }
    setLogos(l => ({ ...l, [cual]: true })); setVersion(v => v + 1)
  }
  async function quitarLogo(cual: 'sponsor' | 'cliente') {
    const r = await escribir('ficha-logo', { groupId: grupo, planId: plan, cual, quitar: true })
    if (!r.ok) { setError(decirError(r)); return }
    setLogos(l => ({ ...l, [cual]: false }))
  }

  // ── facturación: qué está marcado
  const marcadas = useMemo(() => new Map(f.facturacion.map(c => [claveDe(c), c])), [f.facturacion])
  const candidatos = filas.filter(x => x.tipo === 'fase' || x.tipo === 'grupo' || (conActividades && (x.tipo === 'actividad' || x.tipo === 'hito')))
  const claveDeFila = (x: FilaDeArbol): ClaveDeFacturacion => x.tipo === 'actividad' || x.tipo === 'hito'
    ? { tipo: 'actividad', tramo: null, pendienteId: x.k.slice(2), nombre: x.nombre, concepto: '' }
    : { tipo: x.tipo === 'fase' ? 'fase' : 'grupo', tramo: x.tramo, pendienteId: null, nombre: x.nombre, concepto: '' }
  const alternarFacturacion = (x: FilaDeArbol) => {
    const c = claveDeFila(x)
    const k = claveDe(c)
    cambiar('facturacion', marcadas.has(k) ? f.facturacion.filter(y => claveDe(y) !== k) : [...f.facturacion, c])
  }
  const conceptoDe = (k: string, concepto: string) =>
    cambiar('facturacion', f.facturacion.map(y => (claveDe(y) === k ? { ...y, concepto } : y)))

  const campo = (k: 'cliente' | 'sponsor' | 'liderProyecto', etiqueta: string, ayuda: string) => (
    <label className="gn-campo">
      <span>{etiqueta} <em>{ayuda}</em></span>
      <input value={f[k]} disabled={!puede} onChange={e => cambiar(k, e.target.value)} maxLength={120} />
    </label>
  )
  const area = (k: 'objetivo' | 'alcance' | 'descripcion', etiqueta: string, filasTxt: number) => (
    <label className="gn-campo ancho">
      <span>{etiqueta}</span>
      <textarea rows={filasTxt} value={f[k]} disabled={!puede} onChange={e => cambiar(k, e.target.value)} />
    </label>
  )

  return (
    <div className="gn">
      {error && <div className="ed-error" role="alert">{error}</div>}

      {/* ── reportes primero: es a lo que se viene */}
      <section className="pt-tarjeta">
        <header>
          <h2>Reportes</h2>
          <span className="pt-overline">{reportes.length} emitido{reportes.length === 1 ? '' : 's'}</span>
        </header>
        <div className="gn-botones">
          <button className="ed-btn primario" disabled={!puede} onClick={() => setDialogo('pdf')}>Reporte formal (PDF)</button>
          <button className="ed-btn primario" disabled={!puede} onClick={() => setDialogo('pptx')}>Presentación ejecutiva (PowerPoint)</button>
          {reportes.length > 0 && <Entrega archivos={[{ etiqueta: 'Todos (PDF)', href: `${base}/reporte/todos/pdf` }]} />}
        </div>
        {!puede && <p className="gn-nota">Los reportes los emite quien dirige el proyecto; aquí puedes descargar los emitidos.</p>}
        {reportes.length > 0 && (
          <div className="pt-scroll">
            <table className="pt-tabla gn-tabla">
              <thead><tr><th>Folio</th><th>Tipo</th><th>Periodo</th><th>Emitido</th><th>Avance</th><th /></tr></thead>
              <tbody>
                {reportes.map(r => (
                  <tr key={r.id}>
                    <td className="pt-mono">{r.folio}</td>
                    <td>{NOMBRE_TIPO[r.tipo] ?? r.titulo}</td>
                    <td>{fechaCorta(r.periodo.desde)} – {fechaCorta(r.periodo.hasta)}</td>
                    <td>{fechaCorta(r.emitido)}{r.emitidoPor ? ` · ${r.emitidoPor}` : ''}</td>
                    <td>{r.real}%</td>
                    <td>
                      <Entrega chico archivos={[
                        { etiqueta: 'PDF', href: `${base}/reporte/${r.id}/pdf` },
                        { etiqueta: 'PowerPoint', href: `${base}/reporte/${r.id}/pptx` },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {dialogo && (
        <DialogoReporte grupo={grupo} plan={plan} base={base} formato={dialogo} fases={fases} hoy={hoy}
          onCerrar={() => setDialogo(null)}
          onEmitido={r => setReportes(rs => [r, ...rs])} />
      )}

      <TarjetaSocial base={base} fases={fases} veredicto={veredicto} hayLogo={logos.sponsor} hayCliente={logos.cliente}
        publicarCliente={f.publicarCliente} />

      {/* ── datos del proyecto */}
      <section className="pt-tarjeta">
        <header>
          <h2>Datos del proyecto</h2>
          {puede && (
            <button className="ed-btn primario chico" onClick={guardar} disabled={estado === 'guardando'}>
              {estado === 'guardando' ? 'Guardando…' : estado === 'guardado' ? 'Guardado' : 'Guardar cambios'}
            </button>
          )}
        </header>
        <div className="gn-rejilla">
          {campo('cliente', 'Cliente', 'la empresa para la que es el proyecto')}
          {campo('sponsor', 'Sponsor', 'quien lo dirige o lo presenta: tu empresa')}
          {campo('liderProyecto', 'Líder del proyecto', 'nombre y cargo')}
          {area('objetivo', 'Objetivo', 3)}
          {area('alcance', 'Alcance', 4)}
          {area('descripcion', 'Descripción breve', 2)}
        </div>
      </section>

      <section className="pt-tarjeta">
        <header><h2>Logos</h2><span className="pt-overline">PNG o JPG · hasta 600 KB</span></header>
        <div className="gn-logos">
          {(['sponsor', 'cliente'] as const).map(cual => (
            <div key={cual} className="gn-logo">
              <b>{cual === 'sponsor' ? 'Logo del sponsor' : 'Logo del cliente'}</b>
              <div className="marco">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {logos[cual] ? <img src={`${base}/logo/${cual}?v=${version}`} alt={`Logo del ${cual}`} /> : <span>Sin logo</span>}
              </div>
              {puede && (
                <div className="gn-botones">
                  <label className="ed-btn suave chico">
                    {logos[cual] ? 'Cambiar' : 'Subir'}
                    <input type="file" accept="image/png,image/jpeg" hidden onChange={e => { void subirLogo(cual, e.target.files?.[0]); e.target.value = '' }} />
                  </label>
                  {logos[cual] && <button className="ed-btn suave chico" onClick={() => quitarLogo(cual)}>Quitar</button>}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="gn-nota">Van en los reportes y, si quieres, en la tarjeta para redes. El logo de Zaelyn PMO va siempre, pequeño, en todos.</p>
      </section>

      <section className="pt-tarjeta">
        <header>
          <h2>Contactos y equipo</h2>
          {puede && <button className="ed-btn suave chico" onClick={() => cambiar('contactos', [...f.contactos, { ...vacio }])}>Agregar</button>}
        </header>
        {f.contactos.length === 0 ? <p className="gn-nota">Sin contactos todavía.</p> : (
          <div className="pt-scroll">
            <table className="pt-tabla gn-tabla">
              <thead><tr><th>Tipo</th><th>Nombre</th><th>Rol</th><th>Empresa</th><th>Email</th><th>Teléfono</th><th /></tr></thead>
              <tbody>
                {f.contactos.map((c, i) => {
                  const poner = (k: keyof Contacto, v: string) => cambiar('contactos', f.contactos.map((x, j) => (j === i ? { ...x, [k]: v } : x)))
                  return (
                    <tr key={i}>
                      <td>
                        <select value={c.tipo} disabled={!puede} onChange={e => poner('tipo', e.target.value)}>
                          {(Object.keys(TIPO_CONTACTO) as TipoContacto[]).map(t => <option key={t} value={t}>{TIPO_CONTACTO[t]}</option>)}
                        </select>
                      </td>
                      <td><input value={c.nombre} disabled={!puede} onChange={e => poner('nombre', e.target.value)} /></td>
                      <td><input value={c.rol} disabled={!puede} onChange={e => poner('rol', e.target.value)} /></td>
                      <td><input value={c.empresa} disabled={!puede} onChange={e => poner('empresa', e.target.value)} /></td>
                      <td><input type="email" value={c.email} disabled={!puede} onChange={e => poner('email', e.target.value)} /></td>
                      <td><input type="tel" value={c.telefono} disabled={!puede} onChange={e => poner('telefono', e.target.value)} /></td>
                      <td>{puede && <button className="ed-btn suave chico" onClick={() => cambiar('contactos', f.contactos.filter((_, j) => j !== i))} aria-label="Quitar">×</button>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="pt-tarjeta">
        <header>
          <h2>Entregables clave para facturación</h2>
          <label className="gn-check"><input type="checkbox" checked={conActividades} onChange={e => setConActividades(e.target.checked)} /> Mostrar actividades</label>
        </header>
        <p className="gn-nota">Marca lo que soporta cada factura y escribe el concepto («Pago 2 de 4»). El reporte de facturación lo trae con su estado, fecha de cierre y horas.</p>
        <div className="gn-factura">
          {candidatos.map(x => {
            const c = claveDeFila(x)
            const k = claveDe(c)
            const m = marcadas.get(k)
            return (
              <div key={x.k} className={`gn-factura-fila${m ? ' on' : ''}`} style={{ paddingLeft: 8 + x.nivel * 16 }}>
                <label className="gn-check">
                  <input type="checkbox" checked={!!m} disabled={!puede} onChange={() => alternarFacturacion(x)} />
                  <span className={x.tipo === 'fase' || x.tipo === 'grupo' ? 'fuerte' : ''}>{x.clave ? `${x.clave} · ` : ''}{x.nombre}</span>
                </label>
                {m && <input className="gn-concepto" placeholder="Concepto: Pago 1 de 3" value={m.concepto} disabled={!puede} onChange={e => conceptoDe(k, e.target.value)} />}
                <span className="gn-pct">{x.real}%</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="pt-tarjeta">
        <header><h2>Publicaciones</h2></header>
        <label className="gn-check">
          <input type="checkbox" checked={f.publicarCliente} disabled={!puede} onChange={e => cambiar('publicarCliente', e.target.checked)} />
          El cliente autorizó que su nombre y su logo aparezcan en tarjetas para redes sociales
        </label>
        <p className="gn-nota">Sin esta marca, las tarjetas para redes salen sin el nombre ni el logo del cliente.</p>
        {puede && (
          <div className="gn-botones" style={{ marginTop: 12 }}>
            <button className="ed-btn primario chico" onClick={guardar} disabled={estado === 'guardando'}>
              {estado === 'guardando' ? 'Guardando…' : estado === 'guardado' ? 'Guardado' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

function DialogoReporte({
  grupo, plan, base, formato, fases, hoy, onCerrar, onEmitido,
}: {
  grupo: string; plan: string; base: string; formato: 'pdf' | 'pptx'; fases: string[]; hoy: string
  onCerrar: () => void; onEmitido: (r: ReporteEnLista) => void
}) {
  const [tipo, setTipo] = useState<TipoReporte>('semanal')
  const [desde, setDesde] = useState(restar(hoy, 6))
  const [hasta, setHasta] = useState(hoy)
  const [fase, setFase] = useState(fases[0] ?? '')
  const [t, setT] = useState({ resumen: '', logros: '', causas: '', acciones: '', siguientes: '', comentarios: '' })
  const [vista, setVista] = useState<DatosDeReporte | null>(null)
  const [estado, setEstado] = useState<'' | 'leyendo' | 'emitiendo'>('')
  const [error, setError] = useState('')
  const [emitido, setEmitido] = useState<{ id: string; folio: string } | null>(null)
  const conFase = tipo === 'fase_inicio' || tipo === 'fase_cierre'
  const pedido = () => ({ groupId: grupo, planId: plan, tipo, desde, hasta, ...(conFase ? { fase } : {}), textos: t })

  async function prellenar() {
    setEstado('leyendo'); setError('')
    const r = await escribir<DatosDeReporte>('reporte-vista', pedido())
    setEstado('')
    if (!r.ok) { setError(decirError(r)); return }
    const d = r.dato
    setVista(d)
    setT(x => ({
      ...x,
      resumen: x.resumen || d.textos.resumen,
      causas: x.causas || (d.atrasados.length
        ? d.atrasados.map(a => `${a.texto}${a.quien ? ` (${a.quien})` : ''}: va ${a.real}%${a.esperado !== null ? ` de ${a.esperado}%` : ''}. Causa: `).join('\n')
        : ''),
    }))
  }
  async function emitir() {
    setEstado('emitiendo'); setError('')
    const r = await escribir<{ id: string; folio: string }>('reporte-emitir', pedido())
    setEstado('')
    if (!r.ok) { setError(decirError(r)); return }
    setEmitido(r.dato)
    onEmitido({ id: r.dato.id, folio: r.dato.folio, tipo, titulo: NOMBRE_TIPO[tipo], emitido: new Date().toISOString(), emitidoPor: '', periodo: { desde, hasta }, real: vista?.avance.real ?? 0 })
  }
  const area = (k: keyof typeof t, etiqueta: string, ayuda: string) => (
    <label className="gn-campo ancho">
      <span>{etiqueta} <em>{ayuda}</em></span>
      <textarea rows={k === 'resumen' || k === 'causas' ? 4 : 3} value={t[k]} onChange={e => setT(x => ({ ...x, [k]: e.target.value }))} />
    </label>
  )

  return (
    <div className="gn-velo" role="dialog" aria-modal="true" aria-label="Nuevo reporte">
      <div className="gn-dialogo">
        <header>
          <h2>{formato === 'pdf' ? 'Reporte formal (PDF)' : 'Presentación ejecutiva (PowerPoint)'}</h2>
          <button className="ed-btn suave chico" onClick={onCerrar}>Cerrar</button>
        </header>
        {emitido ? (
          <div className="gn-listo">
            <p>Emitido con folio <b className="pt-mono">{emitido.folio}</b> y guardado en el historial. Descárgalo o mándatelo a Telegram, donde lo puedes guardar o reenviar.</p>
            <Entrega archivos={formato === 'pdf'
              ? [{ etiqueta: 'PDF', href: `${base}/reporte/${emitido.id}/pdf` }, { etiqueta: 'PowerPoint', href: `${base}/reporte/${emitido.id}/pptx` }]
              : [{ etiqueta: 'PowerPoint', href: `${base}/reporte/${emitido.id}/pptx` }, { etiqueta: 'PDF', href: `${base}/reporte/${emitido.id}/pdf` }]} />
            <div className="gn-botones">
              <button className="ed-btn primario" onClick={onCerrar}>Listo</button>
            </div>
          </div>
        ) : (
          <>
            <div className="gn-rejilla">
              <label className="gn-campo">
                <span>Tipo</span>
                <select value={tipo} onChange={e => { setTipo(e.target.value as TipoReporte); setVista(null) }}>
                  {TIPOS.map(x => <option key={x.v} value={x.v}>{x.t}</option>)}
                </select>
              </label>
              {conFase && (
                <label className="gn-campo">
                  <span>Fase</span>
                  <select value={fase} onChange={e => { setFase(e.target.value); setVista(null) }}>
                    {fases.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
              )}
              <label className="gn-campo"><span>Desde</span><input type="date" value={desde} onChange={e => { setDesde(e.target.value); setVista(null) }} /></label>
              <label className="gn-campo"><span>Hasta</span><input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setVista(null) }} /></label>
            </div>
            <div className="gn-botones">
              <button className="ed-btn suave" onClick={prellenar} disabled={estado !== ''}>{estado === 'leyendo' ? 'Leyendo el proyecto…' : vista ? 'Volver a leer' : 'Leer el proyecto y prellenar'}</button>
              {vista && <span className="gn-nota">{vista.avance.real}% real{vista.avance.esperado !== null ? ` contra ${vista.avance.esperado}% planeado` : ''} · {vista.realizado.length} cerradas en el periodo · {vista.atrasados.length} atrasadas · {vista.siguiente.length} siguen</span>}
            </div>
            <p className="gn-nota">Los números salen del proyecto. Lo que no se puede medir —por qué se atrasó algo y qué se va a hacer— lo escribes tú; si lo dejas vacío, el reporte lo dice en vez de inventarlo.</p>
            <div className="gn-rejilla">
              {area('resumen', 'Resumen ejecutivo', 'para el comité')}
              {area('logros', 'Logros del periodo', 'lo que vale la pena destacar')}
              {area('causas', 'Causas de los atrasos', 'una por renglón')}
              {area('acciones', 'Acciones para mitigar', 'quién hace qué y para cuándo')}
              {area('siguientes', 'Siguientes pasos', 'además de lo que ya marca el plan')}
              {area('comentarios', 'Comentarios', 'acuerdos, pendientes del cliente, decisiones')}
            </div>
            {error && <div className="ed-error">{error}</div>}
            <div className="gn-botones">
              <button className="ed-btn primario" onClick={emitir} disabled={estado !== ''}>{estado === 'emitiendo' ? 'Emitiendo…' : 'Emitir'}</button>
              <span className="gn-nota">Al emitirlo se guarda con folio en el historial y ya no cambia.</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TarjetaSocial({
  base, fases, veredicto, hayLogo, hayCliente, publicarCliente,
}: { base: string; fases: string[]; veredicto: Veredicto; hayLogo: boolean; hayCliente: boolean; publicarCliente: boolean }) {
  const [etapa, setEtapa] = useState<(typeof ETAPAS)[number]['v']>('avance')
  const [formato, setFormato] = useState<'cuadrada' | 'horizontal'>('cuadrada')
  const [conLogo, setConLogo] = useState(hayLogo)
  const [conCliente, setConCliente] = useState(false)
  const [fase, setFase] = useState(fases[0] ?? '')
  const q = new URLSearchParams({ etapa, formato, logo: conLogo ? '1' : '0', cliente: conCliente && publicarCliente ? '1' : '0', ...(etapa === 'fase' ? { fase } : {}) })
  const src = `${base}/social?${q.toString()}`
  return (
    <section className="pt-tarjeta">
      <header><h2>Tarjeta para redes</h2><span className="pt-overline">LinkedIn, Instagram, WhatsApp</span></header>
      <div className="gn-social">
        <div className="gn-social-op">
          <label className="gn-campo"><span>Momento</span>
            <select value={etapa} onChange={e => setEtapa(e.target.value as typeof etapa)}>{ETAPAS.map(x => <option key={x.v} value={x.v}>{x.t}</option>)}</select>
          </label>
          {etapa === 'fase' && (
            <label className="gn-campo"><span>Fase</span>
              <select value={fase} onChange={e => setFase(e.target.value)}>{fases.map(x => <option key={x} value={x}>{x}</option>)}</select>
            </label>
          )}
          <label className="gn-campo"><span>Formato</span>
            <select value={formato} onChange={e => setFormato(e.target.value as typeof formato)}>
              <option value="cuadrada">Cuadrada (1080 × 1080)</option>
              <option value="horizontal">Horizontal (1200 × 627)</option>
            </select>
          </label>
          <label className="gn-check"><input type="checkbox" checked={conLogo} disabled={!hayLogo} onChange={e => setConLogo(e.target.checked)} /> Con el logo del sponsor{!hayLogo && ' (no hay)'}</label>
          <label className="gn-check"><input type="checkbox" checked={conCliente && publicarCliente} disabled={!publicarCliente} onChange={e => setConCliente(e.target.checked)} /> Con el nombre {hayCliente ? 'y el logo ' : ''}del cliente{!publicarCliente && ' (falta su autorización, abajo)'}</label>
          {etapa === 'avance' && veredicto === 'atrasado' && (
            <p className="gn-nota">El proyecto va atrasado: la tarjeta dice el avance sin celebrarlo.</p>
          )}
          <Entrega archivos={[{ etiqueta: 'Imagen', href: `${src}&descargar=1` }]} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={`gn-social-img ${formato}`} src={src} alt="Vista previa de la tarjeta" />
      </div>
    </section>
  )
}

/**
 * Descargar, o mandármelo a Telegram (#208).
 *
 * Quien entra al portal desde el chat lo ve en el navegador de Telegram, y
 * ahí un archivo se abre en la página sin forma de guardarlo. Mandado al chat
 * llega como documento: se guarda, se reenvía o se abre con otra app.
 */
function Entrega({ archivos, chico = false }: { archivos: Array<{ etiqueta: string; href: string }>; chico?: boolean }) {
  const [estado, setEstado] = useState<{ tono: 'ok' | 'mal' | 'yendo'; texto: string } | null>(null)
  async function alChat(a: { etiqueta: string; href: string }) {
    setEstado({ tono: 'yendo', texto: `Mandando ${a.etiqueta}…` })
    try {
      const r = await fetch(a.href, { method: 'POST' })
      const j = (await r.json().catch(() => ({}))) as { error?: string }
      if (r.ok) { setEstado({ tono: 'ok', texto: `Listo: ${a.etiqueta} va en camino a tu chat de Telegram.` }); return }
      setEstado({ tono: 'mal', texto: j.error === 'SIN_TELEGRAM'
        ? 'Tu cuenta no tiene Telegram vinculado: usa el botón de descargar.'
        : j.error === 'SIN_SESION' ? 'Tu sesión se cerró. Pídele a Zaelyn un enlace nuevo.'
          : 'No pude mandarlo. Inténtalo otra vez.' })
    } catch {
      setEstado({ tono: 'mal', texto: 'No hay conexión. Inténtalo otra vez.' })
    }
  }
  const c = chico ? ' chico' : ''
  return (
    <span className="gn-entrega">
      {archivos.map(a => (
        <a key={a.href} className={`ed-btn suave${c}`} href={a.href} download title={`Descargar ${a.etiqueta}`}>↓ {a.etiqueta}</a>
      ))}
      {archivos.map(a => (
        <button key={`tg-${a.href}`} type="button" className={`ed-btn suave gn-tg${c}`} disabled={estado?.tono === 'yendo'}
          onClick={() => void alChat(a)} title={`Mandarme ${a.etiqueta} a mi chat de Telegram`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 4.3 2.9 11.5c-1.1.4-1 1.9.1 2.2l4.6 1.4 1.8 5.5c.3.9 1.4 1.1 2 .4l2.6-2.7 4.6 3.4c.8.6 1.9.1 2.1-.9l3.1-14.9c.2-1.1-.9-2-1.9-1.6Z" fill="currentColor" /></svg>
          {archivos.length > 1 ? a.etiqueta : 'A Telegram'}
        </button>
      ))}
      {estado && <span className={`gn-entrega-estado ${estado.tono}`} role="status">{estado.texto}</span>}
    </span>
  )
}
