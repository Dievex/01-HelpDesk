[HelpDesk](../../README.md) / [Fase de Elaboración](../README.md) / Modelo de Análisis/Diseño

# Modelo de Análisis/Diseño (MVC)

Puente entre los Casos de Uso (qué hace el sistema) y el stack elegido en la [Decisión de Arquitectura](../arquitectura.md) (React + Vite / Node + Express / PostgreSQL + Prisma): por cada patrón de flujo significativo, identifica qué se resuelve en la **Vista** (componente React), qué en el **Controlador** (lógica de negocio en Express) y qué en el **Modelo** (entidad de Prisma, ahora con los atributos y métodos técnicos que el Modelo de Dominio conceptual no tenía).

No se detalla caso de uso por caso de uso — los 43 ya están especificados y varios comparten exactamente la misma forma de resolverse, mismo criterio que ya evitó re-detallar 20 veces el mismo patrón CRUD en la Especificación de Casos de Uso. Se agrupan en 7 patrones de flujo, cada uno con su propio diagrama de clases Modelo/Vista/Controlador.

## Patrones

| Patrón | Casos de uso que cubre | Resumen |
|---|---|---|
| [01 · Acceso y Sesión](patron-01-acceso-sesion.md) | UC-01, UC-02 | Login/logout, JWT en cookie `httpOnly` |
| [02 · Ciclo de vida del Ticket](patron-02-ciclo-vida-ticket.md) | UC-03, 07, 08, 11, 12, 13, 18, 19, 41 | Transiciones de estado sobre un `Ticket` existente |
| [03 · Consulta de Tickets](patron-03-consulta-tickets.md) | UC-04, 05, 14 | Vistas de detalle y listados, sin mutar datos |
| [04 · Contenido asociado a un Ticket](patron-04-contenido-ticket.md) | UC-06, 42, 43 | Comentarios, adjuntos y vínculos a artículos |
| [05 · Base de Conocimiento (lectura)](patron-05-base-conocimiento-lectura.md) | UC-09, 10 | Consulta de artículos filtrada por visibilidad y rol |
| [06 · CRUD de configuración y contenido](patron-06-crud-generico.md) | UC-15 a 17, UC-21 a 40 | Crear/Ver/Listar/Editar/Eliminar de las 5 entidades de catálogo/contenido |
| [07 · Dashboard de Métricas](patron-07-dashboard-metricas.md) | UC-20 | Agregación y cálculo de cumplimiento de SLA |

## Convención de los diagramas

Diagrama de clases PlantUML con estereotipos `<<Model>>`, `<<View>>` y `<<Controller>>` — mismo formato visual que el [Diagrama de Clases del Modelo de Dominio](../../01-fase-inicio/modelo-dominio/diagrama-clases.md), pero mostrando la arquitectura de tres capas en vez de las entidades conceptuales. Las clases `<<Model>>` son las mismas del Modelo de Dominio, con los atributos y métodos técnicos que esta fase añade — ver la sección "Pendiente para Elaboración" del [Modelo de Dominio](../../01-fase-inicio/modelo-dominio/README.md#pendiente-para-elaboración).

Alcance deliberado: este artefacto se queda en diagramas y documentación de diseño, no en código — Construcción sigue siendo la fase que produce `schema.prisma`, rutas Express y componentes React reales.
