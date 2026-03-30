import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiUser, FiMail, FiLock, FiPhone, FiUpload, FiEye, FiEyeOff } from "react-icons/fi"
import background from "@/infrastructure/imgs/Fondo2.png"
import "@/infrastructure/css/Registre.css"

export default function RegistroEmprendedora() {
  const navigate = useNavigate()

  const [paso, setPaso]         = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState("")
  const [codigo, setCodigo]     = useState("")
  const [verPass, setVerPass]   = useState(false)
  const [verConf, setVerConf]   = useState(false)
  const [fotoDoc, setFotoDoc]       = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)

  const [form, setForm]       = useState({ nombre: "", email: "", password: "", confirmar: "", telefono: "" })
  const [errores, setErrores] = useState({})

  const set = (campo, valor) => {
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

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())               e.nombre    = "El nombre es obligatorio"
    if (!form.email.trim())                e.email     = "El correo es obligatorio"
    if (!form.telefono.trim())             e.telefono  = "El teléfono es obligatorio"
    if (form.password.length < 8)          e.password  = "Mínimo 8 caracteres"
    if (form.password !== form.confirmar)  e.confirmar = "Las contraseñas no coinciden"
    if (!fotoDoc)                          e.foto      = "Debes subir tu documento de identidad"
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setCargando(true)
    try {
      const formData = new FormData()
      formData.append("nombre",         form.nombre)
      formData.append("email",          form.email)
      formData.append("password",       form.password)
      formData.append("telefono",       form.telefono)
      formData.append("rol",            "emprendedora")
      formData.append("foto_documento", fotoDoc)
      await axios.post("http://localhost:3000/registro", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setPaso(2)
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse")
    } finally {
      setCargando(false)
    }
  }

  const handleVerificar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      await axios.post("http://localhost:3000/verificar", { email: form.email, codigo })
      setPaso(3)
    } catch (err) {
      setError(err.response?.data?.error || "Código incorrecto")
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="container-register">
      <div className="container-img">

        <div className="container-formulario">
          <h2>Registro de Emprendedora</h2>

          {/* Paso 1 */}
          {paso === 1 && (
            <form onSubmit={handleRegistro} className="container-form">
              <div className="container-paddin">

                {/* Info */}
                <p className="mensaje-info" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.35rem', padding: '0.5rem 0.75rem', color: '#92400e' }}>
                  Tu solicitud será revisada. Mientras tanto puedes usar la plataforma como cliente.
                </p>

                <div className="container-input">
                  <FiUser />
                  <label htmlFor="nombre">Nombre</label>
                  <input id="nombre" type="text" placeholder="Ej: María García"
                    value={form.nombre} onChange={e => set("nombre", e.target.value)}
                    style={errores.nombre ? { borderColor: '#ef4444' } : {}} required />
                </div>
                {errores.nombre && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.nombre}</p>}

                <div className="container-input">
                  <FiMail />
                  <label htmlFor="email">Correo</label>
                  <input id="email" type="email" placeholder="Ej: maria@gmail.com"
                    value={form.email} onChange={e => set("email", e.target.value)}
                    style={errores.email ? { borderColor: '#ef4444' } : {}} required />
                </div>
                {errores.email && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.email}</p>}

                <div className="container-input">
                  <FiPhone />
                  <label htmlFor="telefono">Teléfono</label>
                  <input id="telefono" type="tel" placeholder="Ej: 3001234567"
                    value={form.telefono} onChange={e => set("telefono", e.target.value)}
                    style={errores.telefono ? { borderColor: '#ef4444' } : {}} required />
                </div>
                {errores.telefono && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.telefono}</p>}

                <div className="container-input">
                  <FiLock />
                  <label htmlFor="password">Contraseña</label>
                  <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                    <input id="password" type={verPass ? "text" : "password"} placeholder="Mínimo 8 caracteres"
                      value={form.password} onChange={e => set("password", e.target.value)}
                      style={{ width: '100%', paddingRight: '2.2rem', boxSizing: 'border-box', ...(errores.password ? { borderColor: '#ef4444' } : {}) }} required />
                    <button type="button" onClick={() => setVerPass(p => !p)}
                      style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                      {verPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
                {errores.password && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.password}</p>}

                <div className="container-input">
                  <FiLock />
                  <label htmlFor="confirmar">Confirmar</label>
                  <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                    <input id="confirmar" type={verConf ? "text" : "password"} placeholder="Repite tu contraseña"
                      value={form.confirmar} onChange={e => set("confirmar", e.target.value)}
                      style={{ width: '100%', paddingRight: '2.2rem', boxSizing: 'border-box', ...(errores.confirmar ? { borderColor: '#ef4444' } : {}) }} required />
                    <button type="button" onClick={() => setVerConf(p => !p)}
                      style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                      {verConf ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
                {errores.confirmar && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.confirmar}</p>}

                {/* Foto documento */}
                <div className="container-input" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FiUpload style={{ color: 'var(--gray-mid)', flexShrink: 0 }} />
                    <label style={{ color: 'var(--gray-mid)', fontSize: '0.875rem' }}>
                      Documento de identidad
                    </label>
                  </div>
                  <label htmlFor="foto_doc" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.45rem 0.8rem', borderRadius: '0.35rem', cursor: 'pointer',
                    border: `1px solid ${fotoPreview ? 'rgba(5,150,105,0.5)' : 'var(--border)'}`,
                    background: fotoPreview ? 'rgba(5,150,105,0.08)' : 'transparent',
                    color: fotoPreview ? '#059669' : 'var(--gray-mid)',
                    fontSize: '0.82rem', fontWeight: 500, width: '100%', boxSizing: 'border-box'
                  }}>
                    <FiUpload size={13} />
                    {fotoPreview ? '✓ Documento cargado — click para cambiar' : 'Subir foto del documento'}
                  </label>
                  <input id="foto_doc" type="file" accept="image/*,.pdf"
                    onChange={handleFoto} style={{ display: 'none' }} />
                  {fotoPreview && (
                    <img src={fotoPreview} alt="Documento"
                      style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: '0.35rem', border: '1px solid var(--border)' }} />
                  )}
                </div>
                {errores.foto && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.foto}</p>}

              </div>

              {error && <p className="mensaje">{error}</p>}

              <div className="container-button">
                <button type="button" className="btn-secondary" onClick={() => navigate("/registro")}>
                  Volver
                </button>
                <button type="submit" disabled={cargando}>
                  {cargando ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          )}

          {/* Paso 2 — Verificar */}
          {paso === 2 && (
            <form onSubmit={handleVerificar} className="container-form">
              <div className="container-paddin">
                <p className="mensaje-info">
                  Te enviamos un código a <strong>{form.email}</strong>. Ingrésalo para confirmar tu solicitud.
                </p>
                <div className="container-input">
                  <FiMail />
                  <label htmlFor="codigo">Código</label>
                  <input id="codigo" placeholder="6 dígitos" maxLength={6}
                    value={codigo} onChange={e => setCodigo(e.target.value)}
                    style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1rem' }} required />
                </div>
              </div>
              {error && <p className="mensaje">{error}</p>}
              <div className="container-button">
                <button type="button" className="btn-secondary" onClick={() => setPaso(1)}>Volver</button>
                <button type="submit" disabled={cargando}>
                  {cargando ? "Verificando..." : "Confirmar"}
                </button>
              </div>
            </form>
          )}

          {/* Paso 3 — Éxito */}
          {paso === 3 && (
            <div className="container-form">
              <div className="container-paddin" style={{ textAlign: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🎉</div>
                <p className="mensaje-info" style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                  ¡Solicitud enviada!
                </p>
                <p className="mensaje-info">
                  El administrador revisará tu documento y te notificará por correo cuando sea aprobada.
                </p>
                <p className="mensaje-info" style={{ color: '#059669', fontWeight: 600 }}>
                  Mientras tanto, puedes ingresar como cliente y explorar la plataforma.
                </p>
              </div>
              <div className="container-button">
                <button type="button" onClick={() => navigate("/login")}>
                  Ir al login
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="container-cat">
          <img src={background} alt="Decoración" />
        </div>

      </div>
    </section>
  )
}