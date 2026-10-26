'use client'
/**
 * El árbol de avance: proyecto → fase → grupo → subgrupo → actividad (#201).
 *
 * Cada nivel se abre y se cierra; las guías verticales dicen a qué grupo
 * pertenece cada renglón, y cada nivel lleva el avance acumulado de lo que
 * cuelga de él. Los números vienen medidos: aquí solo se dibuja.
 */
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { RITMO_NOMBRE, ritmoDe, type FilaDeArbol } from '@/lib/arbol'

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const corta = (iso: string | null) => {
  if (!iso) return ''
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MES[(m ?? 1) - 1]}`
}

export function ArbolDeAvance({ filas, hoy, base }: { filas: FilaDeArbol[]; hoy: string; base: string }) {
  // Abiertos al empezar: el proyecto y las fases, así que se ven las fases y
  // sus entregables cerrados. Cada nivel se abre hacia abajo.
  const inicial = useMemo(() => new Set(filas.filter(f => f.tipo === 'proyecto' || f.tipo === 'fase').map(f => f.k)), [filas])
  const [abiertos, setAbiertos] = useState<Set<string>>(inicial)
  const conHijos = useMemo(() => new Set(filas.flatMap(f => f.padres.slice(-1))), [filas])

  const visibles = filas.filter(f => f.padres.every(p => abiertos.has(p)))
  const alternar = (k: string) => setAbiertos(a => {
    const n = new Set(a)
    if (n.has(k)) n.delete(k); else n.add(k)
    return n
  })
  // Para las guías: si después de este renglón todavía viene un hermano en
  // cada nivel, la línea de ese nivel sigue bajando.
  const sigue = (i: number, nivel: number): boolean => {
    for (let j = i + 1; j < visibles.length; j++) {
      if (visibles[j]!.nivel < nivel) return false
      if (visibles[j]!.nivel === nivel) return true
    }
    return false
  }

  return (
    <div className="pt-arbol">
      <div className="pt-arbol-acciones">
        <button type="button" className="ed-btn suave chico" onClick={() => setAbiertos(new Set(filas.map(f => f.k)))}>Abrir todo</button>
        <button type="button" className="ed-btn suave chico" onClick={() => setAbiertos(inicial)}>Solo fases y entregables</button>
        <span className="leyenda">
          {(['hecho', 'bien', 'riesgo', 'atrasado'] as const).map(r => (
            <span key={r}><i className={`rt-${r}`} />{RITMO_NOMBRE[r]}</span>
          ))}
        </span>
      </div>
      {visibles.map((f, i) => {
        const ritmo = ritmoDe(f, hoy)
        const abre = conHijos.has(f.k)
        const resumen = f.tipo === 'proyecto' || f.tipo === 'fase' || f.tipo === 'grupo'
        const nombre = <span className="nom">{f.clave && <span className="clave">{f.clave}</span>}{f.nombre}</span>
        return (
          <div key={f.k} className={`pt-arbol-fila t-${f.tipo}`}>
            <div className="izq">
              {/* las guías: una por nivel de ancestro */}
              {Array.from({ length: f.nivel }, (_, n) => (
                <span key={n} className={`guia${n === f.nivel - 1 ? (sigue(i, f.nivel) ? ' rama' : ' ultima') : (sigue(i, n + 1) ? ' linea' : '')}`} />
              ))}
              {abre
                ? <button type="button" className="abre" aria-expanded={abiertos.has(f.k)} aria-label={abiertos.has(f.k) ? 'Cerrar' : 'Abrir'}
                    onClick={() => alternar(f.k)}>{abiertos.has(f.k) ? '▾' : '▸'}</button>
                : <span className="abre vacio">{f.tipo === 'hito' ? '◆' : '•'}</span>}
              <div className="txt">
                <div className="linea1">
                  {f.tramo ? <Link href={`${base}?v=tablero&en=${encodeURIComponent(JSON.stringify(f.tramo))}`}>{nombre}</Link> : nombre}
                  {f.tipo === 'hito' && <span className="pt-bandera">Hito</span>}
                  {f.soporte && <span className="pt-bandera">Soporte</span>}
                  {f.manda && <span className="pt-bandera">Sin margen</span>}
                </div>
                {!resumen && (f.quien || f.espera) && (
                  <div className="linea2">
                    {f.quien ? f.quien : 'Sin responsable'}
                    {f.apoyos.length > 0 && ` · apoyo: ${f.apoyos.join(', ')}`}
                    {f.espera && <span className="espera"> · espera «{f.espera}»</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="der">
              <span className="fechas">{f.inicia || f.vence ? `${corta(f.inicia)}${f.inicia && f.vence && f.inicia !== f.vence ? ' → ' : ''}${f.vence && f.vence !== f.inicia ? corta(f.vence) : ''}` : ''}</span>
              <span className={`barra rt-${ritmo}`} title={`${RITMO_NOMBRE[ritmo]}: ${f.real}%${f.esperado !== null ? ` · tocaba ${f.esperado}%` : ''}`}>
                <i style={{ width: `${Math.max(0, Math.min(100, f.real))}%` }} />
                {f.esperado !== null && <b style={{ left: `${Math.max(0, Math.min(100, f.esperado))}%` }} />}
              </span>
              <span className={`pct rt-${ritmo}`}>{f.real}%</span>
              <span className="esp">{f.esperado !== null ? `esp ${f.esperado}%` : ''}</span>
              <span className="cuenta">{resumen ? `${f.cerradas}/${f.total}` : ''}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
