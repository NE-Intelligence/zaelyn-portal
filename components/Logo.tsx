/**
 * La marca (#187), en sus dos únicas formas permitidas:
 *
 * - `LogoBarra`: el logotipo oficial —el wordmark con el ligado æ de
 *   filamentos—, recortado sin fondo desde el arte original. Es luz sobre
 *   negro y sobre blanco no sobrevive, así que SOLO vive en la barra
 *   superior, que es negra siempre, en día y en noche.
 * - `Logo`: en el resto del sitio el nombre se compone en tipografía,
 *   «z æ lyn» en MuseoModerno con el ligado en el degradado de marca, y toma
 *   el color de tinta del tema.
 *
 * Nunca el raster dentro de un recuadro negro sobre una página clara.
 */
export function LogoBarra({ ancho }: { ancho: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="logo-barra"
      src="/logo/zaelyn-logo-640.png"
      srcSet="/logo/zaelyn-logo-320.png 320w, /logo/zaelyn-logo-640.png 640w, /logo/zaelyn-logo-1200.png 1200w"
      sizes={`${ancho}px`}
      alt="zælyn"
      width={ancho}
      height={Math.round((ancho * 213) / 640)}
    />
  )
}

export function Logo({ ancho, clase = '' }: { ancho: number; clase?: string }) {
  return (
    <span className={`logo ${clase}`} style={{ ['--logo-ancho' as string]: `${ancho}px` }} role="img" aria-label="zælyn">
      <span className="logo-dia" aria-hidden="true">
        z<span className="ae">æ</span>lyn
      </span>
    </span>
  )
}
