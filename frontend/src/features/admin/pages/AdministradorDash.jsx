import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiActivity } from "react-icons/fi"
import { adminService } from "@/features/admin/services/admin.service"

import { DashKpis }          from "../components/dashboard/DashKpis"
import { DashGraficas }      from "../components/dashboard/DashGraficas"
import { DashTopProductos }  from "../components/dashboard/DashTopProductos"
import { DashEstadoPedidos } from "../components/dashboard/DashEstadoPedidos"
import { DashAlertas }       from "../components/dashboard/DashAlertas"

import { MESES, getHeaders } from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/dashboard/AdminDashboard.css"
import "@/infrastructure/css/admin/dashboard/DashKpis.css"
import "@/infrastructure/css/admin/dashboard/DashGraficas.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function AdministradorDash() {
  const navigate = useNavigate()

  const [usuarios, setUsuarios]   = useState([])
  const [pedidos, setPedidos]     = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [animado, setAnimado]     = useState(false)

  useEffect(() => {
    Promise.all([
      adminService.listarUsuarios(),
      axios.get(`${API_URL}/api/admin/pedidos`, { headers: getHeaders() }).then(r => r.data).catch(() => []),
      axios.get(`${API_URL}/api/items/admin/todos`, { headers: getHeaders() }).then(r => r.data).catch(() => []),
    ])
      .then(([u, ped, prod]) => {
        setUsuarios(u)
        setPedidos(Array.isArray(ped) ? ped : [])
        setProductos(Array.isArray(prod) ? prod : [])
      })
      .catch(console.error)
      .finally(() => { setCargando(false); setTimeout(() => setAnimado(true), 100) })
  }, [])

  const pedidosEntregados = pedidos.filter(p => p.estado === "entregado")
  const totalVentas       = pedidosEntregados.reduce((acc, p) => acc + Number(p.total || 0), 0)

  const ventasPorMes = (() => {
    const hoy = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1)
      const total = pedidosEntregados
        .filter(p => { const f = new Date(p.fecha); return f.getMonth() === fecha.getMonth() && f.getFullYear() === fecha.getFullYear() })
        .reduce((acc, p) => acc + Number(p.total || 0), 0)
      return { mes: MESES[fecha.getMonth()], total: Math.round(total) }
    })
  })()

  const pedidosPorMes = (() => {
    const hoy = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1)
      const count = pedidos.filter(p => { const f = new Date(p.fecha); return f.getMonth() === fecha.getMonth() && f.getFullYear() === fecha.getFullYear() }).length
      return { mes: MESES[fecha.getMonth()], count }
    })
  })()

  const productosMasVendidos = (() => {
    const conteo = {}
    pedidos.forEach(p => {
      p.detalles?.forEach(d => {
        const nombre = d.producto?.nombre_producto || "Producto"
        if (!conteo[nombre]) conteo[nombre] = { ventas: 0, total: 0 }
        conteo[nombre].ventas += Number(d.cantidad || 0)
        conteo[nombre].total  += Number(d.precio_unit || 0) * Number(d.cantidad || 0)
      })
    })
    return Object.entries(conteo)
      .sort((a, b) => b[1].ventas - a[1].ventas)
      .slice(0, 5)
      .map(([nombre, data]) => ({ nombre, ...data }))
  })()

  const stockBajo = productos.filter(p =>
    p.tipo !== "servicio" && p.inventario?.cantidad !== undefined &&
    p.inventario.cantidad <= (p.inventario.stock_minimo || p.stock_minimo || 5)
  ).length

  const crecimiento = ventasPorMes[4]?.total > 0
    ? (((ventasPorMes[5]?.total - ventasPorMes[4]?.total) / ventasPorMes[4]?.total) * 100).toFixed(1)
    : 0

  const pendientesAprobacion = usuarios.filter(u => u.rol === "emprendedora" && !u.activo).length

  const now = new Date()
  const hora = now.getHours()
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches"

  if (cargando) return (
    <div className="adm-loading">
      <div className="dash-spinner" />
      <p>Cargando panel...</p>
    </div>
  )

  return (
    <div className={`dash-page ${animado ? "dash-animado" : ""}`}>
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

      <DashKpis
        usuarios={usuarios} pedidos={pedidos} productos={productos}
        totalVentas={totalVentas} pedidosEntregados={pedidosEntregados}
        crecimiento={crecimiento}
      />

      <DashGraficas ventasPorMes={ventasPorMes} pedidosPorMes={pedidosPorMes} crecimiento={crecimiento} />

      <div className="dash-graficas dash-graficas--row2">
        <DashTopProductos productos={productosMasVendidos} />
        <DashEstadoPedidos pedidos={pedidos} />
      </div>

      <DashAlertas
        stockBajo={stockBajo}
        pendientesAprobacion={pendientesAprobacion}
        onNavigate={navigate}
      />
    </div>
  )
}
