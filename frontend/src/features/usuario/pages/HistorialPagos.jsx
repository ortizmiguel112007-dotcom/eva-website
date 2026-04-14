import { useState, useEffect } from "react";
import { useAuth } from "@/core/context/AuthConten";
import axios from "axios";
import {
  FiClock, FiCheck, FiX, FiEye, FiDollarSign,
  FiTrendingUp, FiCalendar, FiPackage,
} from "react-icons/fi";
import { MdOutlineQrCode2 } from "react-icons/md";
import "@/infrastructure/css/HistorialPagos.css";
import "@/infrastructure/css/CrudAdmin.css";

function formatPrecio(p) {
  return "$" + Number(p).toLocaleString("es-CO");
}
function formatFecha(f) {
  return new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const ESTADO = {
  sin_comprobante: { label: "Sin comprobante", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", Icon: FiClock },
  pendiente:       { label: "Pendiente",        color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", Icon: FiClock },
  verificado:      { label: "Verificado",       color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", Icon: FiCheck },
  rechazado:       { label: "Rechazado",        color: "#ef4444", bg: "#fef2f2", border: "#fecaca", Icon: FiX    },
};

export default function HistorialPagos() {
  const { token } = useAuth();
  const [pedidos, setPedidos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro]     = useState("todos");
  const [modalImg, setModalImg] = useState(null);
  const [pagina, setPagina]     = useState(1);
  const POR_PAGINA = 8;

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/cliente/pedidos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPedidos(res.data);
      } catch {
        setPedidos([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [token]);

  useEffect(() => { setPagina(1); }, [filtro]);

  const filtrados =
    filtro === "todos"             ? pedidos
    : filtro === "sin_comprobante" ? pedidos.filter((p) => !p.pago)
    : pedidos.filter((p) => p.pago?.estado === filtro);

  const totalPaginas    = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const filtradosPagina = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totalGastado = pedidos
    .filter((p) => p.pago?.estado === "verificado")
    .reduce((acc, p) => acc + Number(p.total), 0);

  const metricas = [
    { label: "Total pagos",   valor: pedidos.length,                                             color: "#3b82f6", bg: "#eff6ff", Icon: FiDollarSign },
    { label: "Verificados",   valor: pedidos.filter((p) => p.pago?.estado === "verificado").length, color: "#10b981", bg: "#ecfdf5", Icon: FiCheck      },
    { label: "Pendientes",    valor: pedidos.filter((p) => p.pago?.estado === "pendiente").length,  color: "#f59e0b", bg: "#fffbeb", Icon: FiClock      },
    { label: "Total gastado", valor: formatPrecio(totalGastado),                                  color: "#0f172a", bg: "#f8fafc", Icon: FiTrendingUp, grande: true },
  ];

  if (cargando)
    return (
      <div className="hp-loading">
        <div className="hp-spinner" />
        <p>Cargando historial...</p>
      </div>
    );

  return (
    <div className="hp-page">

      {/* Header */}
      <div className="hp-header">
        <div>
          <h1 className="hp-titulo">Historial de Pagos</h1>
          <p className="hp-sub">Comprobantes enviados y su estado de verificación</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="hp-metricas">
        {metricas.map((m) => (
          <div key={m.label} className="hp-metrica" style={{ "--mc": m.color, "--mb": m.bg }}>
            <div className="hp-metrica-icono">
              <m.Icon size={16} color={m.color} />
            </div>
            <div>
              <p className="hp-metrica-label">{m.label}</p>
              <strong className={`hp-metrica-valor ${m.grande ? "grande" : ""}`} style={{ color: m.color }}>
                {m.valor}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="hp-filtros">
        {["todos", "sin_comprobante", "pendiente", "verificado", "rechazado"].map((f) => {
          const est   = ESTADO[f];
          const count = f === "todos"
            ? pedidos.length
            : f === "sin_comprobante"
              ? pedidos.filter((p) => !p.pago).length
              : pedidos.filter((p) => p.pago?.estado === f).length;
          return (
            <button key={f} onClick={() => setFiltro(f)}
              className={`hp-filtro-btn ${filtro === f ? "active" : ""}`}
              style={filtro === f && f !== "todos" ? { background: est?.bg, color: est?.color, borderColor: est?.border } : {}}>
              {f === "todos" ? "Todos" : est?.label}
              <span className="hp-filtro-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="hp-empty">
          <div className="hp-empty-icono">
            <FiDollarSign size={32} color="#cbd5e1" />
          </div>
          <p>No hay pagos con este filtro</p>
        </div>
      ) : (
        <>
          <div className="hp-lista">
            {filtradosPagina.map((pedido) => {
              const pago = pedido.pago;
              const est  = pago ? (ESTADO[pago.estado] || ESTADO.pendiente) : ESTADO.sin_comprobante;
              const tienda = pedido.seccion?.emprendedora?.usuario?.nombre || "EVA";
              return (
                <div key={pedido.id_pedido} className="hp-item">
                  <div className="hp-item-indicador" style={{ background: est.color }} />
                  <div className="hp-item-est-icono" style={{ background: est.bg }}>
                    <est.Icon size={16} color={est.color} />
                  </div>
                  <div className="hp-item-info">
                    <div className="hp-item-titulo">
                      <span className="hp-item-pedido">Pedido #{pedido.id_pedido}</span>
                      <span className="hp-item-tienda"><FiPackage size={11} /> {tienda}</span>
                    </div>
                    <div className="hp-item-meta">
                      <span><MdOutlineQrCode2 size={11} /> {pedido.metodo_pago || "QR"}</span>
                      <span><FiCalendar size={11} /> {formatFecha(pago?.fecha || pedido.fecha)}</span>
                      {pago?.estado === "rechazado" && pago?.nota_rechazo && (
                        <span className="hp-item-rechazo">Motivo: {pago.nota_rechazo}</span>
                      )}
                    </div>
                  </div>
                  <div className="hp-item-total">
                    <strong>{formatPrecio(pedido.total)}</strong>
                  </div>
                  <span className="hp-badge" style={{ background: est.bg, color: est.color, borderColor: est.border }}>
                    {pago ? est.label : "Sin comprobante"}
                  </span>
                  {pago?.comprobante && (
                    <button className="hp-btn-ver" onClick={() => setModalImg(pago.comprobante)}>
                      <FiEye size={13} /> Ver
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="crud-pagination">
              <span className="pagination-info">
                {filtrados.length} pago{filtrados.length !== 1 ? "s" : ""} · Página {pagina} de {totalPaginas}
              </span>
              <div className="pagination-controls">
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>‹</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn ${n === pagina ? "page-btn-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
                ))}
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>›</button>
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>»</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal imagen */}
      {modalImg && (
        <div className="hp-modal-overlay" onClick={() => setModalImg(null)}>
          <div className="hp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Comprobante de pago</h3>
            <img src={modalImg} alt="Comprobante" />
            <button onClick={() => setModalImg(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}