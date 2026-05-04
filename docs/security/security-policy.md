# Política de seguridad — Karpos

Versión 1.0 · 2026-05-04

## 1. Compromisos

Karpos implementa un programa de seguridad continuo basado en defensa en profundidad, mínimo privilegio y mejora continua. Las prácticas concretas se documentan en `docs/security/threat-model.md`.

## 2. Reporte de vulnerabilidades

- **Email**: security@karpos.com (preferido).
- **Encriptado**: clave pública PGP publicada en `https://karpos.example/.well-known/security.txt`.
- **Compromiso**: respuesta inicial ≤ 72 h. Triage y plan ≤ 7 días. Resolución según severidad CVSS.
- **Safe harbor**: no perseguiremos legalmente a investigadores de buena fe que cumplan con esta política y eviten degradar el servicio o exponer datos de terceros.
- **No se permite**: acceder a datos de tenants reales, ataques de ingeniería social al staff, denegación de servicio sostenida, sniffing en redes que no sean propias.

## 3. Cumplimiento

- **GDPR**: rol de Data Protection Officer designado, registro de actividades de tratamiento, DPA estándar disponible para clientes.
- **Ley 1581 de 2012 (Colombia)**: registro nacional de bases de datos cuando aplique, autorización del titular para datos personales sensibles.
- **SOC 2 Type II**: roadmap 2026 Q4.
- **GLOBALG.A.P.**: el módulo de Sanidad+ y libros de campo cumple los puntos de control IFA v6 relevantes a registros electrónicos inmutables.

## 4. Soporte de versiones

| Componente   | Soporte de seguridad                                                  |
|--------------|-----------------------------------------------------------------------|
| API server   | últimas dos versiones minor                                           |
| Web app      | última versión publicada                                              |
| Apps móviles | versiones publicadas en últimos 90 días                               |
| ML service   | última versión; se evalúan parches críticos en versión anterior      |

## 5. Datos del cliente

- Por defecto, los datos se almacenan en la región del tenant (LatAm en `us-east-1` con réplicas en `sa-east-1` para clientes que lo soliciten).
- Exportación de datos: en cualquier momento desde el panel; entrega en 24 h en formato CSV/JSON estructurado y rasters originales.
- Borrado: a solicitud, con plazo regulatorio mínimo respetado para registros que aún tienen obligación legal de conservación (ej. aplicaciones químicas).

## 6. Cambios

Esta política se actualiza al menos anualmente o ante cambios materiales.
