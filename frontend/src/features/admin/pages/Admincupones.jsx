import { useState, useEffect } from "react"
import axios from "axios"
import {
  FiSearch, FiX, FiTag, FiPlus, FiToggleLeft,
  FiToggleRight, FiTrash2, FiCalendar, FiUser, FiPercent
} from "react-icons/fi"
import "@/infrastructure/css/AdminCupones.css"

const BASE = "http://localhost:3000"
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })

const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", {
  day: "2-digit", month: "short", year: "numeric"
}) : "Sin límite"

const fmtValor = (tipo, valor) =>
  tipo === "porcentaje" ? `${valor}%` : "$" + Number(valor).toLocaleString("es-CO")

export default function AdminCupones() {
  const [cupones, setCupones]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState({
    codigo: "", tipo: "porcentaje", valor: "",
    descripcion: "", fecha_fin: "", limite_usos: ""
  })
  const [guardando, setGuardando] = useState(false)

  const cargar = async () => {
    try {
      const res = await axios.get(`${BASE}/api/admin/cupones`, { headers: hdrs() })
      setCupones(Array.isArray(res.data) ? res.data : [])
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleCupon = async (id, activo) => {
    try {
      await axios.put(`${BASE}/api/cupones/${id}/toggle`, {}, { headers: hdrs() })
      setCupones(prev => prev.map(c => c.id_cupon === id ? { ...c, activo: !activo } : c))
      mostrarToast(activo ? "Cupón desactivado" : "Cupón activado")
    } catch { mostrarToast("Error al cambiar estado", "error") }
  }

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este cupón?")) return
    try {
      await axios.delete(`${BASE}/api/cupones/${id}`, { headers: hdrs() })
      setCupones(prev => prev.filter(c => c.id_cupon !== id))
      mostrarToast("Cupón eliminado")
    } catch { mostrarToast("Error al eliminar", "error") }
  }

  const crearCupon = async () => {
    if (!form.codigo || !form.valor) return mostrarToast("Código y valor son obligatorios", "error")
    setGuardando(true)
    try {
      await axios.post(`${BASE}/api/cupones`, {
        ...form,
        valor: Number(form.valor),
        limite_usos: form.limite_usos ? Number(form.limite_usos) : null,
        fecha_fin: form.fecha_fin || null,
      }, { headers: hdrs() })
      mostrarToast("Cupón creado")
      setModal(false)
      setForm({ codigo: "", tipo: "porcentaje", valor: "", descripcion: "", fecha_fin: "", limite_usos: "" })
      cargar()
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al crear", "error")
    } finally { setGuardando(false) }
  }

  const filtrados = cupones.filter(c => {
    const matchB = c.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" ? true : filtro === "activos" ? c.activo : !c.activo
    return matchB && matchF
  })

  const isVencido = (c) => c.fecha_fin && new Date() > new Date(c.fecha_fin)
  const isAgotado = (c) => c.limite_usos && c.usos >= c.limite_usos

  const getBadgeEstado = (c) => {
    if (isVencido(c)) return { cls: "ac-badge--vencido",  label: "Vencido"  }
    if (isAgotado(c)) return { cls: "ac-badge--agotado",  label: "Agotado"  }
    if (c.activo)     return { cls: "ac-badge--activo",   label: "Activo"   }
    return               { cls: "ac-badge--inactivo", label: "Inactivo" }
  }

  return (
    <div className="ac-page">

      {toast && <div className={`ac-toast ${toast.tipo}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="ac-header">
        <div>
          <h1 className="ac-titulo">Cupones</h1>
          <p className="ac-sub">Gestiona todos los cupones de descuento de la plataforma</p>
        </div>
        <button className="ac-btn-nuevo" onClick={() => setModal(true)}>
          <FiPlus size={15} /> Nuevo cupón
        </button>
      </div>

      {/* Métricas */}
      <div className="ac-metricas">
        <div className="ac-metrica ac-metrica--total">
          <p className="ac-metrica-label">Total</p>
          <strong className="ac-metrica-valor">{cupones.length}</strong>
        </div>
        <div className="ac-metrica ac-metrica--activo">
          <p className="ac-metrica-label">Activos</p>
          <strong className="ac-metrica-valor">{cupones.filter(c => c.activo).length}</strong>
        </div>
        <div className="ac-metrica ac-metrica--inactivo">
          <p className="ac-metrica-label">Inactivos</p>
          <strong className="ac-metrica-valor">{cupones.filter(c => !c.activo).length}</strong>
        </div>
      </div>

      {/* Filtros */}
      <div className="ac-filtros">
        <div className="ac-search">
          <FiSearch size={14} color="#94a3b8" />
          <input className="ac-search-input" value={busqueda}
            onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cupón..." />
          {busqueda && (
            <button className="ac-search-clear" onClick={() => setBusqueda("")}>
              <FiX size={13} />
            </button>
          )}
        </div>
        <select className="ac-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      <p className="ac-contador">Mostrando {filtrados.length} de {cupones.length} cupones</p>

      {/* Lista */}
      {cargando ? (
        <p className="ac-cargando">Cargando cupones...</p>
      ) : filtrados.length === 0 ? (
        <div className="ac-empty">
          <FiTag size={40} color="#e5e7eb" />
          <p>No hay cupones</p>
        </div>
      ) : (
        <div className="ac-lista">
          {filtrados.map(c => {
            const badge   = getBadgeEstado(c)
            const esActivo = c.activo && !isVencido(c) && !isAgotado(c)
            return (
              <div key={c.id_cupon}
                className={`ac-card ${esActivo ? "ac-card--activo" : "ac-card--inactivo-borde"} ${!c.activo ? "ac-card--inactivo" : ""}`}>

                <div className={`ac-card-icono ac-card-icono--${c.tipo === "porcentaje" ? "porcentaje" : "fijo"}`}>
                  {c.tipo === "porcentaje"
                    ? <FiPercent size={16} color="#3b82f6" />
                    : <FiTag size={16} color="#16a34a" />}
                </div>

                <div className="ac-card-info">
                  <div className="ac-card-titulo">
                    <span className="ac-codigo">{c.codigo}</span>
                    <span className={`ac-badge ${badge.cls}`}>{badge.label}</span>
                    <span className={`ac-badge-tipo ac-badge-tipo--${c.tipo === "porcentaje" ? "porcentaje" : "fijo"}`}>
                      {fmtValor(c.tipo, c.valor)} OFF
                    </span>
                  </div>
                  <div className="ac-card-meta">
                    {c.descripcion && <span>{c.descripcion}</span>}
                    <span><FiCalendar size={11} /> Vence: {fmtFecha(c.fecha_fin)}</span>
                    <span><FiUser size={11} /> {c.usuario?.nombre}</span>
                    {c.limite_usos && <span>{c.usos}/{c.limite_usos} usos</span>}
                  </div>
                </div>

                <div className="ac-card-acciones">
                  <button className="ac-btn-toggle"
                    onClick={() => toggleCupon(c.id_cupon, c.activo)}
                    title={c.activo ? "Desactivar" : "Activar"}>
                    {c.activo
                      ? <FiToggleRight size={22} color="#16a34a" />
                      : <FiToggleLeft  size={22} color="#94a3b8" />}
                  </button>
                  <button className="ac-btn-eliminar" onClick={() => eliminar(c.id_cupon)}>
                    <FiTrash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="ac-modal-overlay" onClick={() => setModal(false)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            <h3>Nuevo Cupón</h3>
            {[
              { label: "Código*",              key: "codigo",      placeholder: "Ej: DESCUENTO20", upper: true },
              { label: "Descripción",          key: "descripcion", placeholder: "Descripción opcional" },
              { label: "Valor*",               key: "valor",       placeholder: "Ej: 20", type: "number" },
              { label: "Fecha de vencimiento", key: "fecha_fin",   type: "date" },
              { label: "Límite de usos",       key: "limite_usos", placeholder: "Sin límite", type: "number" },
            ].map(f => (
              <div key={f.key} className="ac-field">
                <label>{f.label}</label>
                <input type={f.type || "text"} value={form[f.key]}
                  placeholder={f.placeholder}
                  onChange={e => setForm(prev => ({
                    ...prev, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value
                  }))} />
              </div>
            ))}
            <div className="ac-field">
              <label>Tipo*</label>
              <select value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}>
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="valor_fijo">Valor fijo ($)</option>
              </select>
            </div>
            <div className="ac-modal-btns">
              <button className="ac-btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
              <button className="ac-btn-guardar" onClick={crearCupon} disabled={guardando}>
                {guardando ? "Creando..." : "Crear cupón"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}