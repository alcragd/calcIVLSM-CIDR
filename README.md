# Calculadora IP — CIDR y VLSM

Aplicación estática en HTML5, CSS3, Bootstrap 5 y jQuery. No requiere Node.js ni backend.

## Uso

Abrir `index.html` directamente en un navegador con conexión a internet.
O directamente en [este enlace](https://alcragd.github.io/calcIVLSM-CIDR/)

La pestaña **CIDR** acepta prefijo, máscara o ambos (si se proporcionan ambos deben ser consistentes). La pestaña **VLSM** ordena los requerimientos de mayor a menor, asigna bloques alineados y muestra espacio usado, restante y desperdicio.

## Estructura

- `index.html`: interfaz y formularios.
- `css/styles.css`: estilos complementarios.
- `js/ip-utils.js`: validación y conversiones IPv4.
- `js/cidr-calculator.js`: cálculo CIDR.
- `js/vlsm-calculator.js`: asignación VLSM.
- `js/app.js`: eventos y renderizado.

Los botones de ejemplo cubren `192.168.10.0/24` y VLSM `A=100, B=50, C=25, D=10`.
