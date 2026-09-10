# Figuras — juego de geometría para 2° básico

Juego de práctica sobre **figuras geométricas**: líneas rectas y curvas, vértices
y lados, ángulos rectos, rectángulos, cuadrados, triángulos y círculos.

Sigue el capítulo 10 del texto *Sumo Primero* 2° Básico Tomo 2 (Mineduc, Chile).

**Jugar:** https://gonzaloigb.github.io/figuras-geometria/

---

## Las 6 zonas

| # | Zona | Qué practica |
|---|---|---|
| 1 | Rectas y curvas | Distinguir línea recta de curva |
| 2 | Vértices y lados | Contar esquinas y lados. Triángulo o cuadrilátero |
| 3 | Ángulos rectos | Encontrar las esquinas cuadradas |
| 4 | ¿Qué figura es? | Rectángulo, cuadrado, triángulo, círculo |
| 5 | Constructor | **Dibujar** en la cuadrícula según medida |
| 6 | Simulacro | 12 preguntas mezcladas, sin pistas |

Cada zona se abre al conseguir al menos 1 estrella en la anterior.

---

## Tres decisiones de diseño

**1. No aparece ningún número de grados.**
A este nivel no se miden ángulos. El juego dice *ángulo recto* y usa la notación
del libro: un cuadradito donde el ángulo es recto, un arquito donde no lo es.

**2. Las figuras se muestran giradas.**
Un cuadrado rotado sigue siendo un cuadrado. Si solo se vieran figuras
"derechas", se aprendería a reconocer la posición y no la figura.

**3. Ante un error se explica la razón.**
Marcar un romboide como rectángulo responde que le faltan ángulos rectos, y
redibuja la figura con las marcas puestas para que se vea.

---

## Desarrollo

Node + Vite, JavaScript sin frameworks.

```bash
npm install
npm run dev      # servidor con recarga en vivo
npm run build    # compila a dist/index.html
```

El build produce **un solo archivo HTML** autocontenido, de unos 60 KB. Se abre
con doble clic, sin servidor, y se puede copiar a un pendrive.

Eso obliga a `format: 'iife'` en `vite.config.js`: los navegadores bloquean
`<script type="module">` bajo el protocolo `file://`, y sin eso el juego compila
bien pero abre en blanco.

### Estructura

```text
src/
  datos.js        el contenido del libro como datos
  figuras.js      las figuras en SVG, generadas desde sus vértices
  cuadricula.js   el lienzo de arrastre (eventos Pointer)
  motor.js        el ciclo de preguntas que comparten las 6 zonas
  juegos/*.js     una zona cada uno
```

`datos.js` es la fuente de verdad: ningún contenido del libro se escribe dentro
de la lógica de un minijuego.

---

## Licencia

Uso personal y educativo. El contenido pedagógico proviene del texto escolar
del Ministerio de Educación de Chile.
