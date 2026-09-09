import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { FaPlus, FaTimes } from "@/infrastructure/icons/index.js"

import { TablaUsuariosAdmin } from "../components/users/TablaUsuariosAdmin"
import { ModalUsuarioAdmin } from "../components/users/ModalUsuarioAdmin"
import { ModalConfirmarToggle } from "../components/users/ModalConfirmarToggle"

import "@/infrastructure/css/auth/CrudAdmin.css"

const BASE_URL = import.meta.env.VITE_API_URL + "/admin" || "http://localhost:3000/admin"
const getToken = () => localStorage.getItem("token")
const EMPTY_FORM = { nombre: "", email: "", telefono: "", password: "" }
const PAGE_SIZE = 10

export default function CrudAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editandoId, setEditandoId] = useState(null)
  const [modalAbierto, setModal] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [cargando, setCargando] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [busqueda, setBusqueda] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)

  const headers = { Authorization: `Bearer ${getToken()}` }

  const cargarUsuarios = () => {
    axios.get(`${BASE_URL}/usuarios`, { headers })
      .then(res => setUsuarios(res.data))
      .catch(() => mostrarMensaje("Error al cargar los usuarios", "error"))
  }

  useEffect(() => { cargarUsuarios() }, [])
  useEffect(() => { setPaginaActual(1) }, [busqueda])

  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3500)
  }

  const usuariosFiltrados = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    if (!t) return usuarios
    return usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t)
    )
  }, [usuarios, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / PAGE_SIZE))

  const usuariosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * PAGE_SIZE
    return usuariosFiltrados.slice(inicio, inicio + PAGE_SIZE)
  }, [usuariosFiltrados, paginaActual])

  const paginasVisibles = useMemo(() => {
    const delta = 2, rango = []
    for (let i = Math.max(1, paginaActual - delta); i <= Math.min(totalPaginas, paginaActual + delta); i++)
      rango.push(i)
    return rango
  }, [paginaActual, totalPaginas])

  const irAPagina = n => { if (n >= 1 && n <= totalPaginas) setPaginaActual(n) }

  const abrirModalCrear = () => { setForm(EMPTY_FORM); setEditandoId(null); setModal(true) }
  const abrirModalEditar = u => {
    setForm({ nombre: u.nombre || "", email: u.email || "", telefono: u.telefono || "", password: "" })
    setEditandoId(u.id); setModal(true)
  }
  const cerrarModal = () => { setModal(false); setForm(EMPTY_FORM); setEditandoId(null) }
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleCrear = async e => {
    e.preventDefault(); setCargando(true)
    try {
      await axios.post(`${BASE_URL}/usuarios`, form, { headers })
      mostrarMensaje("Usuario creado correctamente"); cerrarModal(); cargarUsuarios()
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || "Error al crear el usuario", "error")
    } finally { setCargando(false) }
  }

  const handleActualizar = async e => {
    e.preventDefault(); setCargando(true)
    const payload = { nombre: form.nombre, email: form.email, telefono: form.telefono }
    if (form.password) payload.password = form.password
    try {
      await axios.put(`${BASE_URL}/usuarios/${editandoId}`, payload, { headers })
      mostrarMensaje("Usuario actualizado correctamente"); cerrarModal(); cargarUsuarios()
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || "Error al actualizar el usuario", "error")
    } finally { setCargando(false) }
  }

  const handleToggleEstado = async () => {
    if (!confirmToggle) return; setCargando(true)
    try {
      await axios.patch(`${BASE_URL}/usuarios/${confirmToggle.id}/estado`, {}, { headers })
      mostrarMensaje(confirmToggle.activo
        ? `Usuario "${confirmToggle.nombre}" inhabilitado`
        : `Usuario "${confirmToggle.nombre}" habilitado`)
      setConfirmToggle(null); cargarUsuarios()
    } catch (err) {
      mostrarMensaje(err.response?.data?.error || "Error al cambiar el estado", "error")
    } finally { setCargando(false) }
  }

  return (
    <section className="crud-admin">
      <div className="crud-header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-primary" onClick={abrirModalCrear}>
          <FaPlus /> Nuevo usuario
        </button>
      </div>

      {mensaje.texto && (
        <div className={`crud-toast ${mensaje.tipo === "error" ? "toast-error" : "toast-ok"}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="crud-search-bar crud-search-bar--full">
        <span className="crud-search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input type="text" className="crud-search-input"
          placeholder="Buscar por nombre o correo..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        {busqueda && (
          <button className="crud-search-clear" onClick={() => setBusqueda("")} title="Limpiar búsqueda">
            <FaTimes />
          </button>
        )}
      </div>

      <TablaUsuariosAdmin
        usuarios={usuariosPagina}
        paginaActual={paginaActual}
        busqueda={busqueda}
        onEditar={abrirModalEditar}
        onToggle={setConfirmToggle}
      />

      {/* Paginación con ellipsis */}
      {totalPaginas > 1 && (
        <div className="crud-pagination">
          <span className="pagination-info">
            {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
            {busqueda ? " encontrados" : ""} · Página {paginaActual} de {totalPaginas}
          </span>
          <div className="pagination-controls">
            <button className="page-btn page-btn-arrow" onClick={() => irAPagina(1)} disabled={paginaActual === 1}>«</button>
            <button className="page-btn page-btn-arrow" onClick={() => irAPagina(paginaActual - 1)} disabled={paginaActual === 1}>‹</button>
            {paginasVisibles[0] > 1 && (
              <>
                <button className="page-btn" onClick={() => irAPagina(1)}>1</button>
                {paginasVisibles[0] > 2 && <span className="page-ellipsis">…</span>}
              </>
            )}
            {paginasVisibles.map(n => (
              <button key={n} className={`page-btn ${n === paginaActual ? "page-btn-active" : ""}`} onClick={() => irAPagina(n)}>{n}</button>
            ))}
            {paginasVisibles[paginasVisibles.length - 1] < totalPaginas && (
              <>
                {paginasVisibles[paginasVisibles.length - 1] < totalPaginas - 1 && <span className="page-ellipsis">…</span>}
                <button className="page-btn" onClick={() => irAPagina(totalPaginas)}>{totalPaginas}</button>
              </>
            )}
            <button className="page-btn page-btn-arrow" onClick={() => irAPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>›</button>
            <button className="page-btn page-btn-arrow" onClick={() => irAPagina(totalPaginas)} disabled={paginaActual === totalPaginas}>»</button>
          </div>
        </div>
      )}

      {modalAbierto && (
        <ModalUsuarioAdmin
          form={form}
          editandoId={editandoId}
          cargando={cargando}
          onChange={handleChange}
          onSubmit={editandoId ? handleActualizar : handleCrear}
          onCerrar={cerrarModal}
        />
      )}

      <ModalConfirmarToggle
        usuario={confirmToggle}
        cargando={cargando}
        onConfirmar={handleToggleEstado}
        onCerrar={() => setConfirmToggle(null)}
      />
    </section>
  )
}

