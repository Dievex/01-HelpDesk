[HelpDesk](../../../README.md) / [Fase de Elaboración](../../README.md) / [Modelo de Análisis/Diseño](README.md)

# Patrón 01 · Acceso y Sesión

| Campo | Valor |
|---|---|
| Casos de uso que cubre | [UC-01 Iniciar Sesión](../especificacion-casos-uso/acceso/UC-01-iniciar-sesion.md), [UC-02 Cerrar Sesión](../especificacion-casos-uso/acceso/UC-02-cerrar-sesion.md) |
| Resumen | Autenticación por credenciales propias; la sesión se materializa como un JWT en una cookie `httpOnly` |

<table>
<tr><td align="center">
<img src="../../../../puml/02-fase-elaboracion/modelo-analisis-diseno/patron01-acceso-sesion.svg" alt="Modelo/Vista/Controlador — Acceso y Sesión">
</td></tr>
<tr><td align="center"><i><a href="../../../../puml/02-fase-elaboracion/modelo-analisis-diseno/patron01-acceso-sesion.puml">Código fuente</a></i></td></tr>
</table>

## Vista — `LoginForm`

Formulario de correo y contraseña ([UC-01](../especificacion-casos-uso/acceso/UC-01-iniciar-sesion.md)). El "Cerrar Sesión" de [UC-02](../especificacion-casos-uso/acceso/UC-02-cerrar-sesion.md) no tiene vista propia — es una acción disparada desde el menú de usuario que ya existe en cualquier pantalla autenticada, no un formulario nuevo.

## Controlador — `AuthController`

- `login(correo, contrasena)`: valida credenciales contra `Usuario`, genera el JWT y lo devuelve en una cookie `httpOnly` (ver [Decisión de Arquitectura](../arquitectura.md)).
- `logout()`: invalida la cookie de sesión. Al ser JWT sin lista de revocación en el servidor, "invalidar" significa borrar la cookie del navegador — el token en sí no se puede revocar del lado del servidor (limitación ya documentada en [UC-02](../especificacion-casos-uso/acceso/UC-02-cerrar-sesion.md)).

## Modelo — `Usuario`

Gana un atributo técnico que el Modelo de Dominio conceptual no tenía: `contrasenaHash` (nunca la contraseña en texto plano, ver [UC-01](../especificacion-casos-uso/acceso/UC-01-iniciar-sesion.md#requisitos-especiales)). El rol (Solicitante/Agente de Soporte/Supervisor/Administrador) se mantiene como la jerarquía de clases ya fijada en el [Diagrama de Clases](../../01-fase-inicio/modelo-dominio/diagrama-clases.md) — este patrón no resuelve cómo esa jerarquía se traduce a las tablas de Prisma, esa decisión queda para cuando se escriba `schema.prisma` en Construcción.
