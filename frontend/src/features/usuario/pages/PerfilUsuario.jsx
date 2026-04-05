import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import {
  FaRegUserCircle,
  FaPhone,
  FaEdit,
} from "@/infrastructure/icons/index.js"
import { MdEmail, IoMdLock } from "@/infrastructure/icons/index.js"
import "@/infrastructure/css/perfil.css"

export default function PerfilUsuario() {
  const { user, token } = useAuth()
  const navigate        = useNavigate()

  const [form, setForm] = useState({
    nombre:           "",
    email:            "",
    telefono:         "",
    password:         "",
    confirmarPassword: "",
  })

  const [errors, setErrors]     = useState({})
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast]         = useState(null)
  const [cargando, setCargando]   = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/perfil", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = res.data
        setForm(prev => ({
          ...prev,
          nombre:   data.nombre   || "",
          email:    data.email    || "",
          telefono: data.telefono || "",
        }))
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const mostrarToast = (msg, tipo = "success") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = "El nombre es obligatorio"
    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio"
    if (form.password && form.password.length < 8)
      e.password = "Mínimo 8 caracteres"
    if (form.password && form.password !== form.confirmarPassword)
      e.confirmarPassword = "Las contraseñas no coinciden"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleGuardar = async () => {
    if (!validar()) return
    setGuardando(true)
    try {
      const data = { nombre: form.nombre, telefono: form.telefono }
      if (form.password) data.password = form.password
      await axios.put("http://localhost:3000/api/perfil", data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setForm(prev => ({ ...prev, password: "", confirmarPassword: "" }))
      mostrarToast("Perfil actualizado correctamente")
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al actualizar", "error")
    } finally {
      setGuardando(false)
    }
  }

  const initials = form.nombre
    ? form.nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  if (cargando) return (
    <div className="perfil-wrapper">
      <div className="perfil-bg">
        <p style={{ color: "#fff" }}>Cargando perfil...</p>
      </div>
    </div>
  )

  return (
    <div className="perfil-wrapper">
      <div className="perfil-bg">
        <div className="perfil-card">

          <h2>Mi Perfil</h2>

          {/* Avatar */}
          <div className="perfil-avatar-section">
            <div className="perfil-avatar">{initials}</div>
            <div className="perfil-avatar-info">
              <h3>{form.nombre}</h3>
              <span>Cliente</span>
            </div>
          </div>

          {/* Inputs */}
          <div className="perfil-inputs">
            <p className="perfil-section-title">Información personal</p>

            <div className="perfil-input-row">
              <FaEdit />
              <label>Nombre</label>
              <input
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre completo"
              />
            </div>
            {errors.nombre && <span className="perfil-error">{errors.nombre}</span>}

            <div className="perfil-input-row">
              <MdEmail />
              <label>Correo</label>
              <input name="email" type="email" value={form.email} disabled />
            </div>
            <span className="perfil-hint">El correo no se puede cambiar</span>

            <div className="perfil-input-row">
              <FaPhone />
              <label>Teléfono</label>
              <input
                name="telefono"
                type="text"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Tu teléfono"
              />
            </div>
            {errors.telefono && <span className="perfil-error">{errors.telefono}</span>}

            <hr className="perfil-sep" />
            <p className="perfil-section-title">Cambiar contraseña</p>

            <div className="perfil-input-row">
              <IoMdLock />
              <label>Nueva clave</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            {errors.password && <span className="perfil-error">{errors.password}</span>}

            <div className="perfil-input-row">
              <IoMdLock />
              <label>Confirmar</label>
              <input
                name="confirmarPassword"
                type="password"
                value={form.confirmarPassword}
                onChange={handleChange}
                placeholder="Repite la contraseña"
              />
            </div>
            {errors.confirmarPassword && <span className="perfil-error">{errors.confirmarPassword}</span>}
          </div>

          {/* Botones */}
          <div className="perfil-buttons">
            <button className="btn-cancelar-perfil" onClick={() => navigate("/inicio")}>
              Cancelar
            </button>
            <button
              className="btn-guardar-perfil"
              onClick={handleGuardar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

        </div>
      </div>

      {toast && <div className={`perfil-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}