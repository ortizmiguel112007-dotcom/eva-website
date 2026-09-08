import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiUsers, FiDownload, FiX } from "react-icons/fi"

import { AlianzaCard } from "@/features/products/components/alianzas/AlianzaCard"
import { HistorialAlianza } from "../components/alianzas/HistorialAlianza"

import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function AdminAlianzas() {
  const { token, user } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [alianzas, setAlianzas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [historialAlianza, setHistorialAlianza] = useState(null)
  const [toast, setToast] = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await axios.get(`${BASE}/api/admin/alianzas`, { headers })
      setAlianzas(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAprobar = async (alianza) => {
    try {
      await axios.put(`${BASE}/api/admin/alianzas/${alianza.id_alianza}/aprobar`, {}, { headers })
      mostrarToast("Alianza aprobada")
      cargar()
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleRechazar = async (alianza) => {
    const motivo = window.prompt("Motivo del rechazo:")
    if (!motivo) return
    try {
      await axios.put(`${BASE}/api/admin/alianzas/${alianza.id_alianza}/rechazar`, { motivo }, { headers })
      mostrarToast("Alianza rechazada")
      cargar()
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleDesactivar = async (alianza) => {
    const motivo = window.prompt("Motivo de la desactivación (opcional):") || null
    try {
      await axios.put(`${BASE}/api/admin/alianzas/${alianza.id_alianza}/desactivar`, { motivo }, { headers })
      mostrarToast("Alianza desactivada")
      cargar()
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleExportar = (formato) => {
    window.open(`${BASE}/api/admin/alianzas/metricas/export?formato=${formato}&token=${token}`, "_blank")
  }

  if (cargando) return <div className="pagos-loading">Cargando alianzas...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Alianzas Promocionales</h1>
        <p>Supervisa, aprueba y modera las alianzas de la plataforma (RF-092)</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button className="dc-btn dc-btn--historial" onClick={() => handleExportar("pdf")}>
          <FiDownload size={13} /> Exportar PDF
        </button>
        <button className="dc-btn dc-btn--historial" onClick={() => handleExportar("excel")}>
          <FiDownload size={13} /> Exportar Excel
        </button>
      </div>

      {alianzas.length === 0 ? (
        <div className="pagos-empty">
          <FiUsers size={40} color="#cbd5e1" />
          <p>No hay alianzas registradas todavía</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {alianzas.map((a) => (
            <AlianzaCard
              key={a.id_alianza}
              alianza={a}
              usuarioActualId={user?.id}
              contexto="admin"
              onAprobar={handleAprobar}
              onRechazar={handleRechazar}
              onDesactivar={handleDesactivar}
              onVerHistorial={setHistorialAlianza}
            />
          ))}
        </div>
      )}

      {historialAlianza && (
        <div className="pagos-modal-overlay" onClick={() => setHistorialAlianza(null)}>
          <div className="pagos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pagos-modal-header">
              <h3>Historial — {historialAlianza.nombre}</h3>
              <button className="pagos-modal-cerrar" onClick={() => setHistorialAlianza(null)}><FiX size={18} /></button>
            </div>
            <div className="pagos-modal-body">
              <HistorialAlianza id_alianza={historialAlianza.id_alianza} token={token} />
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`pagos-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}