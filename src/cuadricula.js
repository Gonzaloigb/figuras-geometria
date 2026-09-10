/**
 * cuadricula.js — el lienzo donde Marina DIBUJA arrastrando.
 *
 * Replica el ejercicio 4 de la p.30: "Dibuja rectangulos en la cuadricula
 * segun las medidas de los lados que se indican", con la cuadricula marcada
 * 1 cm x 1 cm.
 *
 * Por que arrastrar y no elegir entre figuras ya dibujadas: el verbo del
 * temario es CONSTRUIR. Contar cuadraditos mientras se dibuja es justo la
 * habilidad que se evalua.
 *
 * Dos detalles que no son obvios:
 *
 *  1. Se usan eventos POINTER, no mouse ni touch. Un solo juego de eventos
 *     cubre dedo, lapiz y mouse. Con mouse+touch por separado, en tablet los
 *     eventos se duplican y el trazo salta.
 *
 *  2. El lienzo lleva `touch-action: none` (en el CSS). Sin eso, arrastrar el
 *     dedo hace scroll de la pagina y es IMPOSIBLE dibujar en tablet o celular.
 */

import { el } from './util.js';

/**
 * Crea una cuadricula interactiva.
 *
 * @param {object} cfg
 *  - cols, filas: tamano de la rejilla, en centimetros
 *  - onDibujar(r): al soltar, con {x, y, ancho, alto} en centimetros
 * @returns {object} { nodo, limpiar, bloquear, pintarSolucion }
 */
export function crearCuadricula({ cols = 12, filas = 7, onDibujar } = {}) {
  // Lado de la celda en unidades del SVG. El viewBox se calcula a partir de esto,
  // asi que cambiar este numero reescala todo sin romper nada.
  const C = 40;
  const ancho = cols * C;
  const alto = filas * C;

  const marco = el('div', 'marco-cuadricula');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  svg.setAttribute('class', 'cuadricula');
  svg.setAttribute('width', String(ancho));
  svg.setAttribute('height', String(alto));
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  /* --- La rejilla --- */
  let lineas = '';
  for (let i = 0; i <= cols; i++) {
    lineas += `<line x1="${i * C}" y1="0" x2="${i * C}" y2="${alto}"
                     stroke="var(--linea-cuad-fuerte)" stroke-width="1.5"/>`;
  }
  for (let j = 0; j <= filas; j++) {
    lineas += `<line x1="0" y1="${j * C}" x2="${ancho}" y2="${j * C}"
                     stroke="var(--linea-cuad-fuerte)" stroke-width="1.5"/>`;
  }
  svg.innerHTML = `<g class="rejilla">${lineas}</g>
                   <g class="dibujo"></g>
                   <g class="solucion"></g>`;

  const capaDibujo = svg.querySelector('.dibujo');
  const capaSolucion = svg.querySelector('.solucion');

  marco.append(svg);

  /* --- Estado del arrastre --- */
  let inicio = null;
  let bloqueado = false;
  let ultimo = null; // el rectangulo terminado

  /** Convierte la posicion del puntero a coordenadas de celda. */
  function celdaDe(evento) {
    const caja = svg.getBoundingClientRect();
    // Regla de tres desde pixeles de pantalla a unidades del viewBox.
    const x = ((evento.clientX - caja.left) / caja.width) * ancho;
    const y = ((evento.clientY - caja.top) / caja.height) * alto;
    return {
      cx: Math.max(0, Math.min(cols, Math.round(x / C))),
      cy: Math.max(0, Math.min(filas, Math.round(y / C))),
    };
  }

  /** Dibuja el rectangulo en curso. */
  function pintar(a, b, terminado) {
    const x = Math.min(a.cx, b.cx);
    const y = Math.min(a.cy, b.cy);
    const w = Math.abs(b.cx - a.cx);
    const h = Math.abs(b.cy - a.cy);

    capaDibujo.innerHTML = '';
    if (!w && !h) return { x, y, ancho: w, alto: h };

    capaDibujo.innerHTML = `
      <rect x="${x * C}" y="${y * C}" width="${w * C}" height="${h * C}"
            fill="var(--azul)" fill-opacity="${terminado ? '.24' : '.16'}"
            stroke="var(--azul)" stroke-width="4" stroke-linejoin="round"/>`;

    // La medida se muestra mientras se arrastra: cuenta los cuadraditos por ella
    // solo DESPUES de soltar, para que primero cuente sola.
    if (terminado && w && h) {
      capaDibujo.innerHTML += `
        <text x="${(x + w / 2) * C}" y="${y * C - 8}" text-anchor="middle"
              font-size="20" font-weight="800" fill="var(--azul)">${w} cm</text>
        <text x="${(x + w) * C + 10}" y="${(y + h / 2) * C + 6}"
              font-size="20" font-weight="800" fill="var(--azul)">${h} cm</text>`;
    }

    return { x, y, ancho: w, alto: h };
  }

  /* --- Eventos de puntero --- */
  svg.addEventListener('pointerdown', (e) => {
    if (bloqueado) return;
    e.preventDefault();
    svg.setPointerCapture(e.pointerId); // sigue el dedo aunque salga del lienzo
    inicio = celdaDe(e);
    capaDibujo.innerHTML = '';
  });

  svg.addEventListener('pointermove', (e) => {
    if (bloqueado || !inicio) return;
    e.preventDefault();
    pintar(inicio, celdaDe(e), false);
  });

  function soltar(e) {
    if (bloqueado || !inicio) return;
    const fin = celdaDe(e);
    const r = pintar(inicio, fin, true);
    inicio = null;
    // Un toque sin arrastre no cuenta como figura.
    if (r.ancho > 0 && r.alto > 0) {
      ultimo = r;
      onDibujar?.(r);
    }
  }
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);

  return {
    nodo: marco,

    limpiar() {
      capaDibujo.innerHTML = '';
      capaSolucion.innerHTML = '';
      ultimo = null;
      inicio = null;
    },

    bloquear() { bloqueado = true; },

    ultimo: () => ultimo,

    /**
     * Dibuja en verde la figura correcta, SIN taparle a Marina lo que hizo:
     * comparar las dos es justamente lo que ensena donde estuvo el error.
     * Se busca un hueco a la derecha de su dibujo, y si no cabe, abajo.
     */
    pintarSolucion({ ancho: w, alto: h }) {
      let x = 0;
      let y = 0;

      if (ultimo) {
        const derecha = ultimo.x + ultimo.ancho + 1;
        const abajo = ultimo.y + ultimo.alto + 1;
        if (derecha + w <= cols) {
          x = derecha; y = Math.min(ultimo.y, filas - h);
        } else if (abajo + h <= filas) {
          x = Math.min(ultimo.x, cols - w); y = abajo;
        } else if (ultimo.x - w - 1 >= 0) {
          x = ultimo.x - w - 1; y = Math.min(ultimo.y, filas - h);
        } else {
          // No cabe en ningun lado: se dibuja encima, pero solo el contorno,
          // sin relleno ni texto, para que el dibujo de Marina siga visible.
          capaSolucion.innerHTML = `
            <rect x="2" y="2" width="${w * C}" height="${h * C}"
                  fill="none" stroke="var(--verde)" stroke-width="4"
                  stroke-dasharray="9 6" stroke-linejoin="round"/>`;
          return;
        }
      }

      capaSolucion.innerHTML = `
        <rect x="${x * C + 2}" y="${y * C + 2}" width="${w * C}" height="${h * C}"
              fill="var(--verde)" fill-opacity=".22"
              stroke="var(--verde)" stroke-width="4" stroke-dasharray="9 6"
              stroke-linejoin="round"/>
        <text x="${(x + w / 2) * C}" y="${(y + h / 2) * C + 8}" text-anchor="middle"
              font-size="21" font-weight="800" fill="#0B7A5A">${w} × ${h}</text>`;
    },
  };
}
