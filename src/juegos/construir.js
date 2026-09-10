/**
 * ZONA 5 — Constructor
 *
 * Contenido del temario: "construir rectangulos y cuadrados segun medida
 * usando cuadricula" (p. 30 ejercicio 4, p. 31, p. 33, p. 40 ejercicio 4).
 *
 * Marina marca una esquina y arrastra hasta formar la figura pedida.
 * Se acepta la figura GIRADA: pedir 3 cm y 6 cm acepta tambien 6 por 3,
 * igual que en el libro, donde el rectangulo puede quedar en cualquier
 * posicion de la cuadricula.
 */

import { crearCuadricula } from '../cuadricula.js';
import { CONSTRUCCIONES, definicion, pistaDeMedida } from '../datos.js';
import { el, barajar } from '../util.js';
import { correrZona } from '../motor.js';

const TOTAL = 6;

export function jugarConstruir({ zona, onSalir, onFin }) {
  // Sin repetir medidas dentro de una misma ronda.
  const tanda = barajar(CONSTRUCCIONES).slice(0, TOTAL);

  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    onFin,
    montar(ctx, i) {
      montarConstruccion(ctx, tanda[i % tanda.length]);
    },
  });
}

function montarConstruccion(ctx, pedido) {
  ctx.pedir({
    instruccion: `Dibuja ${pedido.texto}`,
    apoyo: pedido.forma === 'cuadrado'
      ? definicion('cuadrado').texto
      : 'Cada cuadradito mide 1 cm. Marca una esquina y arrastra.',
  });

  ctx.zonaJuego.append(el('div', 'pedido', `${pedido.ancho} cm  ×  ${pedido.alto} cm`));

  let hecho = null;

  const rejilla = crearCuadricula({
    cols: 12,
    filas: 7,
    onDibujar(r) {
      hecho = r;
      btnOk.disabled = false;
    },
  });
  ctx.zonaJuego.append(rejilla.nodo);
  ctx.zonaJuego.append(el('div', 'medida-guia', 'Cada cuadradito = 1 cm'));

  const pie = el('div', 'fila-botones');
  const btnBorrar = el('button', 'btn-chico', '🧽 Borrar', { type: 'button' });
  const btnOk = el('button', 'btn-chico destacado', '✅ Listo', { type: 'button' });
  btnOk.disabled = true;
  pie.append(btnBorrar, btnOk);
  ctx.zonaJuego.append(pie);

  btnBorrar.addEventListener('click', () => {
    rejilla.limpiar();
    hecho = null;
    btnOk.disabled = true;
  });

  btnOk.addEventListener('click', () => {
    if (btnOk.disabled) return;
    btnOk.disabled = true;
    btnBorrar.disabled = true;
    rejilla.bloquear();

    // Girada cuenta igual: se comparan las medidas ordenadas.
    const esperado = [pedido.ancho, pedido.alto].sort((a, b) => a - b);
    const logrado = [hecho.ancho, hecho.alto].sort((a, b) => a - b);
    const acerto = esperado[0] === logrado[0] && esperado[1] === logrado[1];

    if (!acerto) rejilla.pintarSolucion(pedido);

    ctx.responder({
      acerto,
      concepto: `construir-${pedido.forma}`,
      mensajeBien: `¡Perfecto! ${hecho.ancho} cm por ${hecho.alto} cm. 🎉`,
      mensajeMal: `Dibujaste ${hecho.ancho} cm por ${hecho.alto} cm.`,
      pista: pistaDeMedida(pedido, hecho),
    });
  });
}
