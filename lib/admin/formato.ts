/** Formatos del tablero de administración (#186). Sin cuentas: solo forma. */
export const dinero = (centavos: number, moneda: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda.toUpperCase(), minimumFractionDigits: 2 }).format(centavos / 100)

export const usd = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: n < 1 ? 4 : 2 }).format(n)

export const entero = (n: number) => new Intl.NumberFormat('es-MX').format(n)

export const dia = (iso: string) => {
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Mexico_City' })
}

export const mes = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, (m || 1) - 1, 15).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
}

const PAISES: Record<string, string> = {
  MX: 'México', US: 'Estados Unidos', BR: 'Brasil', ES: 'España', CO: 'Colombia', AR: 'Argentina',
  CL: 'Chile', PE: 'Perú', CA: 'Canadá', ZZ: 'Sin dato',
}
export const pais = (c: string) => PAISES[c] ?? c

const PLANES: Record<string, string> = { free: 'Kickoff', prueba: 'Prueba', base: 'Sprint', family: 'Tribu', pro: 'PMO' }
export const plan = (c: string | null) => (c ? PLANES[c] ?? c : '—')

const COMPLEMENTOS: Record<string, string> = {
  lider: 'Líder', ejecutores: 'Bloque de 3 Ejecutores', proyecto: 'Proyecto activo', creditos: '15 créditos de IA',
  avisos: '100 avisos de WhatsApp', informado: 'Stakeholder / Monitor', tribu: 'Tribu (paquete)',
}
export const complemento = (c: string) => COMPLEMENTOS[c] ?? c
