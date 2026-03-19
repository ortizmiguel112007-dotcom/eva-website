import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/core/context/AuthConten";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import {
  FaUser,
  MdEmail,
  IoMdLock,
  FaPhone
} from '@/infrastructure/icons/index.js';

import '@/infrastructure/css/Registre.css'
import background from '@/infrastructure/imgs/Fondo2.png'

const RegisterPage = () => {
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol]           = useState('usuario')
  const [fotoDoc, setFotoDoc]   = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)

  const [codigo, setCodigo]     = useState('')
  const [mensaje, setMensaje]   = useState('')
  const [paso, setPaso]         = useState(1)
  const [cargando, setCargando] = useState(false)

  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFotoDoc(file)
      setFotoPreview(URL.createObjectURL(file))
    }
  }

  // Paso 1 - Registro
  const handleRegister = async (e) => {
    e.preventDefault()

    if (rol === 'emprendedora' && !fotoDoc) {
      setMensaje('Debes subir una foto de tu documento de identidad')
      return
    }

    setCargando(true)
    try {
      const formData = new FormData()
      formData.append('nombre',   nombre)
      formData.append('email',    email)
      formData.append('telefono', telefono)
      formData.append('password', password)
      formData.append('rol',      rol)
      if (fotoDoc) formData.append('foto_documento', fotoDoc)

      await axios.post('http://localhost:3000/registro', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setMensaje('Revisa tu correo e ingresa el código')
      setPaso(2)
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al registrar el usuario')
    } finally {
      setCargando(false)
    }
  }

  // Paso 2 - Verificar código
  const handleVerificar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const res = await axios.post('http://localhost:3000/verificar', { email, codigo })

      if (rol === 'emprendedora') {
        // emprendedora queda pendiente de aprobación
        setPaso(3)
        return
      }

      login(res.data.token)
      const decoded = jwtDecode(res.data.token)
      if (decoded.rol === 'administrador') navigate('/admin')
      else navigate('/')
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Código incorrecto o expirado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="container-register">
      <div className="container-img">

        {/* Paso 1 - Formulario */}
        {paso === 1 && (
          <div className="container-formulario">
            <h2>Registro</h2>
            <form onSubmit={handleRegister} className="container-form">
              <div className="container-paddin">

                {/* Selector de rol */}
                <div className="container-input">
                  <FaUser />
                  <label>Tipo de cuenta</label>
                  <select
                    value={rol}
                    onChange={e => { setRol(e.target.value); setFotoDoc(null); setFotoPreview(null); setMensaje('') }}
                    style={{ flex: 1, padding: '0.45rem 0.6rem', border: '1px solid rgba(242,242,242,0.4)', borderRadius: '0.35rem', outline: 'none', fontSize: '0.875rem', background: 'transparent' }}
                  >
                    <option value="usuario">Cliente</option>
                    <option value="emprendedora">Emprendedora</option>
                  </select>
                </div>

                <div className="container-input">
                  <FaUser />
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    placeholder="Ej: Juan Pérez"
                    onChange={e => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="container-input">
                  <MdEmail />
                  <label htmlFor="email">Correo</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Ej: juan@gmail.com"
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="container-input">
                  <IoMdLock />
                  <label htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    placeholder="Ej: MiClave2024#"
                    type="password"
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="container-input">
                  <FaPhone />
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    placeholder="Ej: 1030318920"
                    type="tel"
                    onChange={e => setTelefono(e.target.value)}
                    required
                  />
                </div>

                {/* Foto documento — solo emprendedoras */}
                {rol === 'emprendedora' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 0.1rem' }}>
                    <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>
                      📄 Sube una foto de tu documento de identidad para verificar tu cuenta como emprendedora.
                    </p>
                    <label
                      htmlFor="foto_doc"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0.6rem', borderRadius: '0.35rem', cursor: 'pointer',
                        border: '1.5px dashed rgba(41,177,255,0.5)', color: '#29b1ff',
                        fontSize: '0.82rem', fontWeight: 600, gap: '0.4rem'
                      }}
                    >
                      {fotoPreview ? '✓ Foto cargada — click para cambiar' : '📷 Seleccionar foto del documento'}
                    </label>
                    <input
                      id="foto_doc"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFotoChange}
                      style={{ display: 'none' }}
                    />
                    {fotoPreview && (
                      <img
                        src={fotoPreview}
                        alt="Documento"
                        style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '0.35rem', border: '1px solid rgba(242,242,242,0.2)' }}
                      />
                    )}
                  </div>
                )}

              </div>

              {mensaje && <p className="mensaje">{mensaje}</p>}

              <div className="container-button">
                <button type="submit" disabled={cargando}>
                  {cargando ? 'Registrando...' : 'Registrarse'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Paso 2 - Verificación */}
        {paso === 2 && (
          <div className="container-formulario">
            <h2>Verificación</h2>
            <form onSubmit={handleVerificar} className="container-form">
              <div className="container-paddin">
                <p className="mensaje-info">
                  Te enviamos un código a <strong>{email}</strong>. Ingrésalo para confirmar tu cuenta.
                </p>
                <div className="container-input">
                  <MdEmail />
                  <label htmlFor="codigo">Código</label>
                  <input
                    id="codigo"
                    placeholder="Ingresa los 6 dígitos"
                    maxLength={6}
                    onChange={e => setCodigo(e.target.value)}
                    required
                  />
                </div>
              </div>

              {mensaje && <p className="mensaje">{mensaje}</p>}

              <div className="container-button">
                <button type="button" className="btn-secondary" onClick={() => setPaso(1)}>
                  Volver
                </button>
                <button type="submit" disabled={cargando}>
                  {cargando ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Paso 3 - Pendiente de aprobación (solo emprendedoras) */}
        {paso === 3 && (
          <div className="container-formulario">
            <h2>¡Solicitud enviada!</h2>
            <div className="container-form">
              <div className="container-paddin">
                <p className="mensaje-info">
                  Tu solicitud como emprendedora ha sido enviada. El administrador revisará tu documento y te notificará cuando tu cuenta esté aprobada.
                </p>
                <p className="mensaje-info" style={{ marginTop: '0.75rem' }}>
                  Una vez aprobada, podrás iniciar sesión con tu correo y contraseña.
                </p>
              </div>
              <div className="container-button">
                <button type="button" onClick={() => navigate('/login')}>
                  Ir al login
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="container-cat">
          <img src={background} alt="Decoración" />
        </div>

      </div>
    </section>
  )
}

export default RegisterPage