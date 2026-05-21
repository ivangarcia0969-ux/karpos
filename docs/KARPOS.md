# Karpos — Referencia técnica del proyecto

**Última actualización:** 2026-05-21
**Estado:** Fase 1 desplegada en producción (`app.karpos.surcoapp.tech`).

---

## 1. Visión del producto

Karpos es un SaaS comercial multi-tenant para manejo integral de fincas frutales
(caduca, cítricos, tropicales, berries, vid, frutos secos). Foco LatAm.

**Audiencia:** productores, fincas corporativas, cooperativas, exportadoras, asesores
agronómicos. Independiente de proveedor de insumos.

**Diferenciadores:**

- 100% original — sin reuso de UI/copy/módulos de Agrivi, Croptracker, Agworld,
  Granular, FieldView, Phytech, xarvio, Taranis, FarmERP, Farmbrite.
- Trazabilidad lista para GLOBALG.A.P. IFA v6 (append-only, anular con razón).
- Catálogo ICA Colombia de productos fitosanitarios pre-cargado, con período de
  carencia (PHI) y reingreso (REI). Cada org puede "adoptar" globales o crear propios.
- Multi-cultivo y multi-país desde el primer commit.

**Decisiones bloqueadas (no re-discutir):**

- Nombre marca: **Karpos** (griego antiguo καρπός = fruto).
- Design system: **Karpos DS v2** (paleta neutral-zinc + brand-emerald,
  sin earth-tones).
- Mercado primario: LatAm. Idiomas: `es-CO`, `en-US` (es-MX, es-ES, pt-BR como
  fast-followers).
- Hosting producción: VPS Hostinger KVM 8 (32 GB / 8 vCPU) compartido con
  Supabase y LibreChat ya instalados del usuario.
- Idioma del código: identificadores y comentarios en inglés; copy/UI/docs en
  español.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Web | Next.js (app router) + React | 14.2 / 18.3 |
| API | NestJS + Fastify | 10.4 / 4.28 |
| DB | Postgres vanilla (sin Timescale/PostGIS/pgvector por ahora) | 16-alpine |
| ORM | Drizzle ORM | 0.33 |
| Auth | email+password con bcrypt + JWT HS256 cookie httpOnly | jose 5.6 |
| UI | Tailwind 3.4 + lucide-react + class-variance-authority | — |
| Reverse proxy | Caddy del sistema en el VPS | — |
| Containers | Docker Compose | — |
| Pkg manager | pnpm workspaces (monorepo) | 9.10 |
| Build orquesta | Turborepo (instalado, no se usa intensamente todavía) | — |

**Geometrías:** se almacenan como **GeoJSON en columnas jsonb**, no PostGIS
(decisión Fase 1 — agregar PostGIS cuando se necesiten queries espaciales reales).

---

## 3. Estructura del monorepo

```
frutales/
├── apps/
│   ├── api/                          # NestJS hexagonal
│   │   └── src/
│   │       ├── common/               # filters, health controller, zod pipe
│   │       ├── config/env.ts         # Zod env validation
│   │       ├── database/
│   │       │   ├── database.module.ts  # Drizzle + postgres-js
│   │       │   └── schema/             # Tablas Drizzle por dominio
│   │       ├── iam/                    # auth.service/controller, jwt.guard
│   │       └── modules/                # un módulo por dominio
│   │           ├── farms/              # farms + plots
│   │           ├── field-log/          # bitácora de operaciones
│   │           ├── phenology/          # eventos BBCH
│   │           ├── health/             # sanidad+ (scoutings + sprays)
│   │           ├── harvest/            # planes + lotes
│   │           └── catalog/            # especies + variedades + fitosanitarios
│   ├── web/                          # Next.js 14 app router
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx          # landing
│   │       │   ├── login/            # /login
│   │       │   ├── signup/           # /signup
│   │       │   ├── console/          # área autenticada con sidebar
│   │       │   │   ├── layout.tsx
│   │       │   │   ├── page.tsx      # tablero
│   │       │   │   ├── predios/      # farms + detail [id] + lotes/[id]
│   │       │   │   ├── bitacora/
│   │       │   │   ├── fenoflow/
│   │       │   │   ├── sanidad/
│   │       │   │   ├── cosecha/
│   │       │   │   └── catalogos/    # fitosanitarios CRUD
│   │       │   ├── portal/           # portal público de trazabilidad
│   │       │   └── api/              # route handlers (auth/logout)
│   │       ├── lib/
│   │       │   ├── api-client.ts        # SDK con cookie del request (server)
│   │       │   ├── api-client.client.ts # SDK browser
│   │       │   └── session.ts           # verify JWT con jose
│   │       └── middleware.ts         # redirect a /login si falta cookie
│   └── mobile/                       # React Native Expo (Fase 2, sin tocar)
├── packages/
│   ├── ui/                           # @karpos/ui — componentes design system
│   │   └── src/components/           # Button, Card, Drawer, Input, Label,
│   │                                 # Badge, Table, EmptyState, PageHeader,
│   │                                 # StatCard, Logo
│   ├── sdk/                          # @karpos/sdk — cliente API
│   ├── types/                        # @karpos/types — Zod schemas
│   ├── i18n/                         # @karpos/i18n — mensajes
│   └── config/                       # @karpos/config — tailwind preset
├── infra/
│   ├── db/
│   │   ├── migrations/               # 0001..0004 (numeradas, idempotentes)
│   │   └── seeds/                    # 0001 catálogo especies, 0002 cat fito ICA
│   └── vps/
│       ├── install.sh                # bootstrap idempotente del VPS
│       ├── docker-compose.prod.yml
│       ├── Caddyfile.karpos          # bloque a importar en Caddyfile global
│       ├── .env.production.template
│       ├── backup.sh                 # pg_dump nightly
│       └── README.md
├── scripts/
│   ├── migrate.mjs                   # aplica .sql con checksum check
│   ├── seed.mjs                      # aplica .sql de seeds en orden
│   └── seed-demo.mjs                 # dataset realista para venta
└── docs/
    ├── KARPOS.md                     # ESTE archivo
    └── ...
```

---

## 4. Arquitectura del deploy en VPS

```
internet
  │
  ▼
Caddy (sistema, /usr/bin/caddy, :80 + :443)
  ├── supabase.surcoapp.tech       → 127.0.0.1:8000   (Supabase del usuario, intacto)
  └── app.karpos.surcoapp.tech     → /v1/*  → 127.0.0.1:4100  (karpos-api)
                                     else   → 127.0.0.1:3100  (karpos-web)

Docker (network karpos-net, aislada de Supabase y LibreChat):
  karpos-postgres (postgres:16-alpine) → 127.0.0.1:5433 (loopback)
  karpos-api (nest+fastify)            → 127.0.0.1:4100
  karpos-web (next standalone)         → 127.0.0.1:3100
```

**Aislamiento garantizado:**

| Recurso       | Supabase            | LibreChat   | Karpos                |
|---------------|---------------------|-------------|-----------------------|
| Container PG  | `supabase-db`       | —           | `karpos-postgres`     |
| Red Docker    | `supabase_default`  | —           | `karpos-net`          |
| Puerto host   | `0.0.0.0:5432`      | —           | `127.0.0.1:5433`      |
| Volumen       | `supabase_db_data`  | —           | `karpos-pg`           |
| Caddy bloque  | `supabase.*`        | —           | `app.karpos.*`        |

**UFW está inactive** — no se necesita abrir puertos porque Karpos vive en loopback
y Caddy ya enruta 443.

---

## 5. Modelo de datos

Postgres vanilla, dos schemas: `karpos` (datos del tenant) y `catalog` (referencia
global).

### Tenancy y auth

| Tabla | Campos clave | Notas |
|-------|--------------|-------|
| `karpos.organizations` | id, legal_name, display_name, slug UNIQUE, country_code, default_locale, default_currency, default_timezone, tax_id, billing_email, status | Cada org es el tenant. |
| `karpos.users` | id, email UNIQUE, password_hash, display_name, locale, status | password con bcrypt 10 rounds. |
| `karpos.memberships` | id, org_id, user_id, role (`owner`/`admin`/`manager`/`member`/`viewer`) UNIQUE (org_id, user_id) | Un user puede estar en varias orgs (futuro). |

### Predios

| Tabla | Notas |
|-------|-------|
| `karpos.farms` | code+name+region+locality+timezone+elevation_m+total_area_ha+centroid (GeoJSON Point)+boundary (GeoJSON Polygon)+contact+metadata. UNIQUE (org_id, code). |
| `karpos.plots` | farm_id+code+name+species_id+variety_id+planting_date+spacing_row_m+spacing_tree_m+trees_count+area_ha+boundary+centroid+status (active/fallow/removed)+metadata. UNIQUE (farm_id, code). |

### Operaciones agronómicas

| Tabla | Notas |
|-------|-------|
| `karpos.field_operations` | plot_id+operation_type+started_at+ended_at+area_ha+notes+inputs (jsonb list)+recorded_by+metadata. Tipos: prune/fertilize/spray/irrigate/thin/mow/manual_log/training/soil_amendment/pest_monitoring/other. |
| `karpos.phenology_events` | plot_id+observed_on+bbch_code (Meier 2001)+stage_label+pct_in_stage+notes+recorded_by+metadata. |

### Sanidad+

| Tabla | Notas |
|-------|-------|
| `karpos.pest_scoutings` | plot_id+observed_on+observer_id+target+category (`pest`/`disease`/`weed`/`beneficial`/`abiotic`)+severity (`none`/`low`/`moderate`/`high`/`severe`)+incidence_pct+sample_size+stage_bbch+photos (jsonb list)+metadata. |
| `karpos.spray_records` | **append-only** (GLOBALG.A.P. IFA v6 CB 7.6). Para anular: setear voided_at/voided_by/void_reason. plot_id+scouting_id+fito_product_id+applied_at+ended_at+operator+target+product_name+active_ingredient+registration_no+dose_amount+dose_unit+water_l_per_ha+area_ha+phi_days+rei_hours+equipment+wind_kmh+temp_c+rh_pct+notes+metadata+voided_*. |

### Cosecha

| Tabla | Notas |
|-------|-------|
| `karpos.harvest_plans` | plot_id+season_year+expected_start_date+expected_end_date+expected_yield_kg+expected_yield_kg_ha+forecast_method+status (`draft`/`approved`/`in_progress`/`closed`/`cancelled`)+notes. UNIQUE (plot_id, season_year). |
| `karpos.harvest_lots` | plot_id+plan_id+lot_code+harvested_on+variety_id+gross_kg+tare_kg+net_weight_kg+containers_count+quality_grade+destination+notes+metadata. UNIQUE (org_id, lot_code). |

### Catálogos

| Tabla | Notas |
|-------|-------|
| `catalog.crop_species` | code UNIQUE+scientific_name+common_name_es+common_name_en+family+category. 16 especies sembradas. |
| `catalog.varieties` | species_id+code+name+origin_country+notes. ~10 variedades sembradas. |
| `catalog.fito_products` | Catálogo de productos fitosanitarios. `org_id IS NULL` = global ICA (read-only). Cualquier org puede "adoptar" un global (clone con `cloned_from_id`) o crear propios. **UNIQUE NULLS NOT DISTINCT (org_id, commercial_name)** garantiza no duplicar por scope. 20 productos ICA Colombia sembrados. |

### Migraciones aplicadas

1. `0001_init.sql` — schemas, función `set_updated_at`, tablas base.
2. `0002_sanidad_harvest_plans.sql` — pest_scoutings, spray_records, harvest_plans + columnas extra a harvest_lots.
3. `0003_fito_catalog.sql` — tabla catalog.fito_products + column fito_product_id en spray_records.
4. `0004_fito_clone.sql` — unique (org_id, commercial_name) NULLS NOT DISTINCT + column cloned_from_id.

El runner `scripts/migrate.mjs` mantiene `karpos._migrations` con sha256 por
archivo y rechaza re-aplicar uno modificado.

---

## 6. API REST

Base URL: `https://app.karpos.surcoapp.tech` (en local: `http://localhost:4000`).

**Auth:** cookie httpOnly `karpos.session` con JWT HS256 firmada con `JWT_SECRET`.
El web envía la cookie automáticamente; clientes externos pueden mandar
`Authorization: Bearer <token>`. Endpoints públicos marcados con `@Public()`.

Multi-tenant: cada query incluye `where org_id = principal.orgId` explícito en
el service. No hay RLS a nivel DB (decisión de simplicidad para Fase 1).

### Auth

| Método | Path | Descripción |
|--------|------|-------------|
| `POST` | `/v1/auth/register` | Crea organización + user owner. Body: `{email,password,displayName,organization:{legalName,displayName,slug,countryCode}}`. Devuelve `{principal}` y setea cookie. |
| `POST` | `/v1/auth/login` | Body `{email,password}`. Devuelve `{principal}` y cookie. |
| `POST` | `/v1/auth/logout` | Limpia cookie. |
| `GET`  | `/v1/auth/me` | Devuelve principal. |

### Farms / Plots

| Método | Path | Notas |
|--------|------|-------|
| `GET` | `/v1/farms?q&page&pageSize` | Paginado. |
| `GET` | `/v1/farms/:id` | |
| `POST` | `/v1/farms` | |
| `PUT` | `/v1/farms/:id` | |
| `DELETE` | `/v1/farms/:id` | Cascade a plots. |
| `GET` | `/v1/plots?farmId` | |
| `GET` | `/v1/plots/:id` | |
| `POST` | `/v1/plots` | |
| `PUT` | `/v1/plots/:id` | |
| `DELETE` | `/v1/plots/:id` | |

### Field log

| Método | Path | Notas |
|--------|------|-------|
| `GET` | `/v1/field-operations?plotId&operationType&from&to&page&pageSize` | |
| `GET` | `/v1/field-operations/:id` | |
| `POST` | `/v1/field-operations` | |

### Phenology

| Método | Path | Notas |
|--------|------|-------|
| `GET` | `/v1/phenology/events?plotId` | |
| `POST` | `/v1/phenology/events` | |
| `DELETE` | `/v1/phenology/events/:id` | |

### Health (Sanidad+)

| Método | Path | Notas |
|--------|------|-------|
| `GET` | `/v1/health/scoutings?plotId` | |
| `POST` | `/v1/health/scoutings` | |
| `GET` | `/v1/health/sprays?plotId` | Sólo no anulados. |
| `POST` | `/v1/health/sprays` | Append-only. |
| `POST` | `/v1/health/sprays/:id/void` | Body `{reason}`. |

### Harvest

| Método | Path | Notas |
|--------|------|-------|
| `GET` | `/v1/harvest/plans?seasonYear` | |
| `POST` | `/v1/harvest/plans` | |
| `GET` | `/v1/harvest/lots?plotId` | |
| `POST` | `/v1/harvest/lots` | |
| `DELETE` | `/v1/harvest/lots/:id` | |

### Catalog

| Método | Path | Notas |
|--------|------|-------|
| `GET` | `/v1/catalog/species` | Público. |
| `GET` | `/v1/catalog/varieties?speciesId` | Público. |
| `GET` | `/v1/catalog/fito-products?category&q&cropCode` | Globales no adoptados + propios. |
| `GET` | `/v1/catalog/fito-products/:id` | |
| `POST` | `/v1/catalog/fito-products` | Crea producto propio de la org. |
| `PUT` | `/v1/catalog/fito-products/:id` | Sólo propios. |
| `DELETE` | `/v1/catalog/fito-products/:id` | Soft delete (`is_active=false`), sólo propios. |
| `POST` | `/v1/catalog/fito-products/:id/clone` | Adopta un global a tu org. |

---

## 7. SDK (`@karpos/sdk`)

Cliente isomórfico con `KarposClient`. En server components se construye con
`getServerClient()` (lib/api-client.ts) que adjunta la cookie del request. En
client components se usa `getBrowserClient()` (lib/api-client.client.ts) con
`credentials: 'include'`.

Métodos cubren todos los endpoints. Tipos completos en `@karpos/types`.

---

## 8. UI (`@karpos/ui`)

Design System v2 — neutral-zinc + brand-emerald. Tipografía sistema sharp
(sin Google Fonts por bloqueo corporativo en build local).

| Componente | Notas |
|------------|-------|
| `Button` | `variant: primary/secondary/ghost/danger/link`, `size: sm/md/lg/xl/icon`. |
| `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `CardDescription` | Surface base. |
| `Input`, `Textarea`, `Select` | Form controls con focus ring esmeralda. |
| `Label`, `FieldError`, `FieldHint` | Etiquetas con sub-texto. |
| `Badge` | `tone: neutral/brand/success/warning/danger/info`. |
| `EmptyState` | Card discontinuo con icon+title+description+action. |
| `PageHeader` | `title/description/actions/breadcrumb`. |
| `StatCard` | KPI con `tone: neutral/brand/warning/danger`. |
| `Drawer` | Slide-over desde la derecha, `size: sm/md/lg`. Cierra con ESC + backdrop. Block body scroll. |
| `TableContainer`, `Table`, `THead`, `TR`, `TH`, `TD` | Tablas densas con números tabulares. |
| `Logo` | Karpos wordmark + drupa SVG. |

---

## 9. Web — páginas

| Path | Server/Client | Descripción |
|------|---------------|-------------|
| `/` | server | Landing pública. |
| `/login`, `/signup` | client | Email+password. Si tu navegador es bloqueado por corporate firewall en /v1/auth, el form igual funciona contra el VPS por HTTPS. |
| `/portal/trazabilidad/[lot]` | server | Portal público de trazabilidad de lote (placeholder). |
| `/console` | server | Tablero con KPIs reales y alerta PHI vigente. |
| `/console/predios` | server | Listado tabular + drawer "Nueva finca". |
| `/console/predios/[id]` | server | Detalle finca + tabla de lotes + drawer "Nuevo lote". |
| `/console/lotes/[id]` | server | **Timeline unificado** del lote (operaciones+fenología+sanidad+cosecha) + banner PHI. |
| `/console/bitacora` | server | Tabla de operaciones + drawer crear. |
| `/console/fenoflow` | server | Cards por lote con eventos BBCH + drawer crear con 15 presets. |
| `/console/sanidad` | server | Tabla de aplicaciones + monitoreos + 3 drawers (scout/spray/void) + alerta PHI. |
| `/console/cosecha` | server | Planes + lotes pesados + 2 drawers. |
| `/console/catalogos` | server | CRUD fito-products con "Adoptar" sobre globales. |

---

## 10. Operación del VPS

### Credenciales

| Recurso | Dato |
|---------|------|
| IP VPS | `2.24.89.123` (Hostinger KVM 8) |
| URL prod | `https://app.karpos.surcoapp.tech` |
| Postgres prod | `127.0.0.1:5433` (loopback), db `karpos`, user `karpos`, pass en `/opt/karpos/.env` |
| Repo GitHub | `https://github.com/ivangarcia0969-ux/karpos.git` |
| Demo login | `demo@karpos.com` / `demo1234` |

### Comandos comunes

**Deploy desde cero (primera vez):**

```bash
ssh root@2.24.89.123
sudo git clone https://github.com/ivangarcia0969-ux/karpos.git /opt/karpos
sudo bash /opt/karpos/infra/vps/install.sh
```

**Redeploy de código (sin cambios en DB):**

```bash
cd /opt/karpos && git pull origin main
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml build --no-cache api web
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml up -d --force-recreate api web
```

**Aplicar migración nueva:**

```bash
cd /opt/karpos && git pull origin main
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml --profile once run --rm migrate
```

**Re-sembrar catálogos / demo:**

```bash
# Catálogos (especies + fitosanitarios, idempotente)
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml --profile once run --rm seed

# Demo (organización Frutícola del Valle, 3 fincas, 7 lotes, etc.)
docker compose --env-file /opt/karpos/.env -f infra/vps/docker-compose.prod.yml --profile demo run --rm seed-demo
```

**Logs en vivo:**

```bash
docker compose -f /opt/karpos/infra/vps/docker-compose.prod.yml logs -f api web
```

**Conectarse a la DB desde tu PC:**

```bash
ssh -L 5433:127.0.0.1:5433 root@2.24.89.123
# en DBeaver / pgAdmin: localhost:5433, db karpos, user karpos, pass de /opt/karpos/.env
```

**Backup nightly (instalar una vez):**

```bash
crontab -e
# 0 3 * * * /opt/karpos/infra/vps/backup.sh >> /var/log/karpos-backup.log 2>&1
```

**Apagar Karpos sin tocar Supabase ni LibreChat:**

```bash
docker compose --env-file /opt/karpos/.env -f /opt/karpos/infra/vps/docker-compose.prod.yml down
```

**Borrar TODO Karpos del VPS:**

```bash
docker compose --env-file /opt/karpos/.env -f /opt/karpos/infra/vps/docker-compose.prod.yml down -v
docker rmi karpos-api:latest karpos-web:latest 2>/dev/null
rm -rf /opt/karpos
sed -i '/# Karpos (added by install.sh)/,+1d' /etc/caddy/Caddyfile
rm -f /etc/caddy/karpos.caddy
systemctl reload caddy
```

---

## 11. Patrones técnicos importantes

### Multi-tenant

Cada `Service` recibe `Principal` y filtra por `principal.orgId`:

```ts
async list(principal: Principal) {
  return this.db.select().from(farms).where(eq(farms.orgId, principal.orgId));
}
```

No hay RLS a nivel DB (Fase 1). Si dos clientes comparten DB, el aislamiento
está en el código de cada service. Si querés RLS-DB, reactivar después con
tablas más maduras.

### Append-only en spray_records

Para cumplir GLOBALG.A.P., **nunca** `DELETE FROM spray_records` ni `UPDATE` de
campos clave. Anular = `UPDATE SET voided_at, voided_by, void_reason`. Las
listas filtran `WHERE voided_at IS NULL`.

### Drawer reutilizable

Todos los forms de creación/edición usan el componente `Drawer` de `@karpos/ui`
con un patrón consistente:

```tsx
const [open, setOpen] = useState(false);
return (
  <>
    <Button onClick={() => setOpen(true)}>Nueva X</Button>
    <Drawer open={open} onClose={() => setOpen(false)} title="..." footer={...}>
      <form id="..." onSubmit={...}>...</form>
    </Drawer>
  </>
);
```

El submit usa `form="..."` en el botón del footer para mantener el form
estructurado.

### Sin Google Fonts

El layout NO importa `next/font/google` (bloqueado por corporate firewall en
build local). Si en el futuro querés tipografía custom, usar `next/font/local`
con .woff2 incluidos en `apps/web/public/fonts/`.

### `exactOptionalPropertyTypes`

Desactivado en `apps/web/tsconfig.json` y `apps/api/tsconfig.json` porque genera
fricción con props opcionales legítimas (callsites pasan `undefined`).

### Build standalone EPERM en Windows

`next build` con `output: 'standalone'` falla en Windows con `EPERM: symlink`
al final. Es limitación del SO, no del código. En Linux/VPS no ocurre.

### Bcrypt CJS interop

`bcryptjs` es CJS. Usar `import bcrypt from 'bcryptjs'`, NO `import * as bcrypt`
(rompe en runtime ESM).

---

## 12. Decisiones técnicas con su razón

| Decisión | Razón |
|----------|-------|
| Postgres vanilla en lugar de TimescaleDB + PostGIS + pgvector | Fase 1 falló 5 veces con esos stacks. Vamos a Postgres simple y reintroducimos avanzados (Timescale para sensores, PostGIS para spatial queries, pgvector para RAG) cuando haya clientes reales que lo demanden. |
| Multi-tenant en el código (no RLS-DB) | Más simple, menos cosas que pueden romperse, suficiente para Fase 1. Reactivar RLS cuando haya datos sensibles compartidos. |
| Auth email+password en vez de Keycloak/OIDC | El usuario no tiene cliente IdP corporativo. Login simple > IdP completo en MVP. |
| Sin IA / Karpos IQ por ahora | Decisión 2026-05-18: el usuario quería app vendible inmediato. IA es Fase 4. |
| Geometrías en jsonb (GeoJSON) en lugar de PostGIS | No necesitamos queries espaciales en Fase 1. Frontend lee GeoJSON nativo (MapLibre lo entiende). |
| Catálogo ICA como globales read-only | Cumplimiento agrícola: no se puede editar un registro oficial. Cada org puede "adoptar" un global (clone) para personalizar. |
| `UNIQUE NULLS NOT DISTINCT (org_id, commercial_name)` | Permite mismo nombre como global y como copia per-org sin duplicar dentro del mismo scope. Requiere Postgres 15+. |

---

## 13. Historial de fases

- **Fase 0** (2026-05-18) — Solo DB en VPS, sin app. Postgres vanilla. Aislado de Supabase/LibreChat.
- **Fase 1** (2026-05-19/20) — API NestJS + Web Next.js con 5 módulos core operativos. Email+password auth. Deploy en `app.karpos.surcoapp.tech`. Karpos DS v1 (earth-tones) → reemplazado por v2 (SaaS profesional).
- **Fase 1.5** (2026-05-20) — Redesign SaaS completo + CRUD funcional en los 5 módulos + página de detalle de lote con timeline unificado. Seed demo con dataset realista (3 fincas, 7 lotes, ~35 ops, etc.).
- **Fase 1.6** (2026-05-21) — Catálogo de productos fitosanitarios ICA Colombia (20 productos pre-cargados con PHI/REI/dosis). Form de aplicación con buscador del catálogo y autocompletado. CRUD per-org de productos propios + mecanismo "Adoptar" para personalizar globales sin duplicar.

### Próximas fases planeadas

- **Fase 2** — Mobile React Native Expo con WatermelonDB offline sync para cuadrillas en campo.
- **Fase 3** — Features avanzadas: TimescaleDB para sensores IoT, PostGIS para queries espaciales, audit log hash-chained para inmutabilidad criptográfica.
- **Fase 4** — Karpos IQ (Ollama + pgvector RAG) + EcoSat (NDVI Copernicus) + ML forecast cosecha.

---

## 14. Variables de entorno

### API (apps/api)

| Var | Default | Notas |
|-----|---------|-------|
| `NODE_ENV` | development | |
| `LOG_LEVEL` | info | |
| `API_PORT` | 4000 | |
| `API_BASE_URL` | http://localhost:4000 | Público. |
| `WEB_BASE_URL` | http://localhost:3000 | Para CORS. |
| `DATABASE_URL` | required | `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | required min 32 chars | Compartido entre api y web para verificar JWT. |
| `JWT_EXPIRES_IN` | 7d | |
| `COOKIE_NAME` | karpos.session | |
| `COOKIE_DOMAIN` | optional | |
| `COOKIE_SECURE` | true | |
| `SENTRY_DSN` | optional | |

### Web (apps/web)

| Var | Default | Notas |
|-----|---------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | http://localhost:4000 | Cliente apunta acá. |
| `NEXT_PUBLIC_SITE_URL` | http://localhost:3000 | Para metadataBase. |
| `KARPOS_COOKIE_NAME` | karpos.session | |
| `JWT_SECRET` | required | Mismo valor que la API. |

---

## 15. Convenciones

- **Idioma código**: identificadores y comentarios en inglés.
- **Idioma UI**: español neutro (LatAm).
- **Indentación**: 2 espacios.
- **Imports**: TypeScript con `.js` suffix (ESM workspace), webpack `extensionAlias` maps to `.ts/.tsx`.
- **Commits**: convención `tipo(scope): mensaje` (feat/fix/refactor/docs).
- **Branches**: `main` para producción. Feature branches cuando aplique.
- **Co-Author en commits**: el modelo agrega `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

---

## 16. Lecciones aprendidas (no repetir errores pasados)

1. **No combinar muchas features avanzadas en una sola pasada** — TimescaleDB + RLS + pgvector + PostGIS + audit hash-chain juntos = 5 fallas seguidas. Una capa simple > 5 capas sofisticadas.
2. **Validar local antes de deployar** — `pnpm --filter @karpos/api build` y `pnpm --filter @karpos/web build` antes de cualquier push.
3. **Migraciones aditivas** — nunca modificar un `.sql` ya aplicado (el migrate.mjs lo detecta con checksum). Crear `000N_descripcion.sql` nuevo.
4. **Idempotencia en seeds** — `ON CONFLICT ... DO NOTHING` siempre. Re-correr seed nunca debe duplicar ni romper.
5. **Si una capa falla 3 veces consecutivas, parar** — replantear alcance, no seguir parchando. Lección dura del 2026-05-18.
6. **Geometrías como jsonb** — funciona bien en MapLibre y evita la complejidad de PostGIS hasta que sea necesario.

---

## Contacto

Repo: <https://github.com/ivangarcia0969-ux/karpos>
Issues: GitHub Issues.
Owner: Iván García (ivan.garcia0969@gmail.com).
