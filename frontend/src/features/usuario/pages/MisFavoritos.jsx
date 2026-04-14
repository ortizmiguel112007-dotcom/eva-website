import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "@/core/context/CarritoContext";
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios";
import {
  FiHeart,
  FiShoppingCart,
  FiPackage,
  FiTrash2,
  FiTag,
  FiClock,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";
import "@/infrastructure/css/MisFavoritos.css";

const BASE = "http://localhost:3000";

function formatPrecio(p) {
  return "$" + Number(p).toLocaleString("es-CO");
}

export default function MisFavoritos() {
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [agregados, setAgregados] = useState({});
  const { token } = useAuth();

  // Rel useEffect de cargarFavoritos:
  useEffect(() => {
    cargarFavoritos();
  }, [token]);

  const cargarFavoritos = async () => {
    if (!token) {
      setCargando(false);
      return;
    }
    try {
      const res = await axios.get(`${BASE}/api/favoritos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  // eliminarFavorito:
  const eliminarFavorito = async (id) => {
    try {
      await axios.post(
        `${BASE}/api/favoritos/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProductos((prev) => prev.filter((p) => p.id_producto !== id));
    } catch {}
  };

  // limpiarTodos:
  const limpiarTodos = async () => {
    try {
      await Promise.all(
        productos.map((p) =>
          axios.post(
            `${BASE}/api/favoritos/${p.id_producto}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ),
      );
      setProductos([]);
    } catch {}
  };

  const handleAgregar = (e, p) => {
    e.stopPropagation();
    agregarAlCarrito({
      id_producto: p.id_producto,
      nombre_producto: p.nombre_producto,
      precio: p.precio,
      imagen: p.imagen,
      categoria: p.categoria,
    });
    setAgregados((prev) => ({ ...prev, [p.id_producto]: true }));
    setTimeout(
      () => setAgregados((prev) => ({ ...prev, [p.id_producto]: false })),
      2000,
    );
  };

  if (cargando)
    return (
      <div className="fav-loading">
        <div className="fav-spinner" />
        <p>Cargando favoritos...</p>
      </div>
    );

  return (
    <div className="fav-page">
      {/* Header */}
      <div className="fav-header">
        <div className="fav-header-left">
          <div className="fav-header-icono">
            <FiHeart size={22} color="#ef4444" fill="#ef4444" />
          </div>
          <div>
            <h1 className="fav-titulo">Mis Favoritos</h1>
            <p className="fav-sub">
              {productos.length > 0
                ? `${productos.length} producto${productos.length !== 1 ? "s" : ""} guardado${productos.length !== 1 ? "s" : ""}`
                : "No tienes favoritos aún"}
            </p>
          </div>
        </div>
        {productos.length > 0 && (
          <button className="fav-btn-limpiar" onClick={limpiarTodos}>
            <FiTrash2 size={13} /> Limpiar todo
          </button>
        )}
      </div>

      {productos.length === 0 ? (
        <div className="fav-empty">
          <div className="fav-empty-icono">
            <FiHeart size={40} color="#fca5a5" />
          </div>
          <h3>Tu lista está vacía</h3>
          <p>Guarda tus productos favoritos para encontrarlos fácilmente</p>
          <button
            className="fav-btn-explorar"
            onClick={() => navigate("/productos")}
          >
            <FiArrowRight size={14} /> Explorar productos
          </button>
        </div>
      ) : (
        <div className="fav-grid">
          {productos.map((p, idx) => {
            const agotado =
              p.tipo !== "servicio" && p.inventario?.cantidad === 0;
            const yaAgregado = agregados[p.id_producto];
            const emprendedora =
              p.seccion?.emprendedora?.usuario?.nombre || "EVA";

            return (
              <div
                key={p.id_producto}
                className="fav-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => navigate(`/producto/${p.id_producto}`)}
              >
                {/* Imagen */}
                <div className="fav-card-img">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre_producto} />
                  ) : (
                    <div className="fav-no-img">
                      <FiPackage size={36} color="#cbd5e1" />
                    </div>
                  )}
                  <span className={`fav-tipo-badge fav-tipo--${p.tipo}`}>
                    {p.tipo}
                  </span>
                  <button
                    className="fav-btn-eliminar"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarFavorito(p.id_producto);
                    }}
                    title="Quitar de favoritos"
                  >
                    <FiHeart size={14} fill="#ef4444" color="#ef4444" />
                  </button>
                  {agotado && (
                    <div className="fav-agotado-overlay">
                      <span>Agotado</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="fav-card-body">
                  <span className="fav-cat">{p.categoria}</span>
                  <h3 className="fav-nombre">{p.nombre_producto}</h3>

                  {p.tipo === "servicio" && p.duracion && (
                    <div className="fav-duracion">
                      <FiClock size={11} /> {p.duracion}
                    </div>
                  )}

                  <span className="fav-tienda">
                    <FiTag size={11} /> {emprendedora}
                  </span>

                  <div className="fav-footer">
                    <strong className="fav-precio">
                      {formatPrecio(p.precio)}
                    </strong>
                    <button
                      className={`fav-btn-agregar ${yaAgregado ? "agregado" : ""} ${agotado ? "agotado" : ""}`}
                      disabled={agotado}
                      onClick={(e) => handleAgregar(e, p)}
                    >
                      {yaAgregado ? (
                        <>
                          <FiCheck size={13} /> Listo
                        </>
                      ) : agotado ? (
                        "Agotado"
                      ) : p.tipo === "servicio" ? (
                        "Reservar"
                      ) : (
                        <>
                          <FiShoppingCart size={13} /> Agregar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
