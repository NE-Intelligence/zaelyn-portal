/**
 * Espejo LITERAL de `GET /portal/agenda` y `GET /portal/modulos` del motor
 * (specs/zaelyn-app-cobertura-core.md, 9–10 nov 2026). Son las mismas
 * lecturas que usa la app: el Inicio del portal y la agenda de la app ven
 * exactamente la misma lista, ya medida y ordenada por el motor.
 */

export type EspacioAgenda = { tipo: 'personal' | 'proyecto' | 'familia' | 'grupo'; grupoId: string | null; nombre: string }

export type ItemAgenda = {
  id: string
  tipo: 'recordatorio' | 'evento' | 'pendiente' | 'actividad'
  titulo: string
  fecha: string
  hora: string | null
  fin: string | null
  inicio: string | null
  espacio: EspacioAgenda
  quien: string | null
  cadaAno?: boolean
  estatus?: string
  avance?: number
  hito?: boolean
}

export type Agenda = { desde: string; hasta: string; tz: string; items: ItemAgenda[]; truncado: boolean }

export type Modulo = {
  clave: string
  nombre: string
  descripcion: string
  gratis: boolean
  estado: 'encendido' | 'apagado' | 'pronto'
  encender: { frase: string; boton: string } | null
  apagar: { frase: string; boton: string } | null
}
