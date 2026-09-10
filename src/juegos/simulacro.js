/**
 * ZONA 6 — Simulacro
 *
 * Como la prueba de verdad: preguntas de todo el capitulo, mezcladas y sin
 * pistas. Ahi la idea es MEDIR, no ensenar — por eso `sinPistas: true`.
 *
 * Reutiliza los formatos de las cinco zonas anteriores en vez de reimplementar
 * las preguntas. Si se corrige un ejercicio, se corrige en un solo lugar.
 */

import { figura, dibujar, angulosDe, colorDe } from '../figuras.js';
import { crearCuadricula } from '../cuadricula.js';
import {
  CLASIFICABLES, CATEGORIAS, ADIVINANZAS, CONSTRUCCIONES,
  NO_RECTANGULOS, definicion,
} from '../datos.js';
import { el, barajar, azar, uno, elegirCon } from '../util.js';
import { correrZona } from '../motor.js';
import { guardarSimulacro } from '../estado.js';

const TOTAL = 12;

const CON_VERTICES = [
  'triangulo', 'triangulo-rectangulo', 'cuadrado', 'rectangulo',
  'romboide', 'rombo', 'trapecio', 'trapecio-recto', 'cometa',
];

export function jugarSimulacro({ zona, onSalir, onFin }) {
  // Reparto fijo, cubriendo los cinco contenidos del temario:
  //   2 de conteo · 3 de angulos rectos · 4 de clasificar · 3 de construir
  const guion = barajar([
    'contar', 'contar',
    'angulos', 'angulos', 'angulos',
    'clasificar', 'clasificar', 'adivinanza', 'adivinanza',
    'construir', 'construir', 'construir',
  ]);

  const medidas = barajar(CONSTRUCCIONES);
  let iMedida = 0;
  let aciertos = 0;

  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    sinPistas: true,
    onFin(r) {
      guardarSimulacro(r.aciertos, r.total);
      onFin(r);
    },
    montar(ctx, i) {
      // Envolver responder() para llevar la cuenta propia del simulacro.
      const original = ctx.responder.bind(ctx);
      const ctx2 = {
        ...ctx,
        responder(p) { if (p.acerto) aciertos += 1; return original(p); },
      };

      switch (guion[i]) {
        case 'contar': return preguntaContar(ctx2);
        case 'angulos': return preguntaAngulos(ctx2);
        case 'clasificar': return preguntaClasificar(ctx2);
        case 'adivinanza': return preguntaAdivinanza(ctx2);
        case 'construir': return preguntaConstruir(ctx2, medidas[iMedida++ % medidas.length]);
        default: throw new Error(`simulacro.js: formato desconocido "${guion[i]}"`);
      }
    },
  });
}

/* ---------- Utilidad comun: alternativas de texto ---------- */
function opcionesTexto(ctx, lista, correcto, alResponder) {
  const opciones = el('div', 'opciones texto');
  for (const op of lista) {
    const btn = el('button', 'opcion solo-texto', op.t, {
      type: 'button', 'data-id': String(op.id),
    });
    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));
      const acerto = String(op.id) === String(correcto);
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) {
        [...opciones.children]
          .find((o) => o.dataset.id === String(correcto))
          ?.classList.add('correcta');
      }
      alResponder(acerto);
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Contar vertices o lados ---------- */
function preguntaContar(ctx) {
  const f = figura(uno(CON_VERTICES), azar(0, 5) * 12);
  const que = uno(['vertices', 'lados']);
  const correcto = f.puntos.length;

  ctx.pedir({
    instruccion: que === 'vertices' ? '¿Cuántos vértices tiene?' : '¿Cuántos lados tiene?',
  });

  const tarjeta = el('div', 'tarjeta-figura');
  tarjeta.innerHTML = dibujar(f, { color: colorDe(azar(0, 6)), clase: 'figura-grande' });
  ctx.zonaJuego.append(tarjeta);

  // Siempre 4 alternativas: un Set sobre una lista fija se queda en 3 cuando
  // la correcta coincide con un distractor.
  const nums = [correcto];
  for (const n of [3, 4, 5, 6, 2]) {
    if (nums.length >= 4) break;
    if (!nums.includes(n)) nums.push(n);
  }

  opcionesTexto(ctx, barajar(nums).map((n) => ({ id: n, t: String(n) })), correcto, (acerto) => {
    ctx.responder({
      acerto,
      concepto: `${que}-${f.familia}`,
      mensajeBien: '¡Correcto! 🎉',
      mensajeMal: `Eran ${correcto}.`,
    });
  });
}

/* ---------- Cuantos angulos rectos ---------- */
function preguntaAngulos(ctx) {
  const f = figura(uno(CON_VERTICES), azar(0, 3) * 15);
  const correcto = angulosDe(f).filter((a) => a.recto).length;
  const color = colorDe(azar(0, 6)); // fijo: al revelar no debe cambiar

  ctx.pedir({ instruccion: '¿Cuántos ángulos rectos tiene?' });

  const tarjeta = el('div', 'tarjeta-figura');
  tarjeta.innerHTML = dibujar(f, { color, clase: 'figura-grande' });
  ctx.zonaJuego.append(tarjeta);

  opcionesTexto(ctx, barajar([0, 1, 2, 4]).map((n) => ({ id: n, t: String(n) })),
    correcto, (acerto) => {
      // Al terminar la pregunta se revela igual: ver la marca ensena aunque
      // no haya pista escrita.
      tarjeta.innerHTML = dibujar(f, { color, marcas: 'todas', clase: 'figura-grande' });
      ctx.responder({
        acerto,
        concepto: 'angulo-recto',
        mensajeBien: '¡Correcto! 🎉',
        mensajeMal: `Eran ${correcto}.`,
      });
    });
}

/* ---------- Que figura es ---------- */
function preguntaClasificar(ctx) {
  const id = uno(Object.keys(CLASIFICABLES));
  const correcto = CLASIFICABLES[id];
  const f = figura(id, id === 'circulo' ? 0 : azar(0, 7) * 15);

  ctx.pedir({ instruccion: '¿Qué figura es?' });

  const tarjeta = el('div', 'tarjeta-figura');
  tarjeta.innerHTML = dibujar(f, { color: colorDe(azar(0, 6)), clase: 'figura-grande' });
  ctx.zonaJuego.append(tarjeta);

  const cats = elegirCon(CATEGORIAS, CATEGORIAS.find((c) => c.id === correcto), 4);
  opcionesTexto(ctx, cats.map((c) => ({ id: c.id, t: c.nombre })), correcto, (acerto) => {
    ctx.responder({
      acerto,
      concepto: correcto,
      mensajeBien: '¡Correcto! 🎉',
      mensajeMal: `Era ${CATEGORIAS.find((c) => c.id === correcto).nombre}.`,
    });
  });
}

/* ---------- Adivinanza ---------- */
function preguntaAdivinanza(ctx) {
  const a = uno(ADIVINANZAS);
  ctx.pedir({ instruccion: a.pista });

  const cats = elegirCon(CATEGORIAS, CATEGORIAS.find((c) => c.id === a.respuesta), 4);
  opcionesTexto(ctx, cats.map((c) => ({ id: c.id, t: c.nombre })), a.respuesta, (acerto) => {
    ctx.responder({
      acerto,
      concepto: a.respuesta,
      mensajeBien: '¡Correcto! 🎉',
      mensajeMal: `Era ${CATEGORIAS.find((c) => c.id === a.respuesta).nombre}.`,
    });
  });
}

/* ---------- Construir en la cuadricula ---------- */
function preguntaConstruir(ctx, pedido) {
  ctx.pedir({ instruccion: `Dibuja ${pedido.texto}` });

  let hecho = null;
  const rejilla = crearCuadricula({
    cols: 12, filas: 7,
    onDibujar(r) { hecho = r; btnOk.disabled = false; },
  });
  ctx.zonaJuego.append(rejilla.nodo);

  const pie = el('div', 'fila-botones');
  const btnBorrar = el('button', 'btn-chico', '🧽 Borrar', { type: 'button' });
  const btnOk = el('button', 'btn-chico destacado', '✅ Listo', { type: 'button' });
  btnOk.disabled = true;
  pie.append(btnBorrar, btnOk);
  ctx.zonaJuego.append(pie);

  btnBorrar.addEventListener('click', () => {
    rejilla.limpiar(); hecho = null; btnOk.disabled = true;
  });

  btnOk.addEventListener('click', () => {
    if (btnOk.disabled) return;
    btnOk.disabled = true;
    btnBorrar.disabled = true;
    rejilla.bloquear();

    const esperado = [pedido.ancho, pedido.alto].sort((a, b) => a - b);
    const logrado = [hecho.ancho, hecho.alto].sort((a, b) => a - b);
    const acerto = esperado[0] === logrado[0] && esperado[1] === logrado[1];
    if (!acerto) rejilla.pintarSolucion(pedido);

    ctx.responder({
      acerto,
      concepto: `construir-${pedido.forma}`,
      mensajeBien: '¡Correcto! 🎉',
      mensajeMal: `Eran ${pedido.ancho} cm y ${pedido.alto} cm.`,
    });
  });
}
