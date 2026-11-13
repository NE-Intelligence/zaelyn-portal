/**
 * Arma los datos del Inicio de ejecución a partir de lo que el motor ya midió
 * (`/portal/agenda`, `/portal/persona`, `/portal/familia/<g>`, `/portal/grupos`,
 * `/portal/modulos`). Solo traduce y junta: no cuenta avances, no decide qué
 * venció (lo dice el motor) y no inventa prioridades.
 */
import type { Agenda, ItemAgenda, Modulo } from './agenda'
import type { EstadoDePersona } from './persona'
import type { EstadoDeFamilia } from './familia'
import { ambitoDe, type GrupoEnPortal } from './plan'
import type { Cosa, DatosEjecucion, Espacio } from '@/components/portal/Ejecucion'

const ESPACIO: Record<ItemAgenda['espacio']['tipo'], Espacio> = {
  personal: 'personal', familia: 'familia', proyecto: 'proyecto', grupo: 'grupo',
}

const hhmm = (h: string | null | undefined): string | null => {
  if (!h) return null
  const m = /^(\d{1,2}):(\d{2})/.exec(h)
  return m ? `${Number(m[1])}:${m[2]}` : h
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const fechaCorta = (iso: string) => {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number) as [number, number, number]
  return `${d} ${MESES[m - 1]}`
}

export function desdeAgenda(a: Agenda): Cosa[] {
  return a.items.map(i => ({
    clave: `${i.tipo}:${i.id}:${i.fecha}`,
    abrir: { tipo: i.tipo, id: i.id },
    tipo: i.tipo,
    titulo: i.titulo,
    dia: i.fecha.slice(0, 10),
    hora: hhmm(i.hora),
    espacio: ESPACIO[i.espacio.tipo],
    lugar: i.espacio.tipo === 'personal' ? 'Personal' : i.espacio.nombre,
    quien: i.quien,
    vencida: false,
    hecho: i.estatus === 'hecho',
    avance: i.tipo === 'pendiente' && typeof i.avance === 'number' ? i.avance : null,
    esEvento: (i.tipo === 'evento' || i.tipo === 'actividad') && !!i.hora,
  }))
}

export function desdePersona(p: EstadoDePersona, ya: Set<string>): Cosa[] {
  const out: Cosa[] = []
  // Lo vencido: el motor ya dice cuál; la agenda empieza hoy y no lo trae.
  for (const x of p.compromisos.pendientes) {
    if (!x.vencida || ya.has(`pendiente:${x.pendienteId}`)) continue
    out.push({
      clave: `pendiente:${x.pendienteId}`, abrir: { tipo: 'pendiente', id: x.pendienteId }, tipo: 'pendiente',
      titulo: x.texto, dia: x.vence?.slice(0, 10) ?? null, hora: null, espacio: 'proyecto',
      lugar: x.plan || x.grupo, quien: null, vencida: true, hecho: x.estatus === 'hecho',
      avance: x.avance, esEvento: false,
    })
  }
  // Lo de hoy que no está en la agenda: encargos de la casa y el calendario de fuera.
  for (const e of p.dias[0]?.entradas ?? []) {
    if (e.tipo === 'encargo') {
      out.push({
        clave: `encargo:${e.texto}:${e.hhmm ?? ''}`, abrir: null, tipo: 'actividad', titulo: e.texto, dia: p.hoy, hora: hhmm(e.hhmm),
        espacio: 'familia', lugar: e.grupo, quien: null, vencida: false, hecho: e.hecho, avance: null, esEvento: !!e.hhmm,
      })
    } else if (e.tipo === 'fuera') {
      out.push({
        clave: `fuera:${e.texto}:${e.inicio}`, abrir: null, tipo: 'evento', titulo: e.texto, dia: p.hoy, hora: e.diaCompleto ? null : hhmm(e.hhmm),
        espacio: 'personal', lugar: e.cuenta, quien: null, vencida: false, hecho: false, avance: null, esEvento: !e.diaCompleto,
      })
    }
  }
  return out
}

export function avisosDe(p: EstadoDePersona): string[] {
  const out: string[] = []
  for (const a of p.alertas) {
    if (a.tipo === 'choque') out.push(`A las ${hhmm(a.hhmm)} te chocan: ${a.cosas.join(' y ')}.`)
    else if (a.tipo === 'por_aprobar') out.push(`${a.cuantos} ${a.cuantos === 1 ? 'cosa espera' : 'cosas esperan'} tu visto bueno en ${a.grupo}.`)
    else if (a.tipo === 'agenda_parcial') out.push('Tu calendario de fuera no se pudo leer completo.')
  }
  return out.slice(0, 3)
}

export function casaDe(f: EstadoDeFamilia, href: string): DatosEjecucion['casa'][number] {
  const hoy = f.dias.find(x => x.fecha === f.hoy) ?? f.dias[0]
  return {
    familia: f.grupo.nombre,
    href,
    cosas: (hoy?.eventos ?? [])
      .filter(e => e.estado !== 'no_hay')
      .map(e => {
        const t = e.traslados.find(x => !x.hecho)
        return {
          hora: hhmm(e.inicio?.slice(11, 16) ?? e.inicio),
          texto: e.titulo,
          quien: e.de,
          traslado: t ? `${t.accion === 'llevar' ? 'Lleva' : 'Recoge'}: ${t.quien ?? 'nadie todavía'}` : e.estado === 'por_confirmar' ? 'Por confirmar' : null,
        }
      }),
  }
}

export function fechasDe(familias: EstadoDeFamilia[]): DatosEjecucion['fechas'] {
  return familias
    .flatMap(f => f.fechas)
    .filter(x => x.faltan >= 0 && x.faltan <= 30)
    .sort((a, b) => a.faltan - b.faltan)
    .map(x => ({ titulo: x.cumple ? `${x.titulo} · ${x.cumple} años` : x.titulo, cuando: fechaCorta(x.fecha), faltan: x.faltan }))
}

export function proyectosDe(grupos: GrupoEnPortal[]): DatosEjecucion['proyectos'] {
  return grupos
    .filter(g => ambitoDe(g) === 'proyecto')
    .flatMap(g => g.planes.map(p => ({ nombre: p.nombre, grupo: g.nombre, href: `/app/g/${g.id}/${p.id}`, abiertos: p.abiertos, vencidos: p.vencidos })))
    .sort((a, b) => b.vencidos - a.vencidos || b.abiertos - a.abiertos)
}

export const appsDe = (m: Modulo[]): DatosEjecucion['apps'] => m.map(x => ({ clave: x.clave, nombre: x.nombre, estado: x.estado }))

/** Los Grupos de trabajo (Profesional): solo nombre y liga; nunca el avance de los demás. */
export const gruposDe = (grupos: GrupoEnPortal[]): NonNullable<DatosEjecucion['grupos']> =>
  grupos.filter(g => ambitoDe(g) === 'equipo').map(g => ({ nombre: g.nombre, href: `/app/g/${g.id}` }))
