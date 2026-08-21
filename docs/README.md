# Documentación del proceso — HelpDesk

HelpDesk se desarrolla siguiendo **RUP (Rational Unified Process)**: un proceso iterativo e incremental organizado en fases secuenciales y disciplinas transversales.

- **Fases** (eje temporal): Inicio → Elaboración → Construcción → Transición. 
- **Disciplinas** (eje de trabajo): Modelado del Negocio, Requisitos, Análisis y Diseño, Implementación, Pruebas, Despliegue, Gestión de Configuración y Cambios, Gestión de Proyecto, Entorno.

Todas las fases tocan varias disciplinas, con distinto peso relativo:

| Fase | Disciplina dominante |
| --- | --- |
| [01 · Inicio](01-fase-inicio/README.md) | Requisitos / Negocio |
| [02 · Elaboración](02-fase-elaboracion/README.md) | Análisis y Diseño |
| [03 · Construcción](03-fase-construccion/README.md) | Implementación / Pruebas |
| [04 · Transición](04-fase-transicion/README.md) | Despliegue |

## Estado

Cada carpeta de fase se completa de forma incremental y se cierra con la validación del hito correspondiente antes de abrir la siguiente.

Las 4 fases están cerradas: Inicio (LCOM), Elaboración (LCAM), Construcción (IOCM) y Transición (PRM). El producto está en un estado usable/desplegable — ver el [manual de instalación self-hosted](04-fase-transicion/manual-instalacion.md).
