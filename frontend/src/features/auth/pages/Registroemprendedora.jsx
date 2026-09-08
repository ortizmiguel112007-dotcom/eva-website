import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiUpload } from "react-icons/fi"
import background from "@/infrastructure/imgs/Fondo2.png"

import { CamposBase }       from "../components/registro/CamposBase"
import { PasoVerificacion } from "../components/registro/PasoVerificacion"
import { PasoExito }        from "../components/registro/PasoExito"

import "@/infrastructure/css/Registre.css"

const FORM_INICIAL = {
  nombre:    "",
  email:     "",
  password:  "",
  confirmar: "",
  telefono:  "",
}

const validarCampos = (form, fotoDoc, mayorDeEdad, declaracion) => {
  const e = {}
  const n = form.nombre.trim()
  if (!n)                                         e.nombre = "El nombre es obligatorio"
  else if (n.length < 3)                          e.nombre = "Mínimo 3 caracteres"
  else if (/\d/.test(n))                          e.nombre = "El nombre no puede contener números"
  else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}/.test(n)) e.nombre = "El nombre debe tener al menos 2 letras"
  if (!form.email.trim())    e.email    = "El correo es obligatorio"
  if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio"
  if (form.password.length < 8)          e.password  = "Mínimo 8 caracteres"
  if (form.password !== form.confirmar)  e.confirmar = "Las contraseñas no coinciden"
  if (!fotoDoc)                          e.foto      = "Debes subir tu documento de identidad"
  if (!mayorDeEdad)                      e.mayorDeEdad = "Debes confirmar que eres mayor de 18 años"
  if (!declaracion)                      e.declaracion = "Debes aceptar la declaración"
  return e
}

export default function RegistroEmprendedora() {
  const navigate = useNavigate()

  const [paso, setPaso]               = useState(1)
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState("")
  const [codigo, setCodigo]           = useState("")
  const [fotoDoc, setFotoDoc]         = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [form, setForm]               = useState(FORM_INICIAL)
  const [errores, setErrores]         = useState({})
  const [mayorDeEdad, setMayorDeEdad] = useState(false)   // 🆕
  const [declaracion, setDeclaracion] = useState(false)   // 🆕

  const onChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: "" }))
    setError("")
  }

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFotoDoc(file)
      setFotoPreview(URL.createObjectURL(file))
      setErrores(prev => ({ ...prev, foto: "" }))
    }
  }

  const handleRegistro = async (e) => {
    e.preventDefault()  // 🆕 faltaba esto
    const e_ = validarCampos(form, fotoDoc, mayorDeEdad, declaracion)
    if (Object.keys(e_).length) { setErrores(e_); return }

    setCargando(true)
    try {
      const fd = new FormData()
      fd.append("nombre",        form.nombre.trim())
      fd.append("email",         form.email)
      fd.append("password",      form.password)
      fd.append("telefono",      form.telefono)
      fd.append("rol",           "emprendedora")
      fd.append("foto_documento", fotoDoc)
      await axios.post("http://localhost:3000/registro", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setPaso(2)
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse")
    } finally { setCargando(false) }
  }

  const handleVerificar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      await axios.post("http://localhost:3000/verificar", { email: form.email, codigo })
      setPaso(3)
    } catch (err) {
      setError(err.response?.data?.error || "Código incorrecto")
    } finally { setCargando(false) }
  }

  return (
    <section className="container-register">
      <div className="container-img">
        <div className="container-formulario">
          <h2>Registro de Emprendedora</h2>

          {paso === 1 && (
            <form onSubmit={handleRegistro} className="container-form">
              <div className="container-paddin">
                <p className="re-aviso">
                  Tu solicitud será revisada. Mientras tanto puedes usar la plataforma como cliente.
                </p>

                <CamposBase form={form} errores={errores} onChange={onChange} />

                {/* Documento */}
                <div className="re-doc-wrapper">
                  <div className="re-doc-header">
                    <FiUpload className="re-doc-icon" />
                    <label className="re-doc-label-title">Documento de identidad</label>
                  </div>
                  <label htmlFor="foto_doc"
                    className={`re-doc-label ${fotoPreview ? "cargado" : ""}`}>
                    <FiUpload size={13} />
                    {fotoPreview ? "✓ Documento cargado — click para cambiar" : "Subir foto del documento"}
                  </label>
                  <input id="foto_doc" type="file" accept="image/*,.pdf"
                    onChange={handleFoto} style={{ display: "none" }} />
                  {fotoPreview && (
                    <img src={fotoPreview} alt="Documento" className="re-doc-preview" />
                  )}
                  {errores.foto && <p className="re-campo-error">{errores.foto}</p>}
                </div>

                {/* 🆕 Declaraciones */}
                <div className="re-declaraciones">
                  <label className={`re-check-label ${errores.mayorDeEdad ? "error" : ""}`}>
                    <input
                      type="checkbox"
                      checked={mayorDeEdad}
                      onChange={e => {
                        setMayorDeEdad(e.target.checked)
                        setErrores(prev => ({ ...prev, mayorDeEdad: "" }))
                      }}
                    />
                    <span>Confirmo que soy mayor de 18 años.</span>
                  </label>
                  {errores.mayorDeEdad && (
                    <p className="re-campo-error">{errores.mayorDeEdad}</p>
                  )}

                  <label className={`re-check-label ${errores.declaracion ? "error" : ""}`}>
                    <input
                      type="checkbox"
                      checked={declaracion}
                      onChange={e => {
                        setDeclaracion(e.target.checked)
                        setErrores(prev => ({ ...prev, declaracion: "" }))
                      }}
                    />
                    <span>
                      Declaro que la información y el documento suministrados son veraces
                      y me hago responsable de su exactitud.
                    </span>
                  </label>
                  {errores.declaracion && (
                    <p className="re-campo-error">{errores.declaracion}</p>
                  )}
                </div>
              </div>

              {error && <p className="mensaje">{error}</p>}

              <div className="container-button">
                <button type="button" className="btn-secondary"
                  onClick={() => navigate("/registro")}>
                  Volver
                </button>
                <button type="submit" disabled={cargando}>
                  {cargando ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          )}

          {paso === 2 && (
            <PasoVerificacion
              email={form.email}
              codigo={codigo}
              setCodigo={setCodigo}
              error={error}
              cargando={cargando}
              onVolver={() => setPaso(1)}
              onSubmit={handleVerificar}
            />
          )}

          {paso === 3 && (
            <PasoExito esEmprendedora onIrLogin={() => navigate("/login")} />
          )}
        </div>
        <div className="container-cat">
          <img src={background} alt="Decoración" />
        </div>
      </div>
    </section>
  )
}
