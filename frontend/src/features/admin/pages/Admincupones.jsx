import { useState, useEffect } from "react"
import axios from "axios"
import { FiTag, FiSearch, FiX, FiTrash2, FiToggleLeft, FiToggleRight, FiPlus } from "react-icons/fi"
import { RiCoupon3Line } from "react-icons/ri"
import "@/infrastructure/css/AdminCupones.css"

const BASE = "http://localhost:3000"
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })
const formatPrecio = p => "$" + Number(p).toLocaleString("es-CO")
const formatFecha = f => f
  ? new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
  : "Sin vencimiento"

export default function AdminCupones() {
  const [cupones, setCupones]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro]     = useState("todos")
  const [toast, setToast]       = useState(null)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState({
    codigo: "", tipo: "porcentaje", valor: "",
    descripcion: "", fecha_fin: "", limite_usos: ""
  })
  const [creando, setCreando] = useState(false)

  const cargar = async () => {
    try {
      const res = await axios.get(`${BASE}/api/cupones`, { headers: headers() })
      setCupones(Array.isArray(res.data) ? res.data : [])
    } catch { setCupones([]) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleCupon = async (id, activo) => {
    try {
      await axios.put(`${BASE}/api/cupones/${id}/toggle`, {}, { headers: headers() })
      setCupones(prev => prev.map(c => c.id_cupon === id ? { ...c, activo: !activo } : c))
      mostrarToast(activo ? "Cupón desactivado" : "Cupón activado")
    } catch { mostrarToast("Error", "error") }
  }

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este cupón?")) return
    try {
      await axios.delete(`${BASE}/api/cupones/${id}`, { headers: headers() })
      setCupones(prev => prev.filter(c => c.id_cupon !== id))
      mostrarToast("Cupón eliminado")
    } catch { mostrarToast("Error", "error") }
  }

  const handleCrear = async () => {
    if (!form.codigo || !form.valor) { mostrarToast("Código y valor son requeridos", "error"); return }
    setCreando(true)
    try {
      const res = await axios.post(`${BASE}/api/cupones`, {
        ...form,
        valor: Number(form.valor),
        limite_usos: form.limite_usos ? Number(form.limite_usos) : null,
        fecha_fin: form.fecha_fin || null,
      }, { headers: headers() })
      setCupones(prev => [res.data, ...prev])
      setModal(false)
      setForm({ codigo: "", tipo: "porcentaje", valor: "", descripcion: "", fecha_fin: "", limite_usos: "" })
      mostrarToast("Cupón creado")
    } catch (err) { mostrarToast(err.response?.data?.error || "Error", "error") }
    finally { setCreando(false) }
  }

  const filtrados = cupones.filter(c => {
    const matchB = c.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" ? true : filtro === "activos" ? c.activo : !c.activo
    return matchB && matchF
  })

  return (
    <div className="ac-page">

      {/* Toast */}
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
        {[
          { label: "Total",    valor: cupones.length,                        color: "#1e293b" },
          { label: "Activos",  valor: cupones.filter(c => c.activo).length,  color: "#16a34a" },
          { label: "Inactivos",valor: cupones.filter(c => !c.activo).length, color: "#ef4444" },
        ].map(m => (
          <div key={m.label} className="ac-metrica">
            <p className="ac-metrica-label">{m.label}</p>
            <strong className="ac-metrica-valor" style={{ color: m.color }}>{m.valor}</strong>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="ac-filtros">
        <div className="ac-search">
          <FiSearch size={14} color="#94a3b8" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar cupón..." className="ac-search-input" />
          {busqueda && (
            <button onClick={() => setBusqueda("")} className="ac-search-clear">
              <FiX size={13} />
            </button>
          )}
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} className="ac-select">
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      {/* Lista */}
      {cargando ? (
        <p className="ac-cargando">Cargando...</p>
      ) : (
        <div className="ac-lista">
          {filtrados.length === 0 ? (
            <div className="ac-empty">
              <RiCoupon3Line size={40} color="#e5e7eb" />
              <p>No hay cupones</p>
            </div>
          ) : filtrados.map(c => (
            <div key={c.id_cupon} className="ac-card">
              <div className="ac-card-stripe" style={{ background: c.activo ? "#6366f1" : "#e5e7eb" }} />

              <div className="ac-card-icono">
                <RiCoupon3Line size={18} color="#6366f1" />
              </div>

              <div className="ac-card-info">
                <div className="ac-card-top">
                  <span className="ac-card-codigo">{c.codigo}</span>
                  <span className={`ac-badge ${c.activo ? "activo" : "inactivo"}`}>
                    {c.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="ac-card-meta">
                  <span><FiTag size={11} /> {c.tipo === "porcentaje" ? `${c.valor}% OFF` : `${formatPrecio(c.valor)} OFF`}</span>
                  <span>Vence: {formatFecha(c.fecha_fin)}</span>
                  {c.limite_usos && <span>Usos: {c.usos}/{c.limite_usos}</span>}
                  {c.descripcion && <span>{c.descripcion}</span>}
                </div>
              </div>

              <div className="ac-card-acciones">
                <button onClick={() => toggleCupon(c.id_cupon, c.activo)} className="ac-btn-toggle">
                  {c.activo
                    ? <><FiToggleRight size={14} color="#16a34a" /> Desactivar</>
                    : <><FiToggleLeft size={14} color="#94a3b8" /> Activar</>
                  }
                </button>
                <button onClick={() => eliminar(c.id_cupon)} className="ac-btn-eliminar">
                  <FiTrash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear */}
      {modal && (
        <div className="ac-modal-overlay" onClick={() => setModal(false)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            <div className="ac-modal-header">
              <h3>Crear nuevo cupón</h3>
              <button onClick={() => setModal(false)} className="ac-modal-close"><FiX size={16} /></button>
            </div>

            <div className="ac-modal-body">
              {[
                { label: "Código *", name: "codigo", type: "text", placeholder: "Ej: DESC10" },
                { label: "Valor *", name: "valor", type: "number", placeholder: "Ej: 10" },
                { label: "Descripción", name: "descripcion", type: "text", placeholder: "Ej: 10% de descuento" },
                { label: "Fecha de vencimiento", name: "fecha_fin", type: "date", placeholder: "" },
                { label: "Límite de usos", name: "limite_usos", type: "number", placeholder: "Ej: 100" },
              ].map(f => (
                <div key={f.name} className="ac-form-field">
                  <label>{f.label}</label>
                  <input type={f.type} value={form[f.name]} placeholder={f.placeholder}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))} />
                </div>
              ))}

              <div className="ac-form-field">
                <label>Tipo de descuento</label>
                <select value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}>
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="valor_fijo">Valor fijo ($)</option>
                </select>
              </div>
            </div>

            <div className="ac-modal-footer">
              <button onClick={() => setModal(false)} className="ac-btn-cancelar">Cancelar</button>
              <button onClick={handleCrear} disabled={creando} className="ac-btn-crear">
                {creando ? "Creando..." : "Crear cupón"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}