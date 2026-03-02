import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/core/context/AuthConten";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  MdEmail,
  IoMdLock,
  FaPhone
} from '@/infrastructure/icons/index.js';

import '@/infrastructure/css/Registre.css'
import background from '@/infrastructure/imgs/Fondo2.png'

const RegisterPage = () => {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')

  const [codigo, setCodigo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)

  const { login } = useAuth();
  const navigate = useNavigate();

  // Paso 1 - Registro
  const handleRegister = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      await axios.post('http://localhost:3000/registro', { nombre, email, telefono, password })
      setMensaje('Revisa tu correo e ingresa el código')
      setPaso(2)
    } catch (error) {
      console.log('Error al registrar el usuario:', error)
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
      console.log('Respuesta del servidor:', res.data)
      login(res.data.token)
      navigate('/productos')
    } catch (error) {
      console.log('Error al verificar el código:', error)
      setMensaje(error.response?.data?.error || 'Código incorrecto o expirado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="container-register">
      <div className="container-img">

        {/* Paso 1 - Formulario de registro */}
        {paso === 1 && (
          <div className="container-formulario">
            <h2>Registro</h2>
            <form onSubmit={handleRegister} className="container-form">
              <div className="container-paddin">
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

        {/* Paso 2 - Verificación de código */}
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

        <div className="container-cat">
          <img src={background} alt="Decoración" />
        </div>

      </div>
    </section>
  );
};

export default RegisterPage;