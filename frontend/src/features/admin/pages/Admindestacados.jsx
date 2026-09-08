import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiStar, FiDownload, FiX } from "react-icons/fi"

import { DestacadoCard } from "@/features/products/components/destacados/DestacadoCard"
import { MetricasDestacados } from "@/features/products/components/destacados/MetricasDestacados"
import { HistorialDestacado } from "../components/destacados/HistorialDestacado"

import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function AdminDestacados() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [productos, setProductos] = useState([])
  const [metricas, setMetricas]   = useState([])
  const [config, setConfig]       = useState({ dias_nuevo: 7, top_mas_vendidos: 10 })
  const [cargando, setCargando]   = useState(true)
  const [vista, setVista]         = useState("lista")
  const [historialProducto, setHistorialProducto] = useState(null)
  const [toast, setToast]         = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const [prods, mets, cfg] = await Promise.all([
        axios.get(`${BASE}/api/admin/destacados`, { headers }).then((r) => r.data),
        axios.get(`${BASE}/api/admin/destacados/metricas`, { headers }).then((r) => r.data),
        axios.get(`${BASE}/api/admin/destacados/config`, { headers }).then((r) => r.data),
      ])
      setProductos(prods)
      setMetricas(mets)
      setConfig(cfg)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAprobar = async (producto) => {
    try {
      await axios.put(`${BASE}/api/admin/destacados/${producto.id_producto}/aprobar`, {}, { headers })
      mostrarToast("Destacado aprobado")
      cargar()
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleRechazar = async (producto) => {
    const motivo = window.prompt("Motivo del rechazo:")
    if (!motivo) return
    try {
      await axios.put(`${BASE}/api/admin/destacados/${producto.id_producto}/rechazar`, { motivo }, { headers })
      mostrarToast("Solicitud rechazada")
      cargar()
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleDesactivar = async (producto) => {
    const motivo = window.prompt("Motivo de la desactivación (opcional):") || null
    try {
      await axios.put(`${BASE}/api/admin/destacados/${producto.id_producto}/desactivar`, { motivo }, { headers })
      mostrarToast("Destacado desactivado")
      cargar()
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleGuardarConfig = async () => {
    try {
      await axios.put(`${BASE}/api/admin/destacados/config`, config, { headers })
      mostrarToast("Configuración guardada")
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleExportar = (formato) => {
    window.open(`${BASE}/api/admin/destacados/metricas/export?formato=${formato}&token=${token}`, "_blank")
  }

  if (cargando) return <div className="pagos-loading">Cargando destacados...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Promociones Destacadas</h1>
        <p>Aprueba, rechaza y supervisa las solicitudes de la plataforma (RF-083)</p>
      </div>

      <div className="comentarios-tabs">
        <button className={vista === "lista" ? "active" : ""} onClick={() => setVista("lista")}>Solicitudes</button>
        <button className={vista === "metricas" ? "active" : ""} onClick={() => setVista("metricas")}>Métricas</button>
        <button className={vista === "config" ? "active" : ""} onClick={() => setVista("config")}>Configuración</button>
      </div>

      {vista === "config" ? (
        <div className="pagos-modal-rechazo" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1.25rem", maxWidth: 400 }}>
          <label>Días para considerar un producto "nuevo"</label>
          <input
            type="number"
            value={config.dias_nuevo}
            onChange={(e) => setConfig({ ...config, dias_nuevo: Number(e.target.value) })}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1.5px solid #e5e7eb", marginBottom: "0.75rem" }}
          />
          <label>Cantidad de productos en "más vendidos"</label>
          <input
            type="number"
            value={config.top_mas_vendidos}
            onChange={(e) => setConfig({ ...config, top_mas_vendidos: Number(e.target.value) })}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1.5px solid #e5e7eb", marginBottom: "1rem" }}
          />
          <button className="pago-btn-verificar-modal" onClick={handleGuardarConfig}>Guardar configuración</button>
        </div>
      ) : vista === "metricas" ? (
        <>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <button className="dc-btn dc-btn--historial" onClick={() => handleExportar("pdf")}>
              <FiDownload size={13} /> Exportar PDF
            </button>
            <button className="dc-btn dc-btn--historial" onClick={() => handleExportar("excel")}>
              <FiDownload size={13} /> Exportar Excel
            </button>
          </div>
          <MetricasDestacados metricas={metricas} />
        </>
      ) : productos.length === 0 ? (
        <div className="pagos-empty">
          <FiStar size={40} color="#cbd5e1" />
          <p>No hay solicitudes ni destacados activos</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {productos.map((p) => (
            <DestacadoCard
              key={p.id_producto}
              producto={p}
              contexto="admin"
              onAprobar={handleAprobar}
              onRechazar={handleRechazar}
              onDesactivar={handleDesactivar}
              onVerHistorial={setHistorialProducto}
            />
          ))}
        </div>
      )}

      {historialProducto && (
        <div className="pagos-modal-overlay" onClick={() => setHistorialProducto(null)}>
          <div className="pagos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pagos-modal-header">
              <h3>Historial — {historialProducto.nombre_producto}</h3>
              <button className="pagos-modal-cerrar" onClick={() => setHistorialProducto(null)}><FiX size={18} /></button>
            </div>
            <div className="pagos-modal-body">
              <HistorialDestacado id_producto={historialProducto.id_producto} token={token} />
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`pagos-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}