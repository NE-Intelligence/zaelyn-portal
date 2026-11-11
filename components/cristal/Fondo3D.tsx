'use client'

/**
 * La pieza 3D sutil del portal (decisiones/2026-11-11-cristal): un cuerpo de
 * vidrio iridiscente —tres esferas que se funden— flotando despacio detrás de
 * todo, con los colores de la paleta que la persona escogió.
 *
 * WebGL a mano, sin librerías (unos 4 KB): un sombreador que traza rayos
 * sobre la escena. Para que no estorbe:
 * - se dibuja a media resolución y a 30 cuadros por segundo como máximo;
 * - se detiene si la pestaña no está a la vista;
 * - con «reducir movimiento» pinta un solo cuadro quieto;
 * - sin WebGL, o si falla, no aparece y queda el fondo pastel;
 * - se apaga desde Apariencia (html[data-fondo3d='no']).
 */
import { useEffect, useRef } from 'react'

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform float noche;
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float esc(vec3 q){
  vec3 a=vec3(sin(t*.31)*.55,cos(t*.27)*.35,0.);
  vec3 b=vec3(cos(t*.23)*.6,sin(t*.35)*.4,sin(t*.19)*.3);
  vec3 c=vec3(sin(t*.17+2.)*.45,sin(t*.29+1.)*.5,cos(t*.21)*.35);
  float d=length(q-a)-.62;
  d=smin(d,length(q-b)-.48,.55);
  d=smin(d,length(q-c)-.42,.55);
  return d;
}
vec3 nor(vec3 q){vec2 e=vec2(.002,0.);return normalize(vec3(esc(q+e.xyy)-esc(q-e.xyy),esc(q+e.yxy)-esc(q-e.yxy),esc(q+e.yyx)-esc(q-e.yyx)));}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;
  bool vert=r.x<r.y;uv-=vec2(.5*r.x/r.y-(vert?.1:.24),vert?.36:.27);
  vec3 ro=vec3(0.,0.,vert?10.:6.2);vec3 rd=normalize(vec3(uv,-1.6));
  float d=0.;float h;bool hit=false;float mn=9.;
  for(int i=0;i<64;i++){h=esc(ro+rd*d);mn=min(mn,h);if(h<.002){hit=true;break;}d+=h;if(d>11.)break;}
  if(!hit){float g=exp(-mn*9.)*.32*(noche>.5?.6:1.);vec3 gc=mix(c1,c3,.5);gl_FragColor=vec4(gc*g,g);return;}
  vec3 q=ro+rd*d;vec3 n=nor(q);
  float fr=pow(1.-max(dot(n,-rd),0.),2.4);
  float ir=.5+.5*sin(n.y*3.+n.x*2.+t*.4);
  vec3 col=mix(c1,c2,ir);
  col=mix(col,c3,smoothstep(.1,.9,n.x*.5+.5)*.55);
  vec3 L=normalize(vec3(-.5,.8,.6));
  float sp=pow(max(dot(reflect(-L,n),-rd),0.),48.);
  col+=fr*.55+sp*.9;
  
  float a=clamp(.42+fr*.5+sp*.4,0.,1.)*(noche>.5?.26:.8);
  gl_FragColor=vec4(col*a,a);
}`

function rgb(css: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(css.trim())
  if (!m) return [0.8, 0.75, 1]
  const n = parseInt(m[1]!, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function Fondo3D() {
  const lienzo = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = lienzo.current
    if (!cv) return
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' })
    if (!gl) return

    const sombreador = (tipo: number, src: string) => {
      const s = gl.createShader(tipo)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const v = sombreador(gl.VERTEX_SHADER, VERT)
    const f = sombreador(gl.FRAGMENT_SHADER, FRAG)
    if (!v || !f) return
    const pr = gl.createProgram()!
    gl.attachShader(pr, v)
    gl.attachShader(pr, f)
    gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return
    gl.useProgram(pr)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(pr, n)
    const uR = U('r'), uT = U('t'), u1 = U('c1'), u2 = U('c2'), u3 = U('c3'), uN = U('noche')

    const colores = () => {
      const cs = getComputedStyle(document.documentElement)
      gl.uniform3fv(u1, rgb(cs.getPropertyValue('--cr-3d-1')))
      gl.uniform3fv(u2, rgb(cs.getPropertyValue('--cr-3d-2')))
      gl.uniform3fv(u3, rgb(cs.getPropertyValue('--cr-3d-3')))
      const tema = document.documentElement.dataset.tema
      const noche = tema === 'oscuro' || (tema !== 'claro' && matchMedia('(prefers-color-scheme: dark)').matches)
      gl.uniform1f(uN, noche ? 1 : 0)
    }
    const medida = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75
      cv.width = Math.round(window.innerWidth * k)
      cv.height = Math.round(window.innerHeight * k)
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(uR, cv.width, cv.height)
    }
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
    let id = 0
    let ultimo = 0
    const t0 = performance.now() - 40_000
    const pintar = (ahora: number) => {
      id = requestAnimationFrame(pintar)
      if (ahora - ultimo < 33 || document.hidden || document.documentElement.dataset.fondo3d === 'no') return
      ultimo = ahora
      gl.uniform1f(uT, (ahora - t0) / 1000)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    medida()
    colores()
    if (quieto) {
      gl.uniform1f(uT, 42)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    } else {
      id = requestAnimationFrame(pintar)
    }
    cv.classList.add('listo')

    const obs = new MutationObserver(() => {
      colores()
      if (quieto) gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-paleta', 'data-tema'] })
    const mq = matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', colores)
    window.addEventListener('resize', medida)
    return () => {
      cancelAnimationFrame(id)
      obs.disconnect()
      mq.removeEventListener('change', colores)
      window.removeEventListener('resize', medida)
    }
  }, [])

  return <canvas ref={lienzo} className="cr-3d" aria-hidden="true" />
}
