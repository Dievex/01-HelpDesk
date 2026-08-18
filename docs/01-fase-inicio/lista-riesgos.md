[HelpDesk](../README.md) / [Fase de Inicio](README.md)

# Lista de Riesgos

Riesgos identificados al cierre de la Fase de Inicio. Se prioriza mitigar los de mayor exposición (probabilidad × impacto) primero — varios de ellos son justamente el criterio para elegir qué casos de uso se detallan primero en Elaboración (ver [Plan de Desarrollo de Software](plan-desarrollo-software.md)).

| ID | Riesgo | Categoría | Prob. | Impacto | Exposición | Mitigación |
|---|---|---|---|---|---|---|
| R-01 | El mecanismo de autenticación (`Iniciar Sesión`) no está definido — cuentas propias vs. futura integración SSO/LDAP | Técnico | Media | Alto | Alta | Detallar `Iniciar Sesión` en la primera iteración de Elaboración, antes de fijar el modelo de diseño de `Usuario` |
| R-02 | Reglas de negocio aún abiertas (pausa de SLA en estados de espera, gestión de miembros de Equipo) quedan sin cerrar hasta Construcción | Negocio | Media | Medio | Media | Resolverlas al detallar los casos de uso que las tocan (`Escalar Ticket`, `Editar Usuario`), no dejarlas para el final |
| R-03 | Pérdida de trabajo no confirmado en git (ya ocurrió una vez con la carpeta `puml/`) | Operacional | Media | Medio | Media | Commits frecuentes por artefacto cerrado, no acumular cambios grandes sin confirmar |
| R-04 | Complejidad del modelo de dominio (`Equipo`, `SLA`, escalamiento, visibilidad) subestimada para el Modelo de Diseño | Técnico | Media | Medio | Media | Empezar Elaboración con un caso de uso que ejercite estas relaciones (`Escalar Ticket`) para validar el diseño temprano |
| R-05 | Stack tecnológico sin decidir todavía, pospuesto a Elaboración | Técnico | Baja | Medio | Baja | Es una decisión deliberadamente diferida (ver Documento de Visión 4.1) — riesgo bajo mientras se resuelva antes de Construcción |
| R-06 | Cumplimiento de protección de datos personales depende de configuración de la Organización adoptante, no del producto | Legal | Baja | Medio | Baja | Mantener el diseño flexible (roles, visibilidad ya modelada); no requiere acción inmediata |

## Historial de riesgos cerrados

| ID original | Riesgo | Fecha | Motivo |
|---|---|---|---|
| R-01 | Alcance del MVP demasiado ambicioso para el tiempo disponible | 2026-08-18 | No aplica: no hay fecha límite ni presión de cronograma en este proyecto — se retira, no se pospone |
| R-02 | Único desarrollador, sin dedicación exclusiva | 2026-08-18 | No es un riesgo sino el diseño deliberado del proyecto: es para aprender y para servir de ejemplo al equipo del autor más adelante |
| R-05 | No hay stakeholder/usuario real que valide requisitos | 2026-08-18 | Se retira por ser específico de un ejercicio didáctico — en un proyecto real (que es lo que esta lista debe poder servir de plantilla) este riesgo no debería figurar nunca, porque si no hay stakeholder real no hay proyecto real |
