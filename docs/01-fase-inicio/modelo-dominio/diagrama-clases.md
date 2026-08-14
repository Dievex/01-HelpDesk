[HelpDesk](../../README.md) / [Fase de Inicio](../README.md) / [Modelo de Dominio](README.md)

# Diagrama de Clases — Modelo de Dominio

```mermaid
%%{init: {"class": {"hideEmptyMembersBox": true}}}%%
classDiagram
    namespace Usuarios_Roles {
        class Usuario {
            +nombre
            +correo
        }
        class AgenteSoporte {
            +nivel
        }
        class Supervisor
        class Administrador
    }

    namespace Gestion_Tickets {
        class Ticket {
            +titulo
            +descripcion
            +estado
            +fechaCreacion
            +fechaResolucion
        }
        class Categoria {
            +nombre
        }
        class Prioridad {
            +nombre
        }
        class SLA {
            +tiempoPrimeraRespuesta
            +tiempoResolucion
        }
        class Comentario {
            +texto
            +fecha
        }
        class Adjunto {
            +nombreArchivo
        }
        class EventoAuditoria {
            +tipoEvento
            +fecha
        }
    }

    namespace Base_de_Conocimiento {
        class ArticuloConocimiento {
            +titulo
            +contenido
        }
    }

    namespace Notificaciones {
        class Notificacion {
            +mensaje
            +fechaEnvio
        }
    }

    Usuario <|-- AgenteSoporte
    AgenteSoporte <|-- Supervisor
    Usuario <|-- Administrador

    Usuario  -->  Ticket : reporta (solicitante)
    AgenteSoporte  -->  Ticket : atiende
    Ticket  -->  Categoria : pertenece a
    Ticket  -->  Prioridad : tiene
    Prioridad  -->  SLA : define

    Ticket  *--  Comentario : contiene
    Ticket  *--  Adjunto : incluye
    Ticket  *--  EventoAuditoria : registra
    Ticket  -->  ArticuloConocimiento : se resuelve con

    Notificacion  -->  Usuario : destinatario
    Comentario  -->  Usuario : autor
    EventoAuditoria  -->  Usuario : autor
    EventoAuditoria  -->  Notificacion : genera
```

## Decisiones de modelado (y por qué)

- **Solicitante no es una clase.** Es un rol que cualquier `Usuario` asume al reportar un ticket — incluso un `AgenteSoporte` puede reportar uno. Modelarlo como clase aparte hubiera duplicado `Usuario` sin aportar comportamiento distinto.
- **`nivel` de `AgenteSoporte` existe por y para el escalamiento.** No clasifica tipos de ticket, clasifica capacidad de resolución: N1 atiende primero, y cuando el caso excede lo que puede resolver, se escala a un agente N2/N3. Es el dato del que depende a quién se le puede escalar un ticket.
- **`Supervisor` hereda de `AgenteSoporte`, no de `Usuario` directamente.** Para poder dirigir agentes necesita el mismo conocimiento técnico que ellos, y de hecho puede atender tickets él mismo — aunque en la práctica lo haga poco, siendo su rol principal supervisar carga de trabajo y SLA. Modelarlo como especialización de `AgenteSoporte` evita duplicar la asociación "atiende Ticket": la hereda.
- **Estado vive como atributo de `Ticket`, no como clase.** Su ciclo de vida sí es lo bastante rico como para modelarse aparte - ver el [Diagrama de Estados](diagrama-estados.md) - pero como máquina de estados, no como entidad relacionable aquí.
- **Escalamiento no tiene clase propia.** Se representa como un `EventoAuditoria` de tipo "Escalamiento" combinado con el cambio de `AgenteSoporte` asignado al ticket. Crear una clase `Escalamiento` habría sido una clase que en la práctica nadie consulta de forma independiente al ticket - justo el tipo de clase huérfana que conviene evitar.
- **`Ticket.fechaResolucion` es un atributo propio, no algo derivado en caliente de `EventoAuditoria`.** El objetivo (`SLA.tiempoResolucion`) es una política; `fechaResolucion` es el dato real de esta instancia. Reportes y Dashboard son feature prioritaria del MVP, así que este dato debe poder leerse directo del `Ticket` sin recorrer todo su historial de auditoría. El cumplimiento de SLA se calcula comparando ambos, no se almacena.
- **`Comentario`, `Adjunto` y `EventoAuditoria` son composición (`*--`) de `Ticket`.** No tienen sentido ni ciclo de vida propio fuera de su ticket: si el ticket se elimina, se eliminan con él.
- **`ArticuloConocimiento` es asociación simple, no agregación ni composición.** La agregación modela relaciones todo-parte (ej. un Equipo agrega Jugadores); un `Ticket` no está "compuesto de" artículos ni viceversa, son dos entidades independientes que se referencian entre sí. Por eso es asociación simple.
