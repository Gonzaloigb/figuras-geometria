/**
 * datos.js — TODO el contenido del capitulo 10, en un solo lugar.
 *
 * Fuente de verdad: ../../CONTENIDOS_EXTRAIDOS.md
 * Si la profesora cambia el temario, se cambia AQUI y el juego entero se adapta.
 * Ninguna definicion ni pista debe estar escrita dentro de la logica de un minijuego.
 *
 * REGLA DEL NIVEL: nunca escribir "90" ni la palabra "grados". La profesora fue
 * explicita en que a este nivel no se miden angulos. Se dice "angulo recto".
 */

/* ============================================================
   1 · LAS ZONAS DEL MAPA
   ============================================================ */
export const ZONAS = [
  {
    id: 'rectas', n: 1,
    titulo: 'Rectas y curvas',
    subtitulo: '¿Es una línea recta?',
    icono: '📏',
    color: '#4C6EF5',
    momento: 'amanecer',
    paginas: '19-20',
  },
  {
    id: 'partes', n: 2,
    titulo: 'Vértices y lados',
    subtitulo: 'Contar esquinas y lados',
    icono: '📐',
    color: '#12B886',
    momento: 'manana',
    paginas: '21-23, 26',
  },
  {
    id: 'angulos', n: 3,
    titulo: 'Ángulos rectos',
    subtitulo: 'La esquina cuadrada',
    icono: '🔲',
    color: '#F59E0B',
    momento: 'mediodia',
    paginas: '27-29',
  },
  {
    id: 'clasificar', n: 4,
    titulo: '¿Qué figura es?',
    subtitulo: 'Reconocer cada figura',
    icono: '🔷',
    color: '#7C3AED',
    momento: 'tarde',
    paginas: '29-34, 39-40',
  },
  {
    id: 'construir', n: 5,
    titulo: 'Constructor',
    subtitulo: 'Dibujar en la cuadrícula',
    icono: '✏️',
    color: '#E64980',
    momento: 'atardecer',
    paginas: '30, 40',
  },
  {
    id: 'simulacro', n: 6,
    titulo: 'Simulacro',
    subtitulo: 'Como la prueba de verdad',
    icono: '🏁',
    color: '#F76707',
    momento: 'noche',
    paginas: 'todo',
  },
];

/* ============================================================
   2 · LAS DEFINICIONES DEL LIBRO
   ============================================================
   Textuales, o lo mas cerca posible. Son las que se muestran como
   recordatorio y las que sustentan las pistas ante un error.
*/
export const DEFINICIONES = {
  'linea-recta': {
    nombre: 'línea recta',
    texto: 'La línea que se forma al estirar un cordel se llama línea recta.',
    pagina: 19,
  },
  triangulo: {
    nombre: 'triángulo',
    texto: 'La figura que tiene 3 líneas rectas se llama triángulo.',
    pagina: 23,
    vertices: 3, lados: 3,
  },
  cuadrilatero: {
    nombre: 'cuadrilátero',
    texto: 'La figura que tiene 4 líneas rectas se llama cuadrilátero.',
    pagina: 23,
    vertices: 4, lados: 4,
  },
  vertice: {
    nombre: 'vértice',
    texto: 'Las esquinas de los triángulos y cuadriláteros se llaman vértices.',
    pagina: 23,
  },
  lado: {
    nombre: 'lado',
    texto: 'La línea recta que une dos vértices se llama lado.',
    pagina: 23,
  },
  'angulo-recto': {
    nombre: 'ángulo recto',
    texto: 'La esquina que se forma al doblar un papel se llama ángulo recto.',
    pagina: 27,
  },
  rectangulo: {
    nombre: 'rectángulo',
    texto: 'Un cuadrilátero se llama rectángulo si tiene sus 4 ángulos rectos.',
    pagina: 29,
    vertices: 4, lados: 4,
  },
  cuadrado: {
    nombre: 'cuadrado',
    texto: 'Un cuadrilátero que tiene sus 4 lados de igual longitud '
         + 'y sus 4 ángulos rectos se llama cuadrado.',
    pagina: 32,
    vertices: 4, lados: 4,
  },
  'triangulo-rectangulo': {
    nombre: 'triángulo rectángulo',
    texto: 'Un triángulo que tiene un ángulo recto se llama triángulo rectángulo.',
    pagina: 34,
    vertices: 3, lados: 3,
  },
  circulo: {
    nombre: 'círculo',
    texto: 'Los círculos son figuras que no tienen líneas rectas.',
    pagina: 37,
  },
};

export function definicion(id) {
  const d = DEFINICIONES[id];
  if (!d) throw new Error(`datos.js: no existe la definicion "${id}"`);
  return d;
}

/* ============================================================
   3 · LAS FIGURAS QUE SE CLASIFICAN
   ============================================================
   Que responde el juego cuando pregunta "que figura es esta".

   Las claves son ids del catalogo de figuras.js. El campo `respuesta` es la
   categoria correcta; `distractores` no tienen respuesta propia porque la
   pregunta que reciben es otra ("es un rectangulo? si/no").
*/
export const CLASIFICABLES = {
  cuadrado: 'cuadrado',
  rectangulo: 'rectangulo',
  'rectangulo-alto': 'rectangulo',
  triangulo: 'triangulo',
  'triangulo-rectangulo': 'triangulo-rectangulo',
  'triangulo-rectangulo-b': 'triangulo-rectangulo',
  circulo: 'circulo',
};

/** Las 5 categorias que la prueba pide distinguir. */
export const CATEGORIAS = [
  { id: 'cuadrado', nombre: 'cuadrado' },
  { id: 'rectangulo', nombre: 'rectángulo' },
  { id: 'triangulo', nombre: 'triángulo' },
  { id: 'triangulo-rectangulo', nombre: 'triángulo rectángulo' },
  { id: 'circulo', nombre: 'círculo' },
];

/* Los cuadrilateros que NO son rectangulos — la trampa de la p.29. */
export const NO_RECTANGULOS = ['romboide', 'rombo', 'trapecio', 'cometa'];

/* Las figuras que NO tienen lados rectos — la trampa de la p.26. */
export const CURVAS = ['curvo-3', 'curvo-3-b', 'redondeado-3', 'curvo-4', 'curvo-4-b'];

/* ============================================================
   4 · LAS ADIVINANZAS (p.40, ejercicio 2)
   ============================================================
   Textuales del libro. Se describe la figura por sus propiedades.
*/
export const ADIVINANZAS = [
  { pista: 'Tiene 4 lados y 4 ángulos rectos.', respuesta: 'rectangulo' },
  { pista: 'Tiene 4 ángulos rectos y todos sus lados miden lo mismo.', respuesta: 'cuadrado' },
  { pista: 'Un triángulo con un ángulo recto.', respuesta: 'triangulo-rectangulo' },
  { pista: 'Tiene 3 vértices y 3 lados.', respuesta: 'triangulo' },
  { pista: 'No tiene ninguna línea recta.', respuesta: 'circulo' },
  { pista: 'Tiene 4 vértices y sus lados opuestos miden lo mismo.', respuesta: 'rectangulo' },
];

/* ============================================================
   5 · LAS MEDIDAS PARA CONSTRUIR (p.30, 31, 33, 40)
   ============================================================
   Textuales del libro. `lado` marca el cuadrado, donde los dos lados son iguales.
*/
export const CONSTRUCCIONES = [
  { forma: 'rectangulo', ancho: 3, alto: 6, texto: 'un rectángulo de 3 cm y 6 cm', pagina: 30 },
  { forma: 'rectangulo', ancho: 1, alto: 7, texto: 'un rectángulo de 1 cm y 7 cm', pagina: 30 },
  { forma: 'rectangulo', ancho: 5, alto: 4, texto: 'un rectángulo de 5 cm y 4 cm', pagina: 30 },
  { forma: 'rectangulo', ancho: 4, alto: 7, texto: 'un rectángulo de 4 cm y 7 cm', pagina: 31 },
  { forma: 'cuadrado', ancho: 5, alto: 5, texto: 'un cuadrado de lado 5 cm', pagina: 33 },
  { forma: 'cuadrado', ancho: 3, alto: 3, texto: 'un cuadrado de lado 3 cm', pagina: 40 },
  { forma: 'cuadrado', ancho: 4, alto: 4, texto: 'un cuadrado de lado 4 cm', pagina: 33 },
  { forma: 'rectangulo', ancho: 2, alto: 6, texto: 'un rectángulo de 2 cm y 6 cm', pagina: 30 },
];

/* ============================================================
   6 · PISTAS ANTE ERRORES
   ============================================================
   No basta con decir "incorrecto": hay que decir POR QUE, y la razon tiene
   que corresponder a la figura preguntada. Estas son las confusiones que el
   capitulo provoca a proposito.
*/

/**
 * Por que esta figura no es lo que Marina creyo.
 *
 * @param {string} creyo   la categoria que marco
 * @param {object} f       la ficha real de la figura (de figuras.js)
 */
export function pistaDeError(creyo, f) {
  // Las curvas traen su propia razon en el catalogo.
  if (f.curva) return f.razon || 'No tiene todos sus lados rectos.';

  if (creyo === 'rectangulo') {
    if (f.familia === 'cuadrilatero' && f.rectos < 4) {
      return f.rectos === 0
        ? 'Tiene 4 lados, pero ninguna de sus esquinas es un ángulo recto. '
          + 'Un rectángulo necesita los 4.'
        : `Tiene 4 lados, pero solo ${f.rectos} de sus esquinas son ángulos rectos. `
          + 'Un rectángulo necesita los 4.';
    }
    if (f.familia === 'triangulo') return 'Tiene 3 lados. Un rectángulo tiene 4.';
    if (f.familia === 'circulo') return 'El círculo no tiene lados rectos.';
  }

  if (creyo === 'cuadrado') {
    if (f.id === 'rectangulo' || f.id === 'rectangulo-alto') {
      return 'Es un rectángulo: tiene sus 4 ángulos rectos. Para ser cuadrado, '
           + 'sus 4 lados tendrían que medir lo mismo.';
    }
    if (f.ladosIguales && f.rectos < 4) {
      return 'Sus 4 lados sí miden lo mismo, pero sus esquinas no son ángulos rectos. '
           + 'El cuadrado necesita las dos cosas.';
    }
    if (f.familia === 'triangulo') return 'Tiene 3 lados. Un cuadrado tiene 4.';
  }

  if (creyo === 'triangulo-rectangulo') {
    if (f.familia === 'triangulo' && f.rectos === 0) {
      return 'Es un triángulo, pero ninguna de sus esquinas es un ángulo recto.';
    }
    if (f.familia === 'cuadrilatero') return 'Tiene 4 lados. Los triángulos tienen 3.';
  }

  if (creyo === 'triangulo' && f.familia === 'cuadrilatero') {
    return 'Tiene 4 lados. Un triángulo tiene 3.';
  }

  if (creyo === 'circulo' && f.lados > 0) {
    return `Tiene ${f.lados} lados rectos. El círculo no tiene ninguno.`;
  }

  // Caso general: decir que es en realidad.
  return `Es ${conArticulo(f.nombre)}.`;
}

/** "un cuadrado" / "una figura" — para que las pistas suenen naturales. */
export function conArticulo(nombre) {
  return /^(figura|línea)/.test(nombre) ? `una ${nombre}` : `un ${nombre}`;
}

/** Pista al contar mal vertices o lados. */
export function pistaDeConteo(que, correcto, familia) {
  const cosa = que === 'vertices' ? 'vértices' : 'lados';
  const donde = que === 'vertices' ? 'las esquinas' : 'las líneas rectas del borde';
  const regla = familia === 'triangulo'
    ? 'Los triángulos siempre tienen 3 vértices y 3 lados.'
    : familia === 'cuadrilatero'
      ? 'Los cuadriláteros siempre tienen 4 vértices y 4 lados.'
      : '';
  return `Cuenta ${donde}: hay ${correcto}. ${regla}`.trim();
}

/** Pista al construir una figura con la medida equivocada. */
export function pistaDeMedida(pedido, hecho) {
  const { ancho: pa, alto: pl } = pedido;
  const { ancho: ha, alto: hl } = hecho;

  // Acepta la figura girada: 3x6 y 6x3 son el mismo rectangulo.
  const pedidoOrd = [pa, pl].sort((a, b) => a - b);
  const hechoOrd = [ha, hl].sort((a, b) => a - b);

  if (hechoOrd[0] === pedidoOrd[0] || hechoOrd[1] === pedidoOrd[1]) {
    return 'Un lado quedó bien. Cuenta los cuadraditos del otro: '
         + `necesitas ${pedidoOrd[0]} y ${pedidoOrd[1]}.`;
  }
  if (pedido.forma === 'cuadrado' && ha !== hl) {
    return `Dibujaste ${ha} por ${hl}. En un cuadrado los 4 lados miden lo mismo: `
         + `${pa} y ${pa}.`;
  }
  return `Dibujaste ${ha} por ${hl}. Cuenta de nuevo: necesitas ${pa} y ${pl}.`;
}
