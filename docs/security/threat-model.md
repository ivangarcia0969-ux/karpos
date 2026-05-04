# Karpos — Threat Model (STRIDE)

Versión 1.0 · 2026-05-04

## 1. Alcance

Cubre los componentes definidos en `docs/architecture/c4-containers.md`: web, mobile, api, ml, jobs, PostgreSQL, Redis, NATS, S3, Keycloak. Integraciones externas: Stripe/Wompi, Sentinel-2, ERPs, estaciones meteorológicas, LLM providers.

## 2. Activos

| Activo                          | Sensibilidad | Daño si se compromete                                     |
|---------------------------------|--------------|-----------------------------------------------------------|
| Datos de tenants (predios, cosecha, costos) | Alta | Pérdida de confianza, ventaja competitiva del rival |
| Libro de aplicaciones químicas  | Crítica      | Sanciones GLOBALG.A.P., decomiso de exportaciones         |
| Datos personales (cuadrillas)   | Alta         | Multas 1581/GDPR                                          |
| Credenciales / tokens           | Crítica      | Compromiso total del tenant                               |
| Hash chain de auditoría         | Crítica      | Pérdida de no-repudio                                     |
| Modelos ML y pesos              | Media        | Pérdida de IP                                             |
| Imágenes satelitales descargadas| Baja         | Costo de re-descarga                                      |

## 3. Diagrama de confianza (resumen)

```
[Cliente web/móvil] → (TLS) → [WAF/ALB] → [Ingress] → {api, web, ml}
                                                       ↓ (TLS)
                                                  [PG, Redis, NATS, S3]
[Stripe/Wompi] → (webhook firmado) → [api]
[Estaciones meteorológicas] → (MQTT/TLS) → [jobs]
```

## 4. STRIDE por componente

### 4.1 apps/api

| Categoría              | Amenaza                                                    | Mitigación                                                                                                        |
|------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| **S**poofing           | Token JWT robado o falsificado                             | JWT firmado por Keycloak con clave rotada, MFA obligatoria para roles admin, `aud`/`iss` validados, kid pinning   |
| **T**ampering          | Modificación de aplicaciones químicas pasadas              | Event sourcing append-only + hash chain con verificación nocturna (ver ADR-0003)                                  |
| **R**epudiation        | Operario niega haber registrado una aplicación             | Cada evento con `actor_id`, `actor_role`, IP, user-agent, `device_id`; firma del agricultor capturada como evidencia |
| **I**nfo disclosure    | Tenant A accede a datos de tenant B                        | RLS con `org_id` + rol de aplicación sin BYPASSRLS + tests automáticos que verifican aislamiento                  |
| **I**nfo disclosure    | Logs filtran tokens                                        | Pino redact en `authorization`, `cookie`; revisión SAST                                                            |
| **D**enial of service  | Bombardeo de endpoints públicos (portal QR)                | Rate limit por IP + WAF + Cloudflare en frente; cache en CloudFront                                               |
| **E**lev. of privilege | Bypass de PermissionsGuard                                 | Guards aplicados como APP_GUARD + tests por endpoint; permisos resueltos sólo desde JWT firmado                   |

### 4.2 PostgreSQL

| Categoría          | Amenaza                              | Mitigación                                                                                  |
|--------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| Tampering          | Edición directa de `audit_events`    | Triggers BEFORE UPDATE/DELETE que abortan; rol de aplicación sin permisos de update/delete  |
| Info disclosure    | Backup robado                        | Backups cifrados con KMS; retención 30 días; acceso a backups sólo a un rol IAM dedicado    |
| DoS                | Query no acotada (full scan)         | `statement_timeout` por rol; índices `(org_id, …)` obligatorios; `pg_stat_statements` revisado |

### 4.3 apps/web (Next.js)

| Categoría          | Amenaza                              | Mitigación                                                                                  |
|--------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| Tampering / XSS    | Inyección en campos libres           | React por defecto escapa; CSP estricto en headers; sanitización de markdown del copiloto    |
| Info disclosure    | Cookie de sesión leakeada            | `Secure`, `HttpOnly`, `SameSite=Lax`; rotación al MFA                                       |
| Spoofing           | CSRF en endpoints stateful           | SameSite + tokens CSRF en formularios server actions                                        |

### 4.4 apps/mobile

| Categoría          | Amenaza                              | Mitigación                                                                                  |
|--------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| Tampering          | Manipulación de SQLite local         | El servidor verifica eventos al sync; campos críticos (cosecha, sprays) firmados con HMAC del device key |
| Info disclosure    | Pérdida del dispositivo              | Token en SecureStore (Keychain/Keystore); MFA al re-abrir app tras 24h                      |
| DoS sync           | Cliente envía millones de cambios    | Limit por payload + por sesión; rejection con backoff                                        |

### 4.5 apps/ml

| Categoría          | Amenaza                              | Mitigación                                                                                  |
|--------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| Spoofing           | Llamadas no autenticadas             | Bearer token compartido entre api y ml; servicio sin Ingress externo                        |
| Tampering          | Modelo malicioso reemplazado         | Imágenes firmadas (cosign), checksum validado al cargar pesos                               |
| Prompt injection   | Pregunta del usuario contiene jailbreak | Prompts con marcadores explícitos; respuestas con citas verificables; sanitizar tool calls |

### 4.6 Integraciones externas

| Componente | Amenaza                                | Mitigación                                                                            |
|------------|----------------------------------------|---------------------------------------------------------------------------------------|
| Stripe     | Webhook spoofeado                      | Verificación de firma `Stripe-Signature` con secreto rotable                          |
| ERPs       | Credenciales filtradas                 | Tokens almacenados cifrados en SSM/Secrets Manager; rotación automatizada             |
| LLM provider | Datos del tenant enviados al modelo  | Anonimización de identificadores; opt-in del tenant; modo on-prem para Enterprise     |

## 5. Controles transversales

- **Cifrado**: TLS 1.3 obligatorio extremo a extremo. At-rest: KMS para PG, Redis, S3.
- **Identidad**: Keycloak central; MFA TOTP/WebAuthn; OIDC/SAML para federación.
- **Secretos**: AWS Secrets Manager + External Secrets Operator en EKS. Cero secretos en values.yaml.
- **Imágenes**: build SBOM con syft, vuln scan con trivy en CI; firma con cosign.
- **Red**: VPC privada; node groups sin IP pública; egress controlado.
- **Backup/Recovery**: PITR PostgreSQL 35 días; RPO 5 min, RTO 1 h. Restore drills trimestrales.
- **Cumplimiento**: GDPR (DPA estándar disponible), Ley Colombia 1581 (registro de tratamiento), SOC 2 Type II en roadmap, cumplimiento GLOBALG.A.P. para el módulo de químicos.
- **Acceso**: Just-in-time access a producción vía SSO + aprobación; sesiones grabadas (Teleport o equivalente).

## 6. Gestión de vulnerabilidades

- **SAST**: Semgrep en CI bloquea merges con findings high/critical.
- **DAST**: ZAP baseline scan semanal contra staging.
- **Dependencias**: Renovate semanal; Dependabot security; SBOM publicado.
- **Pen test**: anual por tercero acreditado.
- **Bug bounty**: roadmap (ver `security-policy.md`).

## 7. Revisión

Este documento se revisa cada 6 meses o ante cambios arquitecturales mayores.
