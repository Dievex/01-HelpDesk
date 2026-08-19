[HelpDesk](../../../README.md) / [Fase de Elaboración](../../README.md) / [Especificación de Casos de Uso](../README.md) / Tickets

# Tickets

Casos de uso del ciclo de vida del `Ticket`: Solicitante (UC-03 a UC-08, UC-42), Agente de Soporte (UC-11 a UC-14) y Supervisor (UC-18, UC-19, UC-41). Se agrupan aquí en vez de por actor porque son el mismo flujo de negocio visto desde distintos roles — ver el [Diagrama de Estados del Ticket](../../../01-fase-inicio/modelo-dominio/diagrama-estados.md) para el ciclo completo.

| ID | Caso de uso | Actor | Estado |
|---|---|---|---|
| [UC-03](UC-03-crear-ticket.md) | Crear Ticket | Solicitante | Detallado |
| [UC-04](UC-04-ver-ticket.md) | Ver Ticket | Solicitante | Detallado |
| UC-05 | Listar Tickets Propios | Solicitante | Pendiente |
| [UC-06](UC-06-comentar-ticket.md) | Comentar Ticket | Solicitante | Detallado |
| [UC-07](UC-07-confirmar-cierre-ticket.md) | Confirmar Cierre de Ticket | Solicitante | Detallado |
| [UC-08](UC-08-reabrir-ticket.md) | Reabrir Ticket | Solicitante | Detallado |
| [UC-11](UC-11-tomar-ticket.md) | Tomar Ticket | Agente de Soporte | Detallado |
| [UC-12](UC-12-resolver-ticket.md) | Resolver Ticket | Agente de Soporte | Detallado |
| [UC-13](UC-13-escalar-ticket.md) | Escalar Ticket | Agente de Soporte | Detallado |
| [UC-14](UC-14-listar-cola-de-tickets.md) | Listar Cola de Tickets | Agente de Soporte | Detallado |
| UC-18 | Asignar Ticket | Supervisor | Pendiente |
| UC-19 | Reasignar Ticket | Supervisor | Pendiente |
| [UC-41](UC-41-priorizar-ticket.md) | Priorizar Ticket | Supervisor | Detallado |
| UC-42 | Adjuntar Archivo a Ticket | Solicitante | Pendiente |
