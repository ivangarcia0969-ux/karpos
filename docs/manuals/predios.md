# Manual — Predios

Predios es el módulo donde se definen fincas, sectores, lotes y árboles. Es la columna vertebral; sin un lote registrado no se pueden registrar labores ni cosechas.

## Crear una finca

1. Consola → **Predios** → **Nueva finca**.
2. Asigna un código corto (ej. `F-001`), nombre, país, región y zona horaria.
3. Dibuja el polígono de la finca en el mapa o sube un GeoJSON.
4. Guarda. La finca aparecerá en el listado.

## Crear un lote

1. Abre la finca → pestaña **Lotes** → **Nuevo lote**.
2. Asigna código, especie, variedad, patrón, sistema de conducción.
3. Define marco de plantación (distancia entre hileras y entre árboles).
4. Dibuja el polígono o impórtalo.
5. La aplicación calcula el número de árboles según el marco y el área.

## Censo de árboles

Para fincas que requieren trazabilidad árbol a árbol (uva fina, manzano alta densidad), genera un censo:

1. Lote → **Acciones** → **Generar censo de árboles**.
2. Imprime las etiquetas QR (las puedes pegar en cada poste o tutor).
3. Desde la app móvil, al escanear un QR queda asociado a un árbol único.

## Mapas y superposiciones

- **NDVI / NDRE**: si tu plan incluye EcoSat, las capas aparecen automáticamente.
- **Sensores**: cada sensor se ubica en su coordenada y se puede consultar al hacer clic.
