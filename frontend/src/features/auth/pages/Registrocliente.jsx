import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import background from "@/infrastructure/imgs/Fondo2.png"

import { CamposBase }       from "../components/registro/CamposBase"
import { PasoVerificacion } from "../components/registro/PasoVerificacion"

import "@/infrastructure/css/Registre.css"

const FORM_INICIAL = { nombre: "", email: "", password: "", confirmar: "", telefono: "" }

const validarCampos = (form) => {
  const e = {}
  const n = form.nombre.trim()
  if (!n)                                       e.nombre = "El nombre es obligatorio"
  else if (n.length < 3)                        e.nombre = "Mínimo 3 caracteres"
  else if (/\d/.test(n))                        e.nombre = "El nombre no puede contener números"
  else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}/.test(n)) e.nombre = "El nombre debe tener al menos 2 letras"
  if (!form.email.trim())    e.email    = "El correo es obligatorio"
  if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio"
  if (form.password.length < 8)               e.password = "Mínimo 8 caracteres"
  if (form.password !== form.confirmar)        e.confirmar = "Las contraseñas no coinciden"
  return e
}

export default function RegistroCliente() {
  const navigate    = useNavigate()
  const { login }   = useAuth()

  const [paso, setPaso]       = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError]     = useState("")
  const [codigo, setCodigo]   = useState("")
  const [form, setForm]       = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})

  const onChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: "" }))
    setError("")
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    const e_ = validarCampos(form)
    if (Object.keys(e_).length) { setErrores(e_); return }
    setCargando(true)
    try {
      await axios.post("http://localhost:3000/registro", {
        nombre: form.nombre.trim(), email: form.email,
        password: form.password, telefono: form.telefono, rol: "usuario",
      })
      setPaso(2)
    } catch (err) { setError(err.response?.data?.error || "Error al registrarse") }
    finally { setCargando(false) }
  }

  const handleVerificar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const res = await axios.post("http://localhost:3000/verificar", { email: form.email, codigo })
      login(res.data.token)
      navigate("/")
    } catch (err) { setError(err.response?.data?.error || "Código incorrecto") }
    finally { setCargando(false) }
  }

  return (
    <section className="container-register">
      <div className="container-img">
        <div className="container-formulario">
          <h2>Registro de Cliente</h2>

          {paso === 1 && (
            <form onSubmit={handleRegistro} className="container-form">
              <div className="container-paddin">
                <CamposBase form={form} errores={errores} onChange={onChange} />
              </div>
              {error && <p className="mensaje">{error}</p>}
              <div className="container-button">
                <button type="button" className="btn-secondary" onClick={() => navigate("/registro")}>Volver</button>
                <button type="submit" disabled={cargando}>{cargando ? "Registrando..." : "Crear cuenta"}</button>
              </div>
            </form>
          )}

          {paso === 2 && (
            <PasoVerificacion
              email={form.email} codigo={codigo} setCodigo={setCodigo}
              error={error} cargando={cargando}
              onVolver={() => setPaso(1)} onSubmit={handleVerificar}
            />
          )}
        </div>
        <div className="container-cat"><img src={background} alt="Decoración" /></div>
      </div>
    </section>
  )
}
