# Manual — Fenoflow

Fenoflow modela el ciclo fenológico de tus lotes usando estados BBCH y grados-día.

## Perfiles fenológicos

Un perfil agrupa los estados BBCH esperados por especie/variedad:

- **Temperatura base** (`base_temp_c`): temperatura mínima a la que el cultivo acumula desarrollo. Default: 10°C.
- **Método GDD**: triángulo simple (Zalom et al. 1983) por defecto.
- **Etapas**: cada BBCH con grados-día esperados acumulados, ventana de alerta y notas.

Karpos provee perfiles de referencia para uva, manzana, aguacate, naranja y arándano. Puedes clonarlos y ajustar.

## Registrar un evento fenológico

1. Lote → **Fenoflow** → **Nuevo evento**.
2. Indica BBCH (ej. 65 = plena floración) y porcentaje observado.
3. Adjunta foto opcional.

## Gráfico de grados-día

La página muestra los GDD acumulados desde la fecha de referencia (default: 1 de enero) y los marcadores de cuándo se alcanzaron etapas críticas. Útil para predecir cosecha y planear aplicaciones.

## Fuentes técnicas

- Meier, U. (2001). *BBCH-Skala*. Bundessortenamt.
- Zalom, F.G. et al. (1983). Degree-days: the calculation and use of heat units in pest management.
- Allen, R.G. et al. (1998). FAO Irrigation and Drainage Paper 56.
