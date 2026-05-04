# Manual — Administradores

## Crear una organización

Si tu instalación es self-served vía SaaS, registra la organización desde la landing → **Comenzar**. Para Enterprise, contacta a soporte para creación asistida.

## Invitar usuarios

1. Consola → **Configuración → Usuarios** → **Invitar**.
2. Ingresa correo y rol (`owner`, `admin`, `agronomist`, `foreman`, `crew_lead`, `viewer`).
3. El usuario recibe un correo con un enlace de aceptación.

## Roles y permisos

| Rol         | Lectura | Registro labores | Aplicar químicos | Cosecha | Configurar | Facturación |
|-------------|---------|------------------|------------------|---------|------------|-------------|
| owner       | ✓       | ✓                | ✓                | ✓       | ✓          | ✓           |
| admin       | ✓       | ✓                | ✓                | ✓       | ✓          | ✓           |
| agronomist  | ✓       | ✓                | ✓                | ✓       | —          | —           |
| foreman     | ✓       | ✓                | —                | ✓       | —          | —           |
| crew_lead   | ✓       | ✓                | —                | ✓       | —          | —           |
| viewer      | ✓       | —                | —                | —       | —          | —           |

## Plan y facturación

- **Configuración → Suscripción** muestra plan, próximo cobro y consumo (hectáreas, usuarios, almacenamiento).
- Cambia de plan o cancela desde aquí; el cambio aplica al cierre del período actual.

## API keys

- **Configuración → API keys** → **Nueva clave**.
- Asigna scopes mínimos. Anota el secreto: solo se muestra una vez.

## Auditoría

- **Configuración → Auditoría** lista los eventos sensibles (aplicaciones, cosechas, cambios de configuración).
- Cada evento incluye usuario, IP, dispositivo y hash de la cadena.
