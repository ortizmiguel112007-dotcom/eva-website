import { useState, useEffect } from "react";
import { destacadoService } from "@/features/products/services/destacado.service";
import { FiSearch } from "react-icons/fi";
import "@/infrastructure/css/destacados.css";

export default function Destacados() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [busqueda, setBusqueda]   = useState("");
  const [filtro, setFiltro]       = useState("todos");
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await destacadoService.listar();
        setProductos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (id_producto) => {
    try {
      const res = await destacadoService.toggle(id_producto);
      setProductos(prev =>
        prev.map(p =>
          p.id_producto === id_producto
            ? { ...p, destacado: res.producto.destacado }
            : p
        )
      );
      mostrarToast(res.message);
    } catch (err) {
      mostrarToast("Error al actualizar destacado");
    }
  };

  const filtrados = productos.filter(p => {
    const matchBusqueda =
      p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase());

    const matchFiltro =
      filtro === "todos"      ? true :
      filtro === "destacados" ? p.destacado :
      filtro === "normales"   ? !p.destacado : true;

    return matchBusqueda && matchFiltro;
  });

  const formatPrecio = (precio) =>
    "$" + Number(precio).toLocaleString("es-CO");

  if (cargando) return <div className="destacados-container"><p>Cargando productos...</p></div>;

  return (
    <div className="destacados-container">

      {/* Header */}
      <div className="destacados-header">
        <h1>Productos Destacados</h1>
        <p className="destacados-subtitle">
          Gestiona qué productos y servicios quieres destacar en tu catálogo
        </p>
      </div>

      {/* Métricas */}
      <div className="destacados-metricas">
        <div className="destacado-metrica">
          <h3>{productos.length}</h3>
          <span>Total Productos</span>
        </div>
        <div className="destacado-metrica activos">
          <h3>{productos.filter(p => p.destacado).length}</h3>
          <span>Destacados Activos</span>
        </div>
        <div className="destacado-metrica">
          <h3>{productos.filter(p => !p.destacado).length}</h3>
          <span>Sin Destacar</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="destacados-filtros">
        <div className="destacados-search-wrapper">
          <FiSearch className="destacados-search-icon" />
          <input
            type="text"
            className="destacados-search"
            placeholder="Buscar productos o servicios..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <button
          className={`destacados-pill ${filtro === "todos" ? "active" : ""}`}
          onClick={() => setFiltro("todos")}
        >
          Todos
        </button>
        <button
          className={`destacados-pill ${filtro === "destacados" ? "active" : ""}`}
          onClick={() => setFiltro("destacados")}
        >
          Destacados
        </button>
        <button
          className={`destacados-pill ${filtro === "normales" ? "active" : ""}`}
          onClick={() => setFiltro("normales")}
        >
          Sin Destacar
        </button>
      </div>

      {/* Grid */}
      <div className="destacados-grid">
        {filtrados.length === 0 ? (
          <div className="destacados-empty">No hay productos que coincidan</div>
        ) : (
          filtrados.map(producto => (
            <div
              key={producto.id_producto}
              className={`destacado-card ${producto.destacado ? "es-destacado" : ""}`}
            >
              {/* Imagen */}
              <div className="product-card-img-wrapper">
                {producto.imagen
                  ? <img src={producto.imagen} alt={producto.nombre_producto} />
                  : <div className="img-placeholder">📦</div>
                }

                {/* Badge tipo */}
                <span className={`destacado-tipo-badge ${producto.tipo}`}>
                  {producto.tipo}
                </span>

                {/* Estrella */}
                <button
                  className={`destacado-star ${producto.destacado ? "activo" : "inactivo"}`}
                  onClick={() => handleToggle(producto.id_producto)}
                  title={producto.destacado ? "Quitar de destacados" : "Destacar"}
                >
                  ★
                </button>
              </div>

              {/* Body */}
              <div className="destacado-body">
                <h3 className="destacado-nombre">{producto.nombre_producto}</h3>
                <span className="destacado-categoria">{producto.categoria || "Sin categoría"}</span>
                <span className="destacado-precio">{formatPrecio(producto.precio)}</span>
                {producto.destacado && (
                  <span className="destacado-label">★ Destacado</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && <div className="destacados-toast">{toast}</div>}

    </div>
  );
}