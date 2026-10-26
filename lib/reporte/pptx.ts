/**
 * La presentación ejecutiva en PowerPoint (#202): para que el sponsor
 * presente el avance. Se puede editar —es un .pptx—, pero la marca de Zaelyn
 * PMO va en el patrón de las láminas, chica, en todas.
 */
import PptxGenJS from 'pptxgenjs'
import type { ActividadDeReporte, DatosDeReporte } from '../api'
import { COLOR, COLOR_RITMO, LEYENDA, SECCIONES, SIN_TEXTO, VEREDICTO, fechaCorta, fechaLarga, horas, periodoTexto, type Logos } from './marca'

const H = (c: string) => c.replace('#', '')
const TITULO = 'MuseoModerno'
const TEXTO = 'Prompt'
const c = (text: string | undefined) => ({ text: text ?? '' })
const dataUrl = (b: Buffer, mime: string) => `${mime};base64,${b.toString('base64')}`

export async function presentacion(d: DatosDeReporte, logos: Logos): Promise<Buffer> {
  const p = new PptxGenJS()
  p.layout = 'LAYOUT_WIDE' // 13.33 × 7.5 in
  p.author = d.ficha.sponsor || 'Zaelyn PMO'
  p.company = d.ficha.sponsor || ''
  p.title = `${d.titulo} · ${d.proyecto.nombre}`

  const objetos: PptxGenJS.SlideMasterProps['objects'] = [
    { rect: { x: 0.45, y: 7.0, w: 0.75, h: 0.26, fill: { color: H(COLOR.noche) }, rectRadius: 0.05 } },
    { image: { x: 0.5, y: 7.02, w: 0.65, h: 0.22, data: dataUrl(logos.zaelyn, 'image/png') } },
    { text: { text: LEYENDA, options: { x: 1.3, y: 7.0, w: 7.5, h: 0.26, fontFace: TEXTO, fontSize: 8, color: H(COLOR.tinta3) } } },
    { line: { x: 0.45, y: 6.9, w: 12.43, h: 0, line: { color: H(COLOR.linea), width: 0.75 } } },
  ]
  if (logos.sponsor) objetos.push({ image: { x: 0.45, y: 0.25, w: 1.6, h: 0.55, data: dataUrl(logos.sponsor.datos, logos.sponsor.mime), sizing: { type: 'contain', w: 1.6, h: 0.55 } } })
  if (logos.cliente) objetos.push({ image: { x: 11.28, y: 0.25, w: 1.6, h: 0.55, data: dataUrl(logos.cliente.datos, logos.cliente.mime), sizing: { type: 'contain', w: 1.6, h: 0.55 } } })
  p.defineSlideMaster({
    title: 'ZAELYN', background: { color: 'FFFFFF' }, objects: objetos,
    slideNumber: { x: 12.2, y: 7.0, w: 0.7, h: 0.26, fontFace: TEXTO, fontSize: 8, color: H(COLOR.tinta3), align: 'right' },
  })

  const lamina = (titulo: string, sub?: string) => {
    const s = p.addSlide({ masterName: 'ZAELYN' })
    s.addText(titulo, { x: 0.45, y: 0.95, w: 12.4, h: 0.6, fontFace: TITULO, fontSize: 26, bold: true, color: H(COLOR.tinta) })
    if (sub) s.addText(sub, { x: 0.45, y: 1.5, w: 12.4, h: 0.35, fontFace: TEXTO, fontSize: 12, color: H(COLOR.tinta3) })
    return s
  }
  const barra = (s: PptxGenJS.Slide, x: number, y: number, w: number, real: number, esperado: number | null, color: string, h = 0.16) => {
    s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: H(COLOR.riel) }, rectRadius: h / 2, line: { color: H(COLOR.riel) } })
    if (real > 0) s.addShape(p.ShapeType.roundRect, { x, y, w: Math.max(h, (w * Math.min(100, real)) / 100), h, fill: { color: H(color) }, rectRadius: h / 2, line: { color: H(color) } })
    if (esperado !== null) s.addShape(p.ShapeType.line, { x: x + (w * Math.min(100, esperado)) / 100, y: y - 0.07, w: 0, h: h + 0.14, line: { color: H(COLOR.tinta), width: 1.5 } })
  }
  const caja = (s: PptxGenJS.Slide, x: number, y: number, w: number, h: number, titulo: string, texto: string, vacio?: string) => {
    s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: 'FFFFFF' }, line: { color: H(COLOR.linea), width: 1 }, rectRadius: 0.08 })
    s.addText(titulo, { x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.3, fontFace: TEXTO, fontSize: 11, bold: true, color: H(COLOR.tinta2) })
    s.addText(texto || vacio || '', { x: x + 0.15, y: y + 0.4, w: w - 0.3, h: h - 0.5, fontFace: TEXTO, fontSize: 11, color: H(texto ? COLOR.tinta : COLOR.tinta3), italic: !texto, valign: 'top', fit: 'shrink' })
  }
  const vinetas = (s: PptxGenJS.Slide, items: ActividadDeReporte[], detalle: (a: ActividadDeReporte) => string, color: string, x: number, y: number, w: number, h: number, vacio: string) => {
    if (!items.length) { s.addText(vacio, { x, y, w, h: 0.4, fontFace: TEXTO, fontSize: 13, color: H(COLOR.tinta3), italic: true }); return }
    s.addText(items.slice(0, 10).flatMap(a => [
      { text: `${a.texto}${a.quien ? ` — ${a.quien}` : ''}`, options: { bullet: { code: '25CF' }, color: H(COLOR.tinta), fontSize: 13, breakLine: true } },
      { text: `${detalle(a)}${a.tramo ? ` · ${a.tramo}` : ''}`, options: { color: H(COLOR.tinta3), fontSize: 10, indentLevel: 1, breakLine: true } },
    ]), { x, y, w, h, fontFace: TEXTO, valign: 'top', paraSpaceAfter: 2, fit: 'shrink' })
    void color
  }

  // ── portada
  const v = VEREDICTO[d.avance.veredicto]
  {
    const s = p.addSlide({ masterName: 'ZAELYN' })
    s.addShape(p.ShapeType.rect, { x: 0, y: 1.2, w: 0.22, h: 4.4, fill: { color: H(COLOR.marca) }, line: { color: H(COLOR.marca) } })
    s.addText(d.titulo.toUpperCase() + (d.proyecto.fase ? ` · ${d.proyecto.fase}` : ''), { x: 0.6, y: 1.5, w: 11.8, h: 0.4, fontFace: TEXTO, fontSize: 14, bold: true, color: H(COLOR.zaelyn), charSpacing: 2 })
    s.addText(d.proyecto.nombre, { x: 0.6, y: 2.0, w: 11.8, h: 1.4, fontFace: TITULO, fontSize: 40, bold: true, color: H(COLOR.tinta), fit: 'shrink' })
    s.addText([
      ...(d.ficha.cliente ? [{ text: `Cliente: ${d.ficha.cliente}`, options: { breakLine: true } }] : []),
      ...(d.ficha.sponsor ? [{ text: `Presenta: ${d.ficha.sponsor}${d.ficha.liderProyecto ? ` · ${d.ficha.liderProyecto}` : ''}`, options: { breakLine: true } }] : []),
      { text: periodoTexto(d), options: { breakLine: true } },
    ], { x: 0.6, y: 3.6, w: 11.8, h: 1.2, fontFace: TEXTO, fontSize: 16, color: H(COLOR.tinta2), valign: 'top' })
    s.addText(`Folio ${d.folio} · ${fechaLarga(d.emitido)}`, { x: 0.6, y: 5.1, w: 11.8, h: 0.35, fontFace: TEXTO, fontSize: 11, color: H(COLOR.tinta3) })
  }

  const sec = SECCIONES[d.tipo]

  // ── resumen ejecutivo (va en todas menos el kickoff)
  if (d.tipo !== 'kickoff') {
    const s = lamina('Resumen ejecutivo', periodoTexto(d))
    s.addText(`${d.avance.real}%`, { x: 0.45, y: 2.0, w: 4, h: 1.5, fontFace: TITULO, fontSize: 88, bold: true, color: H(COLOR.marca) })
    s.addText(d.avance.esperado !== null ? `avance real · planeado a hoy ${d.avance.esperado}%` : 'avance real', { x: 0.5, y: 3.45, w: 4.2, h: 0.35, fontFace: TEXTO, fontSize: 13, color: H(COLOR.tinta2) })
    s.addShape(p.ShapeType.roundRect, { x: 0.5, y: 3.95, w: 2.2, h: 0.42, fill: { color: H(v.color) }, line: { color: H(v.color) }, rectRadius: 0.21 })
    s.addText(v.texto, { x: 0.5, y: 3.95, w: 2.2, h: 0.42, fontFace: TEXTO, fontSize: 13, bold: true, color: 'FFFFFF', align: 'center' })
    s.addText(`${d.avance.cerradas} de ${d.avance.total} actividades cerradas\nFecha fin: ${fechaCorta(d.proyecto.termina)}`, { x: 0.5, y: 4.55, w: 4.2, h: 0.8, fontFace: TEXTO, fontSize: 12, color: H(COLOR.tinta2) })
    barra(s, 0.5, 5.6, 4.0, d.avance.real, d.avance.esperado, COLOR.marca, 0.22)
    s.addText([
      { text: d.textos.resumen, options: { fontSize: 14, color: H(COLOR.tinta), breakLine: true, paraSpaceAfter: 8 } },
      ...d.lectura.map(b => ({ text: `${b.titulo}. ${b.texto}`, options: { fontSize: 12, color: H(COLOR.tinta2), bullet: { code: '25CF' }, breakLine: true } })),
    ], { x: 5.2, y: 2.0, w: 7.6, h: 4.6, fontFace: TEXTO, valign: 'top', fit: 'shrink' })
  }

  // ── objetivo, alcance y equipo (kickoff)
  if (sec.includes('datos')) {
    const s = lamina('El proyecto')
    caja(s, 0.45, 2.0, 6.1, 4.6, 'Objetivo', d.ficha.objetivo, 'Sin objetivo registrado.')
    caja(s, 6.75, 2.0, 6.1, 4.6, 'Alcance', d.ficha.alcance, 'Sin alcance registrado.')
  }
  if (sec.includes('equipo') && d.ficha.contactos.length && d.tipo === 'kickoff') laminaEquipo()

  // ── avance por fase y entregable
  if (sec.includes('arbol') && d.arbol.length) {
    for (let i = 0; i < d.arbol.length; i += 11) {
      const s = lamina('Avance por fase y entregable', i ? 'continuación' : 'La línea negra marca lo planeado a hoy')
      d.arbol.slice(i, i + 11).forEach((n, k) => {
        const y = 2.05 + k * 0.42
        s.addText(n.nombre, { x: 0.45 + (n.nivel - 1) * 0.3, y, w: 6.6 - (n.nivel - 1) * 0.3, h: 0.36, fontFace: TEXTO, fontSize: n.tipo === 'fase' ? 13 : 12, bold: n.tipo === 'fase', color: H(COLOR.tinta), fit: 'shrink' })
        barra(s, 7.2, y + 0.11, 3.4, n.real, n.esperado, COLOR_RITMO[n.ritmo])
        s.addText(`${n.real}%`, { x: 10.75, y, w: 0.8, h: 0.36, fontFace: TEXTO, fontSize: 12, bold: true, color: H(n.ritmo === 'atrasado' ? COLOR.mal : COLOR.tinta), align: 'right' })
        s.addText(`${n.esperado !== null ? `plan ${n.esperado}% · ` : ''}${n.cerradas}/${n.total}`, { x: 11.6, y, w: 1.3, h: 0.36, fontFace: TEXTO, fontSize: 9, color: H(COLOR.tinta3), align: 'right' })
      })
    }
  }

  if (sec.includes('realizado')) {
    const s = lamina('Lo realizado', periodoTexto(d))
    vinetas(s, d.realizado, a => `Cerrada el ${fechaCorta(a.fecha)}`, COLOR.bien, 0.45, 2.0, d.textos.logros ? 7.6 : 12.4, 4.7, 'No se cerraron actividades en este periodo.')
    if (d.textos.logros) caja(s, 8.3, 2.0, 4.55, 4.6, 'Logros', d.textos.logros)
  }

  if (sec.includes('atrasos')) {
    if (d.atrasados.length || d.textos.causas || d.textos.acciones) {
      const s = lamina('Atrasos, causas y acciones')
      vinetas(s, d.atrasados, a => `Va ${a.real}%${a.esperado !== null ? ` de ${a.esperado}%` : ''}${a.diasTarde ? ` · ${a.diasTarde} días tarde` : ''}`, COLOR.mal, 0.45, 2.0, 6.2, 4.7, 'Ninguna actividad va atrasada.')
      caja(s, 6.85, 2.0, 6.0, 2.25, 'Causas', d.textos.causas, SIN_TEXTO.causas)
      caja(s, 6.85, 4.4, 6.0, 2.25, 'Acciones para mitigar', d.textos.acciones, SIN_TEXTO.acciones)
    } else {
      const s = lamina('Todo en orden')
      s.addText('Ninguna actividad va atrasada en este corte.', { x: 0.45, y: 2.4, w: 12.4, h: 0.8, fontFace: TEXTO, fontSize: 22, color: H(COLOR.bien), bold: true })
    }
  }

  if (sec.includes('siguiente')) {
    const s = lamina(d.tipo === 'kickoff' ? 'Primeras actividades' : 'Lo que sigue', 'Próximos días')
    vinetas(s, d.siguiente, a => `${a.inicia ? `${fechaCorta(a.inicia)} – ` : ''}${fechaCorta(a.vence)}`, COLOR.marca, 0.45, 2.0, d.textos.siguientes ? 7.6 : 12.4, 4.7, 'No hay actividades programadas para los próximos días.')
    if (d.textos.siguientes) caja(s, 8.3, 2.0, 4.55, 4.6, 'Siguientes pasos', d.textos.siguientes)
  }

  if (sec.includes('hitos') && d.hitos.length) {
    const s = lamina('Hitos')
    s.addTable([
      [{ text: 'Hito', options: { bold: true, color: H(COLOR.tinta3) } }, { text: 'Fecha', options: { bold: true, color: H(COLOR.tinta3) } }, { text: 'Estado', options: { bold: true, color: H(COLOR.tinta3) } }],
      ...d.hitos.slice(0, 12).map(h => [c(h.texto), c(fechaCorta(h.vence)), { text: h.cumplido ? 'Cumplido' : 'Pendiente', options: { color: H(h.cumplido ? COLOR.bien : COLOR.tinta3), bold: true } }]),
    ], { x: 0.45, y: 2.0, w: 12.4, colW: [8.4, 2, 2], fontFace: TEXTO, fontSize: 12, border: { type: 'solid', color: H(COLOR.linea), pt: 0.75 }, autoPage: false })
  }

  if (sec.includes('facturacion')) {
    const s = lamina('Entregables para facturación', d.minutosPeriodo !== null ? `Horas registradas en el periodo: ${horas(d.minutosPeriodo)}` : undefined)
    if (!d.facturacion.length) s.addText('No hay entregables marcados para facturación.', { x: 0.45, y: 2.1, w: 12, h: 0.5, fontFace: TEXTO, fontSize: 14, color: H(COLOR.tinta3), italic: true })
    else s.addTable([
      ['Entregable', 'Concepto', 'Estado', 'Avance', 'Cierre', 'Horas'].map(t => ({ text: t, options: { bold: true, color: H(COLOR.tinta3) } })),
      ...d.facturacion.slice(0, 12).map(f => [c(f.nombre), c(f.concepto || '—'),
        { text: f.estado === 'cumplido' ? 'Cumplido' : f.estado === 'en_curso' ? 'En curso' : 'Pendiente', options: { bold: true, color: H(f.estado === 'cumplido' ? COLOR.bien : f.estado === 'en_curso' ? COLOR.riesgo : COLOR.tinta3) } },
        c(`${f.real}%`), c(fechaCorta(f.fecha)), c(horas(f.minutos))]),
    ], { x: 0.45, y: 2.0, w: 12.4, colW: [4.6, 2.6, 1.5, 1.1, 1.4, 1.2], fontFace: TEXTO, fontSize: 11, border: { type: 'solid', color: H(COLOR.linea), pt: 0.75 }, autoPage: false })
  }

  if (sec.includes('equipo') && d.ficha.contactos.length && d.tipo !== 'kickoff') laminaEquipo()

  if (sec.includes('comentarios') && d.textos.comentarios) {
    const s = lamina('Comentarios y acuerdos')
    s.addText(d.textos.comentarios, { x: 0.45, y: 2.0, w: 12.4, h: 4.6, fontFace: TEXTO, fontSize: 15, color: H(COLOR.tinta), valign: 'top', fit: 'shrink' })
  }

  // ── cierre
  {
    const s = p.addSlide({ masterName: 'ZAELYN' })
    s.addText('Gracias', { x: 0.45, y: 2.4, w: 12.4, h: 1.2, fontFace: TITULO, fontSize: 48, bold: true, color: H(COLOR.tinta), align: 'center' })
    s.addText([d.ficha.sponsor, d.ficha.liderProyecto].filter(Boolean).join(' · ') || d.proyecto.nombre, { x: 0.45, y: 3.6, w: 12.4, h: 0.5, fontFace: TEXTO, fontSize: 16, color: H(COLOR.tinta2), align: 'center' })
  }

  function laminaEquipo() {
    const s = lamina('Equipo y contactos')
    s.addTable([
      ['Tipo', 'Nombre', 'Rol', 'Email', 'Teléfono'].map(t => ({ text: t, options: { bold: true, color: H(COLOR.tinta3) } })),
      ...d.ficha.contactos.slice(0, 12).map(x => [c({ sponsor: 'Sponsor', cliente: 'Cliente', equipo: 'Equipo', otro: 'Otro' }[x.tipo]), c(`${x.nombre}${x.empresa ? ` · ${x.empresa}` : ''}`), c(x.rol), c(x.email), c(x.telefono)]),
    ], { x: 0.45, y: 2.0, w: 12.4, colW: [1.3, 3.8, 2.4, 3.1, 1.8], fontFace: TEXTO, fontSize: 11, border: { type: 'solid', color: H(COLOR.linea), pt: 0.75 }, autoPage: false })
  }

  const salida = await p.write({ outputType: 'nodebuffer' })
  return salida as Buffer
}
