[HelpDesk](../../../README.md) / [Fase de Elaboración](../../README.md) / [Modelo de Análisis/Diseño](README.md)

# Patrón 04 · Contenido asociado a un Ticket

| Campo | Valor |
|---|---|
| Casos de uso que cubre | [UC-06 Comentar Ticket](../especificacion-casos-uso/tickets/UC-06-comentar-ticket.md), [UC-42 Adjuntar Archivo a Ticket](../especificacion-casos-uso/tickets/UC-42-adjuntar-archivo-ticket.md), [UC-43 Vincular Artículo de Conocimiento a Ticket](../especificacion-casos-uso/base-conocimiento/UC-43-vincular-articulo-ticket.md) |
| Resumen | Agregan contenido a un `Ticket` sin cambiar su `estado` — distinto del [Patrón 02](patron-02-ciclo-vida-ticket.md), que sí muta el `Ticket` |

<table>
<tr><td align="center">
<img src="../../../../puml/02-fase-elaboracion/modelo-analisis-diseno/patron04-contenido-ticket.svg" alt="Modelo/Vista/Controlador — Contenido asociado a un Ticket">
</td></tr>
<tr><td align="center"><i><a href="../../../../puml/02-fase-elaboracion/modelo-analisis-diseno/patron04-contenido-ticket.puml">Código fuente</a></i></td></tr>
</table>

## Vistas — `CommentForm`, `AttachmentUploader`, `LinkArticleForm`

Tres vistas pequeñas, cada una embebida en `TicketDetailView` ([Patrón 03](patron-03-consulta-tickets.md)) — ninguna es una pantalla propia, son secciones del detalle del ticket.

## Controlador — `TicketController`

Mismo Controller que los patrones 02 y 03, con tres métodos más:

- `comentar(ticketId, actor, texto)`: crea `Comentario` (autor, fecha).
- `adjuntar(ticketId, actor, archivo)`: valida tamaño/tipo, guarda el archivo en el volumen de Docker (ver [Decisión de Arquitectura](../arquitectura.md)) y crea `Adjunto` (autor, fecha).
- `vincularArticulo(ticketId, actor, articuloId)`: crea la asociación `Ticket — ArticuloConocimiento` y registra un `EventoAuditoria` de tipo "Vinculación" — a diferencia de comentar/adjuntar, esta asociación no tiene atributos propios (ni autor ni fecha), por eso necesita el `EventoAuditoria` para dejar rastro de quién vinculó qué (decisión ya fijada en [UC-43](../especificacion-casos-uso/base-conocimiento/UC-43-vincular-articulo-ticket.md)).

## Modelo — `Comentario`, `Adjunto`, `ArticuloConocimiento`, `EventoAuditoria`

Ninguno genera `Notificacion` propia (decisión de alcance mínimo ya fijada en UC-06 y UC-43) salvo que la fila corresponda al patrón de auditoría del `EventoAuditoria` de vincular. `Adjunto` es el único que además toca almacenamiento de archivos, no solo la base de datos — el volumen de Docker vive junto al contenedor de la app, no junto a PostgreSQL (ver Decisión de Arquitectura, sección Consecuencias).
