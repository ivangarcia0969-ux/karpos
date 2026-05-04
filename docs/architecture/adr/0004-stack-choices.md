# ADR-0004: Selección de stack tecnológico

- **Estado:** Aceptado
- **Fecha:** 2026-05-04

## Decisión resumida

| Capa                  | Elegido                                  | Alternativas descartadas | Razón principal |
|-----------------------|------------------------------------------|--------------------------|-----------------|
| Frontend web          | Next.js 14 App Router + RSC              | Remix, Nuxt              | Ecosistema, SEO público (portal de trazabilidad), edge runtime para portales QR. |
| App móvil             | React Native + Expo + WatermelonDB       | Flutter, Capacitor        | Reuso de TS/types y SDK con web; Watermelon resiste sync con muchos miles de filas. |
| Backend               | NestJS hexagonal                         | Fastify plain, Express    | Disciplina arquitectural, módulos, OpenAPI auto, DI testeable. |
| ORM                   | Drizzle                                  | Prisma, TypeORM           | SQL-first, sin generación masiva, soporta tipos PostGIS y JSON sin contorsiones. |
| Validación            | zod                                      | yup, joi                  | Inferencia de tipos TS sin duplicación. |
| BD principal          | PostgreSQL 16 + PostGIS + TimescaleDB + pgvector | Mongo + servicios separados | Una sola fuente de verdad: geo, series, vectores. |
| Caché / colas         | Redis 7 + BullMQ                         | RabbitMQ                  | Operación simple, soporte de delays nativos. |
| Bus de eventos        | NATS JetStream                           | Kafka                     | Footprint operativo bajo en LATAM, garantías suficientes para nuestros volúmenes. Re-evaluar a Kafka si pasamos 1k msg/s sostenido. |
| Storage de objetos    | S3 (AWS) / MinIO local                   | GCS                       | Compatibilidad universal del API S3. |
| Autenticación         | Keycloak                                 | Auth0, Cognito            | Self-hosted, OIDC + SAML + federación social, sin vendor lock-in. |
| ML                    | FastAPI + PyTorch + LightGBM + Prophet   | TF, Sagemaker             | Stack abierto, costo predecible, sin lock-in. |
| Observabilidad        | OpenTelemetry + Grafana + Loki + Tempo + Sentry | Datadog            | OSS, costo controlable, OTel estándar. |
| IaC                   | Terraform                                | Pulumi                    | Mayor adopción operativa, módulos ya maduros para AWS. |
| K8s                   | EKS (AWS)                                | GKE, ECS Fargate          | Control granular y portabilidad fuera de AWS si fuera necesario. |
| CI/CD                 | GitHub Actions                           | GitLab CI                 | Bajo overhead, integración nativa con repo. |

## Restricciones que filtraron las opciones

- **Licencias**: descartado todo paquete con Server Side Public License, BUSL u otras incompatibles con nuestro uso comercial. Verificación continua por `license-checker`.
- **Operación en LATAM**: latencia y disponibilidad regional priorizadas. AWS São Paulo, Bogotá (Local Zone), Santiago (CL).
- **Costo predecible**: nada de servicios con pricing opaco por evento.
