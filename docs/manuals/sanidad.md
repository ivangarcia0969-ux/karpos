# Manual — Sanidad+

Manejo integrado de plagas y enfermedades, con libro de aplicaciones químicas auditable.

## Monitoreo

1. Consola → **Sanidad+** → **Nuevo monitoreo** (o desde móvil).
2. Selecciona lote y plaga. La escala de severidad depende del cultivo (Horsfall-Barratt para muchas enfermedades, escalas 0-5 para insectos).
3. Indica incidencia (% de árboles afectados) y severidad (intensidad media).
4. Si dudas, toma una foto: **Karpos Vision** propone candidatos con confianza.

## Registrar una aplicación

> ⚠️ Importante: una vez registrada, la aplicación es inmutable. Si se cometió un error grave, debe **anularse** indicando una razón. La anulación no borra el evento original.

1. Lote → **Sanidad+** → **Registrar aplicación**.
2. Indica fecha, equipo, aplicador (con licencia si aplica), área tratada y volumen de agua/ha.
3. Agrega cada producto con dosis y plaga objetivo.
4. Karpos calcula automáticamente la fecha máxima de PHI (período de carencia) y el REI.
5. El sistema bloqueará intentos de registrar cosecha en este lote hasta que el PHI haya expirado.

## Carencia (PHI) y reentrada (REI)

- **PHI**: tiempo mínimo entre la aplicación y la cosecha, expresado en días.
- **REI**: tiempo de reentrada, expresado en horas.
- Karpos los toma del registro nacional del producto. Si tu producto local difiere, edita su PHI/REI por defecto en **Configuración → Catálogo**.

## Cumplimiento GLOBALG.A.P.

El libro electrónico de Karpos cumple los puntos de control IFA v6 sobre registros de aplicaciones. La auditoría externa puede verificar el hash chain con la función `audit.verify_chain`.
