/**
 * El logotipo según el tema (#186).
 *
 * El wordmark raster es luz sobre negro y sobre blanco desaparece, así que en
 * modo día se compone en tipografía: «z æ lyn» en MuseoModerno con el ligado
 * æ en el degradado de marca. Los dos se pintan y el CSS decide cuál se ve,
 * para que no dependa de JavaScript ni destelle al cargar.
 *
 * Sigue faltando el vector del logotipo: cuando exista, este componente es
 * el único lugar que cambia.
 */
export function Logo({ ancho, src = '/logo/zaelyn-wordmark-320.png', clase = '' }: { ancho: number; src?: string; clase?: string }) {
  return (
    <span className={`logo ${clase}`} style={{ ['--logo-ancho' as string]: `${ancho}px` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-noche" src={src} alt="zælyn" width={src.includes('1200') ? 1200 : 320} height={src.includes('1200') ? 413 : 110} />
      <span className="logo-dia" aria-hidden="true">
        z<span className="ae">æ</span>lyn
      </span>
    </span>
  )
}
