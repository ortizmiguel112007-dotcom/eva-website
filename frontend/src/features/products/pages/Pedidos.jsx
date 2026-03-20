import { useState, useEffect, useRef } from "react";
import { pedidoService } from "@/features/products/services/pedido.service";
import "@/infrastructure/css/pedidos.css";

const ESTADOS = [
  { key: "en_proceso", label: "En Proceso" },
  { key: "enviado", label: "Enviado" },
  { key: "entregado", label: "Entregado" },
  { key: "cancelado", label: "Cancelado" },
];

const FECHAS = [
  { key: "todos", label: "Todas las fechas" },
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
];

// Avatar con iniciales
function Avatar({ nombre, estado }) {
  const initials = nombre
    ? nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return <div className={`pedido-avatar ${estado}`}>{initials}</div>;
}

// Dropdown cambiar estado
function CambiarEstado({ pedido, onCambiar }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const opciones = ESTADOS.filter((e) => e.key !== pedido.estado);

  return (
    <div className="pedido-cambiar-wrapper" ref={ref}>
      <button
        className={`pedido-cambiar-btn ${pedido.estado}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>Cambiar a...</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="pedido-cambiar-dropdown">
          {opciones.map((e) => (
            <div
              key={e.key}
              className={`pedido-cambiar-option ${e.key}`}
              onClick={() => {
                onCambiar(pedido.id_pedido, e.key);
                setOpen(false);
              }}
            >
              {e.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("todos");
  const [toast, setToast] = useState(null);

  // fuera del componente, al inicio del archivo
const formatNumPedido = (id) =>
  `#PED-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await pedidoService.listar();
        setPedidos(data);
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

  const handleEstado = async (id_pedido, nuevoEstado) => {
    try {
      await pedidoService.cambiarEstado(id_pedido, nuevoEstado);
      setPedidos((prev) =>
        prev.map((p) =>
          p.id_pedido === id_pedido ? { ...p, estado: nuevoEstado } : p,
        ),
      );
      mostrarToast("Estado actualizado");
    } catch (err) {
      mostrarToast("Error al actualizar estado");
    }
  };

  // Filtrado
  const filtrados = pedidos.filter((p) => {
    const numFormateado = formatNumPedido(p.id_pedido).toLowerCase();
    const matchBusqueda =
      p.cliente?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cliente?.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      numFormateado.includes(busqueda.toLowerCase()) ||
      String(p.id_pedido).includes(busqueda);

    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;

    const ahora = new Date();
    const fecha = new Date(p.fecha);
    const matchFecha =
      filtroFecha === "todos"
        ? true
        : filtroFecha === "hoy"
          ? fecha.toDateString() === ahora.toDateString()
          : filtroFecha === "semana"
            ? ahora - fecha <= 7 * 24 * 60 * 60 * 1000
            : filtroFecha === "mes"
              ? ahora - fecha <= 30 * 24 * 60 * 60 * 1000
              : true;

    return matchBusqueda && matchEstado && matchFecha;
  });

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatPrecio = (precio) => "$" + Number(precio).toLocaleString("es-CO");



  if (cargando)
    return (
      <div className="pedidos-container">
        <p>Cargando pedidos...</p>
      </div>
    );

  return (
    <div className="pedidos-container">
      {/* Header */}
      <div className="pedidos-header">
        <h1>Pedidos y Ventas</h1>
        <input
          type="text"
          className="pedidos-search"
          placeholder="Buscar por número de pedido o cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Filtros pills */}
      <div className="pedidos-filtros">
        {/* Estado */}
        <button
          className={`pedidos-filtro-pill ${filtroEstado === "todos" ? "active" : ""}`}
          onClick={() => setFiltroEstado("todos")}
        >
          Todos
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e.key}
            className={`pedidos-filtro-pill ${filtroEstado === e.key ? `active ${e.key}` : ""}`}
            onClick={() => setFiltroEstado(e.key)}
          >
            {e.label}
          </button>
        ))}

        <div className="pedidos-filtro-separador" />

        {/* Fecha */}
        {FECHAS.filter((f) => f.key !== "todos").map((f) => (
          <button
            key={f.key}
            className={`pedidos-filtro-pill ${filtroFecha === f.key ? "active" : ""}`}
            onClick={() =>
              setFiltroFecha((prev) => (prev === f.key ? "todos" : f.key))
            }
          >
            {f.key === "hoy" && ""}
            {f.label}
          </button>
        ))}
      </div>

      {/* Métricas */}
      <div className="pedidos-metricas">
        <div className="pedidos-metrica">
          <h3>{pedidos.length}</h3>
          <span>Total Pedidos</span>
        </div>
        {ESTADOS.map((e) => (
          <div key={e.key} className={`pedidos-metrica ${e.key}`}>
            <h3>{pedidos.filter((p) => p.estado === e.key).length}</h3>
            <span>{e.label}</span>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="kanban-board">
        {ESTADOS.map((estado) => {
          const columna = filtrados.filter((p) => p.estado === estado.key);
          return (
            <div key={estado.key} className="kanban-col">
              {/* Header columna */}
              <div className={`kanban-col-header ${estado.key}`}>
                <span className="kanban-col-title">{estado.label}</span>
                <span className="kanban-col-subtitle">
                  {columna.length} pedidos
                </span>
              </div>

              {/* Body */}
              <div className="kanban-col-body">
                {columna.length === 0 ? (
                  <div className="kanban-empty">Sin pedidos</div>
                ) : (
                  columna.map((pedido) => (
                    <div key={pedido.id_pedido} className="pedido-card">
                      {/* Header */}
                      <div className="pedido-card-header">
                        <span className="pedido-num">
                          {formatNumPedido(pedido.id_pedido)}
                        </span>
                        <span className="pedido-fecha">
                          {formatFecha(pedido.fecha)}
                        </span>
                      </div>

                      {/* Cliente */}
                      <div className="pedido-cliente-row">
                        <Avatar
                          nombre={pedido.cliente?.nombre}
                          estado={pedido.estado}
                        />
                        <div>
                          <div className="pedido-cliente">
                            {pedido.cliente?.nombre}
                          </div>
                          <div className="pedido-cliente-email">
                            {pedido.cliente?.email}
                          </div>
                        </div>
                      </div>

                      {/* Productos */}
                      <div className="pedido-productos">
                        {pedido.detalles?.map((d) => (
                          <div
                            key={d.id_detalle}
                            className="pedido-producto-item"
                          >
                            {d.producto?.imagen ? (
                              <img
                                src={d.producto.imagen}
                                alt={d.producto.nombre_producto}
                                className="pedido-producto-img"
                              />
                            ) : (
                              <div className="pedido-producto-sin-img">📦</div>
                            )}
                            <span className="pedido-producto-nombre">
                              {d.producto?.nombre_producto}
                            </span>
                            <span className="pedido-producto-cant">
                              Cantidad: {d.cantidad}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="pedido-total-section">
                        <span className="pedido-total-label">Total</span>
                        <span className="pedido-total">
                          {formatPrecio(pedido.total)}
                        </span>
                      </div>

                      {/* Método de pago */}
                      {pedido.metodo_pago && (
                        <span className="pedido-metodo">
                          {pedido.metodo_pago}
                        </span>
                      )}

                      {/* Cambiar estado */}
                      <CambiarEstado pedido={pedido} onCambiar={handleEstado} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && <div className="pedidos-toast">{toast}</div>}
    </div>
  );
}
