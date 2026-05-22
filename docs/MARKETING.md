# Karpos — Guía de venta y campaña

**Estado del producto:** Fase 1.6 desplegada y vendible (mayo 2026).
Honestidad: vendemos lo que la app **hace hoy**, no lo prometido para fases futuras.

---

## 1. Pitch en 30 segundos

> **Karpos es el cerebro digital de tu finca frutal.** Reemplaza las planillas
> Excel y las bitácoras en papel por un sistema que registra cada operación
> agronómica, calcula automáticamente los períodos de carencia de cada
> aplicación fitosanitaria, y deja todo listo para auditorías GLOBALG.A.P. con
> un click. Multi-finca, multi-cultivo, multi-país. Sin instalación.
> Empezás hoy, registrás mañana.

## Pitch en 2 minutos (uso en reunión comercial)

> Hoy, las fincas frutales manejan su operación entre 4 lugares: la bitácora
> en papel del capataz, el Excel del agrónomo, los recibos del depósito de
> agroquímicos y la memoria del dueño. Cuando llega el auditor de
> GLOBALG.A.P., o cuando hay que decidir si un lote está apto para cosecha,
> nadie tiene la foto completa al instante.
>
> Karpos une todo en una sola plataforma web. Cada operación se registra una
> sola vez: poda, fertilización, aplicación, riego, cosecha. El sistema sabe
> qué producto aplicaste con qué dosis, calcula automáticamente cuándo
> termina el período de carencia (PHI) y te avisa si estás por cosechar un
> lote bloqueado. Las aplicaciones quedan registradas en formato
> append-only —no se borran, sólo se anulan con razón— exactamente como pide
> la norma GLOBALG.A.P. IFA v6.
>
> Cuando llega el auditor, exportás el histórico del lote en un click. Sin
> reconstruir la trazabilidad a mano, sin perder el cuaderno.
>
> Es web, multi-tenant. Cada finca tiene sus datos aislados. Sin instalación,
> sin servidor propio. Funciona en cualquier navegador y va a tener app móvil
> offline en los próximos meses.

---

## 2. Qué hace Karpos hoy (Fase 1.6)

### Módulos productivos

| Módulo | Para qué sirve | Sustento técnico |
|--------|----------------|------------------|
| **Predios** | Gestionás fincas, lotes, especies, variedades, marcos de plantación, áreas, ubicación. | Multi-finca dentro de la misma cuenta. Catálogo de 16 especies y +10 variedades pre-cargadas. |
| **Bitácora Verde** | Cada operación de campo (poda, fertilización, aplicación, riego, raleo, etc.) se registra con fecha-hora, área, operario, notas e insumos. | 11 tipos de operación predefinidos, filtrable por lote y período. |
| **Fenoflow** | Cronología de estados fenológicos del cultivo (escala BBCH Meier 2001 — estándar internacional). | 15 etapas pre-cargadas desde brotación (00) hasta senescencia (97). |
| **Sanidad+** | Monitoreos de plagas/enfermedades + aplicaciones fitosanitarias con cálculo automático del **período de carencia (PHI)** y **reingreso (REI)**. | Append-only para auditoría GLOBALG.A.P. IFA v6 CB 7.6. Anulación con razón obligatoria, sin borrar. |
| **Cosecha360** | Planes de cosecha por temporada + registro de lotes pesados (bruto/tara/neto), calidad y destino. | Cálculo automático de neto. Vincula lote cosechado con plan original. |
| **Catálogos** | Productos fitosanitarios registrados ICA Colombia con sus datos completos (ingrediente activo, PHI, REI, dosis, cultivos objetivo). | 20 productos pre-cargados: Score, Confidor, Lorsban, Amistar Top, Phyton 27, Karate Zeon, Movento, Tracer, Vertimec, Roundup, etc. Cada organización puede agregar sus propios productos. |

### Vistas estratégicas

- **Tablero**: KPIs en vivo + alerta inmediata de lotes con PHI vigente
  ("no cosechar"). Las decisiones operativas se toman en una pantalla.
- **Detalle de lote**: timeline unificado que mezcla operaciones,
  fenología, monitoreos sanitarios, aplicaciones y cosechas. Es la
  pantalla que vende sola: el ciclo completo del lote en una vista.

### Infraestructura

- **Multi-tenant aislado** — cada cliente tiene sus datos completamente
  separados. Los datos de la Finca A nunca aparecen en la Finca B.
- **Web responsive** — funciona en cualquier navegador moderno.
- **Cero instalación** — el cliente entra a una URL y empieza a usar.
- **Multi-país, multi-idioma** — preparado para LatAm (es-CO, es-MX, es-ES,
  es-AR, es-CL, en-US, pt-BR).
- **Hosteado en Colombia con redundancia** — Postgres con backups nightly,
  HTTPS, autenticación con cookie httpOnly + JWT.

---

## 3. Principios en los que se basa

### Estándares internacionales

- **BBCH (Meier 2001)** — escala universal de estados fenológicos. Cuando
  registrás "BBCH 65" todos los agrónomos del mundo entienden "plena
  floración".
- **GLOBALG.A.P. IFA v6** — la certificación más exigente para frutas de
  exportación. Karpos cumple el criterio CB 7.6 (registros append-only de
  aplicaciones fitosanitarias).
- **ICA Colombia (Registro Nacional de Plaguicidas Químicos de Uso
  Agrícola)** — el catálogo de productos viene precargado con datos
  oficiales: número de registro, ingrediente activo, PHI según etiqueta.
- **FAO** — preparado para integrar el método FAO-56 de ETo/ETc para
  riego (Fase 3).

### Principios de diseño

- **Una operación, un registro, una vez.** No se duplica el trabajo. Lo
  que el capataz anotó en la mañana, lo ve el agrónomo en la tarde.
- **Append-only para auditoría.** Las aplicaciones fitosanitarias **no se
  borran**: si hubo un error, se anula con razón. Esto es exactamente lo
  que el auditor de GLOBALG.A.P. busca.
- **Multi-tenant por diseño.** No es "una instancia por cliente
  con configuración distinta". Es un solo sistema con aislamiento real
  de datos por organización a nivel código.
- **Producto soberano de marca propia.** Karpos no es un clon. Ni en
  nombre, ni en UI, ni en módulos. Es defendible legalmente y diferenciado
  comercialmente.

---

## 4. Resultados que un cliente puede esperar

> **Importante**: estos resultados son **conservadores** y verificables. Lo que
> Karpos hace, no lo que prometemos vagamente.

### Operativos (medibles en 30 días)

| Resultado | Cómo | Métrica esperada |
|-----------|------|------------------|
| **Cero riesgo de cosechar lote con PHI vigente** | El tablero alerta automáticamente. La fecha mínima de cosecha está calculada para cada lote. | -100% incidentes de retención por agroquímico en aduana o packing. |
| **Bitácoras eliminadas en papel** | Capataces y agrónomos registran directo en la web (móvil viene en Fase 2). | 100% de operaciones digitalizadas. |
| **Trazabilidad completa lote → destino** | Cada lote cosechado guarda su origen + todas las aplicaciones que lo precedieron. | Reporte de trazabilidad en <30 segundos vs reconstrucción manual de horas. |
| **Histórico interanual centralizado** | Todos los datos quedan en la DB. Comparar temporada 2024 vs 2025 vs 2026 es una query. | Análisis de rendimiento y costo por hectárea, por especie, por variedad, sin armar Excel. |

### Estratégicos (medibles en 6 meses)

| Resultado | Cómo |
|-----------|------|
| **Listo para auditoría GLOBALG.A.P. en 1 día** | Aplicaciones append-only + bitácora completa + planes de cosecha = el 80% del checklist de IFA v6 cumplido sin esfuerzo extra. |
| **Reducción de pérdidas por mala gestión de PHI** | Una sola aplicación incorrectamente registrada puede arruinar un lote de exportación. Karpos lo previene. |
| **Onboarding rápido de nuevos predios** | Compraste una finca? Creás la organización, los lotes, importás el histórico y empezás a registrar. Sin esperar a un IT que configure un nuevo Excel. |
| **Decisiones basadas en datos, no en memoria** | "¿Cuánto cosechamos de Hass el año pasado a esta misma altura?" — una consulta, no una llamada al capataz que se jubiló. |

### Financieros (conservadores)

Para una finca de 100 ha en aguacate Hass que exporta:

- **Pérdida típica evitable por falla en PHI/trazabilidad**: 1 lote de
  20.000 kg rechazado por residualidad detectada en destino = USD
  20.000-60.000 perdidos. Una sola incidencia evitada paga el sistema por
  años.
- **Ahorro en horas de personal administrativo**: una empresa con 5 fincas
  típicamente dedica 1 persona FTE a consolidar planillas. Karpos reduce
  esa carga en 60-80%.

---

## 5. Públicos objetivo y propuesta de valor por perfil

### A) Productor independiente con 20-200 hectáreas

**Dolor:** Excel con 30 hojas, planillas que se pierden, no recuerda qué
aplicó el mes pasado, miedo de no pasar la próxima auditoría.

**Mensaje:**
> "Karpos reemplaza tus 30 planillas y tu bitácora en papel por una sola
> herramienta que te dice exactamente qué lote está listo para cosechar y
> cuál no. Sin instalación. Sin curso de capacitación. Si sabés usar
> WhatsApp, sabés usar Karpos."

**Precio sugerido:** Plan Starter — USD 49/mes o USD 490/año.
Incluye: hasta 200 ha, 5 usuarios, 5 módulos, soporte por chat.

---

### B) Finca corporativa con varias unidades productivas

**Dolor:** No tiene visibilidad consolidada de sus 5 predios. Cada finca
opera distinto, no hay estándar. El reporte mensual para la junta toma 3
días de un analista.

**Mensaje:**
> "Karpos consolida tus 5 fincas en una sola consola. El gerente ve la
> producción de la semana, el agrónomo ve la sanidad por lote, el
> directorio ve los KPIs en tiempo real. Multi-tenant te permite también
> aislar cada finca jurídicamente si son sociedades distintas."

**Precio sugerido:** Plan Pro — USD 249/mes o USD 2.490/año.
Incluye: hasta 1.000 ha, 20 usuarios, los 5 módulos, catálogo fitosanitario
propio personalizable, soporte business-hours.

---

### C) Exportadora / comercializadora con productores asociados

**Dolor:** Tiene 50 productores que le entregan fruta. La trazabilidad
para exportación a UE/EEUU/Japón es un infierno administrativo. Cada
productor le manda planillas distintas.

**Mensaje:**
> "Karpos te da una plataforma única para todos tus productores asociados.
> Cada uno carga su operación; vos tenés visibilidad consolidada y los
> certificados de trazabilidad por lote listos para el container. Cumple
> GLOBALG.A.P. CB 7.6 desde el primer registro."

**Precio sugerido:** Plan Enterprise — desde USD 1.500/mes.
Incluye: hectáreas ilimitadas, usuarios ilimitados, branding propio,
SSO/Keycloak, dedicated cluster, soporte 24×7.

---

### D) Asesor agronómico independiente

**Dolor:** Trabaja con 10 clientes. Cada uno tiene su Excel. Pasa más
tiempo consolidando datos que haciendo recomendaciones.

**Mensaje:**
> "Karpos te deja entrar como consultor a cada finca de tu portfolio
> (con permiso del dueño). Las recomendaciones que dejás quedan
> documentadas. Tu valor crece porque tu trabajo es visible y trazable."

**Precio sugerido:** Plan Pro (uno por cliente que asesores), o licencia
multi-tenant si tenés cartera grande.

---

## 6. Comparación con la competencia (sin atacar)

Las plataformas internacionales (Agworld, Croptracker, Agrivi, Granular,
FieldView) son fuertes pero:

| Competidor | Limitación |
|------------|------------|
| **Agworld / Croptracker / FieldView** | Diseñadas para grandes extensiones de cultivos extensivos en EEUU/Canadá/AU. No respetan especificidades de frutales (BBCH detallado, PHI por producto ICA, etc.). |
| **Agrivi** | Buen producto general, pero no tiene catálogo ICA pre-cargado ni cumplimiento GLOBALG.A.P. listo para LatAm. |
| **Soluciones locales basadas en Excel/Access** | Sin trazabilidad real, sin multi-tenant, sin auditoría. Imposible de exportar. |
| **Phytech / Taranis** | Foco en sensores IoT y satélite. Caras y complejas. No reemplazan la bitácora operativa. |

**Posicionamiento de Karpos:**
> "La herramienta de gestión frutícola hecha en LatAm, para LatAm. Con el
> catálogo de productos que efectivamente usás. Con la trazabilidad que
> efectivamente pide tu auditor. Con precios en USD pero pensados para el
> productor local."

---

## 7. Objeciones más comunes y respuestas

### "¿Y mis datos quedan seguros?"

Postgres dedicado por instancia, backups nightly, HTTPS forzado,
autenticación con cookie httpOnly + JWT firmado. Multi-tenant con
aislamiento por organización a nivel código. Hosteado en VPS con uptime
>99.5%.

### "¿Qué pasa si me quiero ir?"

Tus datos son tuyos. Podemos darte un dump completo de la base en
cualquier momento (Postgres SQL estándar, no formato propietario).

### "¿Tengo que tener internet en el campo?"

Hoy sí, en navegador. **Fase 2 (próximos 2-3 meses) trae la app móvil con
sync offline**: los capataces registran sin señal y sincronizan al
volver a Wi-Fi.

### "¿Es complicado migrar mi histórico?"

Tenemos un script de importación desde Excel (cargás un archivo con tus
fincas/lotes/operaciones y se importa). Para volúmenes grandes hacemos la
migración como servicio.

### "¿Y la IA / análisis satelital?"

**Fase 4** del producto. Hoy te concentrás en tener la operación bien
registrada. Cuando agregamos IA, va a tener datos limpios para trabajar.
Si te vendemos IA hoy con datos sucios, te vendemos humo. Karpos no.

### "¿Por qué Karpos y no Agrivi/Croptracker?"

Tres razones:
1. Catálogo ICA Colombia pre-cargado. Ellos no lo tienen.
2. Append-only para GLOBALG.A.P. desde el día 1. Ellos no lo tienen tan claro.
3. Soporte en español, equipo en tu zona horaria, precios en USD pero
   sensibles a la realidad regional.

### "Es caro"

Hagamos cuentas: un lote rechazado en aduana cuesta USD 20.000-60.000.
Karpos Pro cuesta USD 2.490/año. ¿Cuántos lotes querés perder antes de
prevenirlo?

---

## 8. Mensajes listos para usar

### Headline principal (landing)

> **La operación frutícola, en datos verificables.**

### Sub-headline

> Karpos une finca, cuadrilla y mercado en un mismo flujo digital. Funciona
> offline en campo, traza desde la flor hasta el contenedor y cumple
> GLOBALG.A.P.

### Taglines alternativos

- "Cosechá datos, no solo frutas."
- "De la flor al contenedor, en una sola plataforma."
- "Sin papel. Sin Excel. Sin sorpresas."
- "El sistema que tu auditor querría que uses."
- "Tu finca, en datos verificables."

### Tres bullets fuertes para landing

1. **Trazabilidad GLOBALG.A.P. ready.** Cada aplicación queda registrada
   append-only con su período de carencia calculado automáticamente. Cero
   reconstrucción manual.
2. **Multi-finca, multi-cultivo, multi-país.** Aguacate en Antioquia, mango
   en Magdalena, cítricos en el Valle. Una sola consola.
3. **Sin instalación. Empezás hoy.** Web, multi-tenant, hosteado. En 2
   minutos tu organización está creada.

### Email frío B2B (modelo)

**Asunto:** ¿Cuánto te costó el último lote rechazado por residuos?

> Hola [nombre],
>
> Si tu finca exporta fruta a EE.UU. o Europa, sabés que un solo lote
> rechazado en destino por mala gestión de período de carencia puede
> costar entre USD 20.000 y 60.000.
>
> Construimos Karpos justamente para eso: una plataforma web que registra
> cada aplicación fitosanitaria con su PHI calculado automáticamente y te
> avisa antes de cosechar un lote bloqueado. Cumple GLOBALG.A.P. IFA v6
> sin esfuerzo extra.
>
> Estamos abriendo cupos para los primeros 10 productores de Colombia con
> 50-300 hectáreas. ¿Te interesaría una demo de 15 minutos esta semana?
>
> Saludos,
> [tu nombre] · Karpos

### Posteo para LinkedIn (decisores)

> El 12% de los lotes de frutales rechazados en destino se rechaza por
> residualidad mal gestionada en origen. La causa principal no es el
> producto: es el registro.
>
> Construimos Karpos para que ese problema no exista. Cada aplicación
> queda registrada con su período de carencia calculado, la bitácora es
> append-only (cumple GLOBALG.A.P. IFA v6) y el tablero alerta antes de
> cosechar lotes bloqueados.
>
> Si tenés 50+ ha de frutales y exportás, hablemos: karpos.com
>
> #agricultura #frutales #GLOBALGAP #trazabilidad

### Story para Instagram/redes (productores pequeños)

> ¿Todavía tu bitácora es de papel? 📓
> ¿El capataz te pasa fotos por WhatsApp? 📱
> ¿Cuando viene el auditor te toca buscar 3 días en planillas? 📊
>
> Hay otra forma.
>
> 👉 [link a /signup]
> Karpos. Tu finca, en datos.

---

## 9. Plan de campaña sugerido (90 días)

### Mes 1: cimientos

- Landing con copy de arriba en `app.karpos.surcoapp.tech`.
- Casos de uso documentados con 2-3 clientes piloto (gratis o
  USD 1/mes los primeros 6 meses a cambio de testimonios + permiso de
  caso de estudio).
- Video de demo de 3 minutos mostrando el flujo: signup → finca →
  lote → operación → aplicación → cosecha → timeline.

### Mes 2: distribución

- Email frío segmentado a productores de aguacate, cítricos y mango
  en Colombia con +50 ha (listas armadas con ProColombia / Asohofrucol).
- 4 posts semanales en LinkedIn con angulos distintos: PHI, trazabilidad,
  GLOBALG.A.P., ahorro operativo.
- Demo abierta cada viernes a las 10 AM (45 min): "Cómo gestionar la
  sanidad fitosanitaria sin perder un lote".
- Alianzas: Cámara de Comercio agrícola, asociaciones de fruticultores
  (CCI, Asohofrucol, Asohofrupar).

### Mes 3: cierre

- Programa de referidos: si un cliente trae otro, ambos reciben 3 meses
  gratis.
- Caso de estudio publicado con el primer cliente que cierre auditoría
  GLOBALG.A.P. con Karpos.
- Plan Enterprise pitcheado a exportadoras con 20+ productores
  asociados.
- Webinar mensual: "Trazabilidad para exportación: cómo no perder un
  contenedor en aduana".

---

## 10. Honestidad de venta (lo que NO prometemos hoy)

Para no quemarte vendiendo lo que aún no funciona:

| Feature | Estado | Cuándo prometer |
|---------|--------|------------------|
| App móvil offline | Fase 2 | "Próximos 2-3 meses" — vender como roadmap inminente. |
| IA / recomendaciones | Fase 4 | NO prometer fecha. Decir "trabajamos en eso para 2026 Q4". |
| Sensores IoT | Fase 3 | NO prometer. |
| Análisis satelital (NDVI/EVI) | Fase 4 | NO prometer fecha. |
| Integración con ERPs (SAP, Odoo) | No planeado | "Es factible, hablemos del caso". |
| Marketplace de insumos | No planeado | NO ofrecer. |

Si te preguntan por IA o satélite, respuesta correcta:
> "Nuestro producto está en Fase 1.6, enfocado 100% en gestión operativa.
> IA y satélite son parte del roadmap 2026 H2 pero hoy no los ofrecemos.
> Lo que sí te garantizamos es que cuando los agreguemos, vas a tener
> datos limpios para que funcionen."

Eso es vender con integridad: gana confianza, te diferencia.

---

## Contacto / próximos pasos

- Repo del producto: <https://github.com/ivangarcia0969-ux/karpos>
- Demo en vivo: <https://app.karpos.surcoapp.tech>
- Owner: Iván García (ivan.garcia0969@gmail.com)

**Para arrancar la campaña ya:**
1. Editá la landing actual en `apps/web/src/app/page.tsx` con los headlines
   de la sección 8.
2. Grabá el video demo de 3 min (signup → finca → aplicación → timeline).
3. Definí los 30 prospectos B2B prioritarios y mandá el email frío.
4. Publicá el primer post LinkedIn.

El producto está listo para vender. Lo que falta es la conversación con los
clientes.
