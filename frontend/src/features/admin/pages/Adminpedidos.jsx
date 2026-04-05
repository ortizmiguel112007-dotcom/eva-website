import { useState, useEffect } from "react"
import axios from "axios"
import { FiSearch, FiX, FiPackage, FiUser, FiCalendar } from "react-icons/fi"
import "@/infrastructure/css/AdminPedidos.css"

const BASE = "http://localhost:3000"
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })
const fmtPrecio = p => "$" + Number(p).toLocaleString("es-CO")
const fmtFecha  = f => new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })

const ESTADOS = {
  en_proceso: { clase: "proceso", label: "En proceso" },
  enviado:    { clase: "enviado", label: "Enviado"    },
  entregado:  { clase: "entregado", label: "Entregado" },
  cancelado:  { clase: "cancelado", label: "Cancelado" },
}

export default function AdminPedidos() {
  const [pedidos, setPedidos]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get(`${BASE}/api/pedidos`, { headers: hdrs() })
        setPedidos(Array.isArray(res.data) ? res.data : [])
      } catch (err) { console.error(err) }
      finally { setCargando(false) }
    }
    cargar()
  }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await axios.put(`${BASE}/api/pedidos/${id}/estado`, { estado }, { headers: hdrs() })
      setPedidos(prev => prev.map(p => p.id_pedido === id ? { ...p, estado } : p))
      mostrarToast("Estado actualizado")
    } catch { mostrarToast("Error al cambiar estado", "error") }
  }

  const filtrados = pedidos.filter(p => {
    const matchB = String(p.id_pedido).includes(busqueda) ||
      p.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" || p.estado === filtro
    return matchB && matchF
  })

  const metricas = [
    { label: "Total",      valor: pedidos.length,                                        cls: "total"    },
    { label: "En proceso", valor: pedidos.filter(p => p.estado === "en_proceso").length, cls: "proceso"  },
    { label: "Entregados", valor: pedidos.filter(p => p.estado === "entregado").length,  cls: "entregado"},
    { label: "Cancelados", valor: pedidos.filter(p => p.estado === "cancelado").length,  cls: "cancelado"},
  ]

  return (
    <div className="ap-page">

      {/* Toast */}
      {toast && <div className={`ap-toast ${toast.tipo}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="ap-header">
        <h1 className="ap-titulo">Todos los Pedidos</h1>
        <p className="ap-sub">Supervisa y gestiona todos los pedidos de la plataforma</p>
      </div>

      {/* Métricas */}
      <div className="ap-metricas">
        {metricas.map(m => (
          <div key={m.label} className={`ap-metrica ap-metrica--${m.cls}`}>
            <p className="ap-metrica-label">{m.label}</p>
            <strong className="ap-metrica-valor">{m.valor}</strong>
          </div>
        ))}
      </div>

      {/* Filtros */}
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
          <option value="todos">Todos</option>
          <option value="en_proceso">En proceso</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Lista */}
      {cargando ? (
        <p className="ap-cargando">Cargando pedidos...</p>
      ) : (
        <div className="ap-lista">
          {filtrados.length === 0 ? (
            <div className="ap-empty">
              <FiPackage size={40} color="#e5e7eb" />
              <p>No hay pedidos</p>
            </div>
          ) : filtrados.map(p => {
            const est   = ESTADOS[p.estado] || ESTADOS.en_proceso
            const isExp = expandido === p.id_pedido
            return (
              <div key={p.id_pedido} className="ap-card">
                {/* Fila principal */}
                <div className="ap-card-row" onClick={() => setExpandido(isExp ? null : p.id_pedido)}>
                  <div className="ap-card-left">
                    <div className="ap-card-titulo">
                      <span className="ap-card-num">Pedido #{p.id_pedido}</span>
                      <span className={`ap-badge ap-badge--${est.clase}`}>{est.label}</span>
                    </div>
                    <div className="ap-card-meta">
                      <span><FiUser size={11} /> {p.cliente?.nombre}</span>
                      <span><FiCalendar size={11} /> {fmtFecha(p.fecha)}</span>
                      <span><FiPackage size={11} /> {p.detalles?.length} producto(s)</span>
                    </div>
                  </div>

                  <strong className="ap-card-total">{fmtPrecio(p.total)}</strong>

                  <select value={p.estado}
                    onChange={e => { e.stopPropagation(); cambiarEstado(p.id_pedido, e.target.value) }}
                    onClick={e => e.stopPropagation()}
                    className="ap-estado-select">
                    <option value="en_proceso">En proceso</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>

                  <span className="ap-chevron">{isExp ? "▲" : "▼"}</span>
                </div>

                {/* Detalle expandido */}
                {isExp && (
                  <div className="ap-card-detalle">
                    {p.detalles?.map(d => (
                      <div key={d.id_detalle} className="ap-detalle-row">
                        <span>{d.producto?.nombre_producto} x{d.cantidad}</span>
                        <span>{fmtPrecio(Number(d.precio_unit) * d.cantidad)}</span>
                      </div>
                    ))}
                    {p.nota && <p className="ap-nota">📝 {p.nota}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}