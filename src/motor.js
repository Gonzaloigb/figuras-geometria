/**
 * motor.js — el esqueleto que comparten los seis minijuegos.
 *
 * Cada zona solo define COMO se ve una pregunta y QUE es correcto.
 * El conteo de aciertos, la barra de progreso, el audio, los avisos y la
 * pantalla final viven aqui, una sola vez.
 *
 * Adaptado del motor del juego de ingles. Diferencia principal: alla la
 * consigna se ESCUCHABA (el audio era la materia evaluada) y pedir() armaba
 * botones de bocina. Aqui la consigna se lee, y pedir() solo pinta texto.
 */

import { el, esperar, estrellasPorPuntaje, confeti, pintarEstrellas } from './util.js';
import { sonarBien, sonarMal, sonarVictoria, sonarEstrella } from './audio.js';
import { guardarEstrellas, registrar } from './estado.js';

/**
 * Arranca una zona.
 *
 * @param {object} cfg
 *  - zona:        objeto de ZONAS
 *  - total:       cuantas preguntas
 *  - montar(ctx): dibuja UNA pregunta. Recibe el contexto y el indice.
 *  - onSalir():   volver al mapa
 *  - onFin(r):    al terminar
 *  - sinPistas:   si true, no muestra la razon del error (modo simulacro)
 */
export function correrZona(cfg) {
  const raiz = document.getElementById('app');
  const { zona, total, montar, onSalir, onFin, sinPistas = false } = cfg;

  let indice = 0;
  let aciertos = 0;
  const fallos = [];

  /* ---------- Estructura de la pantalla ---------- */
  const pantalla = el('div', `pantalla cielo-${zona.momento}`);

  const barra = el('div', 'barra');
  const btnVolver = el('button', 'btn-volver', '⬅ Volver', { type: 'button' });
  const titulo = el('h2', 'titulo-zona', `${zona.icono} ${zona.titulo}`);
  const contador = el('div', 'contador');
  const progreso = el('div', 'progreso', '<i></i>');
  barra.append(btnVolver, titulo, progreso, contador);

  const tablero = el('div', 'tablero');
  const consigna = el('div', 'consigna');
  const zonaJuego = el('div', 'zona-juego');
  const aviso = el('div', 'aviso');
  tablero.append(consigna, zonaJuego, aviso);

  pantalla.append(barra, tablero);
  raiz.replaceChildren(pantalla);

  btnVolver.addEventListener('click', onSalir);

  /* ---------- Contexto que recibe cada minijuego ---------- */
  const ctx = {
    consigna,
    zonaJuego,
    sinPistas,

    /**
     * Arma la consigna.
     * @param {object} p
     *  - instruccion: que tiene que hacer
     *  - apoyo:       recordatorio de la definicion (opcional)
     */
    pedir({ instruccion, apoyo = '' }) {
      consigna.replaceChildren();
      consigna.append(el('p', 'instruccion', instruccion));
      if (apoyo && !sinPistas) consigna.append(el('p', 'apoyo', apoyo));
    },

    /** Marca la respuesta y pasa a la siguiente pregunta. */
    async responder({ acerto, concepto, mensajeBien, mensajeMal, pista }) {
      if (concepto) registrar(concepto, acerto);

      if (acerto) {
        aciertos += 1;
        sonarBien();
        aviso.className = 'aviso bien';
        aviso.textContent = mensajeBien || '¡Muy bien! 🎉';
      } else {
        fallos.push(concepto);
        sonarMal();
        aviso.className = 'aviso mal';
        aviso.replaceChildren(document.createTextNode(mensajeMal || 'Casi… 💪'));
        // La pista es lo que convierte el error en aprendizaje. En el simulacro
        // se calla, porque ahi la idea es medir, no ensenar.
        if (pista && !sinPistas) aviso.append(el('span', 'pista', pista));

        // En celular el aviso nace al pie y puede quedar bajo la linea de
        // flotacion: una pista que no se ve no ensena nada. Se trae a la vista.
        if (aviso.getBoundingClientRect().bottom > window.innerHeight) {
          aviso.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }

      // Un error necesita mas tiempo en pantalla: hay que alcanzar a leer la razon.
      await esperar(acerto ? 1100 : (sinPistas ? 1100 : 2900));
      aviso.className = 'aviso';
      aviso.replaceChildren();

      indice += 1;
      siguiente();
    },
  };

  /* ---------- Ciclo de preguntas ---------- */
  function pintarBarra() {
    contador.textContent = `${indice + 1} / ${total}`;
    progreso.querySelector('i').style.width = `${(indice / total) * 100}%`;
  }

  function siguiente() {
    if (indice >= total) return terminar();
    pintarBarra();
    zonaJuego.replaceChildren();
    montar(ctx, indice);
  }

  async function terminar() {
    progreso.querySelector('i').style.width = '100%';
    contador.textContent = `${total} / ${total}`;

    const estrellas = estrellasPorPuntaje(aciertos, total);
    guardarEstrellas(zona.id, estrellas);

    const fiesta = el('div', 'fiesta');
    const bien = aciertos >= total * 0.7;
    fiesta.append(
      el('h2', '', bien ? '¡Excelente, Marina! 🎉' : '¡Buen intento! 💪'),
      el('div', 'estrellas-grandes',
        [0, 1, 2].map((i) => `<span>${i < estrellas ? '⭐' : '☆'}</span>`).join('')),
      el('div', 'puntaje', `${aciertos} de ${total} correctas`),
    );

    if (fallos.filter(Boolean).length) {
      const unicos = [...new Set(fallos.filter(Boolean))];
      fiesta.append(el('div', 'panel',
        `<h3>Para repasar</h3><p>${unicos.map(legible).join(' · ')}</p>`));
    }

    const botones = el('div', 'fila-botones');
    const otra = el('button', 'btn-chico destacado', '🔁 Jugar de nuevo', { type: 'button' });
    const volver = el('button', 'btn-chico', '🗺️ Volver al mapa', { type: 'button' });
    otra.addEventListener('click', () => {
      indice = 0; aciertos = 0; fallos.length = 0;
      raiz.replaceChildren(pantalla);
      siguiente();
    });
    volver.addEventListener('click', () => onFin({ aciertos, total, estrellas }));
    botones.append(otra, volver);
    fiesta.append(botones);

    tablero.replaceChildren(fiesta);

    if (bien) {
      sonarVictoria();
      confeti(70);
      for (let i = 0; i < estrellas; i++) {
        await esperar(220);
        sonarEstrella();
      }
    }
  }

  siguiente();
}

/**
 * Nombre legible de un concepto, para el informe y el "para repasar".
 *
 * Los conceptos se guardan como identificadores sin tildes (`angulo-recto`)
 * porque son claves de localStorage. Aqui se traducen a como se dicen.
 */
const NOMBRES = {
  'linea-recta': 'líneas rectas',
  'angulo-recto': 'ángulos rectos',
  triangulo: 'triángulo',
  cuadrilatero: 'cuadrilátero',
  rectangulo: 'rectángulo',
  cuadrado: 'cuadrado',
  circulo: 'círculo',
  'triangulo-rectangulo': 'triángulo rectángulo',
  'vertices-triangulo': 'vértices del triángulo',
  'vertices-cuadrilatero': 'vértices del cuadrilátero',
  'lados-triangulo': 'lados del triángulo',
  'lados-cuadrilatero': 'lados del cuadrilátero',
  'construir-rectangulo': 'construir rectángulos',
  'construir-cuadrado': 'construir cuadrados',
};

export function legible(concepto) {
  return NOMBRES[concepto] || String(concepto).replace(/-/g, ' ');
}

/** Pinta las estrellas — reexportado para que las zonas no importen util. */
export { pintarEstrellas };
