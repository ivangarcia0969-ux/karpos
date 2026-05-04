# Karpos — Guía de despliegue

Versión 1.0 · 2026-05-04

## 1. Entornos

| Entorno     | Propósito                | Cluster         | DNS                     |
|-------------|--------------------------|-----------------|-------------------------|
| dev         | Local con docker-compose | docker-desktop  | localhost               |
| staging     | Validación pre-prod      | EKS staging     | *.staging.karpos.example |
| production  | Tenants reales           | EKS production  | *.karpos.example        |

## 2. Pre-requisitos producción

- Cuenta AWS con Org SCPs alineados al baseline CIS.
- Certificados ACM emitidos para `*.karpos.example`.
- Dominios delegados a Route 53.
- Secrets Manager con: `karpos/db/url`, `karpos/redis/url`, `karpos/oidc/client-secret`, `karpos/sentry/dsn`, `karpos/stripe/secret-key`, `karpos/stripe/webhook-secret`, `karpos/copernicus/credentials`.
- KMS keys: `alias/karpos-rds`, `alias/karpos-s3`, `alias/karpos-secrets`.
- Cluster EKS provisionado vía Terraform (`infra/terraform/`).
- External Secrets Operator instalado en el cluster.

## 3. Despliegue inicial

```bash
# 1. Provisionar infraestructura
cd infra/terraform
terraform init -backend-config=staging.tfbackend
terraform apply -var environment=staging

# 2. Conectar kubectl al cluster
aws eks update-kubeconfig --name karpos-staging --region us-east-1

# 3. Crear namespace y secretos base
kubectl create namespace karpos-staging
kubectl apply -f infra/k8s/external-secrets.yaml

# 4. Migraciones (job one-shot)
kubectl run migrate \
  --image=$ECR/karpos-api:$SHA \
  --restart=Never --rm -it \
  --env-from=secret/karpos-db \
  --command -- node scripts/migrate.mjs

# 5. Helm install
helm upgrade --install karpos infra/helm/karpos \
  --namespace karpos-staging \
  -f infra/helm/karpos/values-staging.yaml \
  --set image.tag=$SHA --wait
```

## 4. Despliegue continuo

GitHub Actions `.github/workflows/deploy-staging.yml` se dispara con cada merge a `main`. Producción requiere aprobación manual del Environment `production`.

## 5. Rollback

```bash
helm history karpos -n karpos-<env>
helm rollback karpos <revision> -n karpos-<env>
```

Migraciones de schema: cada migración debe tener un script reverso publicado en `infra/db/migrations/down/`. Política: si un rollback aplicacional requiere revertir schema, primero revertir el deploy, luego ejecutar el down script tras validación manual del DBA.

## 6. Smoke tests post-deploy

```bash
curl -fsS https://api.staging.karpos.example/health
curl -fsS https://api.staging.karpos.example/ready
curl -fsS https://app.staging.karpos.example/ | grep -q "Karpos"
```

## 7. Observabilidad

- **Trazas**: OTel → Tempo, búsqueda por `trace_id` en Grafana.
- **Logs**: stdout/stderr → Loki, query `{namespace="karpos-staging"} |= "error"`.
- **Métricas**: Prometheus + Karpos custom: `karpos_http_request_duration`, `karpos_sync_pull_size`, `karpos_audit_chain_breaks`.
- **SLOs**: 99.9% uptime API; p95 < 300 ms; tasa de error < 1%.

## 8. Backups y DR

- RDS PITR 35 días + snapshots manuales pre-major-release.
- S3 versionado + cross-region replication (us-east-1 → sa-east-1).
- DR drill anual: restore completo en región alterna, smoke test, RTO objetivo 1 h.

## 9. Multi-región (Enterprise)

- Tenants Enterprise con cluster dedicado: misma chart Helm, namespace dedicado, RDS aparte, KMS dedicado.
- Transferencia de tenant a cluster dedicado: documentada en `docs/deployment/migration-runbook.md`.
