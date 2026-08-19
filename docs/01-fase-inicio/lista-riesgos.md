[HelpDesk](../README.md) / [Fase de Inicio](README.md)

# Lista de Riesgos

Riesgos identificados al cierre de la Fase de Inicio. Se prioriza mitigar los de mayor exposición (probabilidad × impacto) primero — varios de ellos son justamente el criterio para elegir qué casos de uso se detallan primero en Elaboración (ver [Plan de Desarrollo de Software](plan-desarrollo-software.md)).

Los ID son permanentes: un riesgo conserva el suyo aunque se cierre, y nunca se reasigna a uno nuevo. Por eso la numeración de la tabla activa tiene huecos — corresponden a los riesgos del Historial.

| ID | Riesgo | Categoría | Prob. | Impacto | Exposición | Mitigación |
|---|---|---|---|---|---|---|
| R-03 | El mecanismo de autenticación (`Iniciar Sesión`) no está definido — cuentas propias vs. futura integración SSO/LDAP | Técnico | Media | Alto | Alta | Detallar `Iniciar Sesión` en la primera iteración de Elaboración, antes de fijar el modelo de diseño de `Usuario` |
| R-06 | Pérdida de trabajo no confirmado en git (ya ocurrió una vez con la carpeta `puml/`) | Operacional | Media | Medio | Media | Commits frecuentes por artefacto cerrado, no acumular cambios grandes sin confirmar |
| R-07 | Complejidad del modelo de dominio (`Equipo`, `SLA`, escalamiento, visibilidad) subestimada para el Modelo de Diseño | Técnico | Media | Medio | Media | Empezar Elaboración con un caso de uso que ejercite estas relaciones (`Escalar Ticket`) para validar el diseño temprano |
| R-09 | Cumplimiento de protección de datos personales depende de configuración de la Organización adoptante, no del producto | Legal | Baja | Medio | Baja | Mantener el diseño flexible (roles, visibilidad ya modelada); no requiere acción inmediata |
| R-10 | El despliegue self-hosted (diferenciador central del producto) no tiene evaluado el empaquetado, la infraestructura mínima requerida, ni la complejidad de instalación para organizaciones adoptantes con perfiles técnicos muy distintos | Técnico | Media | Alto | Alta | Evaluar containerización (Docker) desde la decisión de arquitectura en la primera iteración de Elaboración, no dejarlo para Transición |

## Historial de riesgos cerrados

| ID | Riesgo | Fecha | Motivo |
|---|---|---|---|
| R-01 | Alcance del MVP demasiado ambicioso para el tiempo disponible | 2026-08-18 | No aplica: no hay fecha límite ni presión de cronograma en este proyecto — se retira, no se pospone |
| R-02 | Único desarrollador, sin dedicación exclusiva | 2026-08-18 | No es un riesgo sino el diseño deliberado del proyecto: es para aprender y para servir de ejemplo al equipo del autor más adelante |
| R-04 | Reglas de negocio aún abiertas (pausa de SLA, gestión de miembros de Equipo) quedan sin cerrar hasta Construcción | 2026-08-19 | No es un riesgo aparte, es el propio proceso de detallar casos de uso funcionando — cada regla se resuelve cuando le toca detallarse (pausa de SLA con el estado que la origine, gestión de miembros al detallar `Editar Usuario`), no antes. Nota: la pausa de SLA y la gestión de miembros de Equipo específicamente *no* están cubiertas por la primera iteración — quedan pendientes para cuando se detallen los casos de uso que las tocan |
| R-05 | No hay stakeholder/usuario real que valide requisitos | 2026-08-18 | Se retira por ser específico de un ejercicio didáctico — en un proyecto real (que es lo que esta lista debe poder servir de plantilla) este riesgo no debería figurar nunca, porque si no hay stakeholder real no hay proyecto real |
| R-08 | Stack tecnológico sin decidir todavía, pospuesto a Elaboración | 2026-08-19 | Es una decisión deliberadamente diferida (Documento de Visión, 4.1), no una incertidumbre no gestionada — no aporta como riesgo |
