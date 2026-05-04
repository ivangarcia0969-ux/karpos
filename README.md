# Karpos

Plataforma SaaS multi-tenant para el manejo integral de cultivos frutales.

> Convierte cada lote, árbol y jornal en datos útiles, decisiones agronómicas trazables y rentabilidad medible — con o sin señal en el campo.

## Estructura del repositorio

```
karpos/
├── apps/
│   ├── api/            NestJS backend (REST + GraphQL + eventos NATS)
│   ├── web/            Next.js 14 (App Router) — consola web
│   ├── mobile/         React Native + Expo (offline-first)
│   └── ml/             FastAPI + PyTorch — visión por computador y forecasting
├── packages/
│   ├── ui/             Karpos DS (design system, shadcn extendido)
│   ├── types/          Tipos compartidos generados desde el esquema
│   ├── sdk/            Cliente API tipado para web/mobile
│   ├── i18n/           Catálogos de traducción
│   └── config/         ESLint / TS / Tailwind compartidos
├── infra/
│   ├── db/             Migraciones SQL y seeders
│   ├── helm/karpos/    Chart Helm para despliegue K8s
│   └── terraform/      IaC para AWS (EKS, RDS, S3, CloudFront)
├── docs/
│   ├── brand/          Identidad visual y design tokens
│   ├── architecture/   C4 + ADRs
│   ├── security/       Threat model STRIDE + IR
│   ├── deployment/     Runbooks
│   ├── pricing/        Planes Starter / Pro / Enterprise
│   └── manuals/        Manuales de usuario
└── .github/workflows/  CI/CD (lint, test, SAST, deploy)
```

## Requisitos

- Node.js >= 20.10 (`.nvmrc`)
- pnpm >= 9
- Python >= 3.11 (para `apps/ml`)
- Docker + Docker Compose (servicios locales)

## Arranque local

```bash
pnpm install
docker compose up -d                # Postgres+PostGIS+Timescale, Redis, NATS, MinIO, Keycloak, MailHog
pnpm db:migrate
pnpm db:seed                        # tres fincas demo: uva (AR), aguacate (CO), manzana (CL)
pnpm dev                            # arranca todas las apps en paralelo
```

| Servicio          | URL local                |
|-------------------|--------------------------|
| Web               | http://localhost:3000    |
| API REST          | http://localhost:4000    |
| API GraphQL       | http://localhost:4000/graphql |
| ML                | http://localhost:8000    |
| Keycloak          | http://localhost:8081    |
| MinIO console     | http://localhost:9001    |
| MailHog           | http://localhost:8025    |

## Calidad

| Métrica                                  | Objetivo |
|------------------------------------------|----------|
| Cobertura backend / módulos críticos web | >= 80%   |
| p95 API CRUD                             | < 300 ms |
| Sync móvil 10k registros en 4G           | < 60 s   |
| Lighthouse Performance/A11y/BP/SEO       | >= 95    |
| Licencias incompatibles con uso comercial| 0        |

## Documentación

- Identidad y branding: [docs/brand/brand-guidelines.md](docs/brand/brand-guidelines.md)
- Arquitectura C4: [docs/architecture/c4-context.md](docs/architecture/c4-context.md)
- ADRs: [docs/architecture/adr/](docs/architecture/adr/)
- Modelo de datos (DDL): [infra/db/migrations/](infra/db/migrations/)
- Seguridad (STRIDE + IR): [docs/security/threat-model.md](docs/security/threat-model.md)
- Despliegue: [docs/deployment/README.md](docs/deployment/README.md)
- Planes y monetización: [docs/pricing/plans.md](docs/pricing/plans.md)

## Licencia

Propietario — todos los derechos reservados. Ver [LICENSE](LICENSE).
