import { useNavigate } from "react-router-dom";

export default function TopBar({ search, setSearch }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <h1>Mis Productos / Servicios</h1>

      <div className="topbar-actions">
        <input
          type="text"
          placeholder="Buscar producto o servicio..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="btn-primary"
          onClick={() => navigate("/crear-item")}
        >
          + Nuevo Producto / Servicio
        </button>
      </div>
    </header>
  );
}