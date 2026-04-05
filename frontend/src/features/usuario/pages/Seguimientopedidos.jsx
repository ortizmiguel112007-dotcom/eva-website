import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/core/context/AuthConten";
import {
  FiCalendar,
  FiCheck,
  FiMapPin,
  FiTruck,
  FiPackage,
  FiStar,
} from "react-icons/fi";
import "@/infrastructure/css/Seguimientop.css";

const PASOS = [
  { key: "confirmado", label: "Pedido confirmado" },
  { key: "preparacion", label: "En preparación" },
  { key: "camino", label: "En camino" },
  { key: "entregado", label: "Entregado" },
];

// Mapeo del estado del backend a índice de progreso
const PROGRESO = {
  en_proceso: 1,
  enviado: 2,
  entregado: 3,
  cancelado: 0,
};

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO");
}

function formatId(id) {
  return `Pedido ORD-${String(id).padStart(3, "0")}`;
}

function ModalComentario({ pedido, onClose, onEnviado, token }) {
  const [productoId, setProductoId] = useState(
    pedido.detalles?.[0]?.producto?.id_producto || null,
  );
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleEnviar = async () => {
    if (calificacion === 0) {
      setError("Selecciona una calificación");
      return;
    }
    if (!texto.trim()) {
      setError("Escribe un comentario");
      return;
    }
    setEnviando(true);
    try {
      await axios.post(
        "http://localhost:3000/api/comentarios",
        {
          id_producto: productoId,
          id_pedido: pedido.id_pedido,
          calificacion,
          texto,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onEnviado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar comentario");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Dejar reseña</h3>
        {pedido.detalles?.length > 1 ? (
          <select
            value={productoId}
            onChange={(e) => setProductoId(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1.5px solid #e5e7eb",
              fontSize: "0.88rem",
              outline: "none",
            }}
          >
            {pedido.detalles.map((d) => (
              <option key={d.id_detalle} value={d.producto?.id_producto}>
                {d.producto?.nombre_producto}
              </option>
            ))}
          </select>
        ) : (
          <p className="mp-modal-producto">
            Reseña para:{" "}
            <strong>{pedido.detalles?.[0]?.producto?.nombre_producto}</strong>
          </p>
        )}
        <div>
          <p
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#374151",
              margin: "0 0 0.5rem",
            }}
          >
            Calificación
          </p>
          <div className="mp-estrellas">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                className={`mp-estrella ${i <= (hover || calificacion) ? "llena" : "vacia"}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setCalificacion(i)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <textarea
          placeholder="¿Cómo fue tu experiencia?"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setError("");
          }}
        />
        {error && (
          <p style={{ fontSize: "0.78rem", color: "#ef4444", margin: 0 }}>
            {error}
          </p>
        )}
        <div className="mp-modal-btns">
          <button className="mp-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="mp-btn-enviar"
            onClick={handleEnviar}
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar reseña"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SeguimientoPedidos() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalPedido, setModalPedido] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/cliente/pedidos",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // mostrar solo activos (no cancelados)
        setPedidos(res.data.filter((p) => p.estado !== "cancelado"));
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

  if (cargando)
    return <div className="mp-loading">Cargando seguimiento...</div>;

  return (
    <div className="mp-page">
      <div className="mp-page-header">
        <h1 className="mp-page-title">
          <FiMapPin size={20} /> Seguimiento de Pedidos
        </h1>
        <p className="mp-page-subtitle">
          Rastrea el estado y ubicación de tus pedidos en tiempo real
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="mp-empty">
          <FiPackage
            size={48}
            style={{ color: "#94a3b8", marginBottom: "1rem" }}
          />
          <p>No tienes pedidos activos</p>
          <button onClick={() => navigate("/")}>Explorar productos</button>
        </div>
      ) : (
        pedidos.map((pedido) => {
          const progresoIdx = PROGRESO[pedido.estado] ?? 0;

          return (
            <div key={pedido.id_pedido} className="seg-card">
              {/* Header */}
              <div className="seg-card-header">
                <div>
                  <p className="seg-card-id">{formatId(pedido.id_pedido)}</p>
                  <div
                    className="seg-card-fecha"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                    }}
                  >
                    <FiCalendar size={11} />
                    <span>Fecha: {formatFecha(pedido.fecha)}</span>
                  </div>
                </div>
                <span className={`mp-badge ${pedido.estado}`}>
                  {pedido.estado === "en_proceso"
                    ? "En proceso"
                    : pedido.estado === "enviado"
                      ? "Enviado"
                      : pedido.estado === "entregado"
                        ? "Entregado"
                        : ""}
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="seg-progreso">
                <div className="seg-pasos">
                  {/* Línea activa */}
                  <div
                    className="seg-linea-activa"
                    style={{
                      width: `${progresoIdx === 0 ? 0 : progresoIdx >= 3 ? "calc(100% - 1.75rem)" : `${(progresoIdx / 3) * 100}%`}`,
                    }}
                  />

                  {PASOS.map((paso, i) => {
                    const completado = i < progresoIdx;
                    const activo = i === progresoIdx;
                    const pendiente = i > progresoIdx;

                    return (
                      <div key={paso.key} className="seg-paso">
                        <div
                          className={`seg-paso-circulo ${completado ? "completado" : activo ? "activo" : "pendiente"}`}
                        >
                          {completado ? <FiCheck size={12} /> : i + 1}
                        </div>
                        <span
                          className={`seg-paso-label ${completado ? "completado" : activo ? "activo" : ""}`}
                        >
                          {paso.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Productos */}
              <div className="seg-productos">
                <p className="seg-productos-titulo">
                  Productos en este pedido:
                </p>
                {pedido.detalles.map((d) => (
                  <div key={d.id_detalle} className="seg-producto-item">
                    <span>
                      {d.cantidad}x {d.producto?.nombre_producto}
                    </span>
                    <span>{formatPrecio(d.precio_unit)}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="seg-total">
                <span>Total del pedido</span>
                <span>{formatPrecio(pedido.total)}</span>
              </div>

              {/* Mensajes contextuales */}
              {pedido.estado === "enviado" && (
                <div className="seg-mensaje enviado">
                  <FiTruck size={16} />
                  <div className="seg-mensaje-texto">
                    Tu pedido está en camino
                    <small>Llegaría aproximadamente en los próximos días</small>
                  </div>
                </div>
              )}

              {pedido.estado === "entregado" && (
                <>
                  <div className="seg-mensaje entregado">
                    <FiCheck size={16} />
                    <div className="seg-mensaje-texto">
                      Pedido entregado exitosamente
                      <small>
                        ¿Te gustó tu compra? Deja una reseña para ayudar a otros
                        clientes
                      </small>
                    </div>
                  </div>
                  <button
                    className="seg-btn-resena"
                    onClick={() => setModalPedido(pedido)}
                  >
                    <FiStar size={13} style={{ marginRight: "0.3rem" }} />
                    Dejar reseña
                  </button>
                </>
              )}
            </div>
          );
        })
      )}

      {modalPedido && (
        <ModalComentario
          pedido={modalPedido}
          token={token}
          onClose={() => setModalPedido(null)}
          onEnviado={() => mostrarToast("Reseña enviada correctamente")}
        />
      )}

      {toast && <div className="mp-toast">{toast}</div>}
    </div>
  );
}
