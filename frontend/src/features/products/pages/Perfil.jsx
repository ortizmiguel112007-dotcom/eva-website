import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { perfilService } from "@/features/products/services/perfil.service"
import { useAuth } from "@/core/context/AuthConten"
import { FaRegUserCircle, FaPhone, FaEdit } from "@/infrastructure/icons/index.js"
import { MdEmail, IoMdLock } from "@/infrastructure/icons/index.js"
import "@/infrastructure/css/perfil.css"

export default function Perfil() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "",
    datos_bancarios: "", password: "", confirmarPassword: "",
  })
  const [errors, setErrors]       = useState({})
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast]         = useState(null)
  const [cargando, setCargando]   = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await perfilService.obtener()
        setForm(prev => ({
          ...prev,
          nombre:   data.nombre   || "",
          email:    data.email    || "",
          telefono: data.telefono || "",
        }))
      } catch (err) { console.error("Error perfil:", err) }

      try {
        const emp = await perfilService.obtenerEmprendedora()
        setForm(prev => ({ ...prev, datos_bancarios: emp.datos_bancarios || "" }))
      } catch {}

      setCargando(false)
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
    const newErrors = {}
    if (!form.nombre.trim())   newErrors.nombre   = "El nombre es obligatorio"
    if (!form.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio"
    if (form.password && form.password.length < 8)
      newErrors.password = "Mínimo 8 caracteres"
    if (form.password && form.password !== form.confirmarPassword)
      newErrors.confirmarPassword = "Las contraseñas no coinciden"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGuardar = async () => {
    if (!validar()) return
    setGuardando(true)
    try {
      const data = { nombre: form.nombre, telefono: form.telefono }
      if (form.password) data.password = form.password
      await perfilService.actualizar(data)
      if (form.datos_bancarios !== undefined) {
        await perfilService.actualizarDatosBancarios(form.datos_bancarios)
      }
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

          <div className="perfil-avatar-section">
            <div className="perfil-avatar">{initials}</div>
            <div className="perfil-avatar-info">
              <h3>{form.nombre}</h3>
              <span>{user?.rol === "emprendedora" ? "Emprendedora" : user?.rol}</span>
            </div>
          </div>

          <div className="perfil-inputs">
            <p className="perfil-section-title">Información personal</p>

            <div className="perfil-input-row">
              <FaEdit />
              <label>Nombre</label>
              <input name="nombre" type="text" value={form.nombre}
                onChange={handleChange} placeholder="Tu nombre completo" />
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
              <input name="telefono" type="text" value={form.telefono}
                onChange={handleChange} placeholder="Tu teléfono" />
            </div>
            {errors.telefono && <span className="perfil-error">{errors.telefono}</span>}

            <hr className="perfil-sep" />
            <p className="perfil-section-title">Datos bancarios</p>
            <div className="perfil-input-row" style={{ alignItems: "flex-start" }}>
              <span style={{ paddingTop: "0.5rem" }}></span>
              <label style={{ paddingTop: "0.5rem" }}>Cuenta</label>
              <textarea
                name="datos_bancarios"
                value={form.datos_bancarios}
                onChange={handleChange}
                placeholder={"Bancolombia - Cuenta Ahorros 123-456789-00\nTitular: Tu nombre"}
                rows={3}
                style={{ width: "100%", resize: "vertical", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid #e5e7eb", fontFamily: "inherit", fontSize: "0.88rem" }}
              />
            </div>
            <span className="perfil-hint">Estos datos se mostrarán al cliente al confirmar su pedido</span>

            <hr className="perfil-sep" />
            <p className="perfil-section-title">Cambiar contraseña</p>

            <div className="perfil-input-row">
              <IoMdLock />
              <label>Nueva clave</label>
              <input name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Mínimo 8 caracteres" />
            </div>
            {errors.password && <span className="perfil-error">{errors.password}</span>}

            <div className="perfil-input-row">
              <IoMdLock />
              <label>Confirmar</label>
              <input name="confirmarPassword" type="password" value={form.confirmarPassword}
                onChange={handleChange} placeholder="Repite la contraseña" />
            </div>
            {errors.confirmarPassword && <span className="perfil-error">{errors.confirmarPassword}</span>}
          </div>

          <div className="perfil-buttons">
            <button className="btn-cancelar-perfil" onClick={() => navigate("/dashboard")}>
              Cancelar
            </button>
            <button className="btn-guardar-perfil" onClick={handleGuardar} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      {toast && <div className={`perfil-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}
