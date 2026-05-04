# Runbook — Staging

## Acceder al cluster

```bash
aws sso login --profile karpos-staging
aws eks update-kubeconfig --name karpos-staging --region us-east-1 --profile karpos-staging
kubectl config use-context arn:aws:eks:us-east-1:<account>:cluster/karpos-staging
```

## Tail de logs

```bash
kubectl -n karpos-staging logs -f deploy/karpos-api --tail=200
kubectl -n karpos-staging logs -f deploy/karpos-web
```

## Reiniciar un componente

```bash
kubectl -n karpos-staging rollout restart deploy/karpos-api
kubectl -n karpos-staging rollout status  deploy/karpos-api
```

## Forzar re-creación de pods (cambio de secret)

```bash
kubectl -n karpos-staging delete pod -l app.kubernetes.io/component=api
```

## Conexión psql desde un bastión efímero

```bash
kubectl -n karpos-staging run pgcli --rm -it --image=postgres:16-alpine \
  --env-from=secret/karpos-db -- psql "$DATABASE_URL"
```

## Rotar secret OIDC

1. Generar nuevo cliente en Keycloak admin.
2. Actualizar `karpos/oidc/client-secret` en Secrets Manager.
3. External Secrets reconcilia automáticamente; reiniciar deploy api.
4. Validar `/health` y `/ready`.

## Forzar reconciliación External Secrets

```bash
kubectl -n karpos-staging annotate externalsecret karpos-db force-sync=$(date +%s) --overwrite
```
