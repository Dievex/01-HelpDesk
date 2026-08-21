import { describe, expect, it } from 'vitest';
import { crearCategoria, crearEquipo, crearEscenarioTicket, crearPrioridad, crearUsuario, loginComo } from './helpers.js';
import { prisma } from '../src/db/prisma.js';
import { cerrarPorVencimiento } from '../src/modules/tickets/tickets.service.js';

async function crearAgente(equipoId, correo = 'agente@test.local') {
  return crearUsuario({ rol: 'AGENTE', nivel: 'N1', equipoId, correo });
}

async function crearSupervisor(equipoId, correo = 'supervisor@test.local') {
  return crearUsuario({ rol: 'SUPERVISOR', nivel: 'N3', equipoId, correo });
}

describe('UC-03 Crear Ticket', () => {
  it('asigna la Prioridad "Baja" por defecto, sin que el Solicitante la elija', async () => {
    const { categoria, prioridadBaja } = await crearEscenarioTicket();
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const agent = await loginComo(solicitante);

    const res = await agent
      .post('/api/tickets')
      .send({ titulo: 'Impresora rota', descripcion: 'No imprime', categoriaId: categoria.id })
      .expect(201);

    expect(res.body.ticket.estado).toBe('ABIERTO');
    expect(res.body.ticket.prioridadId).toBe(prioridadBaja.id);

    const evento = res.body.ticket.eventosAuditoria[0];
    expect(evento.tipoEvento).toBe('CREACION');
  });

  it('rechaza título o descripción vacíos con 400', async () => {
    const { categoria } = await crearEscenarioTicket();
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const agent = await loginComo(solicitante);

    await agent.post('/api/tickets').send({ titulo: '', descripcion: 'D', categoriaId: categoria.id }).expect(400);
  });
});

describe('UC-14 Listar Cola / UC-11 Tomar Ticket', () => {
  it('la cola solo muestra tickets sin asignar del Equipo del actor', async () => {
    const { categoria, equipo } = await crearEscenarioTicket();
    const otroEquipo = await crearEquipo();
    const otraCategoria = await crearCategoria('Otra', otroEquipo.id);
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const solicitanteAgent = await loginComo(solicitante);

    await solicitanteAgent.post('/api/tickets').send({ titulo: 'Del equipo', descripcion: 'D', categoriaId: categoria.id });
    await solicitanteAgent.post('/api/tickets').send({ titulo: 'De otro equipo', descripcion: 'D', categoriaId: otraCategoria.id });

    const agente = await crearAgente(equipo.id);
    const agenteAgent = await loginComo(agente);
    const res = await agenteAgent.get('/api/tickets/cola').expect(200);

    expect(res.body.sinAsignar).toHaveLength(1);
    expect(res.body.sinAsignar[0].titulo).toBe('Del equipo');
  });

  it('FA-1: dos agentes tomando el mismo ticket a la vez -- solo uno gana (guard atómico)', async () => {
    const { categoria, equipo } = await crearEscenarioTicket();
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const solicitanteAgent = await loginComo(solicitante);
    const creado = await solicitanteAgent
      .post('/api/tickets')
      .send({ titulo: 'Disputado', descripcion: 'D', categoriaId: categoria.id });

    const agente1 = await loginComo(await crearAgente(equipo.id, 'a1@test.local'));
    const agente2 = await loginComo(await crearAgente(equipo.id, 'a2@test.local'));

    const [r1, r2] = await Promise.all([
      agente1.post(`/api/tickets/${creado.body.ticket.id}/tomar`),
      agente2.post(`/api/tickets/${creado.body.ticket.id}/tomar`),
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([200, 409]);

    const ticket = await prisma.ticket.findUniqueOrThrow({ where: { id: creado.body.ticket.id } });
    expect(ticket.estado).toBe('ASIGNADO');
    expect(ticket.agenteId).not.toBeNull();
  });
});

describe('Ciclo de vida completo del Ticket', () => {
  async function crearTicketAsignado() {
    const { categoria, equipo } = await crearEscenarioTicket();
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE', correo: 'sol@test.local' });
    const solicitanteAgent = await loginComo(solicitante);
    const creado = await solicitanteAgent
      .post('/api/tickets')
      .send({ titulo: 'Ticket', descripcion: 'D', categoriaId: categoria.id });

    const agente = await crearAgente(equipo.id);
    const agenteAgent = await loginComo(agente);
    await agenteAgent.post(`/api/tickets/${creado.body.ticket.id}/tomar`).expect(200);

    return { ticketId: creado.body.ticket.id, equipo, agente, agenteAgent, solicitante, solicitanteAgent };
  }

  it('UC-12 Resolver: solo el agente asignado puede resolver, y solo desde un estado resoluble', async () => {
    const { ticketId, agenteAgent, equipo } = await crearTicketAsignado();

    const otroAgente = await loginComo(await crearAgente(equipo.id, 'otro@test.local'));
    await otroAgente.post(`/api/tickets/${ticketId}/resolver`).send({ comentario: 'x' }).expect(403);

    const res = await agenteAgent.post(`/api/tickets/${ticketId}/resolver`).send({ comentario: 'Reiniciado' }).expect(200);
    expect(res.body.ticket.estado).toBe('RESUELTO');
    expect(res.body.ticket.fechaLimiteReapertura).not.toBeNull();

    await agenteAgent.post(`/api/tickets/${ticketId}/resolver`).send({}).expect(409);
  });

  it('UC-13 Escalar: libera al agente y pasa a ESCALADO', async () => {
    const { ticketId, agenteAgent } = await crearTicketAsignado();

    const res = await agenteAgent.post(`/api/tickets/${ticketId}/escalar`).send({ motivo: 'Requiere N2' }).expect(200);

    expect(res.body.ticket.estado).toBe('ESCALADO');
    expect(res.body.ticket.agenteId).toBeNull();
  });

  it('UC-18 Asignar / UC-19 Reasignar: exclusivo del Supervisor de ese Equipo', async () => {
    const { categoria, equipo } = await crearEscenarioTicket();
    const solicitanteAgent = await loginComo(await crearUsuario({ rol: 'SOLICITANTE' }));
    const creado = await solicitanteAgent.post('/api/tickets').send({ titulo: 'T', descripcion: 'D', categoriaId: categoria.id });

    const otroEquipo = await crearEquipo();
    const supervisorAjeno = await loginComo(await crearSupervisor(otroEquipo.id, 'sup-ajeno@test.local'));
    await supervisorAjeno.post(`/api/tickets/${creado.body.ticket.id}/asignar`).send({}).expect(403);

    const agente = await crearAgente(equipo.id);
    const supervisor = await loginComo(await crearSupervisor(equipo.id));
    const asignado = await supervisor
      .post(`/api/tickets/${creado.body.ticket.id}/asignar`)
      .send({ agenteId: agente.id })
      .expect(200);
    expect(asignado.body.ticket.agenteId).toBe(agente.id);

    const otroAgente = await crearAgente(equipo.id, 'otro2@test.local');
    const reasignado = await supervisor
      .post(`/api/tickets/${creado.body.ticket.id}/reasignar`)
      .send({ agenteId: otroAgente.id })
      .expect(200);
    expect(reasignado.body.ticket.agenteId).toBe(otroAgente.id);
    expect(reasignado.body.ticket.estado).toBe('ASIGNADO');
  });

  it('UC-41 Priorizar: el Supervisor la confirma una única vez (409 en el segundo intento)', async () => {
    const { ticketId, equipo } = await crearTicketAsignado();
    const otraPrioridad = await crearPrioridad('Alta', 15, 120);
    const supervisor = await loginComo(await crearSupervisor(equipo.id));

    await supervisor.post(`/api/tickets/${ticketId}/priorizar`).send({ prioridadId: otraPrioridad.id }).expect(200);
    await supervisor.post(`/api/tickets/${ticketId}/priorizar`).send({ prioridadId: otraPrioridad.id }).expect(409);
  });

  it('UC-07 Confirmar Cierre / UC-08 Reabrir: exclusivo de quien reportó el ticket', async () => {
    const { ticketId, agenteAgent, solicitanteAgent, equipo } = await crearTicketAsignado();
    await agenteAgent.post(`/api/tickets/${ticketId}/resolver`).send({}).expect(200);

    const ajeno = await loginComo(await crearUsuario({ rol: 'SOLICITANTE', correo: 'ajeno@test.local' }));
    await ajeno.post(`/api/tickets/${ticketId}/reabrir`).send({ motivo: 'Sigue fallando' }).expect(403);

    const reabierto = await solicitanteAgent
      .post(`/api/tickets/${ticketId}/reabrir`)
      .send({ motivo: 'Sigue fallando' })
      .expect(200);
    expect(reabierto.body.ticket.estado).toBe('REABIERTO');

    await agenteAgent.post(`/api/tickets/${ticketId}/resolver`).send({}).expect(200);

    const cerrado = await solicitanteAgent.post(`/api/tickets/${ticketId}/confirmar-cierre`).expect(200);
    expect(cerrado.body.ticket.estado).toBe('CERRADO');
  });

  it('UC-06 Comentar: un tercero sin relación con el ticket no tiene acceso', async () => {
    const { ticketId } = await crearTicketAsignado();
    const tercero = await loginComo(await crearUsuario({ rol: 'SOLICITANTE', correo: 'tercero@test.local' }));

    await tercero.post(`/api/tickets/${ticketId}/comentarios`).send({ texto: 'x' }).expect(403);
  });

  it('UC-43 Vincular Artículo: exclusivo del agente asignado, no duplica el vínculo (FA-2)', async () => {
    const { ticketId, agenteAgent, agente } = await crearTicketAsignado();
    const articulo = await prisma.articuloConocimiento.create({
      data: { titulo: 'Cómo reiniciar', contenido: 'Pasos...', visibilidad: 'PUBLICO', autorId: agente.id },
    });

    await agenteAgent.post(`/api/tickets/${ticketId}/vincular-articulo`).send({ articuloId: articulo.id }).expect(200);
    await agenteAgent.post(`/api/tickets/${ticketId}/vincular-articulo`).send({ articuloId: articulo.id }).expect(409);
  });
});

describe('UC-42 Adjuntar Archivo', () => {
  it('sube y descarga un adjunto real, con lista blanca de tipos activa (FA-2)', async () => {
    const { categoria } = await crearEscenarioTicket();
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const solicitanteAgent = await loginComo(solicitante);
    const creado = await solicitanteAgent.post('/api/tickets').send({ titulo: 'T', descripcion: 'D', categoriaId: categoria.id });
    const ticketId = creado.body.ticket.id;

    const rechazado = await solicitanteAgent
      .post(`/api/tickets/${ticketId}/adjuntos`)
      .attach('archivo', Buffer.from('no soy un tipo permitido'), { filename: 'script.exe', contentType: 'application/x-msdownload' });
    expect(rechazado.status).toBe(400);

    const subido = await solicitanteAgent
      .post(`/api/tickets/${ticketId}/adjuntos`)
      .attach('archivo', Buffer.from('contenido de prueba'), { filename: 'evidencia.txt', contentType: 'text/plain' })
      .expect(201);
    const adjunto = subido.body.ticket.adjuntos[0];
    expect(adjunto.nombreArchivo).toBe('evidencia.txt');

    const descarga = await solicitanteAgent.get(`/api/tickets/${ticketId}/adjuntos/${adjunto.id}`).expect(200);
    expect(descarga.text).toBe('contenido de prueba');
  });
});

describe('Cierre automático (FA-1 de UC-07, disparado por el Sistema)', () => {
  it('cierra los tickets Resueltos cuyo Plazo de Reapertura venció, con autorId nulo', async () => {
    const { categoria, prioridadBaja } = await crearEscenarioTicket();
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const ticket = await prisma.ticket.create({
      data: {
        titulo: 'Vencido',
        descripcion: 'D',
        solicitanteId: solicitante.id,
        categoriaId: categoria.id,
        prioridadId: prioridadBaja.id,
        estado: 'RESUELTO',
        fechaResolucion: new Date(Date.now() - 1000),
        fechaLimiteReapertura: new Date(Date.now() - 1),
      },
    });

    const cerrados = await cerrarPorVencimiento();
    expect(cerrados).toBe(1);

    const actualizado = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: { eventosAuditoria: true },
    });
    expect(actualizado.estado).toBe('CERRADO');
    const eventoCierre = actualizado.eventosAuditoria.find((e) => e.tipoEvento === 'CIERRE');
    expect(eventoCierre.autorId).toBeNull();
  });
});
