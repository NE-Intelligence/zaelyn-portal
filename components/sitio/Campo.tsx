/**
 * El fondo del hero. Era un lienzo animado de filamentos que dibujaba miles de
 * líneas por cuadro y costaba ~1.9 s de bloqueo en un teléfono. Desde el
 * rediseño (decisiones/2026-11-10-rediseno-del-portal) es el orbe de Zaelyn,
 * en CSS puro: la misma marca de la app, sin JavaScript.
 */
export default function Campo() {
  return <div className="st-orbe-hero" aria-hidden="true" />
}
