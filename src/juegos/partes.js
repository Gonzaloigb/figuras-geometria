/**
 * ZONA 2 — Vertices y lados
 *
 * Contenido del temario: "vertices y lados de cuadrilateros y triangulos"
 * (p. 23, ejercitado en la p. 26 y en la p. 39 ejercicio 1).
 *
 * Tres formatos:
 *   A. Cuantos vertices tiene esta figura?
 *   B. Cuantos lados tiene esta figura?
 *   C. Es triangulo o cuadrilatero?
 *
 * Los tres muestran los vertices como puntos, igual que el libro, para que
 * contar sea contar y no adivinar.
 */

import { figura, dibujar, colorDe } from '../figuras.js';
import { definicion, pistaDeConteo } from '../datos.js';
import { el, barajar, azar, uno } from '../util.js';
import { correrZona } from '../motor.js';

const TOTAL = 9;

/* Solo figuras con vertices: el circulo y las curvas no entran aqui. */
const CON_VERTICES = [
  'triangulo', 'triangulo-rectangulo', 'triangulo-rectangulo-b',
  'cuadrado', 'rectangulo', 'rectangulo-alto',
  'romboide', 'rombo', 'trapecio', 'trapecio-recto', 'cometa',
];

export function jugarPartes({ zona, onSalir, onFin }) {
  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    onFin,
    montar(ctx, i) {
      const modo = i % 3;
      if (modo === 0) montarContar(ctx, 'vertices');
      else if (modo === 1) montarContar(ctx, 'lados');
      else montarFamilia(ctx);
    },
  });
}

/* ---------- Formatos A y B: contar vertices o lados ---------- */
function montarContar(ctx, que) {
  const f = figura(uno(CON_VERTICES), azar(0, 5) * 12);
  const correcto = f.puntos.length; // vertices y lados coinciden en estos poligonos
  const esVertices = que === 'vertices';

  ctx.pedir({
    instruccion: esVertices
      ? '¿Cuántos vértices tiene?'
      : '¿Cuántos lados tiene?',
    apoyo: esVertices ? definicion('vertice').texto : definicion('lado').texto,
  });

  // Un solo color por pregunta: si se sortea otra vez al revelar, la figura
  // cambia de color junto con la respuesta y distrae.
  const color = colorDe(azar(0, 6));

  const tarjeta = el('div', 'tarjeta-figura');
  tarjeta.innerHTML = dibujar(f, {
    color,
    vertices: esVertices, // los puntos ayudan a contar esquinas, no lados
    clase: 'figura-grande',
  });
  ctx.zonaJuego.append(tarjeta);

  /* Alternativas: la correcta mas tres distractores creibles.
     Se completa desde una lista de vecinos hasta llegar a 4 — un Set sobre una
     lista fija se queda en 3 cuando la correcta coincide con un distractor. */
  const numeros = [correcto];
  for (const n of [3, 4, 5, 6, 2]) {
    if (numeros.length >= 4) break;
    if (!numeros.includes(n)) numeros.push(n);
  }

  const opciones = el('div', 'opciones cuatro');
  for (const n of barajar(numeros)) {
    const btn = el('button', 'opcion solo-texto', String(n), {
      type: 'button',
      'data-n': String(n),
    });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = n === correcto;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) {
        [...opciones.children]
          .find((o) => o.dataset.n === String(correcto))
          ?.classList.add('correcta');
        // Al fallar, mostrar los puntos: la razon se ve, no solo se lee.
        tarjeta.innerHTML = dibujar(f, { color, vertices: true, clase: 'figura-grande' });
      }

      ctx.responder({
        acerto,
        concepto: `${que}-${f.familia}`,
        mensajeBien: `¡Sí! Tiene ${correcto} ${esVertices ? 'vértices' : 'lados'}. 🎉`,
        mensajeMal: `Tiene ${correcto}.`,
        pista: pistaDeConteo(que, correcto, f.familia),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato C: triangulo o cuadrilatero ---------- */
function montarFamilia(ctx) {
  const f = figura(uno(CON_VERTICES), azar(0, 5) * 12);
  const correcto = f.familia; // 'triangulo' o 'cuadrilatero'

  ctx.pedir({
    instruccion: '¿Qué es esta figura?',
    apoyo: `${definicion('triangulo').texto} ${definicion('cuadrilatero').texto}`,
  });

  const tarjeta = el('div', 'tarjeta-figura');
  tarjeta.innerHTML = dibujar(f, {
    color: colorDe(azar(0, 6)), vertices: true, clase: 'figura-grande',
  });
  ctx.zonaJuego.append(tarjeta);

  const opciones = el('div', 'opciones dos');
  for (const op of [
    { id: 'triangulo', t: 'Triángulo', n: 3 },
    { id: 'cuadrilatero', t: 'Cuadrilátero', n: 4 },
  ]) {
    const btn = el('button', 'opcion solo-texto', op.t, { type: 'button' });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = op.id === correcto;
      btn.classList.add(acerto ? 'correcta' : 'errada');

      ctx.responder({
        acerto,
        concepto: correcto,
        mensajeBien: `¡Sí! Es un ${correcto === 'triangulo' ? 'triángulo' : 'cuadrilátero'}. 🎉`,
        mensajeMal: `Es un ${correcto === 'triangulo' ? 'triángulo' : 'cuadrilátero'}.`,
        pista: `Cuenta sus lados: tiene ${f.puntos.length}. `
             + definicion(correcto).texto,
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}
