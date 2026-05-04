# Manual — Karpos IQ

Karpos IQ es el copiloto agronómico. Responde con base en (1) los datos de tu finca y (2) un corpus técnico vectorizado (FAO-56, BBCH, papers, registros nacionales).

## Cómo preguntar

- Ve a **Karpos IQ** desde la consola.
- Si la pregunta es específica de un lote, abre el lote y usa el botón flotante: el contexto del lote se inyecta automáticamente.

Ejemplos:
- "¿qué umbral de mildiu aplico esta semana en el lote Malbec Alto?"
- "compárame el GDD acumulado del lote Hass con la temporada pasada"
- "tengo signos de oidio incipiente y faltan 14 días para la cosecha — ¿qué producto cumple PHI?"

## Cómo cita las fuentes

Cada respuesta lista fuentes con título, snippet y score de similitud. Si la fuente es un dato propio (un evento fenológico, un pesaje), Karpos IQ lo identifica explícitamente como "dato del tenant" y enlaza al registro original.

## Lo que no hace

- No prescribe productos sin que tú confirmes. Sugiere y explica.
- No accede a datos de otros tenants.
- No envía datos personales identificables al proveedor de LLM (Enterprise puede correr el modelo on-prem).

## Privacidad

En Pro, las preguntas se procesan con el LLM externo configurado por la organización. En Enterprise se ofrece deployment del modelo en el cluster del cliente.
