/**
 * estado.js — progreso de Marina, guardado en el navegador (localStorage).
 *
 * Guarda dos cosas distintas:
 *  1. Estrellas por zona → para el mapa y los desbloqueos.
 *  2. Aciertos y fallos POR CONCEPTO → esto alimenta el informe para Gonzalo,
 *     que es lo que convierte el juego en herramienta de estudio.
 *
 * Aqui un "concepto" es lo que en el juego de ingles era una palabra:
 * "rectangulo", "angulo-recto", "vertices-triangulo". La estructura es la misma.
 *
 * CLAVE distinta a la del juego de ingles: los dos juegos pueden convivir en el
 * mismo navegador sin pisarse el progreso.
 */

const CLAVE = 'figuras-geometricas-v1';

const INICIAL = {
  estrellas: {},   // { rectas: 3, angulos: 2, ... }
  palabras: {},    // { rectangulo: {bien: 4, mal: 1}, ... }
  simulacros: [],  // historial: [{fecha, puntaje, total}]
};

let datos = cargar();

function cargar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return structuredClone(INICIAL);
    const guardado = JSON.parse(crudo);
    return { ...structuredClone(INICIAL), ...guardado };
  } catch {
    // localStorage puede fallar (modo privado, permisos). El juego debe
    // funcionar igual, solo que sin recordar el progreso.
    return structuredClone(INICIAL);
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    /* sin persistencia: el juego sigue funcionando en esta sesion */
  }
}

/* ---------- Estrellas y desbloqueo ---------- */

export function estrellasDe(zonaId) {
  return datos.estrellas[zonaId] || 0;
}

export function guardarEstrellas(zonaId, cantidad) {
  const previo = estrellasDe(zonaId);
  // Nunca bajar el record: si ya saco 3, un intento peor no se lo quita.
  if (cantidad > previo) {
    datos.estrellas[zonaId] = cantidad;
    guardar();
  }
}

export function totalEstrellas() {
  return Object.values(datos.estrellas).reduce((s, n) => s + n, 0);
}

/**
 * Una zona esta abierta si es la primera, o si la anterior tiene
 * al menos 1 estrella. No exige perfeccion para avanzar.
 */
export function zonaAbierta(zonas, indice) {
  if (indice === 0) return true;
  return estrellasDe(zonas[indice - 1].id) >= 1;
}

/* ---------- Registro por concepto (el informe) ---------- */

export function registrar(palabra, acerto) {
  if (!palabra) return;
  const p = (datos.palabras[palabra] ||= { bien: 0, mal: 0 });
  if (acerto) p.bien += 1;
  else p.mal += 1;
  guardar();
}

/**
 * Devuelve los conceptos ordenados de peor a mejor dominio.
 * Es lo que Gonzalo mira la noche antes de la prueba.
 */
export function informe() {
  return Object.entries(datos.palabras)
    .map(([palabra, p]) => {
      const total = p.bien + p.mal;
      return {
        palabra,
        bien: p.bien,
        mal: p.mal,
        total,
        acierto: total ? p.bien / total : 0,
      };
    })
    .sort((a, b) => a.acierto - b.acierto || b.mal - a.mal);
}

export function hayDatosDeInforme() {
  return Object.keys(datos.palabras).length > 0;
}

/* ---------- Simulacros ---------- */

export function guardarSimulacro(puntaje, total) {
  datos.simulacros.push({
    fecha: new Date().toISOString(),
    puntaje,
    total,
  });
  guardar();
}

export function simulacros() {
  return datos.simulacros;
}

/* ---------- Reinicio ---------- */

export function borrarTodo() {
  datos = structuredClone(INICIAL);
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* nada que hacer */
  }
}
