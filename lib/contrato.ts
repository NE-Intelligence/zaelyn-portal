/**
 * El contrato portal–motor, comprobado en ejecución.
 *
 * Ref: auditoría del 25 oct 2026 (motor, docs/BACKLOG.md «Primero»)
 *
 * `lib/plan.ts` es un espejo de los tipos del motor y TypeScript solo lo
 * comprueba contra sí mismo: el 22 de octubre el motor agregó campos y el
 * portal se cayó en diez lugares con errores que no decían por qué. Aquí se
 * revisa lo que de verdad llegó, campo por campo, ANTES de pintar nada. Si
 * algo falta, la pantalla dice «no está disponible» y el registro dice
 * exactamente qué campo — en vez de un `undefined is not an object` en el
 * renglón 3 000 de un componente.
 *
 * No es un validador de esquema completo a propósito: solo lo que las vistas
 * usan sin preguntar. Lo opcional del tipo (`grupos`, `apoyos`…) no se exige.
 */
import type { VistaDePlan } from './plan'

type Tipo = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'string|null' | 'number|null' | 'object|null'

const tipoDe = (v: unknown): string =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v

function revisar(o: unknown, campos: Record<string, Tipo>, donde: string, faltas: string[]): void {
  if (!o || typeof o !== 'object') { faltas.push(`${donde}: no es objeto`); return }
  const r = o as Record<string, unknown>
  for (const [k, t] of Object.entries(campos)) {
    const real = tipoDe(r[k])
    if (!t.split('|').includes(real)) faltas.push(`${donde}.${k}: se esperaba ${t}, llegó ${real}`)
  }
}

const RENGLON: Record<string, Tipo> = {
  id: 'string', texto: 'string', estatus: 'string', abierto: 'boolean', planId: 'string',
  prioridad: 'number', inicia: 'string|null', vence: 'string|null', antecesores: 'array',
  hito: 'boolean', holgura: 'number|null', manda: 'boolean', avance: 'number',
  esperado: 'number|null', senales: 'array', confianza: 'string', criticidad: 'string',
  gravedad: 'number', notas: 'number',
}

/** Devuelve la lista de lo que no cuadra. Vacía = el contrato se cumple. */
export function faltasDePlan(v: unknown): string[] {
  const faltas: string[] = []
  revisar(v, {
    estado: 'object', ruta: 'object', curva: 'object', fases: 'array', narrativa: 'object',
    bitacora: 'array', riesgo: 'array', rol: 'string|null', nivel: 'number',
  }, 'vista', faltas)
  if (faltas.length) return faltas
  const x = v as VistaDePlan
  revisar(x.estado, {
    grupo: 'object', plan: 'object|null', planes: 'array', hoy: 'string', punto: 'object',
    veredicto: 'string', renglones: 'array', personas: 'array', falta: 'object',
  }, 'estado', faltas)
  if (Array.isArray(x.estado?.renglones)) {
    // Basta con los primeros: el motor los arma todos con la misma función.
    x.estado.renglones.slice(0, 5).forEach((r, i) => revisar(r, RENGLON, `renglones[${i}]`, faltas))
  }
  return faltas
}
