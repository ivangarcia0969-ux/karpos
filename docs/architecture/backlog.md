# Backlog priorizado — Karpos

Versión 1.0 · 2026-05-04 · Vista por épicas con criterios de aceptación.

## Iteración 1 — Foundations (sprint 1-2)

### EPIC-001 · Multi-tenancy con RLS

- **US-001-01** Como plataforma, aíslo datos por `org_id` para garantizar que un tenant no vea datos de otro.
  - DOD: 100% de tablas con `org_id` tienen política RLS y test de aislamiento; query elevada de "tenant A → tenant B" devuelve 0 filas.
- **US-001-02** Como dev, ejecuto `pnpm db:migrate` y obtengo el schema completo en local.
  - DOD: script `scripts/migrate.mjs` aplica todas las migraciones de forma idempotente; checksum por archivo guardado en `karpos._migrations`.

### EPIC-002 · IAM + RBAC + ABAC

- **US-002-01** Como admin, invito a un usuario a mi organización con un rol asignado.
- **US-002-02** Como dev, mis endpoints validan permisos vía `@Permissions(...)` y devuelven 403 si faltan.
- **US-002-03** Como admin, genero API keys con scopes restringidos.

## Iteración 2 — Core de campo (sprint 3-4)

### EPIC-010 · Predios

- **US-010-01** Crear, editar, eliminar fincas con geometrías PostGIS.
- **US-010-02** Mapa con MapLibre que muestra todas las fincas y permite editar polígonos.
- **US-010-03** Censo automático de árboles por marco de plantación.

### EPIC-011 · Bitácora Verde

- **US-011-01** Registrar labor desde web y móvil offline.
- **US-011-02** Adjuntar fotos georreferenciadas.
- **US-011-03** Exportar destajo a planilla Excel.

### EPIC-012 · Fenoflow

- **US-012-01** Catálogo de perfiles BBCH para 6 cultivos prioritarios.
- **US-012-02** Cálculo de GDD diario (single-triangle, double-sine).
- **US-012-03** Alertas de etapa crítica.

## Iteración 3 — Sanidad y Cosecha (sprint 5-6)

### EPIC-013 · Sanidad+

- **US-013-01** Registrar monitoreo con IA opcional.
- **US-013-02** Registrar aplicación con cálculo automático de PHI/REI y bloqueo de cosecha.
- **US-013-03** Anular aplicación con razón obligatoria; registro queda en hash chain.

### EPIC-014 · Cosecha360

- **US-014-01** Crear plan de cosecha con forecast del modelo ML.
- **US-014-02** Abrir lote, registrar pesajes y tickets de báscula.
- **US-014-03** Cierre de lote genera SSCC y publica QR.

## Iteración 4 — Inteligencia + Trazabilidad (sprint 7-8)

### EPIC-015 · Karpos IQ

- **US-015-01** Pregunta libre con RAG sobre corpus + datos del tenant.
- **US-015-02** Citas verificables; cada respuesta enlaza fuentes.
- **US-015-03** Sesiones persistentes y exportables.

### EPIC-016 · EcoSat

- **US-016-01** Ingesta nightly de Sentinel-2 vía Copernicus.
- **US-016-02** NDVI/NDRE/NDMI por lote, gráfico temporal.

### EPIC-017 · Trazabilidad

- **US-017-01** Genealogía lote → pallet → contenedor.
- **US-017-02** Portal QR público con prácticas y certificaciones.

## Iteración 5 — Operación (sprint 9-10)

### EPIC-020 · Empaque y Frío
### EPIC-021 · Cuadrillas y nómina
### EPIC-022 · Costos & Rentabilidad
### EPIC-023 · CertiBox

## Iteración 6 — Mercado y monetización (sprint 11-12)

### EPIC-030 · Stripe + Wompi
### EPIC-031 · Marketplace de Insumos
### EPIC-032 · Panel Ejecutivo
### EPIC-033 · Manuales completos + onboarding

---

## Dependencias críticas

- EPIC-001 (RLS) bloquea todos los demás módulos.
- EPIC-002 (IAM) bloquea todo flujo autenticado.
- EPIC-014 depende de EPIC-013 para validar PHI antes de cosechar.
- EPIC-015 depende del corpus vectorizado y del servicio ML disponible.
- EPIC-017 depende de EPIC-014 + EPIC-020.
