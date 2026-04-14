import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch, FiX, FiPackage, FiUser, FiCalendar,
  FiShoppingBag, FiChevronDown, FiChevronUp
} from "react-icons/fi";
import "@/infrastructure/css/AdminPedidos.css";
import "@/infrastructure/css/CrudAdmin.css";

const BASE = "http://localhost:3000";
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const fmtPrecio = (p) => "$" + Number(p).toLocaleString("es-CO");
const fmtFecha  = (f) => new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const PAGE_SIZE = 10;

const ESTADOS = {
  en_proceso: { clase: "proceso",   label: "En proceso" },
  enviado:    { clase: "enviado",   label: "Enviado"    },
  entregado:  { clase: "entregado", label: "Entregado"  },
  cancelado:  { clase: "cancelado", label: "Cancelado"  },
};

export default function AdminPedidos() {
  const [pedidos, setPedidos]     = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [busqueda, setBusqueda]   = useState("");
  const [filtro, setFiltro]       = useState("todos");
  const [toast, setToast]         = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [pagina, setPagina]       = useState(1);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get(`${BASE}/api/admin/pedidos`, { headers: hdrs() });
        setPedidos(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  useEffect(() => { setPagina(1); }, [busqueda, filtro]);

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await axios.put(`${BASE}/api/pedidos/${id}/estado`, { estado }, { headers: hdrs() });
      setPedidos(prev => prev.map(p => p.id_pedido === id ? { ...p, estado } : p));
      mostrarToast("Estado actualizado");
    } catch { mostrarToast("Error al cambiar estado", "error"); }
  };

  const filtrados = pedidos.filter(p => {
    const matchB = String(p.id_pedido).includes(busqueda) ||
      p.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const matchF = filtro === "todos" || p.estado === filtro;
    return matchB && matchF;
  });

  const totalPaginas  = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const pedidosPagina = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  const metricas = [
    { label: "Total",      valor: pedidos.length,                                        cls: "total"     },
    { label: "En proceso", valor: pedidos.filter(p => p.estado === "en_proceso").length, cls: "proceso"   },
    { label: "Entregados", valor: pedidos.filter(p => p.estado === "entregado").length,  cls: "entregado" },
    { label: "Cancelados", valor: pedidos.filter(p => p.estado === "cancelado").length,  cls: "cancelado" },
  ];

  return (
    <div className="ap-page">

      {/* Toast */}
      {toast && <div className={`ap-toast ${toast.tipo}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="ap-header">
        <h1 className="ap-titulo">Todos los Pedidos</h1>
        <p className="ap-sub">Supervisa y gestiona todos los pedidos de la plataforma</p>
      </div>

      {/* Métricas */}
      <div className="ap-metricas">
        {metricas.map(m => (
          <div key={m.label} className={`ap-metrica ap-metrica--${m.cls}`}>
            <p className="ap-metrica-label">{m.label}</p>
            <strong className="ap-metrica-valor">{m.valor}</strong>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="ap-filtros">
        <div className="ap-search">
          <FiSearch size={14} color="#94a3b8" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por # pedido o cliente..."
            className="ap-search-input" />
          {busqueda && (
            <button onClick={() => setBusqueda("")} className="ap-search-clear">
              <FiX size={13} />
            </button>
          )}
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} className="ap-select">
          <option value="todos">Todos los estados</option>
          <option value="en_proceso">En proceso</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Contador */}
      <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.75rem", fontWeight: 600 }}>
        Mostrando {filtrados.length} de {pedidos.length} pedidos
      </p>

      {/* Lista */}
      {cargando ? (
        <p className="ap-cargando">Cargando pedidos...</p>
      ) : (
        <>
          <div className="ap-lista">
            {pedidosPagina.length === 0 ? (
              <div className="ap-empty">
                <FiPackage size={40} color="#e5e7eb" />
                <p>No hay pedidos</p>
              </div>
            ) : pedidosPagina.map(p => {
              const est   = ESTADOS[p.estado] || ESTADOS.en_proceso;
              const isExp = expandido === p.id_pedido;

              return (
                <div key={p.id_pedido} className="ap-card">
                  {/* Fila principal */}
                  <div className="ap-card-row" onClick={() => setExpandido(isExp ? null : p.id_pedido)}>
                    <div className="ap-card-left">
                      <div className="ap-card-titulo">
                        <span className="ap-card-num">Pedido #{p.id_pedido}</span>
                        <span className={`ap-badge ap-badge--${est.clase}`}>{est.label}</span>
                      </div>
                      <div className="ap-card-meta">
                        <span><FiUser size={11} /> {p.cliente?.nombre || "Cliente"}</span>
                        <span><FiCalendar size={11} /> {fmtFecha(p.fecha)}</span>
                        <span><FiShoppingBag size={11} /> {p.detalles?.length || 0} producto(s)</span>
                      </div>
                    </div>

                    <strong className="ap-card-total">{fmtPrecio(p.total)}</strong>

                    <select value={p.estado}
                      onChange={e => { e.stopPropagation(); cambiarEstado(p.id_pedido, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="ap-estado-select">
                      <option value="en_proceso">En proceso</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>

                    <div className="ap-chevron">
                      {isExp ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  {isExp && (
                    <div className="ap-card-detalle">
                      <p className="ap-detalle-titulo">Productos del pedido</p>
                      {p.detalles?.length > 0 ? p.detalles.map(d => (
                        <div key={d.id_detalle} className="ap-detalle-row">
                          <span>
                            <FiPackage size={11} />
                            {d.producto?.nombre_producto || "Producto"} × {d.cantidad}
                          </span>
                          <span>{fmtPrecio(Number(d.precio_unit) * d.cantidad)}</span>
                        </div>
                      )) : (
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", margin: "0.5rem 0" }}>
                          Sin productos registrados
                        </p>
                      )}
                      <div className="ap-detalle-footer">
                        <span className="ap-detalle-total-label">Total del pedido</span>
                        <span className="ap-detalle-total-valor">{fmtPrecio(p.total)}</span>
                      </div>
                      {p.nota && <p className="ap-nota">📝 {p.nota}</p>}
                      {p.metodo_pago && (
                        <p className="ap-nota" style={{ marginTop: "0.4rem" }}>
                          💳 Método de pago: {p.metodo_pago}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="crud-pagination">
              <span className="pagination-info">
                {filtrados.length} pedido{filtrados.length !== 1 ? "s" : ""} · Página {pagina} de {totalPaginas}
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
    </div>
  );
}
