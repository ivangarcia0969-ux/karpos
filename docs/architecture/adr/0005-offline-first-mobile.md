# ADR-0005: Móvil offline-first con sync diferencial

- **Estado:** Aceptado
- **Fecha:** 2026-05-04

## Contexto

Los usuarios primarios de la app móvil son cuadrillas, monitores y mayordomos en lotes con cobertura intermitente o nula. La app debe ser usable durante una jornada completa sin conexión y reconciliar al volver a línea. Volumen objetivo: 10.000 registros sincronizables en menos de 60 s sobre 4G.

## Decisión

- **Almacén local**: WatermelonDB sobre SQLite (lazy-loaded, optimizado para listas grandes).
- **Sync diferencial**: cliente solicita `pull?since=<timestamp_lwm>`; servidor responde con eventos creados/actualizados/eliminados desde esa marca + nueva LWM (last-write mark). Cliente envía `push` con cambios locales y resuelve conflictos con LWW (last-write-wins) por defecto, con override manual para campos críticos (cosecha, aplicaciones).
- **Identificadores**: client-generated UUIDv7 (ordenable temporalmente). Cero dependencia de IDs autonuméricos.
- **Resolución de conflictos**:
  - Entidades simples (notas, fotos): LWW.
  - Entidades sensibles (aplicación química, pesaje): el servidor rechaza y devuelve diff para resolución manual.
  - Eliminaciones: tombstones por 30 días.
- **Adjuntos** (fotos): subida diferida a S3 con backoff exponencial; el registro queda con `attachment_status = pending` hasta que el job confirma.
- **Conflict-free counters** (rendimientos por cuadrilla): CRDT G-Counter local, suma en servidor.

## Consecuencias

**Positivas**
- Productividad de cuadrilla independiente del estado de red.
- Menor consumo de datos: solo el delta.
- Resiliencia ante fallos de servidor: el campo no se detiene.

**Negativas**
- Complejidad de upgrades de schema (migraciones tanto en SQLite cliente como en servidor).
- Pruebas de conflicto requieren matriz de escenarios (cliente A vs B vs servidor).

## Mitigaciones

- Suite de tests de propiedad para el reconciliador.
- Ventana de retención de tombstones suficiente para usuarios que se desconectan semanas.
- Métricas de telemetría: tiempo de pull, tamaño de payload, conflictos por entidad.
