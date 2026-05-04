# Manual — Cosecha360

Plan de cosecha, pesajes y trazabilidad lote → pallet.

## Plan de temporada

1. Consola → **Cosecha360** → **Nuevo plan**.
2. Selecciona lote y temporada. Karpos sugiere un rendimiento esperado basado en histórico + modelo + observación de floración.
3. Define ventana esperada (fechas inicio y fin).
4. Aprobar pasa el plan a estado *active*.

## Abrir un lote de cosecha

Cada día de cosecha abre uno o varios lotes. El lote es la unidad mínima trazable.

1. **Abrir lote** → asigna código (ej. `C-2026-04-12-A`), variedad y cuadrilla.
2. Conforme se reciben canastas o vehículos, se registran pesajes.

## Pesajes

- **Móvil**: la cuadrilla pesa por canasta y registra. Si no hay señal, queda offline.
- **Báscula**: ticket de báscula con número, vehículo, conductor, peso bruto y tara. Karpos calcula neto.
- Cada ticket queda asociado al lote y al evento de auditoría correspondiente.

## Cierre y trazabilidad

Al cerrar el lote, se genera un código GS1-128 (SSCC) opcional para asociarlo a pallets en empaque. La cadena `plot → harvest_lot → packing_lot → pallet → container → shipment` queda en `traceability_links` y es consultable por QR público.

## Forecast

El modelo (`apps/ml`) predice tonelaje al cierre de temporada con LightGBM cuando hay histórico suficiente, o blend mediana + factor de floración cuando no. Las predicciones traen intervalo de confianza.
