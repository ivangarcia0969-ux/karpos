# Manual — API

Karpos expone REST y GraphQL bajo `/v1`. Toda la API está documentada en OpenAPI 3.1 (`docs/api/openapi.yaml`) y servida en `/docs` en entornos no productivos.

## Autenticación

Dos métodos:

1. **OIDC** (humanos): el frontend obtiene un Access Token de Keycloak y lo envía como `Authorization: Bearer <jwt>`.
2. **API Keys** (sistemas): generadas desde Configuración. Se envían como `Authorization: Bearer kp_live_xxx`.

Todos los endpoints excepto `/health`, `/ready`, los webhooks de Stripe y el portal público de trazabilidad requieren autenticación.

## Tenancy

El JWT trae la claim `karpos.org_id`. La API resuelve el contexto del tenant y aplica RLS. Si quieres operar a nombre de otra organización (para integraciones multi-tenant), usa `X-Karpos-Org` y un API key con scope `org:impersonate`.

## Rate limits

| Plan       | req/min |
|------------|---------|
| Starter    | 60      |
| Pro        | 600     |
| Enterprise | 6,000   |

Headers devueltos: `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

## Errores

Formato estándar:

```json
{
  "error": "validation_failed",
  "issues": [{"path": ["plotId"], "message": "Required"}],
  "path": "/v1/farms",
  "timestamp": "2026-05-04T13:42:01.221Z",
  "requestId": "req_01H..."
}
```

## Webhooks

Configura `POST` a `https://tu-host/webhook` para recibir eventos del tenant: `farm.created`, `spray.applied`, `harvest_lot.opened`, `pallet.dispatched`, etc. Firma HMAC SHA-256 en `X-Karpos-Signature`.

## SDK

El SDK TypeScript está disponible como `@karpos/sdk` (workspace package). Instalación externa: `npm install @karpos/sdk` (cuando se publique).
