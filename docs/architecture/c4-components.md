# C4 — Diagrama de Componentes (apps/api)

Backend NestJS organizado en módulos hexagonales (cada módulo: domain, application, infrastructure, http).

```mermaid
C4Component
  title apps/api — componentes

  Container(web, "apps/web")
  Container(mobile, "apps/mobile")
  ContainerDb(pg, "PostgreSQL")
  ContainerQueue(nats, "NATS")
  Container(ml, "apps/ml")

  Container_Boundary(api, "apps/api") {
    Component(http, "HTTP Layer", "Controllers REST + GraphQL resolvers", "Validación entrada (zod), versionado, OpenAPI.")
    Component(auth, "IAM", "Guard JWT + RBAC + ABAC", "Resuelve org_id, rol, scopes; aplica policies por recurso.")
    Component(tenancy, "Tenancy", "Interceptor org context", "Inyecta SET app.current_org en cada conexión PG; RLS.")
    Component(audit, "Audit Log", "Event sourcing", "Append-only por dominio sensible; hash chain por tenant.")

    Component(farms, "Predios", "Module", "Fincas, sectores, lotes (PostGIS), árboles, variedades.")
    Component(fieldlog, "Bitácora Verde", "Module", "Labores culturales, cuadrillas, destajo.")
    Component(pheno, "Fenoflow", "Module", "Perfiles BBCH, grados-día, alertas.")
    Component(health, "Sanidad+", "Module", "Monitoreo, umbrales, aplicaciones químicas, PHI/REI.")
    Component(harvest, "Cosecha360", "Module", "Plan, pesajes, asignación a empaque.")
    Component(copilot, "Karpos IQ", "Module", "Orquestador del copiloto IA + RAG con pgvector.")

    Component(sdk, "Domain SDK", "Shared kernel", "Tipos, value objects, agregados.")
    Component(infra, "Infra adapters", "Repos, gateways, publishers", "PG via Drizzle, NATS publisher, S3, ML client.")
  }

  Rel(web, http, "REST/GraphQL", "HTTPS")
  Rel(mobile, http, "REST sync", "HTTPS")
  Rel(http, auth, "Aplica")
  Rel(http, tenancy, "Aplica")
  Rel(http, farms, "Invoca")
  Rel(http, fieldlog, "Invoca")
  Rel(http, pheno, "Invoca")
  Rel(http, health, "Invoca")
  Rel(http, harvest, "Invoca")
  Rel(http, copilot, "Invoca")
  Rel(farms, sdk, "Usa")
  Rel(fieldlog, sdk, "Usa")
  Rel(pheno, sdk, "Usa")
  Rel(health, sdk, "Usa")
  Rel(harvest, sdk, "Usa")
  Rel(copilot, sdk, "Usa")
  Rel(sdk, infra, "Implementa puertos vía")
  Rel(infra, pg, "SQL", "TCP")
  Rel(infra, nats, "Publica", "TCP")
  Rel(audit, pg, "Append-only", "TCP")
  Rel(copilot, ml, "Pide inferencias", "HTTPS interno")
```

## Convención de capas (cada módulo)

```
modules/<dominio>/
├── domain/             # Entidades, value objects, agregados, eventos de dominio
├── application/        # Casos de uso (commands/queries), puertos
├── infrastructure/     # Adaptadores: repos PG, mappers, publishers
└── http/               # Controllers REST + GraphQL resolvers + DTOs zod
```
