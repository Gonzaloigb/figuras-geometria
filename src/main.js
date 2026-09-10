/**
 * main.js — arranque y navegacion entre pantallas.
 *
 * Tres pantallas propias: portada, mapa e informe.
 * Las seis zonas de juego las dibuja motor.js.
 */

import './estilos.css';
import { ZONAS } from './datos.js';
import { figura, dibujar, colorDe } from './figuras.js';
import { el, pintarEstrellas } from './util.js';
import { despertarAudio, sonarToque } from './audio.js';
import { legible } from './motor.js';
import * as estado from './estado.js';

import { jugarRectas } from './juegos/rectas.js';
import { jugarPartes } from './juegos/partes.js';
import { jugarAngulos } from './juegos/angulos.js';
import { jugarClasificar } from './juegos/clasificar.js';
import { jugarConstruir } from './juegos/construir.js';
import { jugarSimulacro } from './juegos/simulacro.js';

// Se resuelve al arrancar, no al cargar el archivo: en la version compilada
// para doble clic el script corre en el <head>, antes de que exista el div.
let raiz = null;

const JUEGOS = {
  rectas: jugarRectas,
  partes: jugarPartes,
  angulos: jugarAngulos,
  clasificar: jugarClasificar,
  construir: jugarConstruir,
  simulacro: jugarSimulacro,
};

/* ============================================================
   PORTADA
   ============================================================ */
function verPortada() {
  const p = el('div', 'pantalla cielo-amanecer');
  const portada = el('div', 'portada');

  portada.append(el('h1', '', 'Figuras'));
  portada.append(el('p', 'lema', 'Practica para tu prueba de matemática 📐'));

  // Un desfile de figuras, en vez de los animales del juego de ingles.
  const desfile = el('div', 'desfile');
  const muestra = ['triangulo', 'cuadrado', 'rectangulo', 'circulo',
    'triangulo-rectangulo', 'romboide'];
  muestra.forEach((id, i) => {
    desfile.insertAdjacentHTML('beforeend',
      dibujar(figura(id, i * 12), { color: colorDe(i) }));
  });
  portada.append(desfile);

  const btn = el('button', 'btn-grande', '▶ JUGAR', { type: 'button' });
  portada.append(btn);

  portada.append(el('div', 'nota-portada',
    'Capítulo 10: líneas rectas, vértices y lados, ángulos rectos, '
    + 'rectángulos, cuadrados, triángulos y círculos.'));

  p.append(portada);
  raiz.replaceChildren(p);

  // El primer clic es lo que autoriza el audio en el navegador.
  btn.addEventListener('click', () => {
    despertarAudio();
    sonarToque();
    verMapa();
  });
}

/* ============================================================
   MAPA DE ZONAS
   ============================================================ */
function verMapa() {
  const p = el('div', 'pantalla cielo-manana');
  const mapa = el('div', 'mapa');

  const saludo = el('div', 'saludo');
  saludo.insertAdjacentHTML('beforeend',
    dibujar(figura('triangulo-rectangulo'), { color: '#FFD8A8', marcas: 'rectos' }));
  saludo.append(el('p', '',
    '¡Hola, Marina! Elige una zona. Completa una para abrir la siguiente. 📐'));
  mapa.append(saludo);

  mapa.append(el('div', 'total-estrellas',
    `⭐ ${estado.totalEstrellas()} de ${ZONAS.length * 3} estrellas`));

  const rejilla = el('div', 'rejilla-zonas');
  ZONAS.forEach((z, i) => {
    const abierta = estado.zonaAbierta(ZONAS, i);
    const estrellas = estado.estrellasDe(z.id);

    const t = el('button', `tarjeta-zona${abierta ? '' : ' cerrada'}`, '', {
      type: 'button',
      'aria-label': `Zona ${z.n}: ${z.titulo}${abierta ? '' : ' (bloqueada)'}`,
    });

    const num = el('div', 'numero', String(z.n));
    num.style.background = z.color;
    // Texto oscuro sobre los colores claros para mantener el contraste.
    num.style.color = ['#F59E0B'].includes(z.color) ? '#3A2E10' : '#fff';

    const texto = el('div', 'texto',
      `<b>${z.icono} ${z.titulo}</b><span>${z.subtitulo}</span>`);

    t.append(num, texto);
    t.append(abierta
      ? el('div', 'estrellas', pintarEstrellas(estrellas))
      : el('div', 'candado', '🔒'));

    if (abierta) {
      t.addEventListener('click', () => {
        sonarToque();
        abrirZona(z);
      });
    }
    rejilla.append(t);
  });
  mapa.append(rejilla);

  const botones = el('div', 'fila-botones');
  const btnInforme = el('button', 'btn-chico', '📊 Informe para el papá', { type: 'button' });
  btnInforme.addEventListener('click', () => { sonarToque(); verInforme(); });
  botones.append(btnInforme);

  const btnBorrar = el('button', 'btn-chico', '🔄 Empezar de nuevo', { type: 'button' });
  btnBorrar.addEventListener('click', () => {
    if (confirm('¿Borrar todo el progreso y las estrellas?')) {
      estado.borrarTodo();
      verMapa();
    }
  });
  botones.append(btnBorrar);
  mapa.append(botones);

  p.append(mapa);
  raiz.replaceChildren(p);
}

/* ============================================================
   ABRIR UNA ZONA
   ============================================================ */
function abrirZona(z) {
  const juego = JUEGOS[z.id];
  if (!juego) throw new Error(`main.js: no hay juego para la zona "${z.id}"`);
  juego({ zona: z, onSalir: verMapa, onFin: verMapa });
}

/* ============================================================
   INFORME PARA GONZALO
   ============================================================ */
function verInforme() {
  const p = el('div', 'pantalla cielo-tarde');

  const barra = el('div', 'barra');
  const volver = el('button', 'btn-volver', '⬅ Volver', { type: 'button' });
  volver.addEventListener('click', verMapa);
  barra.append(volver, el('h2', 'titulo-zona', '📊 Cómo va Marina'));

  const cont = el('div', 'informe');

  if (!estado.hayDatosDeInforme()) {
    cont.append(el('div', 'panel',
      '<h3>Todavía no hay datos</h3>' +
      '<p>Cuando Marina juegue algunas rondas, aquí aparecerá qué conceptos ' +
      'domina y cuáles conviene repasar antes de la prueba.</p>'));
  } else {
    const filas = estado.informe();
    // `informe()` viene ordenado de peor a mejor dominio.
    const flojas = filas.filter((f) => f.acierto < 0.7 && f.total >= 2);

    /* --- Resumen accionable arriba: lo que se mira la noche antes ---
       Se nombran solo los TRES peores. Una lista de once conceptos no ayuda a
       decidir que repasar la noche antes de la prueba; el detalle completo
       esta en la tabla de mas abajo para quien lo quiera. */
    const resumen = el('div', 'panel');
    resumen.append(el('h3', '', 'Qué reforzar'));
    if (flojas.length) {
      const top = flojas.slice(0, 3).map((f) => legible(f.palabra));
      const resto = flojas.length - top.length;
      resumen.append(el('p', '',
        `Lo más urgente: <b>${top.join(', ')}</b>.`
        + (resto > 0 ? ` Hay ${resto} más en la tabla.` : '')));
    } else {
      resumen.append(el('p', '',
        'Va bien en todo lo que ha practicado. 👏'));
    }
    cont.append(resumen);

    /* --- Detalle concepto por concepto --- */
    const panel = el('div', 'panel');
    panel.append(el('h3', '', 'Detalle por concepto'));

    const tabla = el('table', 'tabla-informe');
    tabla.innerHTML =
      '<thead><tr><th>Concepto</th><th>Aciertos</th><th>Dominio</th><th></th></tr></thead>';
    const cuerpo = el('tbody');

    for (const f of filas) {
      const pct = Math.round(f.acierto * 100);
      const nivel = pct >= 80 ? 'alto' : pct >= 55 ? 'medio' : 'bajo';
      const etiqueta = nivel === 'alto' ? 'Dominado'
        : nivel === 'medio' ? 'Casi' : 'Reforzar';

      const tr = el('tr');
      tr.innerHTML =
        `<td><b>${legible(f.palabra)}</b></td>` +
        `<td>${f.bien} de ${f.total}</td>` +
        `<td><span class="barra-dominio ${nivel === 'alto' ? '' : nivel}" ` +
        `style="width:${Math.max(6, pct)}px"></span> ${pct}%</td>` +
        `<td><span class="etiqueta-nivel ${nivel}">${etiqueta}</span></td>`;
      cuerpo.append(tr);
    }
    tabla.append(cuerpo);
    const marco = el('div', 'marco-tabla');
    marco.append(tabla);
    panel.append(marco);
    cont.append(panel);

    /* --- Historial de simulacros --- */
    const sims = estado.simulacros();
    if (sims.length) {
      const ps = el('div', 'panel');
      ps.append(el('h3', '', 'Simulacros de prueba'));
      const lista = sims.slice(-5).reverse().map((s) => {
        const f = new Date(s.fecha);
        const fecha = f.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
        const hora = f.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        const pct = Math.round((s.puntaje / s.total) * 100);
        return `<li style="margin:6px 0"><b>${s.puntaje}/${s.total}</b> (${pct}%) — ${fecha} ${hora}</li>`;
      }).join('');
      ps.append(el('ul', '', lista, { style: 'list-style:none;font-size:17px;font-weight:700' }));
      cont.append(ps);
    }
  }

  p.append(barra, cont);
  raiz.replaceChildren(p);
}

/* ============================================================
   ARRANQUE
   ============================================================ */
function arrancar() {
  raiz = document.getElementById('app');
  if (!raiz) throw new Error('main.js: falta el <div id="app"> en el HTML');
  verPortada();
}

// Si el DOM todavia no esta listo, esperar. Pasa en la version compilada,
// donde el script va en el <head>.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', arrancar, { once: true });
} else {
  arrancar();
}
