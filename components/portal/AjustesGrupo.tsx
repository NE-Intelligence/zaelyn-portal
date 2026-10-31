'use client'

/**
 * «Ajustes del grupo» (motor: decisiones/2026-10-31-administrar-grupos).
 *
 * Renombrar, sacar o desinvitar a alguien, borrar un plan u obra y archivar
 * el grupo. El portal no decide nada: muestra lo que el rol de cada quien
 * permite y manda la acción al motor, que vuelve a revisar el permiso.
 *
 * Lo que no se deshace se confirma aquí mismo, en dos pasos y con lo que se
 * pierde dicho en números (Ley III) — sin ventanas del navegador. Archivar
 * pide además escribir el nombre del grupo.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AjustesDeGrupo } from '@/lib/api'
import { escribir, decirError } from '@/components/editor/comun'

const ERRORES: Record<string, string> = {
  SIN_PERMISO: 'Tu rol en este grupo no alcanza para esto. Pídeselo a quien administra.',
  SOLO_EL_DUENO: 'Esto lo hace solo quien creó el grupo.',
  ES_EL_DUENO: 'A quien creó el grupo no lo puede sacar nadie.',
  ERES_TU: 'Para salirte tú, dile a Zaelyn «sácame de …».',
  NOMBRE_OCUPADO: 'Ya tienes otro grupo con ese nombre.',
  INVALIDO: 'El nombre va de 2 a 60 letras.',
  BARANDAL: 'Esa persona cuida a alguien en el grupo. Primero pon a otra persona a cargo.',
  NO_LO_ENCUENTRO: 'Ya no está: recarga la página.',
}

export function AjustesGrupo({ a }: { a: AjustesDeGrupo }) {
  const router = useRouter()
  const g = a.grupo.id
  const [nombre, setNombre] = useState(a.grupo.nombre)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [escrito, setEscrito] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState<{ bien: boolean; t: string } | null>(null)

  async function hacer(accion: 'grupo-renombrar' | 'grupo-sacar' | 'plan-borrar' | 'grupo-archivar', cuerpo: Record<string, unknown>, listo: string) {
    setOcupado(true); setAviso(null)
    const r = await escribir<Record<string, unknown>>(accion, { groupId: g, ...cuerpo })
    setOcupado(false); setConfirmando(null); setEscrito('')
    if (!r.ok) return setAviso({ bien: false, t: ERRORES[r.error] ?? decirError(r) })
    if (accion === 'grupo-archivar') { router.push('/app/proyectos?archivado=1'); return }
    setAviso({ bien: true, t: listo })
    router.refresh()
  }

  const Confirmar = ({ id, texto, boton, onSi }: { id: string; texto: string; boton: string; onSi: () => void }) => (
    confirmando === id ? (
      <div className="aj-confirma" role="alert">
        <p>{texto}</p>
        <div className="aj-acc">
          <button className="ed-btn peligro" disabled={ocupado} onClick={onSi}>{ocupado ? 'Un momento…' : boton}</button>
          <button className="ed-btn suave" disabled={ocupado} onClick={() => setConfirmando(null)}>Cancelar</button>
        </div>
      </div>
    ) : null
  )

  return (
    <div className="aj">
      {aviso && <div className={aviso.bien ? 'pu-aviso' : 'ed-error'}>{aviso.t}</div>}

      <section className="aj-seccion">
        <h2>Nombre</h2>
        {a.yo.administro ? (
          <form className="aj-fila" onSubmit={e => { e.preventDefault(); void hacer('grupo-renombrar', { nombre }, `Listo: ahora se llama «${nombre.trim()}».`) }}>
            <label className="aj-campo">
              <span>Nombre del grupo</span>
              <input value={nombre} maxLength={60} onChange={e => setNombre(e.target.value)} />
            </label>
            <button className="ed-btn primario" disabled={ocupado || nombre.trim().length < 2 || nombre.trim() === a.grupo.nombre}>Guardar</button>
          </form>
        ) : <p className="aj-nota">«{a.grupo.nombre}». Lo cambia quien administra el grupo.</p>}
      </section>

      <section className="aj-seccion">
        <h2>Personas</h2>
        <p className="aj-nota">
          {a.yo.administro
            ? 'Sacar a alguien le quita el acceso desde su siguiente mensaje y libera su lugar. Lo que tenía asignado se queda en el plan, sin responsable.'
            : 'Quien administra el grupo puede sacar o desinvitar a alguien.'}
          {a.invitaciones > 0 && ` Hay ${a.invitaciones} ${a.invitaciones === 1 ? 'invitación vigente' : 'invitaciones vigentes'}.`}
        </p>
        <ul className="aj-lista">
          {a.personas.map(p => {
            const puede = a.yo.administro && !p.esYo && !p.esDueno
            return (
              <li key={p.id}>
                <div className="aj-fila">
                  <div className="aj-quien">
                    <b>{p.nombre}{p.esYo ? ' (tú)' : ''}</b>
                    <span>{p.rol}{p.handle ? ` · @${p.handle}` : ''}{!p.conCuenta ? ' · sin cuenta todavía' : ''}{p.esDueno ? ' · creó el grupo' : ''}{p.abiertos ? ` · ${p.abiertos} abiertas` : ''}</span>
                  </div>
                  {puede && confirmando !== `p:${p.id}` && (
                    <button className="ed-btn suave" onClick={() => setConfirmando(`p:${p.id}`)}>{p.conCuenta ? 'Sacar' : 'Quitar y desinvitar'}</button>
                  )}
                </div>
                <Confirmar id={`p:${p.id}`} boton={p.conCuenta ? `Sí, sacar a ${p.nombre}` : `Sí, quitar a ${p.nombre}`}
                  texto={(p.conCuenta ? `${p.nombre} deja de ver «${a.grupo.nombre}» y libera su lugar.` : `Se quita a ${p.nombre} y su código de invitación deja de servir.`)
                    + (p.abiertos ? ` Sus ${p.abiertos} actividades abiertas se quedan sin responsable.` : '')}
                  onSi={() => void hacer('grupo-sacar', { personaId: p.id, confirmado: true }, `Listo: ${p.nombre} ya no está en el grupo.`)} />
              </li>
            )
          })}
        </ul>
      </section>

      <section className="aj-seccion">
        <h2>Planes y obras</h2>
        {a.planes.length === 0 ? <p className="aj-nota">Este grupo no tiene planes.</p> : (
          <ul className="aj-lista">
            {a.planes.map(p => (
              <li key={p.id}>
                <div className="aj-fila">
                  <div className="aj-quien">
                    <b>{p.nombre}</b>
                    <span>{p.tipo === 'obra' ? 'Obra' : 'Plan'} · {p.abiertos} {p.abiertos === 1 ? 'actividad abierta' : 'actividades abiertas'}</span>
                  </div>
                  {a.yo.dirijo && confirmando !== `pl:${p.id}` && (
                    <button className="ed-btn suave" onClick={() => setConfirmando(`pl:${p.id}`)}>Borrar</button>
                  )}
                </div>
                <Confirmar id={`pl:${p.id}`} boton="Sí, borrar"
                  texto={`Se borra «${p.nombre}»${p.abiertos ? ` y se cancelan sus ${p.abiertos} actividades abiertas` : ''}. No se deshace desde el portal.`}
                  onSi={() => void hacer('plan-borrar', { planId: p.id, confirmado: true }, `Listo: «${p.nombre}» quedó borrado.`)} />
              </li>
            ))}
          </ul>
        )}
        {!a.yo.dirijo && <p className="aj-nota">Borrar un plan lo hace quien dirige (Líder, PMO o Sponsor).</p>}
      </section>

      <section className="aj-seccion aj-peligro">
        <h2>Archivar el grupo</h2>
        {a.yo.soyDueno ? (
          <>
            <p className="aj-nota">Nadie lo vuelve a ver, no sale ningún aviso y los lugares que ocupaba se liberan. Lo puedes recuperar durante 30 días desde «Mis grupos» o diciéndole a Zaelyn «recupera el grupo {a.grupo.nombre}».</p>
            {confirmando !== 'archivar' ? (
              <button className="ed-btn peligro" onClick={() => setConfirmando('archivar')}>Archivar «{a.grupo.nombre}»</button>
            ) : (
              <div className="aj-confirma" role="alert">
                <p>Escribe el nombre del grupo para confirmar: <b>{a.grupo.nombre}</b></p>
                <input className="aj-input" value={escrito} onChange={e => setEscrito(e.target.value)} aria-label="Nombre del grupo" />
                <div className="aj-acc">
                  <button className="ed-btn peligro" disabled={ocupado || escrito.trim() !== a.grupo.nombre}
                    onClick={() => void hacer('grupo-archivar', { confirmado: true }, '')}>{ocupado ? 'Archivando…' : 'Sí, archivar'}</button>
                  <button className="ed-btn suave" disabled={ocupado} onClick={() => { setConfirmando(null); setEscrito('') }}>Cancelar</button>
                </div>
              </div>
            )}
          </>
        ) : <p className="aj-nota">Archivar el grupo lo hace solo quien lo creó.</p>}
      </section>
    </div>
  )
}
