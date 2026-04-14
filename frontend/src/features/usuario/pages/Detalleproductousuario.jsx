import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tiendaService } from "@/features/tienda/services/tienda.service";
import { useCarrito } from "@/core/context/CarritoContext";
import { useAuth } from "@/core/context/AuthConten";
import axios from "axios";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiStar,
  FiArrowLeft,
  FiHeart,
  FiPackage,
  FiMessageSquare,
  FiClock,
  FiTag,
  FiCheck,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import "@/infrastructure/css/DetalleProductoUsuario.css";

const AVATAR_COLORS = [
  ["#3b82f6", "#1d4ed8"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#7c3aed", "#5b21b6"],
  ["#ef4444", "#dc2626"],
  ["#0891b2", "#0e7490"],
];

function getAvatarGradient(nombre) {
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

function formatPrecio(p) {
  return "$" + Number(p).toLocaleString("es-CO");
}
function formatFecha(f) {
  return new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Estrellas({ cal, size = 15, interactivo = false, onSelect }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="dp-estrellas">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar
          key={i}
          size={size}
          fill={i <= (interactivo ? hover || cal : cal) ? "#f59e0b" : "none"}
          color={
            i <= (interactivo ? hover || cal : cal) ? "#f59e0b" : "#d1d5db"
          }
          style={{
            cursor: interactivo ? "pointer" : "default",
            transition: "all 0.1s",
          }}
          onMouseEnter={() => interactivo && setHover(i)}
          onMouseLeave={() => interactivo && setHover(0)}
          onClick={() => interactivo && onSelect?.(i)}
        />
      ))}
    </div>
  );
}

export default function DetalleProductoUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();
  const { token } = useAuth();

  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [toast, setToast] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [agregado, setAgregado] = useState(false);
  const [pedidoEntregado, setPedidoEntregado] = useState(null);
  const [imgActiva, setImgActiva] = useState(0);

  // Formulario comentario
  const [mostrarForm, setMostrarForm] = useState(false);
  const [calForm, setCalForm] = useState(0);
  const [textoForm, setTextoForm] = useState("");
  const [enviandoCom, setEnviandoCom] = useState(false);
  const [errorCom, setErrorCom] = useState("");

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };
  //  el useEffect de favoritos:
  useEffect(() => {
    if (!token) return;
    axios
      .get(`http://localhost:3000/api/favoritos/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFavorito(res.data.favorito))
      .catch(() => {});
  }, [id, token]);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await tiendaService.getProducto(id);
        setProducto(data);
        if (data.categoria) {
          const todos = await tiendaService.getCatalogo({
            categoria: data.categoria?.toLowerCase(),
          });
          setRelacionados(
            todos.filter((p) => p.id_producto !== data.id_producto).slice(0, 4),
          );
        }
        try {
          const coms = await tiendaService.getComentariosProducto(id);
          setComentarios(coms);
        } catch {
          setComentarios([]);
        }

        if (token) {
          try {
            const res = await axios.get(
              "http://localhost:3000/api/cliente/pedidos",
              { headers: { Authorization: `Bearer ${token}` } },
            );
            const pedido = res.data.find(
              (p) =>
                p.estado === "entregado" &&
                p.detalles?.some((d) => d.producto?.id_producto === Number(id)),
            );
            setPedidoEntregado(pedido || null);
          } catch {
            setPedidoEntregado(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
    window.scrollTo(0, 0);
  }, [id, token]);

  const handleAgregar = () => {
    if (!producto) return;
    agregarAlCarrito(
      {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio: producto.precio,
        imagen: producto.imagen,
        categoria: producto.categoria,
      },
      cantidad,
    );
    setAgregado(true);
    mostrarToast(`${producto.nombre_producto} agregado al carrito`);
    setTimeout(() => setAgregado(false), 2000);
  };

  //handleFavorito:
  const handleFavorito = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        `http://localhost:3000/api/favoritos/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFavorito(res.data.favorito);
    } catch {}
  };

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!calForm) {
      setErrorCom("Selecciona una calificación");
      return;
    }
    if (!textoForm.trim()) {
      setErrorCom("Escribe un comentario");
      return;
    }
    setEnviandoCom(true);
    try {
      await axios.post(
        "http://localhost:3000/api/comentarios",
        {
          id_producto: Number(id),
          id_pedido: pedidoEntregado.id_pedido,
          calificacion: calForm,
          texto: textoForm,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const coms = await tiendaService.getComentariosProducto(id);
      setComentarios(coms);
      setTextoForm("");
      setCalForm(0);
      setMostrarForm(false);
      mostrarToast("¡Reseña publicada!");
    } catch (err) {
      setErrorCom(err.response?.data?.error || "Error al enviar");
    } finally {
      setEnviandoCom(false);
    }
  };

  if (cargando)
    return (
      <div className="dp-loading">
        <div className="dp-spinner" />
        <p>Cargando producto...</p>
      </div>
    );

  if (!producto)
    return (
      <div className="dp-loading">
        <FiPackage size={48} color="#cbd5e1" />
        <p>Producto no encontrado</p>
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
        ? `Stock bajo (${stock})`
        : `${stock} disponibles`;

  const emprendedora = producto.seccion?.emprendedora;
  const nombreTienda = emprendedora?.usuario?.nombre || "EVA";
  const idEmprendedora = emprendedora?.id_emprendedora;
  const [c1, c2] = getAvatarGradient(nombreTienda);

  const esAlianza = !!producto.seccion?.alianza;
  const participantes = producto.seccion?.alianza?.participantes || [];
  const promedio = comentarios.length
    ? (
        comentarios.reduce((acc, c) => acc + c.calificacion, 0) /
        comentarios.length
      ).toFixed(1)
    : null;

  return (
    <div className="dp-page">
      {/* Toast */}
      {toast && (
        <div className={`dp-toast dp-toast--${toast.tipo}`}>
          {toast.tipo === "ok" ? (
            <FiCheck size={14} />
          ) : (
            <FiAlertCircle size={14} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="dp-breadcrumb">
        <button
          className="dp-btn-volver"
          onClick={() => navigate("/productos")}
        >
          <FiArrowLeft size={14} /> Catálogo
        </button>
        <span className="dp-breadcrumb-sep">›</span>
        <span className="dp-breadcrumb-actual">{producto.nombre_producto}</span>
      </div>

      {/* ── Layout principal ── */}
      <div className="dp-main">
        {/* Columna imagen */}
        <div className="dp-col-img">
          <div className="dp-img-principal">
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre_producto} />
            ) : (
              <div className="dp-img-placeholder">
                <FiPackage size={64} color="#cbd5e1" />
              </div>
            )}
            {/* Badges sobre imagen */}
            <span className={`dp-badge dp-badge--${producto.tipo}`}>
              {producto.tipo}
            </span>
            <button
              className={`dp-fav-btn ${favorito ? "active" : ""}`}
              onClick={handleFavorito}
            >
              <FiHeart
                size={16}
                fill={favorito ? "#ef4444" : "none"}
                color={favorito ? "#ef4444" : "#94a3b8"}
              />
            </button>
          </div>
        </div>

        {/* Columna info */}
        <div className="dp-col-info">
          {/* Categoría */}
          <div className="dp-cat-row">
            <FiTag size={12} />
            <span>{producto.categoria}</span>
          </div>
          {/* Nombre */}
          <h1 className="dp-nombre">{producto.nombre_producto}</h1>
          {/* Rating */}
          {promedio && (
            <div className="dp-rating">
              <Estrellas cal={Math.round(Number(promedio))} />
              <span className="dp-rating-num">{promedio}</span>
              <span className="dp-rating-count">
                ({comentarios.length} reseñas)
              </span>
            </div>
          )}
          {/* Precio */}
          <div className="dp-precio">{formatPrecio(producto.precio)}</div>
          {/* Descripción */}
          {producto.descripcion && (
            <p className="dp-descripcion">{producto.descripcion}</p>
          )}
          {/* Duración */}
          {producto.tipo === "servicio" && producto.duracion && (
            <div className="dp-duracion">
              <FiClock size={14} /> {producto.duracion}
            </div>
          )}
          {/* Stock */}
          <div className={`dp-stock dp-stock--${estadoStock}`}>
            <div className="dp-stock-dot" />
            {stockLabel}
          </div>
          {/* Cantidad + carrito */}
          <div className="dp-acciones">
            {producto.tipo === "producto" && (
              <div className="dp-cantidad">
                <button onClick={() => setCantidad((p) => Math.max(1, p - 1))}>
                  <FiMinus size={13} />
                </button>
                <span>{cantidad}</span>
                <button
                  onClick={() =>
                    setCantidad((p) => Math.min(stock || 99, p + 1))
                  }
                >
                  <FiPlus size={13} />
                </button>
              </div>
            )}
            <button
              className={`dp-btn-agregar ${agregado ? "agregado" : ""} ${estadoStock === "agotado" ? "agotado" : ""}`}
              onClick={handleAgregar}
              disabled={estadoStock === "agotado"}
            >
              {agregado ? (
                <>
                  <FiCheck size={16} /> ¡Agregado!
                </>
              ) : estadoStock === "agotado" ? (
                "Agotado"
              ) : (
                <>
                  <FiShoppingCart size={16} /> Agregar al carrito
                </>
              )}
            </button>
          </div>
          {/* Card tienda */}
          {esAlianza ? (
            <div className="dp-tienda-card">
              <div
                className="dp-tienda-left"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#3b82f6",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Campaña Colaborativa
                </span>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {participantes.map((p) => {
                    const [ca, cb] = getAvatarGradient(p.usuario?.nombre);
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          className="dp-tienda-avatar"
                          style={{
                            background: `linear-gradient(135deg, ${ca}, ${cb})`,
                          }}
                        >
                          {getInitials(p.usuario?.nombre)}
                        </div>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          {p.usuario?.nombre}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                className="dp-btn-ver-tienda"
                onClick={() =>
                  navigate(`/alianza/${producto.seccion.alianza.id_alianza}`)
                }
              >
                Ver campaña →
              </button>
            </div>
          ) : (
            <div className="dp-tienda-card">
              <div className="dp-tienda-left">
                <div
                  className="dp-tienda-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  }}
                >
                  {getInitials(nombreTienda)}
                </div>
                <div>
                  <p className="dp-tienda-nombre">{nombreTienda}</p>
                  <span className="dp-tienda-sub">Emprendedora EVA</span>
                </div>
              </div>
              {idEmprendedora && (
                <button
                  className="dp-btn-ver-tienda"
                  onClick={() => navigate(`/tienda/${idEmprendedora}`)}
                >
                  Ver tienda →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Comentarios ── */}
      <div className="dp-seccion">
        <div className="dp-seccion-header">
          <h2 className="dp-seccion-titulo">
            <FiStar size={18} color="#f59e0b" /> Reseñas y Calificaciones
          </h2>
          {token && pedidoEntregado && (
            <button
              className="dp-btn-resena"
              onClick={() => setMostrarForm((p) => !p)}
            >
              <FiMessageSquare size={14} />
              {mostrarForm ? "Cancelar" : "Dejar reseña"}
            </button>
          )}
          {token && !pedidoEntregado && (
            <span className="dp-resena-hint">
              Compra este producto para reseñarlo
            </span>
          )}
        </div>

        {/* Promedio */}
        {promedio && (
          <div className="dp-promedio">
            <span className="dp-promedio-num">{promedio}</span>
            <div>
              <Estrellas cal={Math.round(Number(promedio))} size={18} />
              <span className="dp-promedio-count">
                {comentarios.length} reseñas
              </span>
            </div>
          </div>
        )}

        {/* Formulario */}
        {mostrarForm && (
          <div className="dp-form-card">
            <h4 className="dp-form-titulo">Tu reseña</h4>
            <form onSubmit={handleEnviarComentario}>
              <div className="dp-form-field">
                <label>Calificación</label>
                <Estrellas
                  cal={calForm}
                  size={22}
                  interactivo
                  onSelect={setCalForm}
                />
              </div>
              <div className="dp-form-field">
                <label>Comentario</label>
                <textarea
                  className="dp-form-textarea"
                  value={textoForm}
                  onChange={(e) => {
                    setTextoForm(e.target.value);
                    setErrorCom("");
                  }}
                  placeholder="¿Cómo fue tu experiencia?"
                />
              </div>
              {errorCom && (
                <p className="dp-form-error">
                  <FiAlertCircle size={13} /> {errorCom}
                </p>
              )}
              <div className="dp-form-btns">
                <button
                  type="button"
                  className="dp-form-btn-cancel"
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="dp-form-btn-submit"
                  disabled={enviandoCom}
                >
                  {enviandoCom ? "Enviando..." : "Publicar reseña"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista comentarios */}
        {comentarios.length === 0 ? (
          <div className="dp-sin-comentarios">
            <FiMessageSquare size={36} color="#cbd5e1" />
            <p>Aún no hay reseñas</p>
            <span>Sé el primero en comentar después de tu compra</span>
          </div>
        ) : (
          <div className="dp-comentarios-lista">
            {comentarios.map((c) => {
              const [ca, cb] = getAvatarGradient(c.usuario?.nombre);
              return (
                <div key={c.id_comentario} className="dp-comentario">
                  <div className="dp-comentario-header">
                    <div className="dp-comentario-usuario">
                      <div
                        className="dp-comentario-avatar"
                        style={{
                          background: `linear-gradient(135deg, ${ca}, ${cb})`,
                        }}
                      >
                        {getInitials(c.usuario?.nombre)}
                      </div>
                      <div>
                        <p className="dp-comentario-nombre">
                          {c.usuario?.nombre}
                        </p>
                        <Estrellas cal={c.calificacion} size={12} />
                      </div>
                    </div>
                    <span className="dp-comentario-fecha">
                      {formatFecha(c.fecha)}
                    </span>
                  </div>
                  <p className="dp-comentario-texto">"{c.texto}"</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Relacionados ── */}
      {relacionados.length > 0 && (
        <div className="dp-seccion">
          <div className="dp-seccion-header">
            <h2 className="dp-seccion-titulo">
              <FiPackage size={18} /> Productos Relacionados
            </h2>
          </div>
          <div className="dp-relacionados-grid">
            {relacionados.map((p) => (
              <div
                key={p.id_producto}
                className="dp-rel-card"
                onClick={() => navigate(`/producto/${p.id_producto}`)}
              >
                <div className="dp-rel-img">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre_producto} />
                  ) : (
                    <div className="dp-rel-no-img">
                      <FiPackage size={28} color="#cbd5e1" />
                    </div>
                  )}
                  <span className={`dp-badge dp-badge--${p.tipo}`}>
                    {p.tipo}
                  </span>
                </div>
                <div className="dp-rel-body">
                  <span className="dp-rel-cat">{p.categoria}</span>
                  <h4 className="dp-rel-nombre">{p.nombre_producto}</h4>
                  <div className="dp-rel-footer">
                    <span className="dp-rel-precio">
                      {formatPrecio(p.precio)}
                    </span>
                    <button
                      className="dp-rel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        agregarAlCarrito({
                          id_producto: p.id_producto,
                          nombre_producto: p.nombre_producto,
                          precio: p.precio,
                          imagen: p.imagen,
                          categoria: p.categoria,
                        });
                        mostrarToast(`${p.nombre_producto} agregado`);
                      }}
                    >
                      <FiShoppingCart size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
