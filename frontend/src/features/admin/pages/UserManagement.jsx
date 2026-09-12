import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import { adminService } from "@/features/admin/services/admin.service"

import { TablaEmprendedoras }    from "../components/users/TablaEmprendedoras"
import { ModalConfirmarAccion }  from "../components/users/ModalConfirmarAccion"
import { ModalFotoDocumento }    from "../components/users/ModalFotoDocumento"

import "@/infrastructure/css/auth/CrudAdmin.css"

const esPendiente = u => u.rol === "emprendedora" && !u.activo

export default function UserManagement() {
  const { user } = useAuth()

  const [listaUsuarios, setListaUsuarios] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [busqueda, setBusqueda]           = useState("")
  const [filtro, setFiltro]               = useState("Todos")
  const [toast, setToast]                 = useState(null)
  const [modalData, setModalData]         = useState(null)
  const [fotoModal, setFotoModal]         = useState(null)
  const [pagina, setPagina]               = useState(1)

  useEffect(() => {
    adminService.listarUsuarios()
      .then(setListaUsuarios)
      .catch(() => mostrarToast("Error al cargar usuarios"))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { setPagina(1) }, [busqueda, filtro])

  const mostrarToast = (mensaje, tipo = "ok") => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const aprobar = async id => {
    await adminService.aprobarEmprendedora(id)
    setListaUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: true } : u))
    mostrarToast("Emprendedora aprobada correctamente")
  }

  const rechazar = async id => {
    await adminService.rechazarEmprendedora(id)
    setListaUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol: "usuario", activo: false } : u))
    mostrarToast("Solicitud rechazada")
  }

  const toggleActivo = async id => {
    const res = await adminService.toggleEstado(id)
    setListaUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: res.usuario.activo } : u))
    mostrarToast(res.message)
  }

  const ejecutarAccion = async () => {
    if (!modalData) return
    const { usuario, tipo } = modalData
    try {
      if (tipo === "aprobar")  await aprobar(usuario.id)
      if (tipo === "rechazar") await rechazar(usuario.id)
      if (tipo === "toggle")   await toggleActivo(usuario.id)
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al ejecutar acción", "error")
    }
    setModalData(null)
  }

  const handleAccion = (usuario, tipo) => setModalData({ usuario, tipo })

  const usuariosFiltrados = listaUsuarios.filter(u => {
    if (u.rol !== "emprendedora") return false
    const matchBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
    const matchFiltro =
      filtro === "Todos"        ? true
      : filtro === "Pendiente"  ? esPendiente(u)
      : filtro === "Aprobado"   ? u.rol === "emprendedora" && u.activo
      : filtro === "Desactivado"? !u.activo && !esPendiente(u)
      : true
    return matchBusqueda && matchFiltro
  })

  if (user?.rol !== "admin") return <h2>No autorizado</h2>
  if (cargando) return <p>Cargando usuarios...</p>

  return (
    <div className="crud-admin">
      {toast && (
        <div className={`crud-toast ${toast.tipo === "error" ? "toast-error" : "toast-ok"}`}>
          {toast.mensaje}
        </div>
      )}

      <div className="crud-header">
        <h1>Solicitudes de Emprendedoras</h1>
      </div>

      <div className="crud-filtros">
        <div className="crud-search-bar">
          <span className="crud-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input type="text" className="crud-search-input"
            placeholder="Buscar por nombre o email..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)}
          className="crud-select">
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente aprobación</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Desactivado">Desactivado</option>
        </select>
      </div>

      <TablaEmprendedoras
        usuarios={usuariosFiltrados}
        pagina={pagina}
        setPagina={setPagina}
        onAccion={handleAccion}
        onVerDocumento={setFotoModal}
      />

      <ModalConfirmarAccion
        modalData={modalData}
        onConfirmar={ejecutarAccion}
        onCerrar={() => setModalData(null)}
      />

      <ModalFotoDocumento
        usuario={fotoModal}
        esPendiente={esPendiente}
        onCerrar={() => setFotoModal(null)}
        onAccion={(u, tipo) => { setModalData({ usuario: u, tipo }); setFotoModal(null) }}
      />
    </div>
  )
}
