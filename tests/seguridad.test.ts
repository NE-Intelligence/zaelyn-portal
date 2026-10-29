/**
 * Las dos reglas de la fase 0 que caben en una función pura.
 * Corre con `npm test` (node --test, sin dependencias).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mismoOrigen, rutaPropia } from '../lib/ruta-propia.ts'

const AQUI = 'https://zaelyn.ai/idioma'

test('volver: rutas propias pasan', () => {
  assert.equal(rutaPropia('/app/g/x', AQUI).href, 'https://zaelyn.ai/app/g/x')
  assert.equal(rutaPropia('/?a=1', AQUI).href, 'https://zaelyn.ai/?a=1')
})

test('volver: todo truco para salir del sitio cae en la portada', () => {
  for (const malo of ['//otro.com', '/\t/otro.com', '/\n/otro.com', 'https://otro.com', '/\\otro.com', '\\\\otro.com', 'javascript:alert(1)', ' //otro.com']) {
    assert.equal(rutaPropia(malo, AQUI).href, 'https://zaelyn.ai/', `dejó pasar ${JSON.stringify(malo)}`)
  }
})

test('origen: el mismo sitio pasa; otro sitio, null o cross-site no', () => {
  const P = 'https://zaelyn.ai'
  assert.equal(mismoOrigen(P, 'same-origin', P), true)
  assert.equal(mismoOrigen('https://malo.com', 'cross-site', P), false)
  assert.equal(mismoOrigen('null', null, P), false)
  assert.equal(mismoOrigen('https://www.zaelyn.ai', 'same-site', P), false)
  assert.equal(mismoOrigen(null, 'cross-site', P), false)
  assert.equal(mismoOrigen(null, 'same-origin', P), true)
  // Sin navegador de por medio (curl): no hay cookie ajena que robar.
  assert.equal(mismoOrigen(null, null, P), true)
})

import { faltasDePlan } from '../lib/contrato.ts'

test('contrato: lo roto se nombra campo por campo', () => {
  assert.deepEqual(faltasDePlan(null), ['vista: no es objeto'])
  const casi = { estado: {}, ruta: {}, curva: {}, fases: [], narrativa: {}, bitacora: [], riesgo: [], rol: null, nivel: 1 }
  const f = faltasDePlan(casi)
  assert.ok(f.includes('estado.renglones: se esperaba array, llegó undefined'))
})
