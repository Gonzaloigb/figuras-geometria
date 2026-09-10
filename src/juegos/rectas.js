/**
 * ZONA 1 — Rectas y curvas
 *
 * Contenido del temario: "Lineas rectas, lineas curvas" (pp. 19-20).
 *
 * Dos formatos que se alternan:
 *   A. Entre varias trazas, cual es la linea recta.
 *   B. Esta figura, tiene todos sus lados rectos? — es la trampa de la p.26,
 *      y el puente hacia la zona 2: sin lados rectos no hay triangulo.
 */

import { lineaRecta, lineaCurva, figura, dibujar, colorDe } from '../figuras.js';
import { CURVAS, definicion } from '../datos.js';
import { el, barajar, azar, uno } from '../util.js';
import { correrZona } from '../motor.js';

const TOTAL = 8;

/* Figuras de lados rectos, para contrastar con las curvas. */
const RECTAS_OK = ['triangulo', 'cuadrado', 'rectangulo', 'romboide', 'trapecio', 'cometa'];

export function jugarRectas({ zona, onSalir, onFin }) {
  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    onFin,
    montar(ctx, i) {
      if (i % 2 === 0) montarCualEsRecta(ctx);
      else montarTieneLadosRectos(ctx);
    },
  });
}

/* ---------- Formato A: cual de estas es una linea recta ---------- */
function montarCualEsRecta(ctx) {
  ctx.pedir({
    instruccion: 'Toca la línea recta',
    apoyo: definicion('linea-recta').texto,
  });

  // Una recta y tres curvas, en orden al azar.
  const semilla = azar(0, 5);
  const cartas = barajar([
    { recta: true, svg: lineaRecta(semilla) },
    { recta: false, svg: lineaCurva(semilla) },
    { recta: false, svg: lineaCurva(semilla + 1) },
    { recta: false, svg: lineaCurva(semilla + 3) },
  ]);

  const opciones = el('div', 'opciones cuatro');

  cartas.forEach((c, i) => {
    const btn = el('button', 'opcion', c.svg, {
      type: 'button',
      'aria-label': c.recta ? 'línea recta' : 'línea curva',
      'data-recta': String(c.recta),
    });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      btn.classList.add(c.recta ? 'correcta' : 'errada');
      if (!c.recta) {
        [...opciones.children]
          .find((o) => o.dataset.recta === 'true')
          ?.classList.add('correcta');
      }

      ctx.responder({
        acerto: c.recta,
        concepto: 'linea-recta',
        mensajeBien: '¡Sí! Esa es una línea recta. 🎉',
        mensajeMal: 'Esa línea es curva.',
        pista: 'Una línea recta es la que se forma al estirar un cordel: '
             + 'no se dobla en ninguna parte.',
      });
    });
    opciones.append(btn);
  });

  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato B: esta figura tiene todos sus lados rectos ---------- */
function montarTieneLadosRectos(ctx) {
  // Mitad de las veces una figura de lados rectos, mitad una curva.
  const esCurva = Math.random() < 0.5;
  const id = esCurva ? uno(CURVAS) : uno(RECTAS_OK);
  const f = figura(id, esCurva ? 0 : azar(0, 3) * 15);

  ctx.pedir({
    instruccion: '¿Todos sus lados son líneas rectas?',
    apoyo: 'Si un lado se curva, o las esquinas están redondeadas, '
         + 'la figura no tiene lados rectos.',
  });

  const tarjeta = el('div', 'tarjeta-figura');
  tarjeta.innerHTML = dibujar(f, { color: colorDe(azar(0, 6)), clase: 'figura-grande' });
  ctx.zonaJuego.append(tarjeta);

  const opciones = el('div', 'opciones dos');
  for (const op of [{ v: true, t: '✅ Sí, todos rectos' }, { v: false, t: '❌ No, hay curvas' }]) {
    const btn = el('button', 'opcion solo-texto', op.t, { type: 'button' });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const correcto = !esCurva;
      const acerto = op.v === correcto;
      btn.classList.add(acerto ? 'correcta' : 'errada');

      ctx.responder({
        acerto,
        concepto: 'linea-recta',
        mensajeBien: esCurva
          ? '¡Exacto! No todos sus lados son rectos. 🎉'
          : '¡Sí! Todos sus lados son líneas rectas. 🎉',
        mensajeMal: esCurva ? 'Fíjate bien: hay curvas.' : 'Sí son todos rectos.',
        pista: esCurva
          ? (f.razon || 'Alguno de sus lados es curvo.')
          : 'Cada lado va derecho de una esquina a la otra, sin doblarse.',
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}
