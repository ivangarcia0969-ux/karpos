# Karpos — Lineamientos de marca

Versión 1.0 · 2026-05-04

## 1. Esencia

Karpos (del griego *karpós*, "fruto") es la plataforma operativa que convierte cada lote, árbol y jornal en datos útiles, decisiones agronómicas trazables y rentabilidad medible.

Atributos de marca:

| Atributo            | Significa que…                                                                |
|---------------------|--------------------------------------------------------------------------------|
| Independiente       | No vendemos insumos, no nos atamos a un proveedor.                            |
| Práctico            | Funciona offline, en campo, con un guante mojado.                             |
| Trazable            | Cada decisión queda en un libro auditable, desde la flor hasta el contenedor. |
| Explicable          | La IA muestra el porqué de cada recomendación; no es caja negra.              |
| Multi-cultivo       | Un mismo motor sirve a uva, aguacate, manzana, cítricos, berries y nueces.    |

## 2. Nomenclatura

- **Karpos**: nombre de la marca paraguas.
- **Karpos DS**: design system (componentes, tokens).
- **Karpos IQ**: copiloto conversacional con IA agronómica.
- **Karpos Cloud**: infraestructura SaaS gestionada.
- **Karpos On-Prem**: despliegue auto-gestionado para clientes Enterprise.

Sub-marcas internas (módulos): Predios, Bitácora Verde, Fenoflow, Sanidad+, AquaPlan, Cuadrillas, Cosecha360, Empaque y Frío, Trazabilidad, EcoSat, Clima Local, Costos & Rentabilidad, CertiBox, Ágora, Marketplace, Panel Ejecutivo. Todas viven dentro del paraguas Karpos.

## 3. Logo

El logotipo combina tres elementos:

- **Drupa estilizada** (forma de fruto carnoso, sin sesgo de cultivo) en *Karpos Leaf*.
- **Hoja superior tangente** en *Karpos Sprout*.
- **Punto ámbar interno**: el dato vivo dentro del fruto.

Variantes provistas:

| Variante       | Archivo                                  | Uso                                |
|----------------|------------------------------------------|------------------------------------|
| Primaria       | `docs/brand/logo.svg`                    | Aplicaciones a color sobre fondo claro |
| Monocromática  | `docs/brand/logo-mono.svg`               | Documentos, sellos, fax, B/N        |
| Favicon        | `docs/brand/logo-favicon.svg`            | Pestaña navegador (sólo marca)      |

Reglas:

- Espacio de aire mínimo igual a la altura de la "K".
- Tamaño mínimo en pantalla: 24 px de alto para wordmark, 16 px para mark.
- No deformar, no rotar, no cambiar colores fuera de la paleta, no aplicar sombras o degradados, no encerrar en formas, no usar sobre fotografías sin máscara de contraste.

## 4. Paleta — "Cosecha"

| Token                  | Hex       | Rol                                            |
|------------------------|-----------|------------------------------------------------|
| `karpos.leaf`          | `#0E5C3A` | Primario — marca, navegación, CTAs principales |
| `karpos.leaf.hover`    | `#0A4A2E` | Hover/pressed del primario                     |
| `karpos.sprout`        | `#3FA66B` | Verde joven — crecimiento, fenología activa    |
| `karpos.bark`          | `#3B2A1F` | Texto principal, headers                       |
| `karpos.clay`          | `#C0653B` | Acento cálido — cosecha, alertas de severidad  |
| `karpos.amber`         | `#F0B23C` | Acento dato — badges, etiquetas, KPI           |
| `karpos.cream`         | `#FAF7F2` | Fondo de superficie principal                  |
| `karpos.fog`           | `#ECECE8` | Bordes, separadores                            |
| `karpos.slate`         | `#1B2A29` | Texto sobre fondos cremas en alto contraste    |
| `semantic.success`     | `#2E7D4F` | Éxito                                          |
| `semantic.warning`     | `#E89A2C` | Advertencia                                    |
| `semantic.danger`      | `#B53A2E` | Error / riesgo crítico (helada, PHI vencido)   |
| `semantic.info`        | `#2B6FA6` | Información neutra                             |

Decisión deliberada: evitar el verde flúor que satura el sector (FieldView, Granular). Verde bosque + terracota + ámbar posiciona como "agronomía profesional", no "techbro agro".

Contraste WCAG 2.2: todas las combinaciones texto/fondo verificadas a AA mínimo, AAA para texto principal sobre `karpos.cream`.

Tokens completos en formato W3C Design Tokens: [tokens.json](tokens.json).

## 5. Tipografía

| Uso             | Familia          | Pesos     | Licencia |
|-----------------|------------------|-----------|----------|
| Display, H1–H2  | Fraunces (var.)  | 500/700   | OFL      |
| UI, body, H3+   | Inter (var.)     | 400/500/600 | OFL    |
| Datos / código  | JetBrains Mono   | 400/600   | OFL      |

Las tres son gratuitas para uso comercial. Sin tipografías premium pagadas — la marca debe ser auditable y replicable.

Escalas tipográficas: ver tokens `typography.*` en [tokens.json](tokens.json). Modular: `1.250` (mayor tercera).

## 6. Voz y tono

- **Práctico antes que poético**. *"Programa la aplicación"* > *"Cultiva el éxito de tu cosecha"*.
- **Tutea** en es-CO/MX/AR; **"tú"** formal en es-ES; **"você"** en pt-BR; **neutral profesional** en en-US.
- **Respeta el conocimiento del usuario.** Asume que el agrónomo y el mayordomo saben más de su cultivo que la app. La IA sugiere, no manda.
- **Cero anglicismos innecesarios** en UI hispana: "tablero" no "dashboard"; "lote" no "field"; "cuadrilla" no "crew"; "siembra" no "planting". Pero los identificadores en código sí van en inglés.
- **Cero emojis** en UI productiva. Iconografía coherente (Lucide o set propio).
- **Datos primero, narrativa después.** En vistas: número grande, contexto pequeño.

## 7. Iconografía

- Set base: **Lucide** (ISC license).
- Stroke uniforme `1.5px`, esquinas `2px`.
- Iconos personalizados (cosecha, fenología, riego) heredan estilo Lucide.

## 8. Aplicación de marca

- **Web**: header limpio, logo `leaf` sobre `cream`, navegación en `bark`.
- **Móvil**: app icon = solo el mark (drupa + hoja + punto), fondo `leaf`.
- **Documentos PDF**: logo monocromo en sello, paleta restringida a `bark` + `cream`.
- **Email transaccional**: logo color sobre `cream`, CTA en `leaf`.

## 9. Don'ts

- No usar el nombre Karpos en posesivo de un cultivo ("Karpos Apple" suena a producto Apple Inc.).
- No combinar con marcas de proveedores de insumos en el mismo bloque visual.
- No traducir el nombre ni el wordmark.
- No usar fotografías genéricas de stock con manos sosteniendo tablets sobre el campo.
