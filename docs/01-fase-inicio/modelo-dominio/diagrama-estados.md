[HelpDesk](../../README.md) / [Fase de Inicio](../README.md) / [Modelo de Dominio](README.md)

# Diagrama de Estados — Ciclo de vida del Ticket

Complementa el [Diagrama de Clases](diagrama-clases.md): cómo cambia el atributo `estado` de un `Ticket` a lo largo del tiempo.

```mermaid
stateDiagram-v2
    [*] --> Abierto : Solicitante crea el ticket
    Abierto --> Asignado : Agente N1 toma el ticket
    Asignado --> EnProgreso : Agente inicia atención
    EnProgreso --> Escalado : Agente escala a N2/N3
    Escalado --> EnProgreso : Agente de nivel superior retoma
    EnProgreso --> Resuelto : Agente marca solución
    Escalado --> Resuelto : Agente de nivel superior resuelve
    Resuelto --> Cerrado : Solicitante confirma o vence el plazo de reapertura
    Resuelto --> Reabierto : Solicitante rechaza la solución
    Reabierto --> EnProgreso : Se retoma la atención
    Cerrado --> [*]
```

## Decisiones de modelado (y por qué)

- **El estado se modela como máquina de estados, no como clase relacionable.** En el [Diagrama de Clases](diagrama-clases.md), `estado` es un simple atributo de `Ticket`. Su ciclo de vida es lo bastante rico (transiciones condicionadas por rol y evento) como para merecer un diagrama propio, pero eso no lo convierte en una entidad con identidad propia dentro del modelo de dominio.
- **`Escalado` no implica cambio de clase ni de propietario del ticket**, solo de estado y de agente asignado - coherente con que `Escalamiento` tampoco es una clase en el Diagrama de Clases.
- **`Reabierto` existe como estado propio** (en vez de volver directo a `EnProgreso`) porque distinguirlo permite medir por separado cuántos tickets se reabren, una métrica de calidad de resolución que la Organización adoptante puede querer auditar.
