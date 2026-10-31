import { descargarHoras } from '@/lib/api'

/** `GET /app/obra/plantilla` — la plantilla de Excel para cargar una obra. */
export async function GET() {
  return descargarHoras({ tipo: 'obra-plantilla' })
}
