# Manual — App móvil

La app móvil Karpos está pensada para campo: cuadrilla, mayordomo y monitor. Funciona offline y sincroniza al recuperar señal.

## Primer ingreso

1. Descarga Karpos del store (iOS / Android).
2. Ingresa con tu correo y contraseña; la primera vez se baja el catálogo y los lotes asignados.
3. Aprueba permisos: **cámara** (fotos de evidencia y diagnóstico), **ubicación** (asociar registros a coordenadas), **almacenamiento** (cache offline).

## Operación offline

- Todo lo que registres queda en una base local SQLite.
- El icono de sincronización en el header indica el estado: ● verde (al día), ○ ámbar (cambios pendientes), ● rojo (error).
- Pestaña **Sync** muestra el detalle y permite forzar la sincronización.

## Conflictos

- Reglas: **última escritura gana** (LWW) para notas y fotos.
- En aplicaciones químicas y pesajes, si hay conflicto el servidor lo bloquea y muestra el diff para resolución manual.
- Las eliminaciones quedan como tombstones por 30 días.
