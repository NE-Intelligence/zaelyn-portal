/**
 * `volver` como dirección de ESTE sitio, o la portada.
 *
 * La versión anterior revisaba el texto: que empezara con `/` y no con `//`.
 * Pero el analizador de URL tira los tabuladores y saltos de línea ANTES de
 * leer, así que `/<tab>/otro.com` pasaba la revisión y salía como
 * `//otro.com`: redirección abierta (auditoría, 25 oct). Ahora se arma la
 * dirección completa y se compara el ORIGEN ya resuelto, que es lo único que
 * importa — no hay truco de escritura que sobreviva a esa comparación.
 */
export function rutaPropia(volver: string, aqui: string): URL {
  const base = new URL(aqui)
  try {
    const u = new URL(volver, base)
    if (u.origin === base.origin && /^[\x20-\x7e]*$/.test(volver)) return u
  } catch { /* cae a la portada */ }
  return new URL('/', base)
}

/** La regla de `proxy.ts`, aparte para poder probarla sin Next. */
export function mismoOrigen(origin: string | null, fetchSite: string | null, propio: string): boolean {
  if (origin !== null) return origin === propio
  return fetchSite !== 'cross-site' && fetchSite !== 'same-site'
}

/**
 * La política de contenido (CSP) del sitio.
 *
 * Ref: auditoría del 25 oct 2026 (CSP, frame-ancestors)
 *
 *  - Scripts SOLO con el nonce de esta petición (`strict-dynamic` deja que
 *    esos scripts carguen los suyos). Un script inyectado no lo trae.
 *  - `connect-src 'self'`: el navegador SOLO habla con este sitio. Es la regla
 *    de diseño del portal —el token nunca sale del servidor de Next— puesta
 *    también como candado: un script inyectado no puede mandar nada afuera.
 *  - `frame-ancestors 'none'`: nadie mete el portal en un iframe para
 *    engañar un clic sobre «Aprobar horas» o «Liberar plan».
 *  - `base-uri` y `form-action` en `'self'`, `object-src 'none'`.
 *
 * Los ESTILOS sí llevan `'unsafe-inline'`, y es la concesión a entender: los
 * componentes usan `style={…}` de React, que el navegador trata como estilo
 * en línea y un nonce no cubre. Un estilo inyectado no ejecuta nada.
 */
export function politicaDeContenido(nonce: string, desarrollo: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${desarrollo ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ')
}
