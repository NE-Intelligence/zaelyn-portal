/**
 * El reporte formal en PDF (#202): carta, para el comité del proyecto.
 *
 * Una página de portada-resumen y las secciones del tipo de reporte. Cada
 * página lleva arriba los logos del sponsor y del cliente y abajo la marca de
 * Zaelyn PMO, que no se quita. Varios reportes van en un solo PDF para la
 * exportación de cierre.
 */
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { ActividadDeReporte, DatosDeReporte } from '../api'
import {
  COLOR, COLOR_RITMO, LEYENDA, NOMBRE_RITMO, SECCIONES, SIN_TEXTO, VEREDICTO,
  fechaCorta, fechaLarga, fuente, horas, periodoTexto, type Logos,
} from './marca'

let registradas = false
function registrar() {
  if (registradas) return
  Font.register({ family: 'Prompt', fonts: [
    { src: fuente('prompt-latin-400-normal.woff'), fontWeight: 400 },
    { src: fuente('prompt-latin-600-normal.woff'), fontWeight: 600 },
  ] })
  Font.register({ family: 'MuseoModerno', src: fuente('museomoderno-latin-700-normal.woff'), fontWeight: 700 })
  Font.registerHyphenationCallback(w => [w])
  registradas = true
}

const s = StyleSheet.create({
  pagina: { fontFamily: 'Prompt', fontSize: 9.5, color: COLOR.tinta, paddingTop: 76, paddingBottom: 54, paddingHorizontal: 44 },
  cabeza: { position: 'absolute', top: 24, left: 44, right: 44, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLOR.linea, paddingBottom: 8 },
  logo: { height: 30, width: 120, objectFit: 'contain' },
  cabezaTxt: { fontSize: 8, color: COLOR.tinta3, textAlign: 'center', flexGrow: 1, flexBasis: 0, paddingHorizontal: 10 },
  pie: { position: 'absolute', bottom: 18, left: 44, right: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLOR.linea, paddingTop: 6 },
  pieMarca: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pastilla: { backgroundColor: COLOR.noche, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 5 },
  pieLogo: { height: 10, width: 30, objectFit: 'contain' },
  pieTxt: { fontSize: 6.5, color: COLOR.tinta3 },
  tipo: { fontSize: 10, color: COLOR.zaelyn, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' },
  titulo: { fontFamily: 'MuseoModerno', fontSize: 22, fontWeight: 700, marginTop: 4 },
  sub: { fontSize: 10, color: COLOR.tinta2, marginTop: 3 },
  kpis: { flexDirection: 'row', gap: 8, marginTop: 16 },
  kpi: { flexGrow: 1, flexBasis: 0, borderWidth: 1, borderColor: COLOR.linea, borderRadius: 6, padding: 9 },
  kpiEt: { fontSize: 7, color: COLOR.tinta3, textTransform: 'uppercase', letterSpacing: 0.6 },
  kpiVal: { fontFamily: 'MuseoModerno', fontSize: 18, fontWeight: 700, marginTop: 2 },
  kpiDet: { fontSize: 7.5, color: COLOR.tinta3, marginTop: 1 },
  h2: { fontSize: 12, fontWeight: 600, marginTop: 18, marginBottom: 6, color: COLOR.tinta, borderBottomWidth: 1.5, borderBottomColor: COLOR.marca, paddingBottom: 3 },
  parrafo: { fontSize: 9.5, lineHeight: 1.45, color: COLOR.tinta },
  vacio: { fontSize: 9, color: COLOR.tinta3, fontStyle: 'italic' },
  fila: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: COLOR.linea, paddingVertical: 4, alignItems: 'center' },
  enc: { flexDirection: 'row', backgroundColor: COLOR.fondo, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: COLOR.linea },
  th: { fontSize: 7, color: COLOR.tinta3, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  td: { fontSize: 8.5 },
  tdSuave: { fontSize: 8, color: COLOR.tinta3 },
  riel: { height: 6, backgroundColor: COLOR.riel, borderRadius: 3, position: 'relative' },
  bullet: { flexDirection: 'row', gap: 5, marginBottom: 3 },
  punto: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  caja: { borderWidth: 1, borderColor: COLOR.linea, borderRadius: 6, padding: 9, marginTop: 6 },
  cajaEt: { fontSize: 8, fontWeight: 600, color: COLOR.tinta2, marginBottom: 3 },
})

function Barra({ real, esperado, color, ancho = 90 }: { real: number; esperado: number | null; color: string; ancho?: number }) {
  return (
    <View style={[s.riel, { width: ancho }]}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(0, Math.min(100, real))}%`, backgroundColor: color, borderRadius: 3 }} />
      {esperado !== null && <View style={{ position: 'absolute', top: -2, width: 1.2, height: 10, left: `${Math.max(0, Math.min(100, esperado))}%`, backgroundColor: COLOR.tinta }} />}
    </View>
  )
}

function Marco({ d, logos }: { d: DatosDeReporte; logos: Logos }) {
  return (
    <>
      <View style={s.cabeza} fixed>
        {logos.sponsor ? <Image style={s.logo} src={{ data: logos.sponsor.datos, format: logos.sponsor.mime === 'image/png' ? 'png' : 'jpg' }} /> : <Text style={{ width: 120, fontSize: 9, fontWeight: 600 }}>{d.ficha.sponsor}</Text>}
        <Text style={s.cabezaTxt}>{d.proyecto.nombre} · {d.titulo} · {d.folio}</Text>
        {logos.cliente ? <Image style={s.logo} src={{ data: logos.cliente.datos, format: logos.cliente.mime === 'image/png' ? 'png' : 'jpg' }} /> : <Text style={{ width: 120, fontSize: 9, fontWeight: 600, textAlign: 'right' }}>{d.ficha.cliente}</Text>}
      </View>
      <View style={s.pie} fixed>
        <View style={s.pieMarca}>
          <View style={s.pastilla}><Image style={s.pieLogo} src={{ data: logos.zaelyn, format: 'png' }} /></View>
          <Text style={s.pieTxt}>{LEYENDA}</Text>
        </View>
        <Text style={s.pieTxt} render={({ pageNumber, totalPages }) => `${d.folio} · Página ${pageNumber} de ${totalPages}`} />
      </View>
    </>
  )
}

function Lista({ items, vacio, color = COLOR.marca, detalle }: { items: ActividadDeReporte[]; vacio: string; color?: string; detalle: (a: ActividadDeReporte) => string }) {
  if (!items.length) return <Text style={s.vacio}>{vacio}</Text>
  return (
    <View>
      {items.map((a, i) => (
        <View key={i} style={s.bullet} wrap={false}>
          <View style={[s.punto, { backgroundColor: color }]} />
          <View style={{ flexGrow: 1, flexBasis: 0 }}>
            <Text style={s.td}>{a.texto}{a.quien ? ` — ${a.quien}` : ''}</Text>
            <Text style={s.tdSuave}>{detalle(a)}{a.tramo ? ` · ${a.tramo}` : ''}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

function Texto({ titulo, texto, vacio }: { titulo: string; texto: string; vacio?: string }) {
  if (!texto && !vacio) return null
  return (
    <View style={s.caja} wrap={false}>
      <Text style={s.cajaEt}>{titulo}</Text>
      <Text style={texto ? s.parrafo : s.vacio}>{texto || vacio}</Text>
    </View>
  )
}

function Reporte({ d, logos }: { d: DatosDeReporte; logos: Logos }) {
  const v = VEREDICTO[d.avance.veredicto]
  const sec = SECCIONES[d.tipo]
  const dif = d.avance.esperado === null ? null : d.avance.real - d.avance.esperado
  const equipo = d.ficha.contactos
  return (
    <Page size="LETTER" style={s.pagina}>
      <Marco d={d} logos={logos} />
      <Text style={s.tipo}>{d.titulo}{d.proyecto.fase ? ` · ${d.proyecto.fase}` : ''}</Text>
      <Text style={s.titulo}>{d.proyecto.nombre}</Text>
      <Text style={s.sub}>
        {d.ficha.cliente ? `Cliente: ${d.ficha.cliente} · ` : ''}{d.ficha.sponsor ? `Sponsor: ${d.ficha.sponsor} · ` : ''}{periodoTexto(d)}
      </Text>
      <Text style={[s.sub, { fontSize: 8, color: COLOR.tinta3 }]}>Folio {d.folio} · emitido el {fechaLarga(d.emitido)}{d.emitidoPor ? ` por ${d.emitidoPor}` : ''} · dirigido al comité del proyecto</Text>

      <View style={s.kpis}>
        <View style={s.kpi}><Text style={s.kpiEt}>Avance real</Text><Text style={[s.kpiVal, { color: COLOR.marca }]}>{d.avance.real}%</Text><Text style={s.kpiDet}>{d.avance.esperado !== null ? `Planeado a hoy: ${d.avance.esperado}%` : 'Sin fechas para comparar'}</Text></View>
        <View style={s.kpi}><Text style={s.kpiEt}>Estado</Text><Text style={[s.kpiVal, { color: v.color, fontSize: 14 }]}>{v.texto}</Text><Text style={s.kpiDet}>{dif === null ? '' : dif >= 0 ? `${dif} puntos adelante` : `${-dif} puntos atrás`}</Text></View>
        <View style={s.kpi}><Text style={s.kpiEt}>Actividades</Text><Text style={s.kpiVal}>{d.avance.cerradas}/{d.avance.total}</Text><Text style={s.kpiDet}>cerradas</Text></View>
        <View style={s.kpi}><Text style={s.kpiEt}>Fecha fin</Text><Text style={[s.kpiVal, { fontSize: 14 }]}>{fechaCorta(d.proyecto.termina)}</Text><Text style={s.kpiDet}>{d.proyecto.inicia ? `Inició ${fechaCorta(d.proyecto.inicia)}` : ''}</Text></View>
      </View>
      <View style={{ marginTop: 8 }}><Barra real={d.avance.real} esperado={d.avance.esperado} color={COLOR.marca} ancho={524} /></View>

      {sec.includes('datos') && (
        <View>
          <Text style={s.h2}>El proyecto</Text>
          <Texto titulo="Objetivo" texto={d.ficha.objetivo} vacio="Sin objetivo registrado en la sección General." />
          <Texto titulo="Alcance" texto={d.ficha.alcance} vacio="Sin alcance registrado en la sección General." />
          {d.ficha.descripcion ? <Texto titulo="Descripción" texto={d.ficha.descripcion} /> : null}
        </View>
      )}

      {sec.includes('resumen') && (
        <View>
          <Text style={s.h2}>Resumen ejecutivo</Text>
          <Text style={s.parrafo}>{d.textos.resumen}</Text>
          {d.lectura.map((b, i) => (
            <View key={i} style={[s.bullet, { marginTop: 4 }]}>
              <View style={[s.punto, { backgroundColor: b.tono === 'bien' ? COLOR.bien : b.tono === 'atencion' ? COLOR.riesgo : COLOR.futuro }]} />
              <Text style={[s.td, { flexGrow: 1, flexBasis: 0 }]}><Text style={{ fontWeight: 600 }}>{b.titulo}. </Text>{b.texto}</Text>
            </View>
          ))}
          {d.textos.logros ? <Texto titulo="Logros del periodo" texto={d.textos.logros} /> : null}
        </View>
      )}

      {sec.includes('arbol') && d.arbol.length > 0 && (
        <View>
          <Text style={s.h2}>Avance por fase y entregable</Text>
          <View style={s.enc}><Text style={[s.th, { flexGrow: 1, flexBasis: 0, paddingLeft: 4 }]}>Fase / entregable</Text><Text style={[s.th, { width: 100 }]}>Avance</Text><Text style={[s.th, { width: 40, textAlign: 'right' }]}>Real</Text><Text style={[s.th, { width: 44, textAlign: 'right' }]}>Plan</Text><Text style={[s.th, { width: 44, textAlign: 'right' }]}>Cerr.</Text><Text style={[s.th, { width: 60, textAlign: 'right', paddingRight: 4 }]}>Fin</Text></View>
          {d.arbol.map((n, i) => (
            <View key={i} style={s.fila} wrap={false}>
              <Text style={[s.td, { flexGrow: 1, flexBasis: 0, paddingLeft: 4 + (n.nivel - 1) * 12, fontWeight: n.tipo === 'fase' ? 600 : 400 }]}>{n.nombre}</Text>
              <View style={{ width: 100 }}><Barra real={n.real} esperado={n.esperado} color={COLOR_RITMO[n.ritmo]} /></View>
              <Text style={[s.td, { width: 40, textAlign: 'right', color: n.ritmo === 'atrasado' ? COLOR.mal : COLOR.tinta, fontWeight: 600 }]}>{n.real}%</Text>
              <Text style={[s.tdSuave, { width: 44, textAlign: 'right' }]}>{n.esperado !== null ? `${n.esperado}%` : '—'}</Text>
              <Text style={[s.tdSuave, { width: 44, textAlign: 'right' }]}>{n.cerradas}/{n.total}</Text>
              <Text style={[s.tdSuave, { width: 60, textAlign: 'right', paddingRight: 4 }]}>{fechaCorta(n.vence)}</Text>
            </View>
          ))}
          <Text style={[s.tdSuave, { marginTop: 4 }]}>Colores: {(['hecho', 'bien', 'riesgo', 'atrasado'] as const).map(r => NOMBRE_RITMO[r]).join(' · ')}. La línea negra marca lo planeado a hoy.</Text>
        </View>
      )}

      {sec.includes('realizado') && (
        <View>
          <Text style={s.h2}>Lo realizado en el periodo</Text>
          <Lista items={d.realizado} color={COLOR.bien} vacio="No se cerraron actividades en este periodo." detalle={a => `Cerrada el ${fechaCorta(a.fecha)}`} />
        </View>
      )}

      {sec.includes('atrasos') && (
        <View>
          <Text style={s.h2}>Atrasos, causas y acciones</Text>
          <Lista items={d.atrasados} color={COLOR.mal} vacio="Ninguna actividad va atrasada." detalle={a => `Va ${a.real}%${a.esperado !== null ? ` de ${a.esperado}% planeado` : ''}${a.diasTarde ? ` · ${a.diasTarde} días después de su fecha (${fechaCorta(a.vence)})` : ''}`} />
          {(d.atrasados.length > 0 || d.textos.causas) && <Texto titulo="Causas" texto={d.textos.causas} vacio={SIN_TEXTO.causas} />}
          {(d.atrasados.length > 0 || d.textos.acciones) && <Texto titulo="Acciones para mitigar" texto={d.textos.acciones} vacio={SIN_TEXTO.acciones} />}
        </View>
      )}

      {sec.includes('siguiente') && (
        <View>
          <Text style={s.h2}>{d.tipo === 'kickoff' ? 'Primeras actividades' : 'Lo que sigue'}</Text>
          <Lista items={d.siguiente} vacio="No hay actividades programadas para los próximos días." detalle={a => `${a.inicia ? `${fechaCorta(a.inicia)} – ` : ''}${fechaCorta(a.vence)} · ${a.real}%`} />
          {d.textos.siguientes ? <Texto titulo="Siguientes pasos" texto={d.textos.siguientes} /> : null}
        </View>
      )}

      {sec.includes('hitos') && d.hitos.length > 0 && (
        <View>
          <Text style={s.h2}>Hitos</Text>
          {d.hitos.map((h, i) => (
            <View key={i} style={s.fila} wrap={false}>
              <Text style={[s.td, { width: 14, color: h.cumplido ? COLOR.bien : COLOR.tinta3 }]}>•</Text>
              <Text style={[s.td, { flexGrow: 1, flexBasis: 0 }]}>{h.texto}</Text>
              <Text style={[s.tdSuave, { width: 70, textAlign: 'right' }]}>{fechaCorta(h.vence)}</Text>
              <Text style={[s.tdSuave, { width: 70, textAlign: 'right' }]}>{h.cumplido ? 'Cumplido' : 'Pendiente'}</Text>
            </View>
          ))}
        </View>
      )}

      {sec.includes('facturacion') && (
        <View>
          <Text style={s.h2}>Entregables para facturación</Text>
          {!d.facturacion.length ? <Text style={s.vacio}>No hay entregables marcados para facturación en la sección General.</Text> : (
            <View>
              <View style={s.enc}><Text style={[s.th, { flexGrow: 1, flexBasis: 0, paddingLeft: 4 }]}>Entregable</Text><Text style={[s.th, { width: 110 }]}>Concepto</Text><Text style={[s.th, { width: 70 }]}>Estado</Text><Text style={[s.th, { width: 44, textAlign: 'right' }]}>Avance</Text><Text style={[s.th, { width: 60, textAlign: 'right' }]}>Cierre</Text><Text style={[s.th, { width: 50, textAlign: 'right', paddingRight: 4 }]}>Horas</Text></View>
              {d.facturacion.map((f, i) => (
                <View key={i} style={s.fila} wrap={false}>
                  <Text style={[s.td, { flexGrow: 1, flexBasis: 0, paddingLeft: 4 }]}>{f.nombre}</Text>
                  <Text style={[s.tdSuave, { width: 110 }]}>{f.concepto || '—'}</Text>
                  <Text style={[s.td, { width: 70, color: f.estado === 'cumplido' ? COLOR.bien : f.estado === 'en_curso' ? COLOR.riesgo : COLOR.tinta3, fontWeight: 600 }]}>{f.estado === 'cumplido' ? 'Cumplido' : f.estado === 'en_curso' ? 'En curso' : 'Pendiente'}</Text>
                  <Text style={[s.td, { width: 44, textAlign: 'right' }]}>{f.real}%</Text>
                  <Text style={[s.tdSuave, { width: 60, textAlign: 'right' }]}>{fechaCorta(f.fecha)}</Text>
                  <Text style={[s.tdSuave, { width: 50, textAlign: 'right', paddingRight: 4 }]}>{horas(f.minutos)}</Text>
                </View>
              ))}
              {d.minutosPeriodo !== null && <Text style={[s.tdSuave, { marginTop: 4 }]}>Horas registradas en el proyecto durante el periodo: {horas(d.minutosPeriodo)}.</Text>}
            </View>
          )}
        </View>
      )}

      {sec.includes('equipo') && equipo.length > 0 && (
        <View>
          <Text style={s.h2}>Equipo y contactos</Text>
          <View style={s.enc}><Text style={[s.th, { width: 60, paddingLeft: 4 }]}>Tipo</Text><Text style={[s.th, { flexGrow: 1, flexBasis: 0 }]}>Nombre</Text><Text style={[s.th, { width: 110 }]}>Rol</Text><Text style={[s.th, { width: 140 }]}>Email</Text><Text style={[s.th, { width: 90, paddingRight: 4 }]}>Teléfono</Text></View>
          {equipo.map((c, i) => (
            <View key={i} style={s.fila} wrap={false}>
              <Text style={[s.tdSuave, { width: 60, paddingLeft: 4 }]}>{{ sponsor: 'Sponsor', cliente: 'Cliente', equipo: 'Equipo', otro: 'Otro' }[c.tipo]}</Text>
              <Text style={[s.td, { flexGrow: 1, flexBasis: 0 }]}>{c.nombre}{c.empresa ? ` · ${c.empresa}` : ''}</Text>
              <Text style={[s.tdSuave, { width: 110 }]}>{c.rol}</Text>
              <Text style={[s.tdSuave, { width: 140 }]}>{c.email}</Text>
              <Text style={[s.tdSuave, { width: 90, paddingRight: 4 }]}>{c.telefono}</Text>
            </View>
          ))}
        </View>
      )}

      {sec.includes('comentarios') && d.textos.comentarios ? (
        <View><Text style={s.h2}>Comentarios y acuerdos</Text><Text style={s.parrafo}>{d.textos.comentarios}</Text></View>
      ) : null}
    </Page>
  )
}

export async function pdfDeReportes(reportes: DatosDeReporte[], logos: Logos): Promise<Buffer> {
  registrar()
  const titulo = reportes.length === 1 ? `${reportes[0]!.titulo} · ${reportes[0]!.proyecto.nombre}` : `Reportes · ${reportes[0]?.proyecto.nombre ?? ''}`
  return await renderToBuffer(
    <Document title={titulo} author={reportes[0]?.ficha.sponsor || 'Zaelyn PMO'} creator="Zaelyn PMO by NE National Expertise" producer="Zaelyn PMO">
      {reportes.map((d, i) => <Reporte key={i} d={d} logos={logos} />)}
    </Document>,
  )
}
