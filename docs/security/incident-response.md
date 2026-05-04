# Karpos — Plan de Respuesta a Incidentes

Versión 1.0 · 2026-05-04

## 1. Definiciones

- **Incidente**: evento que compromete confidencialidad, integridad, disponibilidad o cumplimiento.
- **Severidad**:
  - **SEV1**: brecha de datos confirmada, sistema caído > 30 min, fraude financiero.
  - **SEV2**: degradación severa, riesgo elevado pendiente de confirmación.
  - **SEV3**: afecta a un tenant aislado, soluble en horas hábiles.
  - **SEV4**: defecto reproducible sin afectación productiva.

## 2. Roles

| Rol                  | Responsabilidad                                          |
|----------------------|----------------------------------------------------------|
| Incident Commander   | Coordina, decide, comunica al exterior si aplica         |
| Tech Lead            | Ejecuta diagnóstico técnico y mitigación                 |
| Comms Lead           | Maneja comunicación a clientes y reguladores             |
| Scribe               | Registra hechos, decisiones, hora UTC                    |
| Legal/DPO            | GDPR/1581: notificación a autoridades cuando aplique     |

## 3. Flujo

1. **Detección** → alerta automática (Sentry, OTel, Grafana) o reporte manual a `security@karpos.com`.
2. **Triage** (≤ 15 min): IC asigna severidad y abre canal de incidente.
3. **Contención** (≤ 1 h SEV1/2): mitigación inmediata (rotar secretos, deshabilitar feature, escalar réplicas). Snapshot forense antes de purgar.
4. **Erradicación**: eliminar la causa raíz.
5. **Recuperación**: restaurar SLO, validar con telemetría y pruebas.
6. **Post-mortem** (≤ 5 días hábiles): blameless, con timeline UTC, root causes, contributing factors, action items con dueño y fecha.

## 4. Comunicación externa

| Audiencia             | Plazo            | Canal                                |
|-----------------------|------------------|--------------------------------------|
| Tenants impactados    | ≤ 1 h SEV1       | Email + banner in-app + status page  |
| SIC (Colombia, ley 1581) | ≤ 15 días     | Notificación formal escrita          |
| Autoridades GDPR      | ≤ 72 h           | Vía DPO                              |
| Clientes Enterprise   | ≤ 30 min SEV1    | Llamada + email                      |

## 5. Playbooks (resumen)

### 5.1 Brecha de credenciales / token

1. Rotar secretos OIDC (clientes Keycloak) y JWKS.
2. Forzar logout global vía Keycloak admin.
3. Revisar `audit.audit_events` para acciones sospechosas.
4. Revocar API keys del tenant afectado.
5. Notificar al tenant; recomendar rotar su contraseña y reactivar MFA.

### 5.2 Sospecha de cross-tenant data access

1. Pausar despliegues.
2. Ejecutar `analytics.rls_audit` para verificar políticas.
3. Revisar logs de la query y trazas OTel involucradas.
4. Si confirmado, contención: revocar acceso de aplicación al tenant origen.
5. Forensic dump cifrado a S3 dedicado de incidentes.

### 5.3 Compromiso de dependencia (supply chain)

1. Revisar SBOM + advisories.
2. Pinear versión segura, rebuild imágenes, redeploy.
3. Si la dep ejecutó código en runtime: rotar todos los secretos accesibles desde ese pod.

### 5.4 Manipulación detectada en hash chain

1. Identificar `aggregate_id` y `seq` reportados por `audit.verify_chain`.
2. Aislar tenant: solo lectura.
3. Investigar: ¿BYPASSRLS usado? ¿UPDATE manual? ¿Restore parcial?
4. Reconstruir read models desde último checkpoint válido.
5. Reportar al cliente y a la entidad certificadora si certificaciones se ven afectadas.

## 6. Drills

- Tabletop trimestral con escenarios rotados (los anteriores).
- DR drill anual con restore real desde backup en región alterna.
