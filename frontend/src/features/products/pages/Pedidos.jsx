import { useState, useEffect } from "react";
import { pedidoService } from "@/features/products/services/pedido.service";
import { PedidoCard } from "../components/pedidos/PedidoCard";
import "@/infrastructure/css/products-emprend/pedidos/Pedidos.css";

const ESTADOS = [
  { key: "pendiente_pago", label: "Pendiente Pago" },
  { key: "pago_enviado", label: "Pago Enviado" },
  { key: "pago_rechazado", label: "Pago Rechazado" },
  { key: "en_proceso", label: "En Proceso" },
  { key: "enviado", label: "Enviado" },
  { key: "entregado", label: "Entregado" },
  { key: "cancelado", label: "Cancelado" },
];

const FECHAS = [
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
];

const COLUMNAS_KANBAN = [
  {
    key: "pagos",
    label: "Pagos",
    estados: ["pendiente_pago", "pago_enviado", "pago_rechazado"],
  },
  {
    key: "en_proceso",
    label: "En Proceso",
    estados: ["en_proceso"],
  },
  {
    key: "enviado",
    label: "Enviado",
    estados: ["enviado"],
  },
  {
    key: "finalizado",
    label: "Finalizado",
    estados: ["entregado", "cancelado"],
  },
];

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("todos");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    pedidoService
      .listar()
      .then(setPedidos)
      .catch(console.error)
      .finally(() => setCargando(false));
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
    } catch {
      mostrarToast("Error al actualizar estado");
    }
  };

  const formatNumPedido = (id) =>
    `#PED-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;

  const filtrados = pedidos.filter((p) => {
    const num = formatNumPedido(p.id_pedido).toLowerCase();
    const matchBusqueda =
      p.cliente?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cliente?.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      num.includes(busqueda.toLowerCase()) ||
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

  if (cargando)
    return (
      <div className="pedidos-container">
        <p>Cargando pedidos...</p>
      </div>
    );

  return (
    <div className="pedidos-container">
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

      <div className="pedidos-filtros">
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
        {FECHAS.map((f) => (
          <button
            key={f.key}
            className={`pedidos-filtro-pill ${filtroFecha === f.key ? "active" : ""}`}
            onClick={() =>
              setFiltroFecha((prev) => (prev === f.key ? "todos" : f.key))
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="pedidos-metricas">
        <div className="pedidos-metrica">
          <h3>{pedidos.length}</h3>
          <span>Total</span>
        </div>
        <div className="pedidos-metrica pendiente_pago">
          <h3>{pedidos.filter((p) => p.estado === "pendiente_pago").length}</h3>
          <span>Sin comprobante</span>
        </div>
        <div className="pedidos-metrica pago_enviado">
          <h3>{pedidos.filter((p) => p.estado === "pago_enviado").length}</h3>
          <span>Por verificar</span>
        </div>
        <div className="pedidos-metrica en_proceso">
          <h3>{pedidos.filter((p) => p.estado === "en_proceso").length}</h3>
          <span>En proceso</span>
        </div>
        <div className="pedidos-metrica entregado">
          <h3>{pedidos.filter((p) => p.estado === "entregado").length}</h3>
          <span>Entregados</span>
        </div>
      </div>

      <div className="kanban-board">
        {COLUMNAS_KANBAN.map((col) => {
          const columna = filtrados.filter((p) =>
            col.estados.includes(p.estado),
          );
          return (
            <div key={col.key} className="kanban-col">
              <div className={`kanban-col-header ${col.key}`}>
                <span className="kanban-col-title">{col.label}</span>
                <span className="kanban-col-subtitle">
                  {columna.length} pedidos
                </span>
              </div>
              <div className="kanban-col-body">
                {columna.length === 0 ? (
                  <div className="kanban-empty">Sin pedidos</div>
                ) : (
                  columna.map((pedido) => (
                    <PedidoCard
                      key={pedido.id_pedido}
                      pedido={pedido}
                      onCambiarEstado={handleEstado}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div className="pedidos-toast">{toast}</div>}
    </div>
  );
}
