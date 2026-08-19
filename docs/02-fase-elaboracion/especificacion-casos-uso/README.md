[HelpDesk](../../README.md) / [Fase de Elaboración](../README.md) / Especificación de Casos de Uso

# Especificación de Casos de Uso

Detalle de flujo básico, alternativos y excepciones para cada caso de uso listado en el [Modelo de Casos de Uso](../../01-fase-inicio/casos-de-uso.md). Agrupados por paquete/entidad (mismos paquetes que ya se usan en los diagramas de casos de uso), no por actor — un caso de uso como `Escalar Ticket` se entiende mejor junto al resto del ciclo de vida del Ticket que separado por quién lo ejecuta.

Cada caso de uso tiene su propio diagrama de flujo en PlantUML (precondición → caso de uso → postcondición, con notas de quién hace qué), más la especificación textual.

## Paquetes

| Paquete | Casos de uso | Estado |
|---|---|---|
| [Acceso](acceso/README.md) | UC-01, UC-02 | En curso (UC-01) |
| [Tickets](tickets/README.md) | UC-03 a UC-08, UC-11 a UC-14, UC-18, UC-19, UC-41, UC-42 | En curso (UC-03, UC-11 a UC-14, UC-41) |
| [Base de Conocimiento](base-conocimiento/README.md) | UC-09, UC-10, UC-15 a UC-17, UC-43 | Pendiente |
| [Reportes](reportes/README.md) | UC-20 | Pendiente |
| [Categoría](categoria/README.md) | UC-21 a UC-25 | En curso (UC-21) |
| [Equipo](equipo/README.md) | UC-26 a UC-30 | Pendiente |
| [Prioridad](prioridad/README.md) | UC-31 a UC-35 | Pendiente |
| [Usuario](usuario/README.md) | UC-36 a UC-40 | Pendiente |

La [primera iteración de Elaboración](../../01-fase-inicio/plan-desarrollo-software.md#primera-iteración-de-elaboración) prioriza UC-01, UC-03, UC-11 a UC-14 y UC-21 — el resto se completa en iteraciones posteriores.
