import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tiendaService } from "../services/tienda.service";
import { useCarrito } from "@/core/context/CarritoContext";
import "@/infrastructure/css/inicio.css";
import "@/infrastructure/css/detalleProducto.css";

const handleAgregar = () => {
  agregar(producto, cantidad);
  mostrarToast(`${producto.nombre_producto} agregado al carrito`);
};

const AVATAR_COLORS = [
  "#3b82f6",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#ef4444",
  "#0891b2",
  "#be185d",
  "#65a30d",
];

function getAvatarColor(nombre) {
  if (!nombre) return AVATAR_COLORS[0];
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getInitials(nombre) {
  if (!nombre) return "?";
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO");
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Estrellas({ calificacion, size = "1rem" }) {
  return (
    <div className="detalle-estrellas" style={{ fontSize: size }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < calificacion ? "estrella-llena" : "estrella-vacia"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [toast, setToast] = useState(null);
  const { agregar } = useCarrito();
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await tiendaService.getProducto(id);
        setProducto(data);

        // cargar relacionados por categoría
        if (data.categoria) {
          const todos = await tiendaService.getCatalogo({
            categoria: data.categoria,
          });
          setRelacionados(
            todos.filter((p) => p.id_producto !== data.id_producto).slice(0, 4),
          );
        }

        // cargar comentarios
        try {
          const coms = await tiendaService.getComentariosProducto(id);
          setComentarios(coms);
        } catch {
          setComentarios([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
    window.scrollTo(0, 0);
  }, [id]);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAgregar = () => {
    mostrarToast(`${producto.nombre_producto} agregado al carrito`);
  };

  if (cargando)
    return (
      <div className="detalle-wrapper">
        <div className="pub-loading">Cargando producto...</div>
      </div>
    );

  if (!producto)
    return (
      <div className="detalle-wrapper">
        <div className="pub-empty">Producto no encontrado</div>
      </div>
    );

  const stock = producto.inventario?.cantidad ?? 0;
  const stockMin = producto.inventario?.stock_minimo ?? 0;
  const estadoStock =
    stock === 0 ? "agotado" : stock <= stockMin ? "bajo" : "ok";
  const stockLabel =
    stock === 0
      ? "Agotado"
      : stock <= stockMin
        ? `Stock bajo (${stock} disponibles)`
        : `${stock} disponibles`;

  const emprendedora = producto.seccion?.emprendedora;
  const nombreTienda = emprendedora?.usuario?.nombre || "EVA";
  const idEmprendedora = emprendedora?.id_emprendedora;

  const promedio =
    comentarios.length > 0
      ? (
          comentarios.reduce((acc, c) => acc + c.calificacion, 0) /
          comentarios.length
        ).toFixed(1)
      : null;

  return (
    <div className="inicio-page">
      <div className="detalle-wrapper">
        {/* Breadcrumb */}
        <div className="detalle-breadcrumb">
          <button onClick={() => navigate("/")}>Inicio</button>
          <span>›</span>
          <button onClick={() => navigate("/productos")}>Catálogo</button>
          <span>›</span>
          <span>{producto.nombre_producto}</span>
        </div>

        {/* Layout principal */}
        <div className="detalle-main">
          {/* Imagen */}
          <div className="detalle-img-wrapper">
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre_producto} />
            ) : (
              <div className="detalle-img-placeholder">📦</div>
            )}
          </div>

          {/* Info */}
          <div className="detalle-info">
            {/* Badges */}
            <div className="detalle-badges">
              <span className={`detalle-tipo-badge ${producto.tipo}`}>
                {producto.tipo}
              </span>
              {producto.categoria && (
                <span className="detalle-cat-badge">{producto.categoria}</span>
              )}
            </div>

            {/* Nombre */}
            <h1 className="detalle-nombre">{producto.nombre_producto}</h1>

            {/* Precio */}
            <div className="detalle-precio">
              {formatPrecio(producto.precio)}
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <p className="detalle-descripcion">{producto.descripcion}</p>
            )}

            {/* Duración (servicios) */}
            {producto.tipo === "servicio" && producto.duracion && (
              <span className="detalle-duracion">
                ⏱ Duración: {producto.duracion}
              </span>
            )}

            {/* Stock */}
            <div className="detalle-stock">
              <div className={`stock-dot ${estadoStock}`} />
              <span className={`stock-texto ${estadoStock}`}>{stockLabel}</span>
            </div>

            {/* Cantidad + carrito */}
            <div className="detalle-accion">
              {producto.tipo === "producto" && (
                <div className="detalle-cantidad">
                  <button
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                  >
                    −
                  </button>
                  <span>{cantidad}</span>
                  <button
                    onClick={() =>
                      setCantidad((prev) => Math.min(stock, prev + 1))
                    }
                  >
                    +
                  </button>
                </div>
              )}
              <button
                className="btn-agregar-carrito"
                onClick={handleAgregar}
                disabled={estadoStock === "agotado"}
              >
                🛒{" "}
                {estadoStock === "agotado" ? "Agotado" : "Agregar al carrito"}
              </button>
            </div>

            {/* Tienda */}
            <div className="detalle-tienda-card">
              <div className="detalle-tienda-left">
                <div
                  className="detalle-tienda-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${getAvatarColor(nombreTienda)}, ${getAvatarColor(nombreTienda)}bb)`,
                  }}
                >
                  {getInitials(nombreTienda)}
                </div>
                <div>
                  <p className="detalle-tienda-nombre">{nombreTienda}</p>
                  <span className="detalle-tienda-sub">Emprendedora</span>
                </div>
              </div>
              {idEmprendedora && (
                <button
                  className="btn-ver-tienda"
                  onClick={() => navigate(`/tienda/${idEmprendedora}`)}
                >
                  Ver tienda →
                </button>
              )}
            </div>
          </div>
        </div>

        <hr className="detalle-divider" />

        {/* Comentarios */}
        <div>
          <h2 className="detalle-seccion-titulo">
            ⭐ Comentarios y Calificaciones
          </h2>

          {promedio && (
            <div className="detalle-promedio">
              <span className="detalle-promedio-num">{promedio}</span>
              <div>
                <Estrellas calificacion={Math.round(Number(promedio))} />
                <span className="detalle-total-comentarios">
                  {comentarios.length} reseñas
                </span>
              </div>
            </div>
          )}

          {comentarios.length === 0 ? (
            <div className="detalle-sin-comentarios">
              <p>😊 Aún no hay comentarios para este producto</p>
              <span>Sé el primero en comentar después de tu compra</span>
            </div>
          ) : (
            comentarios.map((c) => (
              <div key={c.id_comentario} className="comentario-pub-card">
                <div className="comentario-pub-header">
                  <div className="comentario-pub-usuario">
                    <div className="comentario-pub-avatar">
                      {getInitials(c.usuario?.nombre)}
                    </div>
                    <div>
                      <div className="comentario-pub-nombre">
                        {c.usuario?.nombre}
                      </div>
                      <Estrellas calificacion={c.calificacion} size="0.85rem" />
                    </div>
                  </div>
                  <span className="comentario-pub-fecha">
                    {formatFecha(c.fecha)}
                  </span>
                </div>
                <p className="comentario-pub-texto">{c.texto}</p>
              </div>
            ))
          )}
        </div>

        {/* Productos relacionados */}
        {relacionados.length > 0 && (
          <>
            <hr className="detalle-divider" />
            <div>
              <h2 className="detalle-seccion-titulo">
                📦 Productos Relacionados
              </h2>
              <div className="relacionados-grid">
                {relacionados.map((p) => (
                  <div
                    key={p.id_producto}
                    className="pub-product-card"
                    onClick={() => navigate(`/producto/${p.id_producto}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="pub-product-img">
                      {p.imagen ? (
                        <img src={p.imagen} alt={p.nombre_producto} />
                      ) : (
                        <div className="no-img">📦</div>
                      )}
                      <span className={`pub-tipo-badge ${p.tipo}`}>
                        {p.tipo}
                      </span>
                    </div>
                    <div className="pub-product-body">
                      <h3>{p.nombre_producto}</h3>
                      <span className="cat">{p.categoria}</span>
                      <div className="pub-product-footer">
                        <span className="pub-precio">
                          {formatPrecio(p.precio)}
                        </span>
                        <button
                          className="btn-agregar"
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarToast(`${p.nombre_producto} agregado`);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="detalle-toast">🛒 {toast}</div>}
    </div>
  );
}
