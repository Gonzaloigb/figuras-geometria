/**
 * ZONA 3 — Angulos rectos
 *
 * Contenido del temario: "angulos rectos" (pp. 27-29, ejercitado en la p. 39).
 *
 * REGLA DEL NIVEL: aqui nunca aparece un numero de grados. La profesora fue
 * explicita. Se usa la notacion del libro: cuadradito = recto, arquito = no.
 *
 * Dos formatos:
 *   A. Marca TODAS las esquinas que son angulo recto (toca los vertices).
 *   B. Cuantos angulos rectos tiene esta figura?
 *
 * En los dos, al revelar la respuesta la figura se redibuja CON las marcas:
 * la razon se ve, no solo se lee.
 */

import { figura, dibujar, angulosDe, colorDe, escuadra } from '../figuras.js';
import { definicion } from '../datos.js';
import { el, azar, uno, barajar } from '../util.js';
import { correrZona } from '../motor.js';

const TOTAL = 8;

/* Figuras con vertices, mezclando las que tienen rectos y las que no. */
const CANDIDATAS = [
  'cuadrado', 'rectangulo', 'rectangulo-alto',
  'triangulo-rectangulo', 'triangulo-rectangulo-b', 'trapecio-recto',
  'triangulo', 'romboide', 'rombo', 'trapecio', 'cometa',
];

export function jugarAngulos({ zona, onSalir, onFin }) {
  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    onFin,
    montar(ctx, i) {
      if (i % 2 === 0) montarMarcarEsquinas(ctx);
      else montarCuantosRectos(ctx);
    },
  });
}

/* ---------- La ayuda de la escuadra ----------
   En la p.28 el libro ensena a comprobar apoyando la escuadra sobre el
   vertice. Es lo que Marina hara en la prueba, asi que el juego se la ofrece.
   No da la respuesta: solo deja mirar de cerca, como la escuadra de verdad. */
function agregarEscuadra(ctx) {
  const fila = el('div', 'fila-botones');
  const btn = el('button', 'btn-chico', '📐 Usar la escuadra', { type: 'button' });
  const caja = el('div', '', escuadra(120));
  caja.style.display = 'none';

  btn.addEventListener('click', () => {
    const visible = caja.style.display !== 'none';
    caja.style.display = visible ? 'none' : 'block';
    btn.textContent = visible ? '📐 Usar la escuadra' : '📐 Ocultar la escuadra';
  });

  fila.append(btn);
  ctx.zonaJuego.append(fila, caja);
}

/* ---------- Formato A: marcar las esquinas rectas ---------- */
function montarMarcarEsquinas(ctx) {
  // Una figura que tenga al menos un angulo recto: si no, no hay nada que marcar.
  const conRectos = CANDIDATAS.filter((id) => figura(id).rectos > 0);
  const f = figura(uno(conRectos), azar(0, 3) * 15);
  const angulos = angulosDe(f);
  const esperados = angulos.filter((a) => a.recto).map((a) => a.indice);

  ctx.pedir({
    instruccion: 'Toca TODAS las esquinas que son ángulo recto',
    apoyo: definicion('angulo-recto').texto
         + ' Es la esquina cuadrada, como la de una hoja.',
  });

  /* El color se elige UNA vez por pregunta: si se sortea de nuevo al revelar,
     la figura cambia de color junto con la respuesta y distrae. */
  const color = colorDe(azar(0, 6));

  /* El lienzo: la figura mas un boton encima de cada vertice.
     Los vertices se posicionan en porcentaje porque el SVG usa un viewBox
     de 100x100: la coordenada del vertice ES el porcentaje. */
  const lienzo = el('div', 'lienzo-vertices');
  lienzo.innerHTML = dibujar(f, { color });

  const marcados = new Set();

  angulos.forEach((a) => {
    const p = el('button', 'punto-vertice', '', {
      type: 'button',
      'aria-label': `esquina ${a.indice + 1}`,
    });
    p.style.left = `${a.punto.x}%`;
    p.style.top = `${a.punto.y}%`;

    p.addEventListener('click', () => {
      if (p.classList.contains('bloqueado')) return;
      if (marcados.has(a.indice)) {
        marcados.delete(a.indice);
        p.classList.remove('marcado');
      } else {
        marcados.add(a.indice);
        p.classList.add('marcado');
      }
    });
    lienzo.append(p);
  });

  ctx.zonaJuego.append(lienzo);
  agregarEscuadra(ctx);

  const btnOk = el('button', 'btn-chico destacado', '✅ Listo', { type: 'button' });
  const pie = el('div', 'fila-botones');
  pie.append(btnOk);
  ctx.zonaJuego.append(pie);

  btnOk.addEventListener('click', () => {
    if (btnOk.disabled) return;
    btnOk.disabled = true;

    const acerto = esperados.length === marcados.size
      && esperados.every((i) => marcados.has(i));

    // Pintar la solucion sobre los puntos.
    [...lienzo.querySelectorAll('.punto-vertice')].forEach((p, i) => {
      p.classList.add('bloqueado');
      p.classList.remove('marcado');
      if (esperados.includes(i)) p.classList.add('correcto');
      else if (marcados.has(i)) p.classList.add('errado');
    });

    // Y redibujar la figura CON las marcas: cuadradito o arquito en cada esquina.
    const svgViejo = lienzo.querySelector('svg.figura');
    svgViejo.outerHTML = dibujar(f, { color, marcas: 'todas' });

    ctx.responder({
      acerto,
      concepto: 'angulo-recto',
      mensajeBien: `¡Sí! Tiene ${esperados.length} ángulo${esperados.length === 1 ? '' : 's'} recto${esperados.length === 1 ? '' : 's'}. 🎉`,
      mensajeMal: `Los ángulos rectos son ${esperados.length}.`,
      pista: 'El cuadradito rojo marca las esquinas rectas. '
           + 'El arquito morado marca las que no lo son.',
    });
  });
}

/* ---------- Formato B: cuantos angulos rectos tiene ---------- */
function montarCuantosRectos(ctx) {
  const f = figura(uno(CANDIDATAS), azar(0, 3) * 15);
  const correcto = angulosDe(f).filter((a) => a.recto).length;
  const color = colorDe(azar(0, 6));

  ctx.pedir({
    instruccion: '¿Cuántos ángulos rectos tiene?',
    apoyo: 'Un ángulo recto es la esquina cuadrada, como la de una hoja de papel.',
  });

  const tarjeta = el('div', 'tarjeta-figura');
  tarjeta.innerHTML = dibujar(f, { color, clase: 'figura-grande' });
  ctx.zonaJuego.append(tarjeta);
  agregarEscuadra(ctx);

  const opciones = el('div', 'opciones cuatro');
  for (const n of barajar([0, 1, 2, 4])) {
    const btn = el('button', 'opcion solo-texto', String(n), {
      type: 'button', 'data-n': String(n),
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
      }

      // Revelar con las marcas puestas.
      tarjeta.innerHTML = dibujar(f, { color, marcas: 'todas', clase: 'figura-grande' });

      ctx.responder({
        acerto,
        concepto: 'angulo-recto',
        mensajeBien: correcto === 0
          ? '¡Sí! No tiene ninguno. 🎉'
          : `¡Sí! Tiene ${correcto}. 🎉`,
        mensajeMal: `Tiene ${correcto}.`,
        pista: 'El cuadradito rojo marca las esquinas rectas. '
             + 'El arquito morado marca las que no lo son.',
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}
