import { useNavigate } from "react-router-dom";
import "@/infrastructure/css/products-emprend/dashboard/TopBar.css"

export default function TopBar({ search, setSearch }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <h1>Mis Productos / Servicios</h1>

      <div className="topbar-actions">
        <input
          data-tour="emprendedora-buscar"
          type="text"
          placeholder="Buscar producto o servicio..."
          className="search-input2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          data-tour="emprendedora-crear"
          className="btn-primary"
          onClick={() => navigate("/crear-item")}
        >
          + Nuevo Producto / Servicio
        </button>
      </div>
    </header>
  );
}