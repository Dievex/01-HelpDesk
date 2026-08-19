[HelpDesk](../../../README.md) / [Fase de Elaboración](../../README.md) / [Especificación de Casos de Uso](../README.md) / [Tickets](README.md)

# UC-41 · Priorizar Ticket

| Campo | Valor |
|---|---|
| Actor principal | Supervisor |
| Precondición | El `Ticket` existe con Prioridad `Baja` sin confirmar (recién creado) |
| Postcondición (éxito) | El `Ticket` queda con la Prioridad real definida por el Supervisor; el SLA aplicable (tiempos de primera respuesta y resolución) se recalcula según esa Prioridad |
| Postcondición (fallo) | La Prioridad no cambia |

<table>
<tr><td align="center">
<img src="../../../../puml/02-fase-elaboracion/especificacion-casos-uso/tickets/UC41-priorizar-ticket.svg" alt="Diagrama de flujo — Priorizar Ticket">
</td></tr>
<tr><td align="center"><i><a href="../../../../puml/02-fase-elaboracion/especificacion-casos-uso/tickets/UC41-priorizar-ticket.puml">Código fuente</a></i></td></tr>
</table>

### Flujo básico

1. El Supervisor abre un ticket de su Equipo.
2. El Sistema muestra el detalle del ticket, incluida su Prioridad actual (`Baja`, por defecto).
3. El Supervisor evalúa el impacto real y selecciona la Prioridad correspondiente (Baja, Media, Alta, Crítica).
4. El Sistema actualiza la Prioridad del Ticket y marca `prioridadConfirmada = true`.
5. El Sistema registra un `EventoAuditoria` de tipo "Priorización".
6. El Sistema recalcula el SLA aplicable (tiempos de primera respuesta y resolución) en función de la nueva Prioridad.

### Flujos alternativos

- **FA-1 — Confirma la prioridad por defecto (paso 3):** si el Supervisor considera correcta la Prioridad `Baja` inicial, la deja sin cambios; el caso de uso termina igual (queda registrado que fue revisada).

### Reglas de negocio relacionadas

- Todo `Ticket` se crea con Prioridad `Baja` por defecto — decisión tomada aquí precisamente para separar "reportar" de "priorizar": quien reporta no debería decidir la urgencia real. Documentado también en el [Modelo de Dominio](../../../01-fase-inicio/modelo-dominio/README.md#reglas-de-negocio-capturadas-para-casos-de-uso).
