import { useNavigate } from "react-router-dom";
import {
  FiPackage, FiCalendar, FiClock,
  FiTruck, FiCheckCircle, FiArrowRight,
} from "react-icons/fi";
import { formatPrecio } from "@/features/tienda/utils/utils";
import "@/infrastructure/css/usuario/dashboard/loading/PedidosRecientes.css"

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatId(id) {
  return `ORD-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;
}

const ESTADO = {
  en_proceso: { label: "En proceso", Icon: FiClock },
  enviado:    { label: "Enviado",    Icon: FiTruck },
  entregado:  { label: "Entregado",  Icon: FiCheckCircle },
};

export function PedidosRecientes({ pedidos }) {
  const navigate = useNavigate();
  if (!pedidos.length) return null;

  return (
    <section className="ud-section">
      <div className="ud-section-header">
        <h2>Pedidos recientes</h2>
        <button className="ud-ver-todos" onClick={() => navigate("/mis-pedidos")}>
          Ver todos <FiArrowRight size={14} />
        </button>
      </div>
      <div className="ud-pedidos-lista">
        {pedidos.map((pedido) => {
          const estado = ESTADO[pedido.estado];
          return (
            <div key={pedido.id_pedido} className="ud-pedido-card">
              <div className="ud-pedido-thumb">
                <FiPackage size={18} color="#94a3b8" />
              </div>
              <div className="ud-pedido-info">
                <p className="ud-pedido-id">{formatId(pedido.id_pedido)}</p>
                <div className="ud-pedido-meta">
                  <FiCalendar size={11} />
                  <span>{formatFecha(pedido.fecha)}</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: "0.1rem 0 0" }}>
                  {pedido.detalles?.length} {pedido.detalles?.length === 1 ? "artículo" : "artículos"}
                </p>
              </div>
              <div className="ud-pedido-right">
                {estado && (
                  <span className={`ud-estado ${pedido.estado}`}>
                    <estado.Icon size={11} /> {estado.label}
                  </span>
                )}
                <div className="ud-pedido-total-wrap">
                  <span className="ud-pedido-total-label">Total</span>
                  <span className="ud-pedido-total-valor">{formatPrecio(pedido.total)}</span>
                </div>
                <button className="ud-btn-ver" onClick={() => navigate("/mis-pedidos")}>
                  Ver detalles
                </button>
                {pedido.estado === "enviado" && (
                  <button className="ud-btn-rastrear" onClick={() => navigate("/seguimiento")}>
                    Rastrear
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}