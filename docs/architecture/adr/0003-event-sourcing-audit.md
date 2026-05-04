# ADR-0003: Auditoría inmutable por event sourcing en dominios sensibles

- **Estado:** Aceptado
- **Fecha:** 2026-05-04

## Contexto

Tres dominios tienen requisitos legales o de certificación de inmutabilidad y trazabilidad completa:

- **Aplicaciones químicas** (Sanidad+): GlobalG.A.P. y normativas locales (Resolución ICA, EU SUR) exigen registro inalterable de qué se aplicó, cuándo, quién, dónde y con qué dosis.
- **Cosecha y pesajes** (Cosecha360 + Empaque): la trazabilidad lote → pallet → contenedor debe sobrevivir a cualquier edición; auditorías de exportación exigen el log original.
- **Inventarios** (Empaque y Frío): movimientos de stock no se editan, se compensan.

CRUD plano sobre estas tablas no cumple. Requerimos inmutabilidad.

## Decisión

Event sourcing **acotado a estos tres dominios**. El resto del sistema sigue CRUD pragmático con auditoría ligera (`created_at`, `updated_at`, `updated_by`).

Modelo:

- Tabla `audit_events` (Timescale hypertable, particionada por mes) con columnas:
  - `event_id uuid PK`
  - `org_id uuid`
  - `aggregate_type text` (`spray_record`, `harvest_lot`, `pallet`, …)
  - `aggregate_id uuid`
  - `seq bigint` (secuencia por agregado, único compuesto)
  - `event_type text`
  - `payload jsonb`
  - `actor_id uuid` (usuario)
  - `actor_role text`
  - `client_meta jsonb` (IP, user-agent, app, versión)
  - `occurred_at timestamptz`
  - `recorded_at timestamptz default now()`
  - `prev_hash bytea`, `hash bytea` — encadenamiento por `(org_id, aggregate_type)`

- **Inmutabilidad** garantizada por: revocación de `UPDATE` y `DELETE` al rol de aplicación; sólo `INSERT`. La compensación se modela como evento nuevo (`SprayRecordVoided`), nunca como UPDATE.

- **Read models** mantenidos por proyectores (idempotentes, idempotency key = `event_id`) en tablas regulares optimizadas para consulta.

- **Verificación**: cada inicio de día un job recomputa el hash chain por `(org_id, aggregate_type)` y alerta si difiere.

## Consecuencias

**Positivas**
- Cumplimiento GlobalG.A.P. demostrable.
- Reproducibilidad: el estado actual se reconstruye desde los eventos.
- Investigación forense trivial: línea temporal completa por agregado.

**Negativas**
- Mayor complejidad de modelado en los tres dominios.
- Tamaño de almacenamiento crece linealmente con eventos; mitigado por compresión Timescale.
- Migraciones de evolución de schema requieren versionado de eventos.

## Mitigaciones

- Plantilla y tests de proyector por dominio.
- Versionado de eventos: campo `event_version` y upcasters.
- Compresión Timescale automática a >30 días.
