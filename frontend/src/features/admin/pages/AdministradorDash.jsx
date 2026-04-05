import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { adminService } from "@/features/admin/services/admin.service";
import {
  FiUsers,
  FiDollarSign,
  FiShoppingBag,
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiUserCheck,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "@/infrastructure/css/AdminDashboard.css";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function AdministradorDash() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [u, ped, prod] = await Promise.all([
          adminService.listarUsuarios(),
          axios
            .get("http://localhost:3000/api/pedidos", { headers: getHeaders() })
            .then((r) => r.data)
            .catch(() => []),
          axios
            .get("http://localhost:3000/api/items", { headers: getHeaders() })
            .then((r) => r.data)
            .catch(() => []),
        ]);
        setUsuarios(u);
        setPedidos(Array.isArray(ped) ? ped : []);
        setProductos(Array.isArray(prod) ? prod : []);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // ── KPIs ──────────────────────────────────────────────────
  const totalUsuarios = usuarios.length;
  const pedidosActivos = pedidos.filter(
    (p) => p.estado === "en_proceso" || p.estado === "enviado",
  ).length;
  const pendientesAprobacion = usuarios.filter(
    (u) => u.rol === "emprendedora" && !u.activo,
  ).length;
  const productosPublicados = productos.filter(
    (p) => p.visible !== false,
  ).length;
  const totalVentas = pedidos
    .filter((p) => p.estado === "entregado")
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  // ── Ventas por mes (últimos 6 meses) ──────────────────────
  const ventasPorMes = (() => {
    const hoy = new Date();
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = MESES[fecha.getMonth()];
      const total = pedidos
        .filter((p) => {
          const f = new Date(p.fecha);
          return (
            f.getMonth() === fecha.getMonth() &&
            f.getFullYear() === fecha.getFullYear()
          );
        })
        .reduce((acc, p) => acc + Number(p.total || 0), 0);
      meses.push({ mes, total: Math.round(total) });
    }
    return meses;
  })();

  // ── Productos más vendidos ────────────────────────────────
  const productosMasVendidos = (() => {
    const conteo = {};
    pedidos.forEach((p) => {
      p.detalles?.forEach((d) => {
        const nombre = d.producto?.nombre_producto || "Producto";
        const precio = Number(d.precio_unit || 0) * Number(d.cantidad || 0);
        if (!conteo[nombre]) conteo[nombre] = { ventas: 0, total: 0 };
        conteo[nombre].ventas += d.cantidad || 0;
        conteo[nombre].total += precio;
      });
    });
    return Object.entries(conteo)
      .sort((a, b) => b[1].ventas - a[1].ventas)
      .slice(0, 5)
      .map(([nombre, data]) => ({ nombre, ...data }));
  })();

  // ── Stock bajo ────────────────────────────────────────────
  const stockBajo = productos.filter(
    (p) =>
      p.inventario?.cantidad !== undefined &&
      p.inventario.cantidad <=
        (p.inventario.stock_minimo || p.stock_minimo || 5),
  ).length;

  const formatPrecio = (n) => "$" + Number(n).toLocaleString("es-CO");

  if (cargando) return <div className="adm-loading">Cargando resumen...</div>;

  return (
    <div className="dash-page">
      {/* Bienvenida */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#1e293b",
            margin: "0 0 0.2rem",
          }}
        >
          Panel de Administración 
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
          Bienvenido de nuevo. Aquí tienes el resumen general de la plataforma.
        </p>
      </div>

      {/* ── KPIs ── */}
      <div className="dash-kpis">
        <div className="dash-kpi">
          <div className="dash-kpi-left">
            <div className="dash-kpi-icono" style={{ background: "#eff6ff" }}>
              <FiUsers size={20} color="#3b82f6" />
            </div>
            <div>
              <p className="dash-kpi-label">Total Usuarios</p>
              <h3 className="dash-kpi-valor">
                {totalUsuarios.toLocaleString()}
              </h3>
              <span className="dash-kpi-sub">registrados</span>
            </div>
          </div>
          <FiTrendingUp size={16} color="#16a34a" />
        </div>

        <div className="dash-kpi">
          <div className="dash-kpi-left">
            <div className="dash-kpi-icono" style={{ background: "#f0fdf4" }}>
              <FiDollarSign size={20} color="#16a34a" />
            </div>
            <div>
              <p className="dash-kpi-label">Total Ventas</p>
              <h3 className="dash-kpi-valor">{formatPrecio(totalVentas)}</h3>
              <span className="dash-kpi-sub">en pedidos entregados</span>
            </div>
          </div>
          <FiTrendingUp size={16} color="#16a34a" />
        </div>

        <div className="dash-kpi">
          <div className="dash-kpi-left">
            <div className="dash-kpi-icono" style={{ background: "#fff7ed" }}>
              <FiShoppingBag size={20} color="#f97316" />
            </div>
            <div>
              <p className="dash-kpi-label">Pedidos Activos</p>
              <h3 className="dash-kpi-valor">{pedidosActivos}</h3>
              <span className="dash-kpi-sub">
                {pendientesAprobacion} pendientes aprobación
              </span>
            </div>
          </div>
          <FiTrendingUp size={16} color="#16a34a" />
        </div>

        <div className="dash-kpi">
          <div className="dash-kpi-left">
            <div className="dash-kpi-icono" style={{ background: "#faf5ff" }}>
              <FiPackage size={20} color="#a855f7" />
            </div>
            <div>
              <p className="dash-kpi-label">Productos Publicados</p>
              <h3 className="dash-kpi-valor">{productosPublicados}</h3>
              <span className="dash-kpi-sub">+{productos.length} en total</span>
            </div>
          </div>
          <FiTrendingUp size={16} color="#16a34a" />
        </div>
      </div>

      {/* ── Gráficas ── */}
      <div className="dash-graficas">
        {/* Ventas por mes */}
        <div className="dash-card">
          <h3 className="dash-card-titulo">Ventas por Mes</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={ventasPorMes}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                formatter={(v) => formatPrecio(v)}
                labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                contentStyle={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#1e293b"
                strokeWidth={2}
                dot={{ fill: "#1e293b", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Productos más vendidos */}
        <div className="dash-card">
          <h3 className="dash-card-titulo">Productos Más Vendidos</h3>
          {productosMasVendidos.length === 0 ? (
            <p
              style={{
                color: "#94a3b8",
                textAlign: "center",
                padding: "2rem",
                fontSize: "0.88rem",
              }}
            >
              No hay datos de ventas aún
            </p>
          ) : (
            <div className="dash-top-lista">
              {productosMasVendidos.map((p, i) => (
                <div key={p.nombre} className="dash-top-item">
                  <div className="dash-top-num">{i + 1}</div>
                  <div className="dash-top-info">
                    <p>{p.nombre}</p>
                    <span>{p.ventas} ventas</span>
                  </div>
                  <span className="dash-top-total">
                    {formatPrecio(p.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Alertas ── */}
      <div className="dash-alertas-header">
        <FiAlertTriangle size={16} color="#f59e0b" />
        <h3>Alertas y Notificaciones</h3>
      </div>

      <div className="dash-alertas">
        <div className="dash-alerta amarillo">
          <div className="dash-alerta-top">
            <span>Productos con bajo stock</span>
            <span className="dash-alerta-badge amarillo">{stockBajo}</span>
          </div>
          <button
            className="dash-alerta-btn"
            onClick={() => navigate("/admin/productos")}
          >
            Ver detalles
          </button>
        </div>

        <div className="dash-alerta azul">
          <div className="dash-alerta-top">
            <span>Emprendedoras pendientes de aprobación</span>
            <span className="dash-alerta-badge azul">
              {pendientesAprobacion}
            </span>
          </div>
          <button
            className="dash-alerta-btn"
            onClick={() => navigate("/admin/users")}
          >
            Ver detalles
          </button>
        </div>

        <div className="dash-alerta rojo">
          <div className="dash-alerta-top">
            <span>Reportes de contenido inapropiado</span>
            <span className="dash-alerta-badge rojo">0</span>
          </div>
          <button
            className="dash-alerta-btn"
            onClick={() => navigate("/admin/resenas")}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}
