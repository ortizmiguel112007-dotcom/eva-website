import { createContext, useContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import axios from "axios"

const AuthContext = createContext()
const API_URL = import.meta.env.VITE_API_URL

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"))

  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem("token")
      if (!t) return null
      const decoded = jwtDecode(t)
      return { ...decoded, nombre: decoded.nombre?.trim() }  // ✅
    } catch {
      return null
    }
  })

  const [idSeccion, setIdSeccion] = useState(() => {
    const saved = localStorage.getItem("id_seccion")
    return saved ? Number(saved) : null
  })

  const [idEmprendedora, setIdEmprendedora] = useState(() => {
    const saved = localStorage.getItem("id_emprendedora")
    return saved ? Number(saved) : null
  })

  useEffect(() => {
    const t = localStorage.getItem("token")
    const seccion = localStorage.getItem("id_seccion")
    const decoded = t ? jwtDecode(t) : null
    if (t && !seccion && decoded?.rol === "emprendedora") {
      cargarSeccion(t)
    }
  }, [])

  const cargarSeccion = async (t) => {
    try {
      const decoded = jwtDecode(t)
      if (decoded.rol !== "emprendedora") return
      const res = await axios.get(
        `${API_URL}/api/emprendedora/mi-seccion`,
        { headers: { Authorization: `Bearer ${t}` } }
      )
      const { id_seccion, id_emprendedora } = res.data
      localStorage.setItem("id_seccion", id_seccion)
      localStorage.setItem("id_emprendedora", id_emprendedora)
      setIdSeccion(id_seccion)
      setIdEmprendedora(id_emprendedora)
    } catch (err) {
      console.error("No se pudo cargar la sección:", err)
    }
  }

  const login = async (t) => {
    localStorage.setItem("token", t)
    setToken(t)
    const decoded = jwtDecode(t)
    setUser({ ...decoded, nombre: decoded.nombre?.trim() })  // ✅
    await cargarSeccion(t)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("id_seccion")
    localStorage.removeItem("id_emprendedora")
    localStorage.removeItem("carrito_local")
    setUser(null)
    setToken(null)
    setIdSeccion(null)
    setIdEmprendedora(null)
  }

  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(prev => ({ ...prev, nombre: res.data.nombre?.trim() || prev.nombre }))  // ✅
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, idSeccion, idEmprendedora, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)