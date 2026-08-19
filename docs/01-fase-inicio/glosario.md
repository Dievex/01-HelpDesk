[HelpDesk](../README.md) / [Fase de Inicio](README.md)

# Glosario

Vocabulario común del dominio. Sirve de base directa para el [Modelo de Dominio](modelo-dominio/README.md) y para nombrar consistentemente actores y entidades en los Casos de Uso.

| Término | Definición |
| --- | --- |
| Adjunto | Archivo adjunto a un ticket como evidencia (captura de pantalla, registro, documento). |
| Administrador del Sistema | Usuario responsable de configurar categorías, equipos, SLA, usuarios y permisos dentro de una instancia. |
| Agente de Soporte | Usuario responsable de atender y resolver tickets asignados. Se clasifica por nivel (N1, N2, N3) según la complejidad que puede resolver, y pertenece a un Equipo. |
| Artículo de Conocimiento | Documento reutilizable que describe la solución a un problema común, vinculable a uno o varios tickets. Tiene una visibilidad: Público (cualquier Solicitante) o Interno (solo personal técnico: Agente, Supervisor, Administrador). |
| Auditoría (Evento de Auditoría) | Registro inmutable de un cambio ocurrido sobre un ticket: autor, fecha y tipo de cambio. |
| Base de Conocimiento | Colección de Artículos de Conocimiento disponible para agentes. |
| Categoría | Clasificación temática de un ticket (ej. Hardware, Software, Red, Cuentas de usuario). Determina el Equipo que la atiende. |
| Comentario | Anotación de texto agregada a un ticket por un Usuario, para dar seguimiento o aportar información adicional sin cambiar sus datos. |
| Equipo | Agrupación de Agentes de Soporte (incluye a su Supervisor) que atiende una o varias Categorías. Es lo que enruta un ticket a un grupo de agentes antes de que uno lo tome individualmente. |
| Escalamiento | Acción de transferir un ticket a un nivel de soporte superior cuando el nivel actual no puede resolverlo. |
| Instancia | Despliegue self-hosted de HelpDesk operado de forma independiente por una Organización adoptante. |
| Notificación | Mensaje generado automáticamente ante un cambio relevante en un ticket, dirigido a un usuario interesado. |
| Organización adoptante | Empresa o entidad que instala y opera su propia instancia de HelpDesk. |
| Plazo de Reapertura | Período tras el cual un Ticket `Resuelto` se cierra automáticamente si el Solicitante no lo confirma ni lo reabre. Su duración la define la Organización adoptante. |
| Prioridad | Nivel de urgencia asignado a un ticket (ej. Baja, Media, Alta, Crítica) que determina el SLA aplicable. |
| SLA (Acuerdo de Nivel de Servicio) | Tiempos objetivo (primera respuesta, resolución) asociados a una prioridad; su incumplimiento genera alertas. |
| Solicitante | Rol que asume cualquier usuario al reportar un ticket. No es un tipo de usuario aparte: cualquier Usuario puede serlo. |
| Supervisor | Agente de Soporte con responsabilidad adicional de vigilar la carga de trabajo y el cumplimiento de SLA del Equipo al que pertenece. Requiere el mismo conocimiento técnico que un agente para poder dirigirlos, y puede atender tickets directamente aunque no sea su función principal. |
| Ticket | Unidad central del sistema. Representa una solicitud o incidencia reportada, con estado, categoría, prioridad y agente asignado. |
| Usuario | Persona registrada en una instancia de HelpDesk. Actúa bajo distintos roles (solicitante, agente, supervisor, administrador). |
