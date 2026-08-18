[HelpDesk](../../README.md) / [Fase de Inicio](../README.md) / Modelo de Dominio

# Modelo de Dominio

## Propósito y alcance

Este es un **modelo conceptual**: identifica las entidades del dominio del negocio, sus atributos esenciales (los que un experto de negocio reconocería, no campos técnicos) y cómo se relacionan entre sí. Deliberadamente **no incluye métodos, visibilidad, ni patrones de diseño** — eso corresponde al Modelo de Diseño de la fase de Elaboración, derivado de los Casos de Uso mediante análisis de robustez.

Cada clase de este modelo debe poder trazarse a un término del [Glosario](../glosario.md).

## Diagramas

- [Diagrama de Clases](diagrama-clases.md) — entidades del dominio y cómo se relacionan. Incluye sus decisiones de modelado.
- [Diagrama de Estados del Ticket](diagrama-estados.md) — ciclo de vida del `Ticket`, la entidad central del sistema. Incluye sus decisiones de modelado.

## Reglas de negocio capturadas (para Casos de Uso)

La estructura de `Notificacion` (generada por `EventoAuditoria`, dirigida a un `Usuario`) ya soporta esto genéricamente; queda como regla a implementar en el flujo de los casos de uso correspondientes, no como cambio de estructura:

- Al crearse un ticket, se notifica al Supervisor.
- Al cerrarse un ticket, se notifica al Supervisor.
- Al asignarse un ticket a un Agente, se le notifica a ese Agente.

`ArticuloConocimiento.visibilidad` (Público / Interno) ya existe como atributo; el filtrado por rol es una regla a implementar en el flujo, no un cambio de estructura:

- Un Solicitante solo puede Ver/Listar artículos con visibilidad Público.
- Agente, Supervisor y Administrador pueden Ver/Listar todos los artículos (Público e Interno), por ser personal técnico.

`Ticket.Prioridad` no la elige el Solicitante al crear el ticket — quien reporta tiende a percibir todo como urgente. Regla capturada al detallar el flujo en Elaboración (ver [Especificación de Casos de Uso — Tickets](../../02-fase-elaboracion/especificacion-casos-uso/tickets.md)):

- Todo `Ticket` se crea con Prioridad `Baja` por defecto.
- El Supervisor confirma o ajusta la Prioridad real (caso de uso `Priorizar Ticket`), lo que recalcula el SLA aplicable.
- Un ticket **sí** puede asignarse (`Asignar Ticket`) antes de que el Supervisor lo priorice — mientras tanto opera con la Prioridad `Baja` por defecto. No es una precondición bloqueante entre casos de uso; queda para aplicar cuando se detallen `Asignar Ticket` y `Listar Cola de Tickets`.

## Pendiente para Elaboración

Este modelo se usará como insumo, no como resultado final. En Elaboración, cada caso de uso arquitectónicamente significativo pasará por análisis de robustez y podrá:

- Añadir atributos técnicos y métodos a estas clases (pasan a ser clases de diseño).
- Confirmar o descartar relaciones que hoy son solo hipótesis (ej. si `ArticuloConocimiento` necesita versión propia).
- Introducir clases de interfaz y control que no existen a nivel de dominio (ej. controladores, DTOs).
