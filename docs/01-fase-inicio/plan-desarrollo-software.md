[HelpDesk](../README.md) / [Fase de Inicio](README.md)

# Plan de Desarrollo de Software

Cierra la Fase de Inicio: define cómo se organiza el trabajo restante por fases e iteraciones. Al ser un proyecto de aprendizaje individual (sin fechas de negocio reales — ver Documento de Visión, sección 6), las "duraciones" son de esfuerzo/iteración, no de calendario.

## Fases y criterios de cierre

| Fase | Objetivo | Artefactos de salida | Hito de cierre |
|---|---|---|---|
| Inicio | Decidir si vale la pena construir el producto | Documento de Visión, Glosario, Modelo de Dominio, Modelo de Casos de Uso, Lista de Riesgos, este Plan | Lifecycle Objective Milestone (LCOM) — **cerrado con este documento** |
| Elaboración | Fijar una arquitectura que aguante los casos de uso y riesgos más significativos | Casos de uso detallados (los significativos), Modelo de Análisis/Diseño, decisión de stack tecnológico, arquitectura baseline | Lifecycle Architecture Milestone (LCAM) |
| Construcción | Completar la implementación funcional | Código, pruebas, resto de casos de uso detallados e implementados | Initial Operational Capability Milestone (IOCM) |
| Transición | Llevar el producto a un estado usable/desplegable | Documentación de despliegue, manual de instalación self-hosted | Product Release Milestone (PRM) |

## Primera iteración de Elaboración

RUP recomienda atacar primero lo que reduce más riesgo, no lo más fácil. Cruzando la [Lista de Riesgos](lista-riesgos.md) con el catálogo de [Casos de Uso](casos-de-uso.md), la primera iteración detalla estos casos de uso — arquitectónicamente significativos y/o de riesgo alto:

| Caso de uso | Por qué entra en la primera iteración |
|---|---|
| UC-01 Iniciar Sesión | Resuelve R-03 (autenticación indefinida) antes de fijar el diseño de `Usuario` |
| UC-03 Crear Ticket | Caso de uso central del sistema; ejercita creación, notificación y la mayoría de las relaciones del dominio |
| UC-11 Tomar Ticket / UC-12 Resolver Ticket | Ejercitan el ciclo de vida del `Ticket` (máquina de estados) que ya se modeló en el Diagrama de Estados |
| UC-13 Escalar Ticket | Resuelve R-07 (complejidad de `Equipo`/`nivel`/escalamiento) — es el caso de uso que más relaciones del dominio toca a la vez |
| UC-14 Listar Cola de Tickets | Ejercita el patrón de consulta/filtrado por `Equipo`, que se repite en otros listados |
| UC-21 Crear Categoría | Representa el patrón CRUD simple que se repite en Categoría, Prioridad, Equipo y Usuario — al detallarlo una vez, sirve de plantilla para los demás |
| UC-41 Priorizar Ticket | Surgió al detallar UC-03: sin él, todo ticket queda con Prioridad `Baja` sin revisar y el SLA real nunca se confirma. Se detalla junto con UC-03 por ser el mismo flujo de negocio |

El resto del catálogo (total del catálogo menos estos 8 — ver el conteo vigente en [Casos de Uso](casos-de-uso.md), para no volver a desincronizar este número cada vez que se agregue uno) se detalla en iteraciones posteriores de Elaboración/Construcción, reutilizando la plantilla que salga de este primer lote — no hace falta re-descubrir el flujo básico de un CRUD tantas veces.

Además de estos 8 casos de uso, la primera iteración también debe producir la **decisión de arquitectura de despliegue** que resuelve R-10 (self-hosted, evaluar containerización) — no es un caso de uso, es parte de la arquitectura baseline que exige el hito LCAM, pero es el riesgo de mayor exposición de toda la lista y no puede quedar fuera del alcance de esta iteración solo porque no encaja en la tabla de casos de uso. Este párrafo se agregó tras la segunda auditoría externa (ver [`audit/auditoria-fase-inicio-2026-08-19.md`](../../audit/auditoria-fase-inicio-2026-08-19.md)), que señaló que R-10 prometía resolverse "en la primera iteración" sin que el Plan lo mencionara en ningún lado.

## Criterio de éxito de la primera iteración

Se considera cerrada cuando estos 8 casos de uso (UC-01, 03, 11, 12, 13, 14, 21, 41) tengan: flujo básico detallado, diagrama de flujo, y las decisiones de diseño que exijan (en particular, la de R-03 sobre autenticación) documentadas — no hace falta código todavía, eso es Construcción. La decisión de arquitectura de despliegue (R-10) se considera parte del mismo criterio de cierre.

## Segunda iteración de Elaboración

La primera iteración validó el flujo de vida "feliz" del `Ticket` (crear → tomar/escalar → resolver) y la arquitectura base. Quedaron sin ejercitar tres cosas que sí son arquitectónicamente significativas — la segunda iteración ataca esas, no las más fáciles del catálogo:

| Caso de uso | Por qué entra en la segunda iteración |
|---|---|
| UC-04 Ver Ticket | Ningún caso de uso detallado hasta ahora renderiza `Comentario`, `Adjunto` y `EventoAuditoria` juntos — las tres composiciones (`*--`) de `Ticket` en el Modelo de Dominio. Es la vista central del sistema y la primera que las ejercita todas a la vez |
| UC-06 Comentar Ticket | Precondición de contenido para UC-04 (sin comentarios no hay nada que listar en su vista) y completa un ciclo de vida simple por sí mismo |
| UC-07 Confirmar Cierre de Ticket / UC-08 Reabrir Ticket | Cierran las transiciones del Diagrama de Estados que la primera iteración no tocó (`Resuelto → Cerrado`/`Reabierto`). UC-07 en particular obliga a resolver cómo conviven el cierre explícito del Solicitante con el cierre automático por **Plazo de Reapertura** que ya está modelado mas no ejercitado por ningún flujo |
| UC-42 Adjuntar Archivo a Ticket | Introduce una decisión de arquitectura que la primera iteración no cubrió: dónde y cómo se almacenan los archivos adjuntos en un despliegue self-hosted (¿volumen de Docker, límite de tamaño?) — la [Decisión de Arquitectura](../02-fase-elaboracion/arquitectura.md) todavía no lo dice |
| UC-09 Ver Artículo de Conocimiento / UC-10 Listar Artículos de Conocimiento | Es la parte de R-07 que la primera iteración dejó sin validar: la regla de visibilidad (Público/Interno) de `ArticuloConocimiento`, que hasta ahora solo existe en papel |

El resto del catálogo (CRUDs de Equipo/Prioridad/Usuario siguiendo la plantilla de `UC-21 Crear Categoría`, y los casos de uso restantes de Tickets/Base de Conocimiento/Reportes) se detalla en iteraciones posteriores — no aportan incertidumbre nueva, son repeticiones del mismo patrón ya validado.

### Criterio de éxito de la segunda iteración

Se considera cerrada cuando estos 7 casos de uso (UC-04, 06, 07, 08, 09, 10, 42) tengan flujo básico, diagrama de flujo y decisiones de diseño documentadas, y cuando quede resuelto si el almacenamiento de adjuntos (UC-42) exige una actualización de la Decisión de Arquitectura o de la Lista de Riesgos.
