import { useAuth } from '../context/AuthContext.jsx';

// Landing mínima hasta que lleguen Tickets y el resto de pantallas.
export default function HomePage() {
  const { usuario } = useAuth();

  return (
    <section>
      <h1>Bienvenido, {usuario?.nombre}</h1>
      <p>Rol: {usuario?.rol}</p>
      <p>El resto de pantallas (Tickets, Base de Conocimiento, Dashboard…) llega en las próximas iteraciones.</p>
    </section>
  );
}
