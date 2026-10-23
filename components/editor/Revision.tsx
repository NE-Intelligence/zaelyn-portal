'use client'
/**
 * La revisión antes de liberar (Zaelyn #188).
 *
 * Las reglas viven en el motor (`editor-revision.ts`) y aquí se piden con el
 * documento tal como está en pantalla: una sola definición de qué está mal,
 * con pruebas, y no dos que se desincronicen. Lo que este panel sí hace es
 * APLICAR el arreglo que el motor propone, y solo cuando la persona lo pide:
 * una fecha «rara» puede ser la correcta para quien la escribió.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Doc, Hallazgo, LecturaExcel, NivelHallazgo, Revision as RevisionT } from '@/lib/editor/tipos'
import { decirError, escribir } from './comun'

const NIVEL: Record<NivelHallazgo, string> = { error: 'Errores', aviso: 'Avisos', info: 'Para que lo sepas' }

export function Revision({
  doc, groupId, lectura, puede, onAplicar, onIr, onRevisado,
}: {
  doc: Doc
  groupId: string | null
  lectura: LecturaExcel | null
  puede: boolean
  /** Aplica uno o varios arreglos en un solo paso (se deshace junto). */
  onAplicar: (arreglos: Array<{ nodo: string; cambios: { inicio?: string; dias?: number } }>) => void
  onIr: (nodo: string) => void
  onRevisado?: (r: RevisionT) => void
}) {
  const [rev, setRev] = useState<RevisionT | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [verInfo, setVerInfo] = useState(false)
  const [verLectura, setVerLectura] = useState(true)
  const turno = useRef(0)

  // Se vuelve a pedir cuando el documento cambia, con un respiro: arrastrar
  // una barra produce decenas de documentos por segundo.
  useEffect(() => {
    const t = setTimeout(async () => {
      const mio = ++turno.current
      setCargando(true)
      const r = await escribir<RevisionT>('revisar', { doc, groupId })
      if (mio !== turno.current) return
      setCargando(false)
      if (!r.ok) { setError(decirError(r)); return }
      setError('')
      setRev(r.dato)
      onRevisado?.(r.dato)
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, groupId])

  const porNivel = useMemo(() => {
    const m: Record<NivelHallazgo, Hallazgo[]> = { error: [], aviso: [], info: [] }
    for (const h of rev?.hallazgos ?? []) m[h.nivel].push(h)
    return m
  }, [rev])
  const conArreglo = (rev?.hallazgos ?? []).filter(h => h.arreglo && h.nodo)
  // En bloque solo van las FECHAS (pasar al siguiente día hábil, respetar una
  // dependencia). Alargar una duración mueve todo lo que sigue y puede correr
  // el go-live semanas: eso se decide una por una.
  const deFecha = conArreglo.filter(h => h.arreglo!.cambios.inicio && h.arreglo!.cambios.dias === undefined)

  const todo = () => {
    // Un nodo, un arreglo: si trae dos (fin de semana y festivo, digamos),
    // gana el primero y la siguiente revisión dirá si queda algo.
    const vistos = new Set<string>()
    const lista = deFecha.filter(h => !vistos.has(h.nodo!) && vistos.add(h.nodo!))
      .map(h => ({ nodo: h.nodo!, cambios: h.arreglo!.cambios }))
    onAplicar(lista)
  }

  return (
    <div className="ed-revision">
      <div className="ed-rev-cab">
        <b>Revisión antes de liberar</b>
        <span className="ed-rev-estado">{cargando ? 'Revisando…' : 'En vivo'}</span>
      </div>

      {lectura && verLectura && (
        <div className="ed-rev-lectura">
          <div className="fila">
            <b>Lo que leí del archivo</b>
            <button className="ed-btn texto" onClick={() => setVerLectura(false)}>Ocultar</button>
          </div>
          <p>
            Hoja «{lectura.hoja}», encabezados en la fila {lectura.filaEncabezado}: {lectura.renglones} renglones →{' '}
            {lectura.fases ? `${lectura.fases} fase${lectura.fases === 1 ? '' : 's'} o grupo${lectura.fases === 1 ? '' : 's'}, ` : ''}
            {lectura.actividades} actividad{lectura.actividades === 1 ? '' : 'es'}{lectura.hitos ? ` y ${lectura.hitos} hito${lectura.hitos === 1 ? '' : 's'}` : ''}.
          </p>
          <p className="ed-rev-chips">
            {lectura.columnas.map(c => <span key={c.campo} className="ed-chip" title={`Columna «${c.titulo}»`}>{c.campo}: {c.titulo}</span>)}
          </p>
          {lectura.estructura === 'esquema' && <p>Las claves eran un esquema (1, 1.1, 1.1.2): los renglones con hijos quedaron como fases y grupos.</p>}
          {lectura.estructura === 'fase' && <p>La columna de fase agrupó las actividades.</p>}
          {lectura.calendario === 'naturales' && <p>Muchas fechas caen en fin de semana: dejé el calendario en días naturales. Si tu proyecto es de lunes a viernes, activa «Solo días hábiles».</p>}
          {!lectura.fechasSeguras && <p className="aviso">Las fechas podían leerse como día/mes o mes/día; las leí como {lectura.diaPrimero ? 'día/mes' : 'mes/día'}. Revisa una para confirmar.</p>}
          {lectura.dependenciasPerdidas > 0 && <p className="aviso">{lectura.dependenciasPerdidas} dependencia{lectura.dependenciasPerdidas === 1 ? '' : 's'} no se pasaron: apuntaban a un renglón que no existe, a un renglón de resumen o cerraban un ciclo.</p>}
          {lectura.ajenas.length > 0 && <p className="gris">Columnas que no usé: {lectura.ajenas.join(', ')}.</p>}
          {lectura.problemas.length > 0 && (
            <details><summary>{lectura.problemas.length} renglón{lectura.problemas.length === 1 ? '' : 'es'} con problemas de lectura</summary>
              <ul>{lectura.problemas.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </details>
          )}
        </div>
      )}

      {error && <div className="ed-error">{error}</div>}

      {rev && (
        <>
          <div className="ed-rev-cuenta">
            <span className={rev.errores ? 'n error' : 'n'}><b className="mono">{rev.errores}</b> error{rev.errores === 1 ? '' : 'es'}</span>
            <span className={rev.avisos ? 'n aviso' : 'n'}><b className="mono">{rev.avisos}</b> aviso{rev.avisos === 1 ? '' : 's'}</span>
            <span className="n"><b className="mono">{rev.info}</b> nota{rev.info === 1 ? '' : 's'}</span>
          </div>
          {puede && deFecha.length > 1 && (
            <button className="ed-btn primario ancho" onClick={todo}>Corregir todas las fechas ({deFecha.length})</button>
          )}
          {rev.errores + rev.avisos === 0 && (
            <div className="ed-rev-limpio">Nada que corregir. Las fechas caen en días hábiles, las dependencias se respetan y los totales cuadran.</div>
          )}
          {(['error', 'aviso', 'info'] as const).map(nv => {
            const l = porNivel[nv]
            if (!l.length) return null
            if (nv === 'info' && !verInfo) {
              return <button key={nv} className="ed-btn texto" onClick={() => setVerInfo(true)}>Ver {l.length} nota{l.length === 1 ? '' : 's'}</button>
            }
            return (
              <section key={nv} className={`ed-rev-grupo n-${nv}`}>
                <h4>{NIVEL[nv]} <span className="mono">{l.length}</span></h4>
                <ul>
                  {l.map((h, i) => (
                    <li key={`${h.codigo}-${h.nodo ?? ''}-${i}`}>
                      {(h.titulo || h.fila) && (
                        <button className="ed-rev-nodo" disabled={!h.nodo} onClick={() => h.nodo && onIr(h.nodo)}>
                          {h.fila ? <span className="mono">fila {h.fila}</span> : null}
                          {h.titulo && <b>{h.titulo}</b>}
                        </button>
                      )}
                      <p>{h.dice}</p>
                      {h.arreglo && h.nodo && puede && (
                        <button className="ed-btn suave chico" onClick={() => onAplicar([{ nodo: h.nodo!, cambios: h.arreglo!.cambios }])}>{h.arreglo.etiqueta}</button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
