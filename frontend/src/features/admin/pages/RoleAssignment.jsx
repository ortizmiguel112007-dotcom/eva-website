import { useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import { useAuth } from "@/core/context/AuthConten"
import { adminService } from "@/features/admin/services/admin.service"

import { UsuarioRolCard } from "../components/roles/UsuarioRolCard"
import { PaginacionSimple } from "@/features/usuario/components/historial/PaginacionSimple"

import "@/infrastructure/css/admin/roles/RoleAssignment.css"
import "@/infrastructure/css/auth/CrudAdmin.css"

const POR_PAGINA = 10

export default function RoleAssignment() {
  const { login } = useAuth()

  const [usuarios, setUsuarios]               = useState([])
  const [cargando, setCargando]               = useState(true)
  const [rolesTemporales, setRolesTemporales] = useState({})
  const [toast, setToast]                     = useState(null)
  const [busqueda, setBusqueda]               = useState("")
  const [pagina, setPagina]                   = useState(1)

  useEffect(() => {
    adminService.listarUsuarios()
      .then(setUsuarios)
      .catch(() => mostrarToast("Error al cargar usuarios", "error"))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { setPagina(1) }, [busqueda])

  const mostrarToast = (mensaje, tipo = "ok") => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCambio = (id, nuevoRol) => {
    setRolesTemporales(prev => ({ ...prev, [id]: nuevoRol }))
  }

  const guardarRol = async id => {
    const nuevoRol = rolesTemporales[id]
    if (!nuevoRol) return mostrarToast("No hay cambios para guardar", "error")

    try {
      const res = await adminService.cambiarRol(id, nuevoRol)

      if (res.nuevoToken) {
        const tokenActual = localStorage.getItem("token")
        if (tokenActual) {
          const decoded = jwtDecode(tokenActual)
          if (decoded.id === id) {
            await login(res.nuevoToken)
            mostrarToast("Rol actualizado. Redirigiendo...")
            setTimeout(() => window.location.reload(), 1500)
            return
          }
        }
      }

      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol: res.usuario.rol } : u))
      setRolesTemporales(prev => { const c = { ...prev }; delete c[id]; return c })
      mostrarToast("Rol actualizado correctamente")
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al cambiar rol", "error")
    }
  }

  const filtrados    = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email?.toLowerCase().includes(busqueda.toLowerCase())
  )
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const pagina_items = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  if (cargando) return <p style={{ padding: "2rem", color: "#64748b" }}>Cargando usuarios...</p>

  return (
    <div className="roles-container">
      <div className="roles-card">
        <div style={{ marginBottom: "1.5rem" }}>
          <h3>Asignar Roles</h3>
          <p>Gestiona permisos y accesos de los usuarios</p>
          <div className="roles-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Buscar por nombre o correo..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="roles-search-input"
            />
          </div>
        </div>

        {filtrados.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
            No hay usuarios registrados
          </p>
        ) : pagina_items.map(u => (
          <UsuarioRolCard
            key={u.id}
            usuario={u}
            rolTemporal={rolesTemporales[u.id]}
            onChange={handleCambio}
            onGuardar={guardarRol}
          />
        ))}

        <PaginacionSimple
          pagina={pagina}
          totalPaginas={totalPaginas}
          setPagina={setPagina}
          total={filtrados.length}
          labelSingular="usuario"
          labelPlural="usuarios"
        />
      </div>

      {toast && (
        <div className={`toast-notificacion ${toast.tipo === "error" ? "toast-error" : ""}`}>
          {toast.mensaje}
        </div>
      )}
    </div>
  )
}
