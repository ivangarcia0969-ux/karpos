# Karpos — Estructura comercial y planes

**Versión:** mayo 2026
**Objetivo:** planes lucrativos para Karpos y factibles para el cliente,
con margen sano y crecimiento por escalera de valor.

---

## 1. Filosofía de pricing

### Cuatro principios

1. **Precio anclado al valor, no al costo.** Un lote rechazado vale
   USD 20.000–60.000. Karpos cuesta una fracción de eso. El productor
   no compra software, compra seguridad operativa.
2. **Plan gratuito de captura, no de subsistencia.** Free atrapa al
   curioso y al productor pequeño; lo limita lo justo para que crezca a
   Starter cuando madura.
3. **Pro es el plan "elegido por la mayoría".** El centro de gravedad
   del pricing. Donde queremos que viva el 60% de los clientes.
4. **Enterprise tiene cotización abierta.** No publicamos precio fijo.
   Cada exportadora/cooperativa es un caso. Vendemos consultoría +
   plataforma juntos.

### Anclajes psicológicos

- Mostrar **anual primero** (más barato por mes) con badge "Ahorrás 2 meses".
- Marcar Pro como **"Recomendado"** con borde acentuado.
- Tachar precio mensual de USD para hacer evidente el descuento del anual.
- Enterprise sin precio → "Hablemos" → genera leads calificados.

---

## 2. Costos unitarios (lo que nos cuesta servir 1 cliente)

| Item | Costo mensual estimado | Notas |
|------|------------------------|-------|
| Compute (Postgres + API + Web compartido) | USD 0.50 – 2.00 / org | VPS Hostinger KVM 8 ~USD 30/mes soporta ~50 clientes iniciales. |
| Storage (DB + S3 + backups) | USD 0.20 / org | ~5-50 MB de datos típicos por org. |
| Soporte humano | USD 5 – 20 / org / mes | Variable según plan. Enterprise mucho más. |
| Onboarding inicial | USD 50 – 200 one-time | Migración Excel + capacitación. Cobrable como add-on. |
| Gateway de pagos (Stripe/Wompi) | 3% del cobro | A descontar del precio bruto. |

**Costo total por cliente Starter/Pro: USD 5–25/mes**.
Margen bruto deseado: ≥85% en planes Starter+. Enterprise: 60–70% (más soporte).

---

## 3. Planes propuestos

### 🌱 Cultivador (Free)

**Pensado para:** productor curioso, finca <5 ha, asesor evaluando.

| Item | Límite |
|------|--------|
| Hectáreas | 5 |
| Fincas | 1 |
| Lotes | 5 |
| Usuarios | 1 |
| Histórico | 3 meses (después, sólo lectura) |
| Soporte | Comunidad / docs |
| Módulos | Predios + Bitácora + Fenología (sin Sanidad+ ni Cosecha) |
| Backup nightly | ❌ |
| Catálogo ICA | ✅ (consulta) |
| Marca propia | ❌ |

**Precio:** USD 0
**Para qué:** captura de leads y demo en vivo. Conversión natural a Starter
cuando el productor crece o necesita sanidad.

---

### 🌿 Productor (Starter)

**Pensado para:** productor independiente 5–200 ha, 1–2 cultivos.

| Item | Límite |
|------|--------|
| Hectáreas | hasta 200 |
| Fincas | hasta 3 |
| Lotes | ilimitados |
| Usuarios | 5 |
| Histórico | ilimitado |
| Soporte | Chat business-hours, respuesta <24 h |
| Módulos | **Los 5 módulos completos** |
| Backup nightly | ✅ |
| Catálogo ICA + cat propio editable | ✅ |
| Portal trazabilidad QR (público) | ✅ |
| Exportación CSV/Excel | ✅ |
| Marca propia | ❌ |

**Precio:**
- Mensual: **USD 59/mes**
- Anual: **USD 590/año** (~USD 49/mes equivalente, ahorrás 2 meses)

**Margen estimado:** ~85%.
**Conversión esperada:** del Free, dentro de los 30 días en que el
productor termina su primer ciclo de cosecha.

---

### 🌳 Multifinca (Pro) — ⭐ Recomendado

**Pensado para:** empresa frutícola con 2–10 predios, cultivos mixtos,
exporta o vende a packing certificado.

| Item | Límite |
|------|--------|
| Hectáreas | hasta 1.500 |
| Fincas | hasta 10 |
| Lotes | ilimitados |
| Usuarios | 25 |
| Histórico | ilimitado |
| Soporte | Chat + email, respuesta <4 h en horario hábil |
| Módulos | Los 5 módulos + Catálogos avanzados |
| Backup nightly + restauración asistida | ✅ |
| Catálogo fitosanitario propio + adopción de globales | ✅ |
| Portal trazabilidad QR con branding | ✅ |
| Reportes consolidados multi-finca | ✅ |
| Exportación CSV/Excel/PDF | ✅ |
| Permisos por rol (owner/admin/manager/member/viewer) | ✅ |
| API REST de sólo lectura | ✅ |
| SLA 99.5% uptime | ✅ |
| Onboarding asistido (1 sesión) | ✅ |
| Marca propia (logo + colores en portal) | ❌ |

**Precio:**
- Mensual: **USD 249/mes**
- Anual: **USD 2.490/año** (~USD 207/mes, ahorrás 2 meses)

**Margen estimado:** ~88%.
**Conversión esperada:** clientes que vienen ya con varias fincas y
necesitan consolidar. Email frío directo a este perfil.

---

### 🌎 Exportador (Enterprise)

**Pensado para:** exportadora, cooperativa con productores asociados,
empresa con >1.500 ha o branding propio.

| Item | Límite |
|------|--------|
| Hectáreas | ilimitadas |
| Fincas | ilimitadas |
| Usuarios | ilimitados |
| Histórico | ilimitado |
| Soporte | Soporte 24×7, gerente de cuenta dedicado |
| Módulos | Todos los actuales + acceso prioritario a Fases 2-4 |
| Backup off-site + recuperación punto en el tiempo | ✅ |
| API REST completa (read+write) con tokens | ✅ |
| **Webhooks** para integración con ERP/packing house | ✅ |
| **SSO/SAML** (Keycloak/Auth0/Azure AD) | ✅ |
| **White-label**: logo, colores, dominio propio | ✅ |
| Multi-organización federada (matriz + subsidiarias) | ✅ |
| Audit logs descargables (cumplimiento) | ✅ |
| SLA 99.9% uptime con créditos | ✅ |
| Onboarding consultivo + migración Excel/Access | ✅ |
| Capacitación dedicada al equipo | ✅ |
| Caso de estudio (opcional, con descuento) | ✅ |

**Precio:** **Cotización abierta** (desde **USD 1.500/mes**).

Ejemplos:
- Exportadora con 20 productores asociados (~3.000 ha total): USD 1.800/mes
- Cooperativa con 50 productores (~5.000 ha): USD 3.500/mes
- Holding agrícola con 8.000 ha en 3 países: USD 6.000–9.000/mes

**Margen estimado:** 60–70% después de soporte y onboarding.

---

## 4. Add-ons (extras facturables)

Vendibles encima de cualquier plan pago.

### One-time

| Add-on | Precio | Para qué |
|--------|--------|----------|
| **Migración Excel/Access** | USD 300 – 800 | Cargamos tus planillas históricas en Karpos. |
| **Onboarding consultivo (4 hs)** | USD 400 | Sesiones de capacitación + configuración inicial. |
| **Capacitación de equipo (8 hs)** | USD 800 | Para clientes con varios usuarios. |
| **Configuración de auditoría GLOBALG.A.P.** | USD 1.500 | Mapeo de tus procesos a los criterios IFA v6. |
| **Setup white-label** | USD 1.200 | Sólo Enterprise. |

### Recurrentes

| Add-on | Precio | Notas |
|--------|--------|-------|
| Hectáreas adicionales (sobre el límite del plan) | USD 0.50/ha/mes | Pro: hasta 5.000 ha extra. |
| Usuario extra | USD 8/usuario/mes | Más del incluido. |
| Soporte prioritario (respuesta <1 h) | USD 200/mes | Disponible para Pro. |
| Backup hora-a-hora (en vez de nightly) | USD 50/mes | Pro y Enterprise. |
| API con cuota extendida (>10k req/día) | USD 100/mes | Sólo Pro y Enterprise. |
| Sandbox/ambiente de prueba | USD 150/mes | Sólo Enterprise. |

### Fases futuras (precios indicativos)

| Cuando salga... | Precio aproximado |
|-----------------|-------------------|
| **Karpos IQ** (asistente IA agronómico) | +USD 99/mes en Pro, +USD 299/mes en Enterprise |
| **EcoSat** (NDVI/EVI satelital por lote) | +USD 0.20/ha/mes |
| **App móvil** (offline sync) | Incluida en Starter+ |
| **Sensores IoT** (ingesta + dashboards) | Cotización por proyecto |

---

## 5. Descuentos y promociones

### Estructura permitida

| Descuento | Aplicación | Notas |
|-----------|-----------|-------|
| **Anual vs mensual** | -17% (2 meses gratis) | Default en checkout. |
| **Bienal anticipado** | -25% | Sólo Enterprise. |
| **Programa de referidos** | 3 meses gratis a referente y referido | Activable desde el panel. |
| **Cliente piloto** | 50% off los primeros 6 meses | Sólo primeros 10 clientes de cada país, a cambio de testimonio + permiso de caso de estudio. |
| **Asociaciones (Asohofrucol, ProColombia, etc.)** | 15% off | Convenio institucional. |
| **NGO / cooperativa pequeña** | 30% off | Caso por caso. |

### NO permitidos (proteger el anclaje)

- Descuentos genéricos sobre Pro o Enterprise (>20% sin razón comercial).
- Precios "negociados" sin documentación.
- Free Trial extendido más allá de 30 días.

---

## 6. Cómo elegir entre planes (script de venta)

Preguntas al prospecto, en orden:

1. **¿Cuántas hectáreas tenés en producción?**
   - <5 → Free
   - 5–200 → Starter
   - 200–1.500 → Pro
   - 1.500+ o tenés productores asociados → Enterprise

2. **¿Exportás o vendés a packing certificado?**
   - Sí → mínimo Starter (Free no incluye Sanidad+ con append-only)

3. **¿Cuántas personas van a usar Karpos?**
   - 1–4 → Starter
   - 5–24 → Pro
   - 25+ → Enterprise

4. **¿Querés branding propio en el portal de trazabilidad?**
   - Sí → Enterprise obligatorio.

5. **¿Tu IT pide SSO/SAML?**
   - Sí → Enterprise obligatorio.

---

## 7. Justificación del precio frente a objeciones

### "Mucho dinero"

> "Hacé este cálculo: un lote de exportación rechazado por residualidad
> mal gestionada cuesta entre USD 20.000 y 60.000. Pro cuesta USD 2.490 al
> año. Vos elegís cuántos lotes querés perder antes de invertir USD 7 al
> día en prevenirlo."

### "Es lo mismo que [competidor], más barato"

> "Competidor X no tiene catálogo ICA Colombia precargado, su período de
> carencia no se calcula automático y no cumple GLOBALG.A.P. CB 7.6 sin
> configuración manual. Cuando le sumás esas tres horas-hombre que vas a
> gastar configurándolo, salimos más barato y listo más rápido."

### "Mi finca es muy chica"

> "Por eso existe Cultivador (Free). Empezás sin pagar. Cuando crezcas o
> exportes, te subimos a Starter. Sin contrato, sin penalidad."

### "¿Y si me arrepiento?"

> "Tus datos son tuyos. Te exportamos un dump SQL en cualquier momento.
> Sin lock-in. Si ves más valor en seguir con Excel, lo entendemos."

### "Quiero pagar en pesos"

> "Aceptamos Stripe (tarjeta) y Wompi (PSE, Nequi, Daviplata). El precio
> figura en USD pero el cobro mensual es en COP al tipo de cambio del día.
> Eso te protege a vos también: si el peso se fortalece, pagás menos."

---

## 8. Roadmap de monetización (12 meses)

### Q1 2026 (junio–agosto)

- Lanzar los 4 planes en `/planes`.
- Cerrar 10 clientes piloto con 50% off los primeros 6 meses.
- Procesar pagos con Stripe (USD) y Wompi (COP).
- Métrica clave: **MRR = USD 1.000** (≈4 Pro o equivalente).

### Q2 2026 (sep–nov)

- Activar add-ons one-time (migración, onboarding).
- Programa de referidos en producción.
- Primer cliente Enterprise (exportadora).
- Métrica clave: **MRR = USD 5.000**.

### Q3 2026 (dic–feb 2027)

- Lanzar app móvil → upsell desde Free a Starter.
- Activar Karpos IQ como add-on premium.
- Métrica clave: **MRR = USD 15.000**.

### Q4 2026 (mar–may 2027)

- 2–3 clientes Enterprise activos.
- EcoSat (NDVI satelital) como add-on.
- Métrica clave: **MRR = USD 35.000–50.000**.

---

## 9. Comparativa rápida (tabla resumen)

| | Cultivador | Productor | **Multifinca** ⭐ | Exportador |
|--|--|--|--|--|
| **Precio anual** | Gratis | USD 590 | USD 2.490 | desde USD 18.000 |
| **Precio mensual** | — | USD 59 | USD 249 | desde USD 1.500 |
| Hectáreas | 5 | 200 | 1.500 | ilimitadas |
| Fincas | 1 | 3 | 10 | ilimitadas |
| Usuarios | 1 | 5 | 25 | ilimitados |
| Histórico | 3 meses | ilimitado | ilimitado | ilimitado |
| 5 módulos | parcial | ✅ | ✅ | ✅ |
| Catálogo ICA | lectura | ✅ + propio | ✅ + propio | ✅ + propio |
| Trazabilidad QR pública | ❌ | ✅ | ✅ con branding | ✅ white-label |
| API REST | ❌ | ❌ | sólo lectura | ✅ completa |
| SSO/SAML | ❌ | ❌ | ❌ | ✅ |
| Soporte | docs | 24 h | 4 h | 24×7 dedicado |
| SLA | — | — | 99.5% | 99.9% con créditos |

---

## 10. Implementación técnica

Cuando armemos el cobro real:

1. **Stripe** para tarjetas internacionales.
2. **Wompi** para LatAm (PSE Colombia, Nequi, Daviplata).
3. Tabla `karpos.subscriptions` (futura migración) con: `plan_code`,
   `billing_provider`, `external_id`, `status`, `current_period_end`.
4. Webhook handlers en `/v1/billing/webhooks/stripe` y `/wompi`.
5. Middleware que verifica límite de plan en cada `POST` (crear finca,
   crear lote, etc.) y bloquea si excedió.
6. Página `/console/billing` para que el owner cambie de plan, vea
   facturas y descargue PDFs.

**Fase 1.7 sugerida:** sumar billing como módulo. ~1-2 semanas.

---

## Cierre

Tres reglas para no quemar el anclaje:

1. **No bajes el precio sin motivo comercial documentado.**
2. **Pro es el centro de gravedad** — todo el copy y la página de planes
   debe empujar suavemente al cliente promedio hacia Pro.
3. **Enterprise nunca tiene precio público.** Genera conversación, no
   transacción automática.

El producto vale lo que vale por lo que **previene** (pérdidas por mala
gestión sanitaria), no por lo que tiene de software.
