import { useState, useEffect } from "react"
import axios from "axios"
import { FiSearch, FiX, FiUsers } from "react-icons/fi"

import { AlianzaAdminCard } from "../components/alianzas/AlianzaAdminCard"
import { getHeaders }       from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/alianzas/AdminAlianzas.css"

const BASE = "http://localhost:3000"

export default function AdminAlianzas() {
  const [alianzas, setAlianzas]   = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    axios.get(`${BASE}/api/admin/alianzas`, { headers: getHeaders() })
      .then(res => setAlianzas(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const handleToggle = id => setExpandido(prev => prev === id ? null : id)

  const filtrados = alianzas.filter(a => {
    const matchB =
      a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.creador?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.participantes?.some(p => p.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
    const matchF = filtro === "todos" || a.estado === filtro
    return matchB && matchF
  })

  const metricas = [
    { label: "Total",       valor: alianzas.length,                                       color: "#3b82f6" },
    { label: "Activas",     valor: alianzas.filter(a => a.estado === "activa").length,    color: "#16a34a" },
    { label: "Pendientes",  valor: alianzas.filter(a => a.estado === "pendiente").length, color: "#f97316" },
    { label: "Finalizadas", valor: alianzas.filter(a => a.estado === "finalizada").length,color: "#64748b" },
  ]

  return (
    <div className="aa-page">
      <div className="aa-header">
        <div>
          <h1 className="aa-titulo">Alianzas Promocionales</h1>
          <p className="aa-sub">Supervisa las promociones colaborativas entre emprendedoras</p>
        </div>
      </div>

      <div className="aa-metricas">
        {metricas.map(m => (
          <div key={m.label} className="aa-metrica" style={{ borderTop: `3px solid ${m.color}` }}>
            <p className="aa-metrica-label">{m.label}</p>
            <strong className="aa-metrica-valor" style={{ color: m.color }}>{m.valor}</strong>
          </div>
        ))}
      </div>

      <div className="aa-filtros">
        <div className="aa-search">
          <FiSearch size={14} color="#94a3b8" />
          <input className="aa-search-input" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar alianza o emprendedora..." />
          {busqueda && (
            <button className="aa-search-clear" onClick={() => setBusqueda("")}>
              <FiX size={13} />
            </button>
          )}
        </div>
        <select className="aa-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="activa">Activas</option>
          <option value="pendiente">Pendientes</option>
          <option value="finalizada">Finalizadas</option>
        </select>
      </div>

      <p className="aa-contador">Mostrando {filtrados.length} de {alianzas.length} alianzas</p>

      {cargando ? (
        <p className="aa-cargando">Cargando alianzas...</p>
      ) : filtrados.length === 0 ? (
        <div className="aa-empty">
          <FiUsers size={40} color="#e5e7eb" />
          <p>No hay alianzas</p>
        </div>
      ) : (
        <div className="aa-lista">
          {filtrados.map(a => (
            <AlianzaAdminCard
              key={a.id_alianza}
              alianza={a}
              expandido={expandido}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}