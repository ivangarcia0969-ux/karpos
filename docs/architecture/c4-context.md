# C4 — Diagrama de Contexto (Karpos)

```mermaid
C4Context
  title Karpos — Sistema de manejo integral de cultivos frutales

  Person(grower, "Productor / Mayordomo", "Registra labores en campo, consulta estado de lotes, autoriza aplicaciones.")
  Person(agronomist, "Asesor Agronómico", "Visita fincas, deja recomendaciones, firma planes.")
  Person(crew, "Trabajador de cuadrilla", "Marca rendimiento por destajo, registra cosecha por canasta.")
  Person(packing, "Operador de empaque", "Pesa lotes, asigna a pallets, etiqueta con QR.")
  Person(buyer, "Comprador / Importador", "Verifica trazabilidad y certificaciones del lote.")
  Person(consumer, "Consumidor final", "Escanea QR del producto y ve historia del lote.")
  Person(admin, "Administrador de organización", "Configura usuarios, roles, módulos, facturación.")

  System(karpos, "Karpos", "Plataforma SaaS multi-tenant: web + móvil + API + IA + IaC.")

  System_Ext(weather, "Estaciones meteorológicas", "Davis, Pessl, MQTT genérico; pronóstico hiperlocal.")
  System_Ext(satellite, "Imágenes satelitales", "Sentinel-2 (Copernicus), Planet API opcional.")
  System_Ext(erp, "ERP del cliente", "SAP B1, Siigo, QuickBooks — consolidación contable.")
  System_Ext(payments, "Pasarelas de pago", "Stripe (global), Wompi (Colombia).")
  System_Ext(idp, "Identity Provider", "Keycloak / OIDC; SSO empresarial vía SAML.")
  System_Ext(s3, "Almacenamiento de objetos", "S3 / MinIO — fotos de campo, PDFs, exportes.")

  Rel(grower, karpos, "Registra y consulta", "HTTPS / app móvil offline-first")
  Rel(agronomist, karpos, "Recomienda y firma")
  Rel(crew, karpos, "Marca rendimiento", "App móvil")
  Rel(packing, karpos, "Pesa, etiqueta, despacha")
  Rel(buyer, karpos, "Consulta trazabilidad", "Portal QR")
  Rel(consumer, karpos, "Escanea QR público", "HTTPS")
  Rel(admin, karpos, "Configura tenant", "HTTPS")

  Rel(karpos, weather, "Ingiere observaciones", "MQTT / HTTPS")
  Rel(karpos, satellite, "Descarga rasters NDVI/NDRE/NDMI", "STAC API")
  Rel(karpos, erp, "Exporta asientos contables", "REST / archivos")
  Rel(karpos, payments, "Cobra suscripciones", "Webhooks")
  Rel(karpos, idp, "Autentica usuarios", "OIDC / SAML")
  Rel(karpos, s3, "Almacena binarios", "S3 API")
```

## Roles y aislamiento

Cada usuario pertenece a una o más **organizaciones** (tenants). Un usuario puede tener un rol distinto por organización. Los datos se aíslan por `org_id` mediante Row-Level Security en PostgreSQL — ver [ADR-0002](adr/0002-multitenancy.md).
