import { useState } from "react"
import { useAuth } from "@/core/context/AuthConten"
import { useNavigate, useLocation } from "react-router-dom"
import { useCarrito } from "@/core/context/CarritoContext"
import axios from "axios"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { MdEmail, IoMdLock } from "@/infrastructure/icons/index.js"
import { jwtDecode } from "jwt-decode"

import "@/infrastructure/css/Login.css"
import background from "@/infrastructure/imgs/Fondo2.png"

const LoginPage = () => {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [mensaje, setMensaje]   = useState("")
  const [cargando, setCargando] = useState(false)
  const [verPass, setVerPass]   = useState(false)

  const { login }        = useAuth()
  const { cargarCarrito } = useCarrito()
  const navigate         = useNavigate()
  const location         = useLocation()
  const from             = location.state?.from || null

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const res     = await axios.post("http://localhost:3000/login", { email, password })
      login(res.data.token)
      await cargarCarrito()  // recarga carrito del servidor

      const decoded = jwtDecode(res.data.token)

      if (decoded.pendiente) {
        navigate("/", { state: { mensaje: res.data.mensaje } })
        return
      }

      if (from) {
        navigate(from, { replace: true })
        return
      }

      if (decoded.rol === "emprendedora") navigate("/dashboard")
      else if (decoded.rol === "admin")   navigate("/admin")
      else                                navigate("/inicio")

    } catch (err) {
      setMensaje(err.response?.data?.error || "Error al iniciar sesión")
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="container-login">
      <div className="container-img-login">
        <div className="container-formulario-login">
          <h2>Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="container-form-login">
            <div className="container-paddin-login">
              <div className="container-input-login">
                <MdEmail />
                <label htmlFor="email">Correo</label>
                <input id="email" type="email" placeholder="Ej: juan@gmail.com"
                  onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="container-input-login">
                <IoMdLock />
                <label htmlFor="password">Contraseña</label>
                <div className="re-pass-wrapper">
                  <input id="password" type={verPass ? "text" : "password"}
                    placeholder="Tu contraseña"
                    onChange={e => setPassword(e.target.value)}
                    className="re-pass-input" required />
                  <button type="button" className="re-pass-toggle"
                    onClick={() => setVerPass(p => !p)}>
                    {verPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {mensaje && <p className="mensaje-login">{mensaje}</p>}

            <div className="container-button-login">
              <button type="submit" disabled={cargando}>
                {cargando ? "Cargando..." : "Iniciar sesión"}
              </button>
            </div>
          </form>
        </div>

        <div className="container-cat-login">
          <img src={background} alt="Decoración" />
        </div>
      </div>
    </section>
  )
}

export default LoginPage
