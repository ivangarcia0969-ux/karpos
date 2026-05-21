---
name: karpos
description: Contexto del SaaS Karpos (gestión frutícola multi-tenant) — arquitectura, módulos, convenciones, deploy. Cargá esta skill al inicio de cualquier sesión de trabajo sobre el monorepo `frutales/` para no perder el hilo entre conversaciones.
---

# Karpos — onboarding rápido

Estás trabajando sobre **Karpos**, un SaaS multi-tenant para gestión frutícola.
La referencia técnica completa está en `docs/KARPOS.md` (200+ líneas, schema,
endpoints, deploy, decisiones). Léela cuando necesites detalle.

Lo que sigue es lo mínimo para no romper convenciones.

## Estado actual (2026-05-21)

- Fase 1.6 desplegada en producción: `app.karpos.surcoapp.tech`.
- VPS Hostinger KVM 8 (`2.24.89.123`) con Caddy + Docker. Karpos en `127.0.0.1:5433/4100/3100`.
- Aislado de Supabase + LibreChat del usuario que ya viven en el mismo VPS.
- Demo login: `demo@karpos.com` / `demo1234`.
- 5 módulos operativos con CRUD funcional: Predios, Bitácora Verde, Fenoflow, Sanidad+, Cosecha360. Más Catálogos (especies + variedades + 20 fitosanitarios ICA).

## Stack — no proponer cambios sin razón fuerte

| Capa | Tecnología |
|------|------------|
| Web | Next.js 14 app router + Tailwind + lucide-react |
| API | NestJS 10 + Fastify (cookie auth con JWT HS256) |
| DB | Postgres 16 **vanilla** (sin Timescale/PostGIS/pgvector — Fase 3+) |
| ORM | Drizzle |
| Auth | email+password con bcryptjs + jose JWT (NO Keycloak) |
| Pkg | pnpm workspaces monorepo |
| Deploy | Docker Compose + Caddy del host |

Geometrías van en `jsonb` (GeoJSON), NO PostGIS. Multi-tenant en código (no RLS DB).

## Estructura del repo

```
apps/api      — NestJS hexagonal por dominio
apps/web      — Next.js con /console (autenticado)
apps/mobile   — React Native Expo (Fase 2, no tocar todavía)
packages/ui   — @karpos/ui (Drawer, Button, Card, Table, Badge, etc.)
packages/sdk  — @karpos/sdk (cliente API isomórfico)
packages/types — @karpos/types (Zod schemas)
infra/db      — migrations/ + seeds/
infra/vps     — install.sh + docker-compose.prod.yml + Caddyfile.karpos
scripts       — migrate.mjs, seed.mjs, seed-demo.mjs
docs/KARPOS.md — referencia técnica completa
```

## Patrones técnicos críticos

### Multi-tenant
Cada service recibe `Principal` y hace `where eq(table.orgId, principal.orgId)`.
No hay RLS a nivel DB. NO romper este patrón en queries nuevas.

### Append-only en spray_records
**Nunca** DELETE ni UPDATE de campos clave en `karpos.spray_records`. Anular =
`UPDATE SET voided_at, voided_by, void_reason`. Cumple GLOBALG.A.P. IFA v6 CB 7.6.

### Catálogo fitosanitarios
- Globales (`org_id IS NULL`): read-only, vienen del seed ICA.
- Per-org: CRUD libre dentro de la org.
- Mecanismo "Adoptar": clone de un global a la org con `cloned_from_id`. Una
  vez adoptado, el global desaparece de la lista de esa org (sin duplicados).
- Unique constraint: `UNIQUE NULLS NOT DISTINCT (org_id, commercial_name)`.

### Drawer reutilizable
Todos los forms de crear/editar usan `<Drawer>` de `@karpos/ui` con patrón:
- `open/setOpen` state en client component.
- `<form id="x">` adentro, `<Button form="x" type="submit">` en el footer.
- `router.refresh()` después del submit para revalidar el server component.

### Imports en ESM workspace
TypeScript imports usan suffix `.js` (porque packages tipo `"module"`). Webpack
de Next y nest build resuelven con extensionAlias o tsconfig moduleResolution.

### tsconfig
`exactOptionalPropertyTypes` y `noUncheckedIndexedAccess` están **desactivados**
en `apps/web` y `apps/api`. No reactivar sin avisar.

### Sin Google Fonts
Layout NO importa `next/font/google` (bloqueado por corporate firewall en
build local del usuario). Si querés tipografía custom, usar `next/font/local`.

### bcryptjs default import
`import bcrypt from 'bcryptjs'`, NO `import * as bcrypt` (CJS interop rompe).

### EPERM symlink en build web Windows
`next build --output=standalone` falla con `EPERM: symlink` en Windows. Es del
SO, no del código. Compile + types pasan; en Linux/VPS funciona. Si lo ves
en log, ignorar.

## Lecciones aprendidas (no repetir)

1. **Si 3 fallas consecutivas en la misma capa, parar y replantear alcance** —
   no parchar más. Ya pasó con Timescale+RLS+columnstore en mayo 2026.
2. **Validar local antes de deploy** — `pnpm --filter @karpos/api build` y
   `pnpm --filter @karpos/web build` siempre antes de push.
3. **Migraciones aditivas** — nunca modificar un `.sql` ya aplicado (checksum
   en `karpos._migrations`). Crear `000N_descripcion.sql` nuevo.
4. **Idempotencia en seeds** — siempre `ON CONFLICT ... DO NOTHING`.
5. **Convertir fechas relativas a absolutas** en memorias y commits.

## Comandos comunes en el VPS

```bash
# Conectar
ssh root@2.24.89.123

# Pull + rebuild API+Web
cd /opt/karpos && git pull origin main
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml build --no-cache api web
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml up -d --force-recreate api web

# Aplicar migración nueva
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml --profile once run --rm migrate

# Re-sembrar (idempotente)
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml --profile once run --rm seed

# Cargar dataset demo
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml --profile demo run --rm seed-demo

# Logs en vivo
docker compose -f /opt/karpos/infra/vps/docker-compose.prod.yml logs -f api web
```

## Antes de tocar código

1. Lee `docs/KARPOS.md` si vas a tocar dominio que no recordás (especialmente schema, endpoints).
2. Si vas a agregar tabla/columna: crear migración `infra/db/migrations/000N_descripcion.sql` aditiva. Nunca modificar una vieja.
3. Si agregas endpoint: actualizar SDK en `packages/sdk/src/index.ts`.
4. Si agregas componente UI: en `packages/ui/src/components/`, exportar desde `index.ts`.
5. Antes de commit: builds locales API + Web limpios.

## Cuando termines de programar

Agregar commit con co-author `Claude Opus 4.7 (1M context) <noreply@anthropic.com>`,
push, y guiar al usuario para correr el redeploy en el VPS con los comandos de
arriba.

---

**Referencia completa**: lee `docs/KARPOS.md` cuando necesites detalle de schema,
endpoints, decisiones técnicas o historial de fases.
