import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiUsers, FiPlus, FiX } from "react-icons/fi"

import { AlianzaCard } from "../components/alianzas/AlianzaCard"
import { ModalNuevaAlianza } from "../components/alianzas/ModalNuevaAlianza"
import { MetricasAlianzas } from "../components/alianzas/MetricasAlianzas"

import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function Alianzas() {
  const { token, user } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [alianzas, setAlianzas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [metricasAlianza, setMetricasAlianza] = useState(null)
  const [toast, setToast] = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await axios.get(`${BASE}/api/alianzas`, { headers })
      setAlianzas(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAutorizar = async (alianza) => {
    try {
      await axios.put(`${BASE}/api/alianzas/${alianza.id_alianza}/autorizar`, {}, { headers })
      mostrarToast("Autorización registrada")
      cargar()
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleFinalizar = async (alianza) => {
    if (!window.confirm(`¿Finalizar la alianza "${alianza.nombre}"?`)) return
    try {
      await axios.put(`${BASE}/api/alianzas/${alianza.id_alianza}/finalizar`, {}, { headers })
      mostrarToast("Alianza finalizada")
      cargar()
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
  }

  const handleVerMetricas = async (alianza) => {
    try {
      const res = await axios.get(`${BASE}/api/alianzas/${alianza.id_alianza}/metricas`, { headers })
      setMetricasAlianza({ nombre: alianza.nombre, datos: res.data })
    } catch (err) { mostrarToast("Error al obtener métricas", "error") }
  }

  if (cargando) return <div className="pagos-loading">Cargando alianzas...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Alianzas Promocionales</h1>
          <p>Colabora con otras emprendedoras en campañas cruzadas</p>
        </div>
        <button className="dc-btn dc-btn--solicitar" onClick={() => setModalAbierto(true)}>
          <FiPlus size={13} /> Nueva alianza
        </button>
      </div>

      {alianzas.length === 0 ? (
        <div className="pagos-empty">
          <FiUsers size={40} color="#cbd5e1" />
          <p>Aún no tienes alianzas — crea una para empezar a colaborar</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {alianzas.map((a) => (
            <AlianzaCard
              key={a.id_alianza}
              alianza={a}
              usuarioActualId={user?.id}
              contexto="emprendedora"
              onAutorizar={handleAutorizar}
              onFinalizar={handleFinalizar}
              onVerMetricas={handleVerMetricas}
            />
          ))}
        </div>
      )}

      <ModalNuevaAlianza abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} onCreada={cargar} token={token} />

      {metricasAlianza && (
        <div className="pagos-modal-overlay" onClick={() => setMetricasAlianza(null)}>
          <div className="pagos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pagos-modal-header">
              <h3>Métricas — {metricasAlianza.nombre}</h3>
              <button className="pagos-modal-cerrar" onClick={() => setMetricasAlianza(null)}><FiX size={18} /></button>
            </div>
            <div className="pagos-modal-body">
              <MetricasAlianzas metricas={metricasAlianza.datos} />
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`pagos-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}