import { useState, useEffect } from "react"
import axios from "axios"
import { FiSearch, FiX, FiPackage } from "react-icons/fi"

import { PedidoAdminCard } from "../components/pedidos/PedidoAdminCard"
import { PaginacionSimple } from "@/features/usuario/components/historial/PaginacionSimple"
import { getHeaders }       from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/pedidos/AdminPedidos.css"
import "@/infrastructure/css/auth/CrudAdmin.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PAGE_SIZE = 10

export default function AdminPedidos() {
  const [pedidos, setPedidos]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [pagina, setPagina]       = useState(1)

  useEffect(() => {
    axios.get(`${BASE}/api/admin/pedidos`, { headers: getHeaders() })
      .then(res => setPedidos(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { setPagina(1) }, [busqueda, filtro])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await axios.put(`${BASE}/api/pedidos/${id}/estado`, { estado }, { headers: getHeaders() })
      setPedidos(prev => prev.map(p => p.id_pedido === id ? { ...p, estado } : p))
      mostrarToast("Estado actualizado")
    } catch { mostrarToast("Error al cambiar estado", "error") }
  }

  const handleToggle = id => setExpandido(prev => prev === id ? null : id)

  const filtrados = pedidos.filter(p => {
    const matchB = String(p.id_pedido).includes(busqueda) ||
      p.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" || p.estado === filtro
    return matchB && matchF
  })

  const totalPaginas  = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const pedidosPagina = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  const metricas = [
    { label: "Total",      valor: pedidos.length,                                        cls: "total"     },
    { label: "En proceso", valor: pedidos.filter(p => p.estado === "en_proceso").length, cls: "proceso"   },
    { label: "Entregados", valor: pedidos.filter(p => p.estado === "entregado").length,  cls: "entregado" },
    { label: "Cancelados", valor: pedidos.filter(p => p.estado === "cancelado").length,  cls: "cancelado" },
  ]

  return (
    <div className="ap-page">
      {toast && <div className={`ap-toast ${toast.tipo}`}>{toast.msg}</div>}

      <div className="ap-header">
        <h1 className="ap-titulo">Todos los Pedidos</h1>
        <p className="ap-sub">Supervisa y gestiona todos los pedidos de la plataforma</p>
      </div>

      <div className="ap-metricas">
        {metricas.map(m => (
          <div key={m.label} className={`ap-metrica ap-metrica--${m.cls}`}>
            <p className="ap-metrica-label">{m.label}</p>
            <strong className="ap-metrica-valor">{m.valor}</strong>
          </div>
        ))}
      </div>

      <div className="ap-filtros">
        <div className="ap-search">
          <FiSearch size={14} color="#94a3b8" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por # pedido o cliente..."
            className="ap-search-input" />
          {busqueda && (
            <button onClick={() => setBusqueda("")} className="ap-search-clear">
              <FiX size={13} />
            </button>
          )}
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} className="ap-select">
          <option value="todos">Todos los estados</option>
          <option value="en_proceso">En proceso</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <p className="ap-contador">
        Mostrando {filtrados.length} de {pedidos.length} pedidos
      </p>

      {cargando ? (
        <p className="ap-cargando">Cargando pedidos...</p>
      ) : (
        <>
          <div className="ap-lista">
            {pedidosPagina.length === 0 ? (
              <div className="ap-empty">
                <FiPackage size={40} color="#e5e7eb" />
                <p>No hay pedidos</p>
              </div>
            ) : pedidosPagina.map(p => (
              <PedidoAdminCard
                key={p.id_pedido}
                pedido={p}
                expandido={expandido}
                onToggle={handleToggle}
                onCambiarEstado={cambiarEstado}
              />
            ))}
          </div>

          <PaginacionSimple
            pagina={pagina}
            totalPaginas={totalPaginas}
            setPagina={setPagina}
            total={filtrados.length}
            labelSingular="pedido"
            labelPlural="pedidos"
          />
        </>
      )}
    </div>
  )
}