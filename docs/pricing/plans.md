# Karpos — Planes y monetización

Versión 1.0 · 2026-05-04

## 1. Planes

| Característica                   | Starter         | Pro              | Enterprise        |
|----------------------------------|-----------------|------------------|-------------------|
| **Precio mensual (USD)**         | 49              | 249              | A medida          |
| **Precio anual (USD)**           | 490             | 2,490            | A medida          |
| Usuarios                         | 5               | 20               | Sin límite        |
| Hectáreas                        | 100             | 1,000            | Sin límite        |
| Fincas                           | 2               | 10               | Sin límite        |
| Predios                          | ✓               | ✓                | ✓                 |
| Bitácora Verde                   | ✓               | ✓                | ✓                 |
| Fenoflow                         | ✓               | ✓                | ✓                 |
| Sanidad+                         | ✓               | ✓                | ✓                 |
| Cosecha360                       | ✓               | ✓                | ✓                 |
| AquaPlan (riego/fertirriego)     | —               | ✓                | ✓                 |
| Cuadrillas / nómina              | —               | ✓                | ✓                 |
| Trazabilidad QR + portal público | —               | ✓                | ✓                 |
| EcoSat (NDVI/NDRE/NDMI)          | —               | ✓                | ✓                 |
| Karpos IQ (copiloto)             | —               | ✓                | ✓                 |
| Empaque y Frío                   | —               | —                | ✓                 |
| CertiBox                         | —               | —                | ✓                 |
| Marketplace                      | —               | —                | ✓                 |
| Panel Ejecutivo                  | —               | —                | ✓                 |
| SSO (SAML/OIDC)                  | —               | —                | ✓                 |
| Cluster dedicado / on-prem       | —               | —                | ✓                 |
| API access                       | Solo lectura    | Lectura/escritura| Sin límite        |
| Soporte                          | Comunidad       | Horas hábiles    | 24×7 + CSM        |
| SLA                              | —               | 99.5%            | 99.9%             |
| Datos en región preferida        | us-east-1       | us-east-1, sa-east-1 | A elección    |
| Sandbox de pruebas               | —               | ✓                | ✓                 |

## 2. Add-ons

| Add-on                       | Precio                   |
|------------------------------|--------------------------|
| 1,000 ha adicionales         | USD 0.10/ha/mes          |
| Usuarios extra (más allá del plan) | USD 8/usuario/mes  |
| Sentinel-2 alta frecuencia (3-5 días) | USD 49/finca/mes |
| Planet PlanetScope (3 m diario)   | A medida (pass-through del costo Planet) |
| Soporte 24×7 dedicado        | USD 990/mes              |

## 3. Límites técnicos por plan

| Recurso               | Starter   | Pro       | Enterprise |
|-----------------------|-----------|-----------|------------|
| Llamadas API/min       | 60        | 600       | 6,000      |
| Almacenamiento de fotos| 5 GB      | 50 GB     | 500 GB     |
| Eventos auditoría      | 100k/mes  | 1M/mes    | Sin límite |
| Sesiones Karpos IQ/mes | —         | 500       | Sin límite |

## 4. Pagos

- **Stripe**: clientes globales y pagos en USD/EUR; tarjeta o ACH.
- **Wompi**: clientes en Colombia (PSE, Nequi, tarjetas locales).
- **Factura local**: solo Enterprise; la organización emite factura electrónica vía proveedor (DIAN para Colombia, AFIP para Argentina, SII para Chile).
- **Período de prueba**: 30 días en Starter y Pro, sin tarjeta requerida.

## 5. Política de uso justo

- Detección de exceso: meters en `karpos.usage_meters` (hectáreas ingeridas, llamadas API, fotos).
- Si un tenant supera el límite del plan en 2 meses consecutivos, se le ofrece upgrade automático con preaviso de 14 días.
- Sin "throttle silencioso": el sistema avisa al admin antes de degradar.

## 6. Descuentos institucionales

- Cooperativas multi-tenant: 25% sobre Pro a partir de 5 tenants.
- ONGs y educación: 50% sobre Pro con verificación.
