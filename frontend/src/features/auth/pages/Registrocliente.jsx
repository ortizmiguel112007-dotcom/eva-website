import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from "react-icons/fi"
import background from "@/infrastructure/imgs/Fondo2.png"
import "@/infrastructure/css/Registre.css"

export default function RegistroCliente() {
  const navigate    = useNavigate()
  const { login }   = useAuth()

  const [paso, setPaso]         = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState("")
  const [codigo, setCodigo]     = useState("")
  const [verPass, setVerPass]   = useState(false)
  const [verConf, setVerConf]   = useState(false)

  const [form, setForm]     = useState({ nombre: "", email: "", password: "", confirmar: "", telefono: "" })
  const [errores, setErrores] = useState({})

  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: "" }))
    setError("")
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())               e.nombre    = "El nombre es obligatorio"
    if (!form.email.trim())                e.email     = "El correo es obligatorio"
    if (!form.telefono.trim())             e.telefono  = "El teléfono es obligatorio"
    if (form.password.length < 8)          e.password  = "Mínimo 8 caracteres"
    if (form.password !== form.confirmar)  e.confirmar = "Las contraseñas no coinciden"
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setCargando(true)
    try {
      await axios.post("http://localhost:3000/registro", {
        nombre: form.nombre, email: form.email,
        password: form.password, telefono: form.telefono, rol: "usuario"
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
      const res = await axios.post("http://localhost:3000/verificar", { email: form.email, codigo })
      login(res.data.token)
      navigate("/")
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

          <h2>Registro de Cliente</h2>

          {/* Paso 1 */}
          {paso === 1 && (
            <form onSubmit={handleRegistro} className="container-form">
              <div className="container-paddin">

                <div className="container-input">
                  <FiUser />
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej: María García"
                    value={form.nombre}
                    onChange={e => set("nombre", e.target.value)}
                    style={errores.nombre ? { borderColor: '#ef4444' } : {}}
                    required
                  />
                </div>
                {errores.nombre && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.nombre}</p>}

                <div className="container-input">
                  <FiMail />
                  <label htmlFor="email">Correo</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Ej: maria@gmail.com"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    style={errores.email ? { borderColor: '#ef4444' } : {}}
                    required
                  />
                </div>
                {errores.email && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.email}</p>}

                <div className="container-input">
                  <FiPhone />
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    type="tel"
                    placeholder="Ej: 3001234567"
                    value={form.telefono}
                    onChange={e => set("telefono", e.target.value)}
                    style={errores.telefono ? { borderColor: '#ef4444' } : {}}
                    required
                  />
                </div>
                {errores.telefono && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.telefono}</p>}

                <div className="container-input">
                  <FiLock />
                  <label htmlFor="password">Contraseña</label>
                  <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                    <input
                      id="password"
                      type={verPass ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={form.password}
                      onChange={e => set("password", e.target.value)}
                      style={{ width: '100%', paddingRight: '2.2rem', boxSizing: 'border-box', ...(errores.password ? { borderColor: '#ef4444' } : {}) }}
                      required
                    />
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
                    <input
                      id="confirmar"
                      type={verConf ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={form.confirmar}
                      onChange={e => set("confirmar", e.target.value)}
                      style={{ width: '100%', paddingRight: '2.2rem', boxSizing: 'border-box', ...(errores.confirmar ? { borderColor: '#ef4444' } : {}) }}
                      required
                    />
                    <button type="button" onClick={() => setVerConf(p => !p)}
                      style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                      {verConf ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
                {errores.confirmar && <p className="mensaje" style={{ marginTop: '-0.5rem' }}>{errores.confirmar}</p>}

              </div>

              {error && <p className="mensaje">{error}</p>}

              <div className="container-button">
                <button type="button" className="btn-secondary" onClick={() => navigate("/registro")}>
                  Volver
                </button>
                <button type="submit" disabled={cargando}>
                  {cargando ? "Registrando..." : "Crear cuenta"}
                </button>
              </div>
            </form>
          )}

          {/* Paso 2 — Verificar */}
          {paso === 2 && (
            <form onSubmit={handleVerificar} className="container-form">
              <div className="container-paddin">
                <p className="mensaje-info">
                  Te enviamos un código a <strong>{form.email}</strong>. Ingrésalo para activar tu cuenta.
                </p>
                <div className="container-input">
                  <FiMail />
                  <label htmlFor="codigo">Código</label>
                  <input
                    id="codigo"
                    placeholder="6 dígitos"
                    maxLength={6}
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1rem' }}
                    required
                  />
                </div>
              </div>
              {error && <p className="mensaje">{error}</p>}
              <div className="container-button">
                <button type="button" className="btn-secondary" onClick={() => setPaso(1)}>Volver</button>
                <button type="submit" disabled={cargando}>
                  {cargando ? "Verificando..." : "Verificar"}
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="container-cat">
          <img src={background} alt="Decoración" />
        </div>

      </div>
    </section>
  )
}