import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { adminService } from "@/features/admin/services/admin.service";
import {
  FiUsers, FiDollarSign, FiShoppingBag, FiPackage,
  FiTrendingUp, FiAlertTriangle, FiArrowUp, FiArrowDown,
  FiShoppingCart, FiStar, FiActivity
} from "react-icons/fi";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from "recharts";
import "@/infrastructure/css/AdminDashboard.css";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const formatPrecio = (n) => {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n/1000).toFixed(0)}k`;
  return "$" + Number(n).toLocaleString("es-CO");
};

const formatPrecioFull = (n) => "$" + Number(n).toLocaleString("es-CO");

// Tooltip personalizado para la gráfica
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0f172a", border: "1px solid #334155",
        borderRadius: "0.6rem", padding: "0.75rem 1rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
      }}>
        <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "0 0 0.3rem", fontWeight: 600 }}>{label}</p>
        <p style={{ color: "#fff", fontSize: "1rem", fontWeight: 800, margin: 0 }}>
          {formatPrecioFull(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0f172a", border: "1px solid #334155",
        borderRadius: "0.6rem", padding: "0.75rem 1rem"
      }}>
        <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: "0 0 0.2rem" }}>{label}</p>
        <p style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>
          {payload[0].value} pedidos
        </p>
      </div>
    );
  }
  return null;
};

export default function AdministradorDash() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios]   = useState([]);
  const [pedidos, setPedidos]     = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [animado, setAnimado]     = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [u, ped, prod] = await Promise.all([
          adminService.listarUsuarios(),
          axios.get("http://localhost:3000/api/admin/pedidos", { headers: getHeaders() })
            .then(r => r.data).catch(() => []),
          axios.get("http://localhost:3000/api/items/admin/todos", { headers: getHeaders() })
            .then(r => r.data).catch(() => []),
        ]);
        setUsuarios(u);
        setPedidos(Array.isArray(ped) ? ped : []);
        setProductos(Array.isArray(prod) ? prod : []);
      } catch (err) { console.error(err); }
      finally {
        setCargando(false);
        setTimeout(() => setAnimado(true), 100);
      }
    };
    cargar();
  }, []);

  // ── KPIs ──
  const totalUsuarios      = usuarios.length;
  const pedidosEntregados  = pedidos.filter(p => p.estado === "entregado");
  const pedidosActivos     = pedidos.filter(p => p.estado === "en_proceso" || p.estado === "enviado").length;
  const pendientesAprobacion = usuarios.filter(u => u.rol === "emprendedora" && !u.activo).length;
  const productosPublicados = productos.filter(p => p.visible !== false).length;
  const totalVentas        = pedidosEntregados.reduce((acc, p) => acc + Number(p.total || 0), 0);

  // ── Ventas por mes (últimos 6 meses) ──
  const ventasPorMes = (() => {
    const hoy = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
      const mes = MESES[fecha.getMonth()];
      const total = pedidosEntregados
        .filter(p => {
          const f = new Date(p.fecha);
          return f.getMonth() === fecha.getMonth() && f.getFullYear() === fecha.getFullYear();
        })
        .reduce((acc, p) => acc + Number(p.total || 0), 0);
      return { mes, total: Math.round(total) };
    });
  })();

  // ── Pedidos por mes (barras) ──
  const pedidosPorMes = (() => {
    const hoy = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
      const mes = MESES[fecha.getMonth()];
      const count = pedidos.filter(p => {
        const f = new Date(p.fecha);
        return f.getMonth() === fecha.getMonth() && f.getFullYear() === fecha.getFullYear();
      }).length;
      return { mes, count };
    });
  })();

  // ── Productos más vendidos ──
  const productosMasVendidos = (() => {
    const conteo = {};
    pedidos.forEach(p => {
      p.detalles?.forEach(d => {
        const nombre = d.producto?.nombre_producto || "Producto";
        if (!conteo[nombre]) conteo[nombre] = { ventas: 0, total: 0 };
        conteo[nombre].ventas += Number(d.cantidad || 0);
        conteo[nombre].total  += Number(d.precio_unit || 0) * Number(d.cantidad || 0);
      });
    });
    return Object.entries(conteo)
      .sort((a, b) => b[1].ventas - a[1].ventas)
      .slice(0, 5)
      .map(([nombre, data]) => ({ nombre, ...data }));
  })();

  // ── Stock bajo ──
  const stockBajo = productos.filter(p =>
    p.tipo !== "servicio" &&
    p.inventario?.cantidad !== undefined &&
    p.inventario.cantidad <= (p.inventario.stock_minimo || p.stock_minimo || 5)
  ).length;

  // ── Crecimiento vs mes anterior ──
  const mesActualVentas  = ventasPorMes[5]?.total || 0;
  const mesAnteriorVentas = ventasPorMes[4]?.total || 0;
  const crecimiento = mesAnteriorVentas > 0
    ? (((mesActualVentas - mesAnteriorVentas) / mesAnteriorVentas) * 100).toFixed(1)
    : 0;

  const BAR_COLORS = ["#3b82f6","#6366f1","#8b5cf6","#a855f7","#ec4899"];

  const now = new Date();
  const hora = now.getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  if (cargando) return (
    <div className="adm-loading">
      <div className="dash-spinner" />
      <p>Cargando panel...</p>
    </div>
  );

  return (
    <div className={`dash-page ${animado ? "dash-animado" : ""}`}>

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <p className="dash-saludo">{saludo}, Admin 👋</p>
          <h1 className="dash-titulo">Panel de Administración</h1>
          <p className="dash-subtitulo">Resumen general de la plataforma EVA</p>
        </div>
        <div className="dash-fecha">
          <FiActivity size={14} color="#3b82f6" />
          <span>{now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</span>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="dash-kpis">
        <div className="dash-kpi dash-kpi--blue">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icono" style={{ background: "rgba(59,130,246,0.12)" }}>
              <FiUsers size={18} color="#3b82f6" />
            </div>
            <span className="dash-kpi-trend up">
              <FiArrowUp size={10} /> +{Math.max(1, Math.floor(totalUsuarios * 0.08))}%
            </span>
          </div>
          <h3 className="dash-kpi-valor">{totalUsuarios.toLocaleString()}</h3>
          <p className="dash-kpi-label">Total Usuarios</p>
          <span className="dash-kpi-sub">{usuarios.filter(u => u.rol === "emprendedora").length} emprendedoras activas</span>
          <div className="dash-kpi-bar" style={{ "--p": "72%", "--c": "#3b82f6" }} />
        </div>

        <div className="dash-kpi dash-kpi--green">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icono" style={{ background: "rgba(16,163,74,0.12)" }}>
              <FiDollarSign size={18} color="#10a34a" />
            </div>
            <span className={`dash-kpi-trend ${Number(crecimiento) >= 0 ? "up" : "down"}`}>
              {Number(crecimiento) >= 0 ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
              {Math.abs(crecimiento)}%
            </span>
          </div>
          <h3 className="dash-kpi-valor">{formatPrecio(totalVentas)}</h3>
          <p className="dash-kpi-label">Total Ventas</p>
          <span className="dash-kpi-sub">{pedidosEntregados.length} pedidos entregados</span>
          <div className="dash-kpi-bar" style={{ "--p": "58%", "--c": "#10a34a" }} />
        </div>

        <div className="dash-kpi dash-kpi--orange">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icono" style={{ background: "rgba(249,115,22,0.12)" }}>
              <FiShoppingCart size={18} color="#f97316" />
            </div>
            <span className="dash-kpi-trend up">
              <FiArrowUp size={10} /> activos
            </span>
          </div>
          <h3 className="dash-kpi-valor">{pedidosActivos}</h3>
          <p className="dash-kpi-label">Pedidos Activos</p>
          <span className="dash-kpi-sub">{pedidos.filter(p => p.estado === "enviado").length} en camino</span>
          <div className="dash-kpi-bar" style={{ "--p": "45%", "--c": "#f97316" }} />
        </div>

        <div className="dash-kpi dash-kpi--purple">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icono" style={{ background: "rgba(168,85,247,0.12)" }}>
              <FiPackage size={18} color="#a855f7" />
            </div>
            <span className="dash-kpi-trend up">
              <FiArrowUp size={10} /> publicados
            </span>
          </div>
          <h3 className="dash-kpi-valor">{productosPublicados}</h3>
          <p className="dash-kpi-label">Productos</p>
          <span className="dash-kpi-sub">{productos.filter(p => p.tipo === "servicio").length} servicios · {productos.filter(p => p.tipo === "producto").length} productos</span>
          <div className="dash-kpi-bar" style={{ "--p": "85%", "--c": "#a855f7" }} />
        </div>
      </div>

      {/* ── Gráficas row 1 ── */}
      <div className="dash-graficas">
        {/* Área — Ventas por mes */}
        <div className="dash-card dash-card--wide">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-titulo">Ingresos por Mes</h3>
              <p className="dash-card-sub">Últimos 6 meses · pedidos entregados</p>
            </div>
            <div className="dash-card-badge">
              {Number(crecimiento) >= 0
                ? <span className="dash-trend-badge up">↑ {crecimiento}% vs mes anterior</span>
                : <span className="dash-trend-badge down">↓ {Math.abs(crecimiento)}% vs mes anterior</span>
              }
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ventasPorMes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={v => v === 0 ? "0" : formatPrecio(v)} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#gradVentas)" dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Barras — Pedidos por mes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-titulo">Pedidos por Mes</h3>
              <p className="dash-card-sub">Todos los estados</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pedidosPorMes} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {pedidosPorMes.map((_, i) => (
                  <Cell key={i} fill={i === pedidosPorMes.length - 1 ? "#3b82f6" : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Fila 2: Top productos + Estado pedidos ── */}
      <div className="dash-graficas dash-graficas--row2">
        {/* Top productos */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-titulo">Top Productos</h3>
              <p className="dash-card-sub">Por unidades vendidas</p>
            </div>
          </div>
          {productosMasVendidos.length === 0 ? (
            <div className="dash-empty">
              <FiShoppingBag size={32} color="#e2e8f0" />
              <p>Sin datos de ventas aún</p>
            </div>
          ) : (
            <div className="dash-top-lista">
              {productosMasVendidos.map((p, i) => {
                const maxVentas = productosMasVendidos[0]?.ventas || 1;
                const pct = Math.round((p.ventas / maxVentas) * 100);
                return (
                  <div key={p.nombre} className="dash-top-item">
                    <div className="dash-top-num" style={{ background: BAR_COLORS[i] }}>{i + 1}</div>
                    <div className="dash-top-info">
                      <p>{p.nombre}</p>
                      <div className="dash-top-bar-wrap">
                        <div className="dash-top-bar" style={{ width: `${pct}%`, background: BAR_COLORS[i] }} />
                      </div>
                    </div>
                    <div className="dash-top-right">
                      <span className="dash-top-ventas">{p.ventas} uds</span>
                      <span className="dash-top-total">{formatPrecio(p.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Estado de pedidos */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-titulo">Estado de Pedidos</h3>
              <p className="dash-card-sub">Distribución actual</p>
            </div>
          </div>
          <div className="dash-estados">
            {[
              { label: "Entregados",  count: pedidosEntregados.length, color: "#10a34a", bg: "#f0fdf4" },
              { label: "En proceso",  count: pedidos.filter(p => p.estado === "en_proceso").length, color: "#f97316", bg: "#fff7ed" },
              { label: "Enviados",    count: pedidos.filter(p => p.estado === "enviado").length, color: "#3b82f6", bg: "#eff6ff" },
              { label: "Cancelados",  count: pedidos.filter(p => p.estado === "cancelado").length, color: "#ef4444", bg: "#fef2f2" },
            ].map(e => {
              const total = pedidos.length || 1;
              const pct   = Math.round((e.count / total) * 100);
              return (
                <div key={e.label} className="dash-estado-item">
                  <div className="dash-estado-left">
                    <div className="dash-estado-dot" style={{ background: e.color }} />
                    <span className="dash-estado-label">{e.label}</span>
                  </div>
                  <div className="dash-estado-bar-wrap">
                    <div className="dash-estado-bar" style={{ width: `${pct}%`, background: e.color }} />
                  </div>
                  <div className="dash-estado-right">
                    <span style={{ fontWeight: 700, color: e.color }}>{e.count}</span>
                    <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
            <div className="dash-total-pedidos">
              <FiShoppingBag size={14} color="#94a3b8" />
              <span>{pedidos.length} pedidos en total</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alertas ── */}
      <div className="dash-alertas-header">
        <FiAlertTriangle size={16} color="#f59e0b" />
        <h3>Alertas y Notificaciones</h3>
      </div>

      <div className="dash-alertas">
        <div className="dash-alerta amarillo">
          <div className="dash-alerta-icon" style={{ background: "#fde68a" }}>
            <FiPackage size={16} color="#92400e" />
          </div>
          <div className="dash-alerta-content">
            <div className="dash-alerta-top">
              <span>Productos con bajo stock</span>
              <span className="dash-alerta-badge amarillo">{stockBajo}</span>
            </div>
            <p className="dash-alerta-desc">Requieren reabastecimiento pronto</p>
          </div>
          <button className="dash-alerta-btn" onClick={() => navigate("/admin/productos")}>
            Ver →
          </button>
        </div>

        <div className="dash-alerta azul">
          <div className="dash-alerta-icon" style={{ background: "#bfdbfe" }}>
            <FiUsers size={16} color="#1e40af" />
          </div>
          <div className="dash-alerta-content">
            <div className="dash-alerta-top">
              <span>Emprendedoras pendientes</span>
              <span className="dash-alerta-badge azul">{pendientesAprobacion}</span>
            </div>
            <p className="dash-alerta-desc">Solicitudes de aprobación</p>
          </div>
          <button className="dash-alerta-btn" onClick={() => navigate("/admin/users")}>
            Ver →
          </button>
        </div>

        <div className="dash-alerta rojo">
          <div className="dash-alerta-icon" style={{ background: "#fecaca" }}>
            <FiStar size={16} color="#991b1b" />
          </div>
          <div className="dash-alerta-content">
            <div className="dash-alerta-top">
              <span>Reportes inapropiados</span>
              <span className="dash-alerta-badge rojo">0</span>
            </div>
            <p className="dash-alerta-desc">Sin reportes pendientes</p>
          </div>
          <button className="dash-alerta-btn" onClick={() => navigate("/admin/resenas")}>
            Ver →
          </button>
        </div>
      </div>
    </div>
  );
}
