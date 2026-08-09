import { useState, useEffect } from "react"
import axios from "axios"
import { FiSearch, FiX, FiTag, FiPlus } from "react-icons/fi"

import { CuponAdminCard }       from "../components/cupones/CuponAdminCard"
import { ModalNuevoCuponAdmin } from "../components/cupones/ModalNuevoCuponAdmin"
import { getHeaders }           from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/cupones/AdminCupones.css"

const BASE        = "http://localhost:3000"
const FORM_INICIAL = { codigo: "", tipo: "porcentaje", valor: "", descripcion: "", fecha_fin: "", limite_usos: "" }

export default function AdminCupones() {
  const [cupones, setCupones]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)

  const cargar = () => {
    axios.get(`${BASE}/api/admin/cupones`, { headers: getHeaders() })
      .then(res => setCupones(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleCupon = async (id, activo) => {
    try {
      await axios.put(`${BASE}/api/cupones/${id}/toggle`, {}, { headers: getHeaders() })
      setCupones(prev => prev.map(c => c.id_cupon === id ? { ...c, activo: !activo } : c))
      mostrarToast(activo ? "Cupón desactivado" : "Cupón activado")
    } catch { mostrarToast("Error al cambiar estado", "error") }
  }

  const eliminar = async id => {
    if (!confirm("¿Eliminar este cupón?")) return
    try {
      await axios.delete(`${BASE}/api/cupones/${id}`, { headers: getHeaders() })
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
        valor:       Number(form.valor),
        limite_usos: form.limite_usos ? Number(form.limite_usos) : null,
        fecha_fin:   form.fecha_fin || null,
      }, { headers: getHeaders() })
      mostrarToast("Cupón creado")
      setModal(false)
      setForm(FORM_INICIAL)
      cargar()
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al crear", "error")
    } finally { setGuardando(false) }
  }

  const filtrados = cupones.filter(c => {
    const matchB =
      c.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" ? true : filtro === "activos" ? c.activo : !c.activo
    return matchB && matchF
  })

  return (
    <div className="ac-page">
      {toast && <div className={`ac-toast ${toast.tipo}`}>{toast.msg}</div>}

      <div className="ac-header">
        <div>
          <h1 className="ac-titulo">Cupones</h1>
          <p className="ac-sub">Gestiona todos los cupones de descuento de la plataforma</p>
        </div>
        <button className="ac-btn-nuevo" onClick={() => setModal(true)}>
          <FiPlus size={15} /> Nuevo cupón
        </button>
      </div>

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

      {cargando ? (
        <p className="ac-cargando">Cargando cupones...</p>
      ) : filtrados.length === 0 ? (
        <div className="ac-empty">
          <FiTag size={40} color="#e5e7eb" />
          <p>No hay cupones</p>
        </div>
      ) : (
        <div className="ac-lista">
          {filtrados.map(c => (
            <CuponAdminCard
              key={c.id_cupon}
              cupon={c}
              onToggle={toggleCupon}
              onEliminar={eliminar}
            />
          ))}
        </div>
      )}

      {modal && (
        <ModalNuevoCuponAdmin
          form={form}
          setForm={setForm}
          guardando={guardando}
          onCrear={crearCupon}
          onCerrar={() => { setModal(false); setForm(FORM_INICIAL) }}
        />
      )}
    </div>
  )
}