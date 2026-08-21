import { describe, expect, it } from 'vitest';
import { crearCategoria, crearEquipo, crearPrioridad, crearUsuario, loginComo } from './helpers.js';
import { prisma } from '../src/db/prisma.js';

const DIA = '2026-03-10';

// Sin sufijo "Z" a propósito -- mismo formato (hora local del proceso) que usa
// reports.service.js para interpretar "desde"/"hasta", así el fixture y el
// servicio miden los mismos instantes sin depender de la zona horaria del contenedor.
function horaDelDia(horas, minutos = 0) {
  return new Date(`${DIA}T${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00.000`);
}

async function crearEscenarioMetricas() {
  const equipo = await crearEquipo();
  const categoria = await crearCategoria('Cat metricas', equipo.id);
  // SLA ajustado para que un ticket cumpla y el otro incumpla, de forma determinista.
  const prioridad = await crearPrioridad('Media metricas', 30, 60);
  const solicitante = await crearUsuario({ rol: 'SOLICITANTE', correo: 'sol@test.local' });
  const agente = await crearUsuario({ rol: 'AGENTE', nivel: 'N1', equipoId: equipo.id, correo: 'agente@test.local' });
  const supervisor = await crearUsuario({ rol: 'SUPERVISOR', nivel: 'N3', equipoId: equipo.id, correo: 'supervisor@test.local' });

  // Ticket A: Resuelto, con comentario de Agente a los 10 min y resuelto a los 50 min -- cumple ambos SLA.
  const ticketA = await prisma.ticket.create({
    data: {
      titulo: 'A', descripcion: 'D', solicitanteId: solicitante.id, agenteId: agente.id, categoriaId: categoria.id, prioridadId: prioridad.id,
      estado: 'RESUELTO', fechaCreacion: horaDelDia(0, 0), fechaResolucion: horaDelDia(0, 50),
    },
  });
  await prisma.comentario.create({
    data: { ticketId: ticketA.id, autorId: agente.id, texto: 'Reviso ahora', fecha: horaDelDia(0, 10) },
  });

  // Ticket B: Resuelto sin comentario de Agente (excluido de primera respuesta) y resuelto a los 120 min -- incumple resolución.
  await prisma.ticket.create({
    data: {
      titulo: 'B', descripcion: 'D', solicitanteId: solicitante.id, agenteId: agente.id, categoriaId: categoria.id, prioridadId: prioridad.id,
      estado: 'RESUELTO', fechaCreacion: horaDelDia(0, 0), fechaResolucion: horaDelDia(2, 0),
    },
  });

  // Ticket C: todavía Abierto -- solo cuenta en volumen.
  await prisma.ticket.create({
    data: {
      titulo: 'C', descripcion: 'D', solicitanteId: solicitante.id, categoriaId: categoria.id, prioridadId: prioridad.id,
      estado: 'ABIERTO', fechaCreacion: horaDelDia(1, 0),
    },
  });

  return { equipo, categoria, prioridad, solicitante, agente, supervisor };
}

describe('UC-20 Ver Dashboard de Métricas', () => {
  it('calcula volumen, tiempos promedio y cumplimiento de SLA, acotado al Equipo del Supervisor', async () => {
    await crearEscenarioMetricas();
    const otroEquipo = await crearEquipo(); // no debería aportar nada al resultado
    const supervisor = await prisma.usuario.findFirstOrThrow({ where: { correo: 'supervisor@test.local' } });
    const agent = await loginComo(supervisor);

    const res = await agent.get('/api/reports/metricas').query({ desde: DIA, hasta: DIA }).expect(200);

    expect(res.body.metricas.volumen).toEqual({ total: 3, porEstado: { RESUELTO: 2, ABIERTO: 1 } });
    expect(res.body.metricas.tiempos.primeraRespuestaMinutos).toBe(10);
    expect(res.body.metricas.tiempos.resolucionMinutos).toBe(85); // (50 + 120) / 2
    expect(res.body.metricas.cumplimientoSla.primeraRespuestaPorcentaje).toBe(100); // 10 <= 30
    expect(res.body.metricas.cumplimientoSla.resolucionPorcentaje).toBe(50); // A cumple (50<=60), B no (120>60)
  });

  it('FA-1: un rango sin tickets devuelve volumen en cero, sin error', async () => {
    await crearEscenarioMetricas();
    const supervisor = await prisma.usuario.findFirstOrThrow({ where: { correo: 'supervisor@test.local' } });
    const agent = await loginComo(supervisor);

    const res = await agent.get('/api/reports/metricas').query({ desde: '2026-01-01', hasta: '2026-01-31' }).expect(200);

    expect(res.body.metricas.volumen.total).toBe(0);
    expect(res.body.metricas.tiempos.primeraRespuestaMinutos).toBeNull();
    expect(res.body.metricas.cumplimientoSla.resolucionPorcentaje).toBeNull();
  });

  it('FA-2: "desde" posterior a "hasta" se rechaza con 400', async () => {
    const supervisor = await crearUsuario({ rol: 'SUPERVISOR', nivel: 'N3', equipoId: (await crearEquipo()).id });
    const agent = await loginComo(supervisor);

    await agent.get('/api/reports/metricas').query({ desde: '2026-03-15', hasta: '2026-03-01' }).expect(400);
  });

  it('es exclusivo de Supervisor -- un Agente del mismo equipo recibe 403', async () => {
    const { agente } = await crearEscenarioMetricas();
    const agent = await loginComo(agente);

    await agent.get('/api/reports/metricas').query({ desde: DIA, hasta: DIA }).expect(403);
  });
});
