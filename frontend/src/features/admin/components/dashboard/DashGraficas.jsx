import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import { formatPrecio, formatPrecioFull } from "@/features/admin/utils/utils"
import "@/infrastructure/css/admin/dashboard/DashGraficas.css"

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="dash-tooltip">
      <p className="dash-tooltip-label">{label}</p>
      <p className="dash-tooltip-valor">{formatPrecioFull(payload[0].value)}</p>
    </div>
  )
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="dash-tooltip">
      <p className="dash-tooltip-label">{label}</p>
      <p className="dash-tooltip-valor">{payload[0].value} pedidos</p>
    </div>
  )
}

export function DashGraficas({ ventasPorMes, pedidosPorMes, crecimiento }) {
  return (
    <div className="dash-graficas">
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
  )
}