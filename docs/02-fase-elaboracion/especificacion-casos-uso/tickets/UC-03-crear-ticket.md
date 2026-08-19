[HelpDesk](../../../README.md) / [Fase de Elaboración](../../README.md) / [Especificación de Casos de Uso](../README.md) / [Tickets](README.md)

# UC-03 · Crear Ticket

| Campo | Valor |
|---|---|
| Actor principal | Solicitante |
| Precondición | El actor está autenticado en el sistema |
| Postcondición (éxito) | Se crea un `Ticket` con estado `Abierto` y Prioridad `Baja` (por defecto, pendiente de confirmar); se registra un `EventoAuditoria` de creación; se notifica al Supervisor del Equipo que atiende la Categoría elegida |
| Postcondición (fallo) | No se crea ningún `Ticket`; el Sistema muestra los errores de validación y conserva lo ya ingresado |

<table>
<tr><td align="center">
<img src="../../../../puml/02-fase-elaboracion/especificacion-casos-uso/tickets/UC03-crear-ticket.svg" alt="Diagrama de flujo — Crear Ticket">
</td></tr>
<tr><td align="center"><i><a href="../../../../puml/02-fase-elaboracion/especificacion-casos-uso/tickets/UC03-crear-ticket.puml">Código fuente</a></i></td></tr>
</table>

### Wireframe

<table>
<tr><td align="center">
<img src="../../../../puml/02-fase-elaboracion/especificacion-casos-uso/tickets/UC03-crear-ticket-wireframe.svg" alt="Wireframe — Crear Ticket">
</td></tr>
<tr><td align="center"><i><a href="../../../../puml/02-fase-elaboracion/especificacion-casos-uso/tickets/UC03-crear-ticket-wireframe.puml">Código fuente</a></i></td></tr>
</table>

### Flujo básico

1. El Solicitante selecciona "Crear Ticket".
2. El Sistema muestra el formulario de creación: título, descripción, categoría.
3. El Solicitante completa el título y la descripción, y selecciona una Categoría.
4. El Solicitante envía el formulario.
5. El Sistema valida que los campos obligatorios estén completos.
6. El Sistema crea el Ticket: estado `Abierto`, Prioridad `Baja` (por defecto), `fechaCreacion` = fecha/hora actual, Solicitante = actor autenticado.
7. El Sistema registra un `EventoAuditoria` de tipo "Creación".
8. El Sistema notifica al Supervisor del Equipo que atiende la Categoría seleccionada.
9. El Sistema muestra al Solicitante la confirmación, con el ticket recién creado.

### Flujos alternativos

- **FA-1 — Validación fallida (paso 5):** si faltan campos obligatorios, el Sistema muestra los errores junto al campo correspondiente y vuelve al paso 3, conservando los datos ya ingresados.
- **FA-2 — Categoría sin Equipo asignado (paso 8):** la relación `Categoria — Equipo` es opcional en el Modelo de Dominio. Si la Categoría elegida todavía no tiene Equipo asociado, el Sistema omite la notificación; el ticket queda creado pero sin enrutar, a la espera de que un Administrador le asigne Equipo a la Categoría o de asignación manual.

### Reglas de negocio relacionadas

- Notificación al Supervisor al crearse un ticket — capturada en el [Modelo de Dominio](../../../01-fase-inicio/modelo-dominio/README.md#reglas-de-negocio-capturadas-para-casos-de-uso).
- El Solicitante no elige la Prioridad — la fija el Supervisor en [UC-41 · Priorizar Ticket](UC-41-priorizar-ticket.md), para no heredar el sesgo de "todo es urgente" de quien reporta. Ver también la decisión correspondiente en el [Modelo de Casos de Uso](../../../01-fase-inicio/casos-de-uso.md).
