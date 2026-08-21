import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usuariosApi } from '../../api/usuarios.js';
import { equiposApi } from '../../api/equipos.js';

const ROLES = ['SOLICITANTE', 'AGENTE', 'SUPERVISOR', 'ADMINISTRADOR'];
const NIVELES = ['N1', 'N2', 'N3'];
const ROLES_CON_NIVEL = ['AGENTE', 'SUPERVISOR'];

const FORM_VACIO = {
  nombre: '',
  correo: '',
  contrasena: '',
  rol: 'SOLICITANTE',
  nivel: '',
  equipoId: '',
};

// UC-36 Crear, UC-37 Ver, UC-39 Editar, UC-40 Eliminar Usuario.
export default function UsuarioFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_VACIO);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargas = [equiposApi.listar()];
    if (editando) cargas.push(usuariosApi.obtener(id));

    Promise.all(cargas)
      .then(([{ equipos }, usuarioRes]) => {
        setEquipos(equipos);
        if (usuarioRes) {
          setForm({
            ...usuarioRes.usuario,
            contrasena: '',
            nivel: usuarioRes.usuario.nivel ?? '',
            equipoId: usuarioRes.usuario.equipoId ?? '',
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, editando]);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const datos = { ...form };
      if (!ROLES_CON_NIVEL.includes(datos.rol)) {
        datos.nivel = null;
        datos.equipoId = null;
      } else {
        datos.equipoId = datos.equipoId || null;
      }
      if (editando && !datos.contrasena) delete datos.contrasena;

      if (editando) {
        await usuariosApi.editar(id, datos);
      } else {
        await usuariosApi.crear(datos);
      }
      navigate('/usuarios');
    } catch (err) {
      // FA-1 de UC-36/UC-39 (validación): se queda en este mismo formulario.
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar a ${form.nombre}? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      await usuariosApi.eliminar(id);
      navigate('/usuarios');
    } catch (err) {
      // FA-1 de UC-40 (usuario con tickets asociados): bloqueado, se queda aquí.
      setError(err.message);
    }
  }

  if (cargando) return <p>Cargando…</p>;

  return (
    <section className="form-page">
      <h1>{editando ? 'Editar usuario' : 'Crear usuario'}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Nombre
          <input
            value={form.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
            required
          />
        </label>
        <label>
          Correo
          <input
            type="email"
            value={form.correo}
            onChange={(e) => actualizarCampo('correo', e.target.value)}
            required
          />
        </label>
        <label>
          {editando ? 'Nueva contraseña (déjalo en blanco para no cambiarla)' : 'Contraseña'}
          <input
            type="password"
            value={form.contrasena}
            onChange={(e) => actualizarCampo('contrasena', e.target.value)}
            required={!editando}
          />
        </label>
        <label>
          Rol
          <select value={form.rol} onChange={(e) => actualizarCampo('rol', e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        {ROLES_CON_NIVEL.includes(form.rol) && (
          <label>
            Nivel
            <select
              value={form.nivel}
              onChange={(e) => actualizarCampo('nivel', e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {NIVELES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        {ROLES_CON_NIVEL.includes(form.rol) && (
          <label>
            Equipo
            <select
              value={form.equipoId}
              onChange={(e) => actualizarCampo('equipoId', e.target.value)}
            >
              <option value="">Sin equipo</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nombre}
                </option>
              ))}
            </select>
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar'}
          </button>
          {editando && (
            <button type="button" className="danger" onClick={handleEliminar}>
              Eliminar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
