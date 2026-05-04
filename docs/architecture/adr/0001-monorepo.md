# ADR-0001: Monorepo con pnpm + Turborepo

- **Estado:** Aceptado
- **Fecha:** 2026-05-04

## Contexto

Karpos tiene cuatro aplicaciones (`apps/web`, `apps/mobile`, `apps/api`, `apps/ml`) y al menos cinco paquetes compartidos (`ui`, `types`, `sdk`, `i18n`, `config`). Queremos:

- Tipos del API consumidos sin duplicación por web y mobile.
- Cambios en `packages/ui` reflejados inmediatamente en `apps/web`.
- Pipeline de CI que solo ejecute lo afectado por un PR.
- Rollouts coordinados (un cambio de schema en API puede requerir bumps en SDK + UI).

## Decisión

Monorepo único con **pnpm workspaces** + **Turborepo**.

- pnpm: gestor de paquetes con symlinks + content-addressable store. Reduce instalación a una fracción del tiempo de npm/yarn y enforza graph correctness.
- Turborepo: orquestador de tareas con caché remoto (Vercel Remote Cache opcional) y detección de afectados.

`apps/ml` (Python) no entra al graph de pnpm pero comparte el repo y el pipeline de CI; usa Poetry/uv internamente.

## Consecuencias

**Positivas**
- Refactors cross-app en un solo PR.
- CI 3–10× más rápido por cache de tareas.
- Versionado coherente del producto.

**Negativas**
- Onboarding requiere conocer pnpm + Turborepo (no son universales).
- Riesgo de acoplamiento implícito entre apps si no se respetan los límites de los paquetes.

## Mitigaciones

- Reglas de ESLint que prohíben imports cross-app directos (todo va por `packages/*`).
- Generación automática de `packages/types` desde el OpenAPI/GraphQL del API (no edición manual).
