/**
 * figuras.js — las figuras geometricas, generadas desde sus vertices.
 *
 * Por que generadas y no dibujos fijos: la p.39 del libro muestra un cuadrado
 * ROTADO, y sigue siendo un cuadrado. Si las figuras fueran dibujos fijos,
 * Marina aprenderia a reconocer solo las que estan "derechas" — justo el error
 * que la prueba busca detectar.
 *
 * Al tener los vertices como datos, ademas se puede PREGUNTAR a la figura:
 * cuantos lados tiene, cuales de sus angulos son rectos, si sus lados son
 * iguales. Las zonas no necesitan saber geometria: le preguntan a la figura.
 *
 * Todas comparten un lienzo de 100x100 para alinearse en las rejillas.
 */

/* ============================================================
   GEOMETRIA BASICA
   ============================================================ */

/** Gira un punto alrededor de un centro. Angulo en grados. */
function girar({ x, y }, grados, cx = 50, cy = 50) {
  const r = (grados * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * Math.cos(r) - dy * Math.sin(r),
    y: cy + dx * Math.sin(r) + dy * Math.cos(r),
  };
}

/** Distancia entre dos puntos. */
function distancia(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Que tan "recto" es el angulo del vertice b, entre los lados ba y bc.
 * Devuelve el coseno: 0 es exactamente recto.
 *
 * Se usa el producto punto normalizado en vez de calcular el angulo con atan2
 * porque asi no hay que preocuparse de vueltas ni de signos.
 */
function cosenoEn(a, b, c) {
  const u = { x: a.x - b.x, y: a.y - b.y };
  const v = { x: c.x - b.x, y: c.y - b.y };
  const mu = Math.hypot(u.x, u.y);
  const mv = Math.hypot(v.x, v.y);
  if (!mu || !mv) return 1;
  return (u.x * v.x + u.y * v.y) / (mu * mv);
}

/**
 * Es recto el angulo del vertice b?
 *
 * La tolerancia de 0.03 en el coseno equivale a poco menos de 2 grados de
 * desvio. Es holgada a proposito: las figuras se definen con coordenadas
 * redondas y al rotarlas aparecen decimales. Un rectangulo girado 30 grados
 * debe seguir dando "recto" en sus cuatro esquinas.
 */
export function esAnguloRecto(a, b, c) {
  return Math.abs(cosenoEn(a, b, c)) < 0.03;
}

/* ============================================================
   EL CATALOGO DE FIGURAS
   ============================================================
   Cada figura son sus vertices en el lienzo 100x100, mas su ficha:

     tipo:     como se llama (lo que hay que responder)
     lados:    cuantos lados. 0 = no tiene lados rectos (el circulo)
     rectos:   cuantos angulos rectos tiene
     curva:    true si alguno de sus lados NO es recto (la trampa de la p.26)

   Las fichas NO se calculan a partir de los puntos: se declaran. Asi una
   figura mal dibujada se nota, en vez de quedar descrita por su propio error.
*/

const CATALOGO = {
  /* ---------- Las figuras del temario ---------- */

  cuadrado: {
    nombre: 'cuadrado',
    puntos: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 75, y: 75 }, { x: 25, y: 75 }],
    lados: 4, rectos: 4, ladosIguales: true, familia: 'cuadrilatero',
  },

  rectangulo: {
    nombre: 'rectángulo',
    puntos: [{ x: 14, y: 32 }, { x: 86, y: 32 }, { x: 86, y: 68 }, { x: 14, y: 68 }],
    lados: 4, rectos: 4, ladosIguales: false, familia: 'cuadrilatero',
  },

  'rectangulo-alto': {
    nombre: 'rectángulo',
    puntos: [{ x: 32, y: 12 }, { x: 68, y: 12 }, { x: 68, y: 88 }, { x: 32, y: 88 }],
    lados: 4, rectos: 4, ladosIguales: false, familia: 'cuadrilatero',
  },

  triangulo: {
    nombre: 'triángulo',
    puntos: [{ x: 50, y: 14 }, { x: 86, y: 80 }, { x: 14, y: 80 }],
    lados: 3, rectos: 0, ladosIguales: false, familia: 'triangulo',
  },

  'triangulo-rectangulo': {
    nombre: 'triángulo rectángulo',
    // El angulo recto queda en el vertice de abajo a la izquierda.
    puntos: [{ x: 18, y: 18 }, { x: 18, y: 82 }, { x: 82, y: 82 }],
    lados: 3, rectos: 1, ladosIguales: false, familia: 'triangulo',
  },

  'triangulo-rectangulo-b': {
    nombre: 'triángulo rectángulo',
    puntos: [{ x: 80, y: 20 }, { x: 80, y: 76 }, { x: 24, y: 76 }],
    lados: 3, rectos: 1, ladosIguales: false, familia: 'triangulo',
  },

  circulo: {
    nombre: 'círculo',
    circulo: { cx: 50, cy: 50, r: 34 },
    lados: 0, rectos: 0, ladosIguales: false, familia: 'circulo',
  },

  /* ---------- Distractores: cuadrilateros que NO son rectangulos ----------
     Trampa 2 de la p.29: tienen 4 lados, pero sus esquinas no son rectas. */

  romboide: {
    nombre: 'cuadrilátero',
    puntos: [{ x: 28, y: 28 }, { x: 90, y: 28 }, { x: 72, y: 72 }, { x: 10, y: 72 }],
    lados: 4, rectos: 0, ladosIguales: false, familia: 'cuadrilatero',
  },

  rombo: {
    // 4 lados iguales pero SIN angulos rectos: no es cuadrado.
    // Es el distractor mas importante para la definicion de cuadrado.
    //
    // OJO: las dos diagonales deben ser DISTINTAS. Si miden lo mismo, la figura
    // es un cuadrado girado 45 grados y tiene 4 angulos rectos — lo contrario
    // de lo que este distractor necesita. Aqui: 76 de ancho y 56 de alto.
    nombre: 'cuadrilátero',
    puntos: [{ x: 50, y: 22 }, { x: 88, y: 50 }, { x: 50, y: 78 }, { x: 12, y: 50 }],
    lados: 4, rectos: 0, ladosIguales: true, familia: 'cuadrilatero',
  },

  trapecio: {
    nombre: 'cuadrilátero',
    puntos: [{ x: 30, y: 26 }, { x: 70, y: 26 }, { x: 88, y: 74 }, { x: 12, y: 74 }],
    lados: 4, rectos: 0, ladosIguales: false, familia: 'cuadrilatero',
  },

  'trapecio-recto': {
    // Tiene DOS angulos rectos, no cuatro. No es rectangulo.
    nombre: 'cuadrilátero',
    puntos: [{ x: 20, y: 24 }, { x: 68, y: 24 }, { x: 84, y: 78 }, { x: 20, y: 78 }],
    lados: 4, rectos: 2, ladosIguales: false, familia: 'cuadrilatero',
  },

  cometa: {
    nombre: 'cuadrilátero',
    puntos: [{ x: 50, y: 10 }, { x: 82, y: 44 }, { x: 50, y: 90 }, { x: 18, y: 44 }],
    lados: 4, rectos: 0, ladosIguales: false, familia: 'cuadrilatero',
  },

  /* ---------- Distractores curvos ----------
     Trampa 1 de la p.26: parecen triangulos o cuadrilateros, pero NO lo son.

     El libro usa DOS variantes, y las dos importan:
       a) lados curvados hacia adentro — la curva es SUAVE, casi no se nota.
          Si se exagera, el ejercicio deja de tener gracia.
       b) esquinas redondeadas — los lados si son rectos, pero las puntas
          estan romas, asi que no hay vertices.

     Motivo: un triangulo necesita 3 LINEAS RECTAS que se junten en vertices.
     Cualquiera de las dos fallas lo descalifica. */

  'curvo-3': {
    nombre: 'no es un triángulo',
    // Los tres lados hundidos, como el primero de la p.26.
    ruta: 'M 50 16 Q 58 50 84 80 Q 50 70 16 80 Q 42 50 50 16 Z',
    lados: 0, rectos: 0, curva: true, ladosIguales: false, familia: 'curva',
    razon: 'Sus lados son curvos, no son líneas rectas.',
  },

  'curvo-3-b': {
    nombre: 'no es un triángulo',
    // UN solo lado curvo, y suave. El caso mas dificil de ver.
    ruta: 'M 50 16 L 84 80 Q 50 70 16 80 Z',
    lados: 0, rectos: 0, curva: true, ladosIguales: false, familia: 'curva',
    razon: 'El lado de abajo es curvo. Un triángulo necesita 3 líneas rectas.',
  },

  'redondeado-3': {
    // El triangulo de esquinas romas de la p.26 (abajo a la derecha).
    // Los tres lados SI son rectos; lo que falla son las puntas, que estan
    // redondeadas y por lo tanto no son vertices.
    //
    // Triangulo base: (50,20) (84,78) (16,78), con las esquinas recortadas
    // y cerradas con un arco.
    nombre: 'no es un triángulo',
    ruta: 'M 44 30 Q 50 20 56 30 L 80 72 Q 85 80 75 80 '
        + 'L 25 80 Q 15 80 20 72 Z',
    lados: 0, rectos: 0, curva: true, ladosIguales: false, familia: 'curva',
    razon: 'Sus esquinas son redondeadas: no tiene vértices.',
  },

  'curvo-4': {
    // El "cuadrado de lados hundidos" de la p.26, ejercicio 5. Curva suave.
    nombre: 'no es un cuadrilátero',
    ruta: 'M 24 22 Q 50 30 76 22 Q 68 50 76 78 Q 50 70 24 78 Q 32 50 24 22 Z',
    lados: 0, rectos: 0, curva: true, ladosIguales: false, familia: 'curva',
    razon: 'Sus lados son curvos, no son líneas rectas.',
  },

  'curvo-4-b': {
    // Dos lados rectos y dos arqueados: el de la p.26 con los costados hundidos.
    nombre: 'no es un cuadrilátero',
    ruta: 'M 26 22 L 74 22 Q 66 50 74 78 L 26 78 Q 34 50 26 22 Z',
    lados: 0, rectos: 0, curva: true, ladosIguales: false, familia: 'curva',
    razon: 'Los lados de los costados son curvos.',
  },
};

/* ============================================================
   CONSULTAR UNA FIGURA
   ============================================================ */

/** Los ids del catalogo. */
export const TIPOS = Object.keys(CATALOGO);

/**
 * Devuelve la ficha de una figura, con sus puntos ya rotados.
 * Falla ruidosamente si el tipo no existe: sin fallbacks silenciosos.
 */
export function figura(tipo, rotacion = 0) {
  const base = CATALOGO[tipo];
  if (!base) throw new Error(`figuras.js: no existe la figura "${tipo}"`);

  return {
    ...base,
    id: tipo,
    rotacion,
    puntos: base.puntos ? base.puntos.map((p) => girar(p, rotacion)) : null,
  };
}

/**
 * Los angulos de una figura, uno por vertice, diciendo si cada uno es recto.
 * Devuelve [] para el circulo y para las figuras curvas: no tienen vertices.
 */
export function angulosDe(f) {
  if (!f.puntos) return [];
  const n = f.puntos.length;
  return f.puntos.map((b, i) => {
    const a = f.puntos[(i - 1 + n) % n];
    const c = f.puntos[(i + 1) % n];
    return { punto: b, recto: esAnguloRecto(a, b, c), indice: i };
  });
}

/** Las longitudes de los lados, en el orden de los vertices. */
export function ladosDe(f) {
  if (!f.puntos) return [];
  const n = f.puntos.length;
  return f.puntos.map((p, i) => distancia(p, f.puntos[(i + 1) % n]));
}

/* ============================================================
   DIBUJAR
   ============================================================ */

const PALETA = ['#A5D8FF', '#B2F2BB', '#FFD8A8', '#FFC9C9', '#D0BFFF', '#FFEC99', '#99E9F2'];

/** Un color estable por indice, para que la misma figura no cambie de color. */
export function colorDe(i = 0) {
  return PALETA[i % PALETA.length];
}

/**
 * Dibuja una figura.
 *
 * @param {object} f        la ficha que devuelve figura()
 * @param {object} opciones
 *   - color:    relleno
 *   - etiqueta: letra en el centro (A, B, C…), como en los ejercicios del libro
 *   - marcas:   'ninguna' | 'todas' | 'rectos'  → notacion de angulos
 *   - vertices: true para mostrar los vertices como puntos
 *   - clase:    clases CSS extra
 */
export function dibujar(f, opciones = {}) {
  const {
    color = '#A5D8FF',
    etiqueta = '',
    marcas = 'ninguna',
    vertices = false,
    clase = '',
  } = opciones;

  let cuerpo = '';

  if (f.circulo) {
    const { cx, cy, r } = f.circulo;
    cuerpo = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"
                      stroke="#37415155" stroke-width="2.5"/>`;
  } else if (f.ruta) {
    cuerpo = `<path d="${f.ruta}" fill="${color}" stroke="#37415155" stroke-width="2.5"
                     stroke-linejoin="round"/>`;
  } else {
    const pts = f.puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    cuerpo = `<polygon points="${pts}" fill="${color}" stroke="#37415155" stroke-width="2.5"
                       stroke-linejoin="round"/>`;
  }

  /* --- Notacion de angulos: cuadradito si es recto, arquito si no --- */
  if (marcas !== 'ninguna' && f.puntos) {
    for (const a of angulosDe(f)) {
      if (marcas === 'rectos' && !a.recto) continue;
      cuerpo += marcaAngulo(f, a.indice);
    }
  }

  if (vertices && f.puntos) {
    for (const p of f.puntos) {
      cuerpo += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"
                         fill="#1F2937" class="vertice"/>`;
    }
  }

  if (etiqueta) {
    const c = centroDe(f);
    cuerpo += `<circle cx="${c.x}" cy="${c.y}" r="11" fill="#FFFFFFDD"/>
               <text x="${c.x}" y="${c.y + 5.5}" text-anchor="middle"
                     font-size="15" font-weight="800" fill="#374151">${etiqueta}</text>`;
  }

  return `<svg viewBox="0 0 100 100" class="figura ${clase}" aria-hidden="true">${cuerpo}</svg>`;
}

/** El centro de la figura, para poner la etiqueta. */
function centroDe(f) {
  if (f.circulo) return { x: f.circulo.cx, y: f.circulo.cy };
  if (!f.puntos) return { x: 50, y: 50 };
  const n = f.puntos.length;
  return {
    x: f.puntos.reduce((s, p) => s + p.x, 0) / n,
    y: f.puntos.reduce((s, p) => s + p.y, 0) / n,
  };
}

/**
 * LA NOTACION DEL LIBRO — cuadradito si el angulo es recto, arquito si no.
 *
 * Esto es lo que Marina reconoce del libro y del geoplano. No es medir: es
 * decir "esta esquina es de las cuadradas" o "esta no". Nunca aparece un
 * numero de grados, porque la profesora lo dejo fuera del nivel.
 *
 * La marca se orienta sola segun hacia donde apuntan los dos lados, asi que
 * funciona igual con la figura rotada.
 */
export function marcaAngulo(f, indice) {
  const n = f.puntos.length;
  const b = f.puntos[indice];
  const a = f.puntos[(indice - 1 + n) % n];
  const c = f.puntos[(indice + 1) % n];

  // Vectores unitarios hacia los dos lados que salen del vertice.
  const u = normal(a, b);
  const v = normal(c, b);
  const recto = esAnguloRecto(a, b, c);

  if (recto) {
    // Cuadradito: b → b+u → b+u+v → b+v
    const t = 11;
    const p1 = { x: b.x + u.x * t, y: b.y + u.y * t };
    const p3 = { x: b.x + v.x * t, y: b.y + v.y * t };
    const p2 = { x: b.x + (u.x + v.x) * t, y: b.y + (u.y + v.y) * t };
    const pts = [p1, p2, p3].map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="#DC2626" stroke-width="2.6"
                       stroke-linejoin="round" class="marca-recto"/>`;
  }

  // Arquito. El radio se achica en los angulos abiertos: con radio fijo, un
  // angulo muy abierto dibuja un arco enorme que cruza la figura entera.
  const cos = cosenoEn(a, b, c);
  const t = cos > 0.5 ? 8 : cos > 0 ? 10 : 13;
  const p1 = { x: b.x + u.x * t, y: b.y + u.y * t };
  const p2 = { x: b.x + v.x * t, y: b.y + v.y * t };
  // Un solo barrido corto; el sentido lo decide el producto cruz.
  const cruz = u.x * v.y - u.y * v.x;
  const sentido = cruz > 0 ? 1 : 0;
  return `<path d="M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}
                   A ${t} ${t} 0 0 ${sentido} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}"
                fill="none" stroke="#7C3AED" stroke-width="2.6" class="marca-curvo"/>`;
}

/** Vector unitario de b hacia a. */
function normal(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const m = Math.hypot(dx, dy) || 1;
  return { x: dx / m, y: dy / m };
}

/* ============================================================
   LA ESCUADRA
   ============================================================
   En la p.28 el libro ensena a comprobar un angulo apoyando la escuadra
   sobre el vertice. Es lo que Marina hara en la prueba con su escuadra real,
   asi que el juego se la ofrece como ayuda, no como respuesta.
*/

/** Una escuadra en SVG, con su angulo recto marcado. */
export function escuadra(tam = 100) {
  const h = tam;
  return `
    <svg viewBox="0 0 100 100" class="escuadra" width="${h}" height="${h}" aria-hidden="true">
      <polygon points="12,88 12,20 80,88" fill="#8CE99A" fill-opacity="0.62"
               stroke="#2F9E44" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="26,74 26,42 58,74" fill="#FFFFFF" fill-opacity="0.75"
               stroke="#2F9E44" stroke-width="2"/>
      <polyline points="12,76 24,76 24,88" fill="none" stroke="#DC2626" stroke-width="3"/>
    </svg>`;
}

/* ============================================================
   LINEAS RECTAS Y CURVAS (p.19-20)
   ============================================================ */

/** Una linea recta entre dos puntos al azar del lienzo. */
export function lineaRecta(semilla = 0) {
  const variantes = [
    'M 12 78 L 88 26',
    'M 14 30 L 86 74',
    'M 20 86 L 80 14',
    'M 10 50 L 90 50',
    'M 50 12 L 50 88',
    'M 16 20 L 84 80',
  ];
  const d = variantes[semilla % variantes.length];
  return `<svg viewBox="0 0 100 100" class="figura traza" aria-hidden="true">
            <path d="${d}" fill="none" stroke="#1F2937" stroke-width="4"
                  stroke-linecap="round"/>
          </svg>`;
}

/** Una linea curva. Nunca debe poder confundirse con una recta. */
export function lineaCurva(semilla = 0) {
  const variantes = [
    'M 12 70 Q 50 12 88 70',
    'M 12 30 Q 50 92 88 30',
    'M 14 82 Q 30 20 50 50 Q 70 80 86 22',
    'M 16 20 C 70 26 30 74 84 80',
    'M 20 86 Q 84 76 78 16',
    'M 12 50 C 34 12 66 88 88 50',
  ];
  const d = variantes[semilla % variantes.length];
  return `<svg viewBox="0 0 100 100" class="figura traza" aria-hidden="true">
            <path d="${d}" fill="none" stroke="#1F2937" stroke-width="4"
                  stroke-linecap="round"/>
          </svg>`;
}
