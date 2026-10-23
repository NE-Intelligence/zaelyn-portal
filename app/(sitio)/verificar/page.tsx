import Campo from '@/components/sitio/Campo'
import { verificarHoras } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Verificar un reporte de horas', robots: { index: false } }

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const fecha = (f: string) => `${Number(f.slice(8, 10))} de ${MESES[Number(f.slice(5, 7)) - 1]} de ${f.slice(0, 4)}`
const h = (min: number) => (Math.round(min / 6) / 10).toLocaleString('es-MX')

/**
 * `/verificar?folio=…&huella=…` — ¿este PDF de horas es una aprobación real? (#192)
 *
 * Sin sesión: lo abre quien recibió el documento (nómina, el cliente que paga
 * la factura). Solo dice si el folio y la huella corresponden y qué ampara en
 * números; no enseña nombres ni actividades.
 */
export default async function Verificar({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const folio = typeof sp.folio === 'string' ? sp.folio.trim() : ''
  const huella = typeof sp.huella === 'string' ? sp.huella.trim() : ''
  const r = folio && huella ? await verificarHoras(folio, huella) : null
  return (
    <main>
      <section className="st-banda st-hero st-hero-chico">
        <Campo />
        <div className="st-caja">
          <p className="st-rotulo st-hero-etq">Zaelyn · Horas aprobadas</p>
          <h1><span>Verificar un</span> <em>reporte de horas</em></h1>
          <p className="st-bajada">Escribe el folio y la huella que vienen en el PDF o el Excel.</p>
        </div>
      </section>
      <section className="st-banda st-seccion st-seccion-pegada">
        <div className="st-caja" style={{ maxWidth: 720 }}>
          <form method="get" style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
            <label style={{ display: 'grid', gap: 4 }}>Folio
              <input name="folio" defaultValue={folio} placeholder="H-2026-00012" required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccd', font: 'inherit' }} />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>Huella SHA-256
              <input name="huella" defaultValue={huella} placeholder="64 caracteres" required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccd', font: 'inherit', fontFamily: 'monospace' }} />
            </label>
            <button className="st-btn st-btn-1" type="submit" style={{ justifySelf: 'start' }}>Verificar</button>
          </form>
          {folio && huella && r === null && <p>No pude consultar ahora. Vuelve a intentarlo en unos minutos.</p>}
          {r && !r.valido && (
            <div style={{ padding: 16, borderRadius: 12, background: '#ffe4e3', color: '#a8201a' }}>
              <b>No corresponde.</b> Ese folio y esa huella no son de una aprobación registrada en Zaelyn. Revisa que estén completos; si el documento fue alterado, la huella no coincide.
            </div>
          )}
          {r && r.valido && (
            <div style={{ padding: 16, borderRadius: 12, background: '#dcf4e8', color: '#0d6340' }}>
              <b>Válido.</b> El folio {r.folio} es una aprobación registrada en Zaelyn el {new Date(r.aprobadoEn).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Mexico_City' })} (hora del centro de México).
              Ampara del {fecha(r.desde)} al {fecha(r.hasta)}: {h(r.trabajoMin)} h de trabajo{r.disponibilidadMin ? ` y ${h(r.disponibilidadMin)} h de disponibilidad` : ''}.
              Si los totales de tu documento coinciden, no se ha modificado.
            </div>
          )}
          <p style={{ marginTop: 24, fontSize: 13, opacity: 0.75 }}>Es el registro de una aprobación hecha dentro de Zaelyn; no es una constancia de conservación NOM-151.</p>
        </div>
      </section>
    </main>
  )
}
