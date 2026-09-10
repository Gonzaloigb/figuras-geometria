/**
 * ZONA 4 — Que figura es
 *
 * Contenido del temario: "triangulo, rectangulo, cuadrado, circulos"
 * (pp. 29-34, ejercitado en las pp. 39-40).
 *
 * Tres formatos:
 *   A. Que figura es esta? — con figuras ROTADAS, porque girar no cambia la figura.
 *   B. Adivinanza (p.40 ej.2): se describe por sus propiedades.
 *   C. Marca todos los que son X — con los distractores de la p.29.
 */

import { figura, dibujar, colorDe } from '../figuras.js';
import {
  CLASIFICABLES, CATEGORIAS, NO_RECTANGULOS, ADIVINANZAS,
  definicion, pistaDeError,
} from '../datos.js';
import { el, barajar, azar, uno, elegirCon } from '../util.js';
import { correrZona } from '../motor.js';

const TOTAL = 10;

const IDS_CLASIFICABLES = Object.keys(CLASIFICABLES);

export function jugarClasificar({ zona, onSalir, onFin }) {
  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    onFin,
    montar(ctx, i) {
      const modo = i % 3;
      if (modo === 0) montarQueEs(ctx);
      else if (modo === 1) montarAdivinanza(ctx);
      else montarMarcarTodos(ctx);
    },
  });
}

/** El nombre visible de una categoria. */
function nombreCat(id) {
  return CATEGORIAS.find((c) => c.id === id).nombre;
}

/* ---------- Formato A: que figura es esta ---------- */
function montarQueEs(ctx) {
  const id = uno(IDS_CLASIFICABLES);
  const correcto = CLASIFICABLES[id];
  // Rotacion generosa: el cuadrado girado sigue siendo cuadrado (p.39).
  const f = figura(id, id === 'circulo' ? 0 : azar(0, 7) * 15);
  // Un solo color por pregunta: cambiarlo al revelar distrae.
  const color = colorDe(azar(0, 6));

  ctx.pedir({ instruccion: '¿Qué figura es?' });

  const tarjeta = el('div', 'tarjeta-figura');
  tarjeta.innerHTML = dibujar(f, { color, clase: 'figura-grande' });
  ctx.zonaJuego.append(tarjeta);

  const cats = elegirCon(CATEGORIAS, CATEGORIAS.find((c) => c.id === correcto), 4);

  const opciones = el('div', 'opciones texto');
  for (const c of cats) {
    const btn = el('button', 'opcion solo-texto', c.nombre, {
      type: 'button', 'data-id': c.id,
    });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = c.id === correcto;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) {
        [...opciones.children]
          .find((o) => o.dataset.id === correcto)
          ?.classList.add('correcta');
        // Mostrar los angulos rectos ayuda a ver por que es lo que es.
        if (f.rectos > 0) {
          tarjeta.innerHTML = dibujar(f, { color, marcas: 'rectos', clase: 'figura-grande' });
        }
      }

      ctx.responder({
        acerto,
        concepto: correcto,
        mensajeBien: `¡Sí! Es un ${nombreCat(correcto)}. 🎉`,
        mensajeMal: `Es un ${nombreCat(correcto)}.`,
        pista: definicion(correcto).texto,
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato B: la adivinanza de la p.40 ---------- */
function montarAdivinanza(ctx) {
  const a = uno(ADIVINANZAS);

  ctx.pedir({ instruccion: '¿Qué figura es?', apoyo: a.pista });

  const cats = elegirCon(CATEGORIAS, CATEGORIAS.find((c) => c.id === a.respuesta), 4);

  const opciones = el('div', 'opciones texto');
  for (const c of cats) {
    const btn = el('button', 'opcion solo-texto', c.nombre, {
      type: 'button', 'data-id': c.id,
    });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = c.id === a.respuesta;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) {
        [...opciones.children]
          .find((o) => o.dataset.id === a.respuesta)
          ?.classList.add('correcta');
      }

      ctx.responder({
        acerto,
        concepto: a.respuesta,
        mensajeBien: `¡Sí! Es un ${nombreCat(a.respuesta)}. 🎉`,
        mensajeMal: `Es un ${nombreCat(a.respuesta)}.`,
        pista: definicion(a.respuesta).texto,
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato C: marca TODOS los que son X ----------
   Replica el ejercicio 1 de la p.29 y el 2 de la p.39: entre varias figuras
   parecidas, cuales cumplen la definicion. */
function montarMarcarTodos(ctx) {
  // Se pregunta por rectangulo o por cuadrado: son los que se confunden.
  const buscado = uno(['rectangulo', 'cuadrado']);

  /* DECISION PEDAGOGICA: al preguntar por rectangulos NO se incluye ningun
     cuadrado entre las opciones.
     Matematicamente un cuadrado es un rectangulo — tiene sus 4 angulos rectos —
     pero el libro de 2° basico presenta las dos figuras como cosas distintas y
     nunca ensena la inclusion. Poner un cuadrado ahi evaluaria algo que no le
     ensenaron, y cualquier respuesta que diera se sentiria injusta.
     Al preguntar por cuadrados si entran rectangulos: esa distincion SI se
     ensena, y es justo la de la p.32. */
  const siSon = buscado === 'rectangulo'
    ? ['rectangulo', 'rectangulo-alto']
    : ['cuadrado'];
  const noSon = buscado === 'rectangulo'
    ? [...NO_RECTANGULOS, 'trapecio-recto']
    : [...NO_RECTANGULOS, 'rectangulo', 'rectangulo-alto', 'trapecio-recto'];

  // 2 correctas y 3 distractores, o 1 y 4 si no alcanzan.
  const cuantasSi = Math.min(2, siSon.length);
  const elegidas = barajar([
    ...barajar(siSon).slice(0, cuantasSi),
    ...barajar(noSon).slice(0, 5 - cuantasSi),
  ]);

  ctx.pedir({
    instruccion: `Marca TODOS los ${buscado === 'rectangulo' ? 'rectángulos' : 'cuadrados'}`,
    apoyo: definicion(buscado).texto,
  });

  const marcadas = new Set();
  const opciones = el('div', 'opciones tres');

  /* Rotacion y color se fijan AQUI, una vez por figura. Al revelar hay que
     redibujarlas con las marcas de angulo, y si se sortearan de nuevo las
     figuras saltarian de posicion y de color justo al dar la respuesta. */
  const pinta = new Map(elegidas.map((id, i) => [id, { rot: azar(0, 5) * 12, color: colorDe(i) }]));

  elegidas.forEach((id) => {
    const { rot, color } = pinta.get(id);
    const f = figura(id, rot);
    const btn = el('button', 'opcion', dibujar(f, { color }), {
      type: 'button',
      'data-id': id,
      'aria-label': f.nombre,
    });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      if (marcadas.has(id)) { marcadas.delete(id); btn.classList.remove('marcada'); }
      else { marcadas.add(id); btn.classList.add('marcada'); }
    });
    opciones.append(btn);
  });
  ctx.zonaJuego.append(opciones);

  const btnOk = el('button', 'btn-chico destacado', '✅ Listo', { type: 'button' });
  const pie = el('div', 'fila-botones');
  pie.append(btnOk);
  ctx.zonaJuego.append(pie);

  btnOk.addEventListener('click', () => {
    if (btnOk.disabled) return;
    btnOk.disabled = true;

    const esperadas = elegidas.filter((id) => esDe(id, buscado));
    const acerto = esperadas.length === marcadas.size
      && esperadas.every((id) => marcadas.has(id));

    // Pintar la solucion y revelar por que: marcas de angulo en cada figura.
    // Misma rotacion y mismo color que antes, para que nada se mueva.
    [...opciones.children].forEach((btn) => {
      const id = btn.dataset.id;
      const { rot, color } = pinta.get(id);
      btn.classList.add('bloqueada');
      btn.classList.remove('marcada');
      btn.classList.add(esperadas.includes(id) ? 'correcta' : 'errada');
      btn.innerHTML = dibujar(figura(id, rot), { color, marcas: 'todas' });
    });

    // La pista habla del primer error, no de todos: una razon clara vale mas.
    const sobra = elegidas.find((id) => marcadas.has(id) && !esperadas.includes(id));
    const falta = esperadas.find((id) => !marcadas.has(id));
    let pista;
    if (sobra) pista = pistaDeError(buscado, figura(sobra));
    else if (falta) pista = `Te faltó una: ${definicion(buscado).texto}`;
    else pista = definicion(buscado).texto;

    ctx.responder({
      acerto,
      concepto: buscado,
      mensajeBien: `¡Muy bien! Eran ${esperadas.length}. 🎉`,
      mensajeMal: `Eran ${esperadas.length}.`,
      pista,
    });
  });
}

/**
 * Cumple esta figura la definicion?
 *
 * "rectangulo" aqui significa rectangulo NO cuadrado, por la decision
 * pedagogica explicada mas arriba. Como los cuadrados nunca se ofrecen en esa
 * pregunta, la distincion no llega a verse en pantalla; se deja explicita para
 * que nadie la reintroduzca por accidente al agregar figuras al catalogo.
 */
function esDe(id, categoria) {
  const f = figura(id);
  if (categoria === 'rectangulo') {
    return f.familia === 'cuadrilatero' && f.rectos === 4 && !f.ladosIguales;
  }
  if (categoria === 'cuadrado') {
    return f.familia === 'cuadrilatero' && f.rectos === 4 && f.ladosIguales;
  }
  return CLASIFICABLES[id] === categoria;
}
