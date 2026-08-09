import { FiUsers, FiDollarSign, FiShoppingCart, FiPackage, FiArrowUp, FiArrowDown } from "react-icons/fi"
import { formatPrecio } from "@/features/admin/utils/utils"
import "@/infrastructure/css/admin/dashboard/DashKpis.css"

export function DashKpis({ usuarios, pedidos, productos, totalVentas, pedidosEntregados, crecimiento }) {
  const pedidosActivos     = pedidos.filter(p => p.estado === "en_proceso" || p.estado === "enviado").length
  const productosPublicados = productos.filter(p => p.visible !== false).length

  return (
    <div className="dash-kpis">
      <div className="dash-kpi dash-kpi--blue">
        <div className="dash-kpi-top">
          <div className="dash-kpi-icono" style={{ background: "rgba(59,130,246,0.12)" }}>
            <FiUsers size={18} color="#3b82f6" />
          </div>
          <span className="dash-kpi-trend up">
            <FiArrowUp size={10} /> +{Math.max(1, Math.floor(usuarios.length * 0.08))}%
          </span>
        </div>
        <h3 className="dash-kpi-valor">{usuarios.length.toLocaleString()}</h3>
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
          <span className="dash-kpi-trend up"><FiArrowUp size={10} /> activos</span>
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
          <span className="dash-kpi-trend up"><FiArrowUp size={10} /> publicados</span>
        </div>
        <h3 className="dash-kpi-valor">{productosPublicados}</h3>
        <p className="dash-kpi-label">Productos</p>
        <span className="dash-kpi-sub">
          {productos.filter(p => p.tipo === "servicio").length} servicios · {productos.filter(p => p.tipo === "producto").length} productos
        </span>
        <div className="dash-kpi-bar" style={{ "--p": "85%", "--c": "#a855f7" }} />
      </div>
    </div>
  )
}