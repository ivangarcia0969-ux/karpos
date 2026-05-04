# ADR-0002: Multi-tenancy con shared schema + Row-Level Security

- **Estado:** Aceptado
- **Fecha:** 2026-05-04

## Contexto

Karpos sirve a fincas individuales, cooperativas, exportadoras y holdings. Los rangos de tamaño van desde 1 finca / 5 ha hasta cientos de fincas / decenas de miles de ha. Necesitamos aislamiento estricto de datos entre tenants pero costo operativo razonable.

Opciones evaluadas:

| Opción                          | Aislamiento | Costo | Complejidad |
|---------------------------------|-------------|-------|-------------|
| Schema-per-tenant               | Alto        | Alto  | Alta (migraciones) |
| Database-per-tenant             | Muy alto    | Muy alto | Muy alta |
| Shared schema + tenant_id + RLS | Alto        | Bajo  | Media |
| Shared schema sin RLS (sólo WHERE) | Bajo    | Bajo  | Baja (peligrosa) |

## Decisión

**Shared schema con `org_id` y Row-Level Security activado en cada tabla de negocio.**

Mecanismo:

1. Cada tabla de negocio incluye `org_id uuid not null references organizations(id)`.
2. Se activa `ALTER TABLE … ENABLE ROW LEVEL SECURITY` y se crean políticas que permiten acceso solo a filas donde `org_id = current_setting('app.current_org')::uuid`.
3. La API ejecuta `SET LOCAL app.current_org = $1` al inicio de cada transacción, derivado del JWT validado.
4. El usuario de aplicación PostgreSQL **no** tiene `BYPASSRLS`. Solo el usuario de migraciones lo tiene.
5. Tablas de catálogo global (variedades de referencia, productos químicos del registro nacional) no tienen `org_id` y son de solo lectura para los tenants.

Tenants Enterprise pueden migrarse a un cluster dedicado bajo el mismo esquema sin cambios de código.

## Consecuencias

**Positivas**
- Costo de operación bajo en LATAM Starter/Pro.
- Aislamiento criptográfico-equivalente en BD: incluso un bug de WHERE no exfiltra datos.
- Backup/restore por tenant posible vía `pg_dump --where`.

**Negativas**
- Pruebas requieren simular el contexto de tenant (helper en cada test).
- Tablas muy grandes con muchos tenants requieren índices `(org_id, …)` siempre.
- Algunas operaciones cross-tenant (analítica interna) requieren un rol elevado bien controlado.

## Mitigaciones

- Linter SQL que prohíbe crear tablas de negocio sin `org_id` y sin política RLS.
- Tests de integración por defecto corren con un tenant dado y verifican que filas de otro tenant no son visibles.
- Auditoría continua: query que detecta tablas con `org_id` pero sin RLS activo, alerta en CI.
