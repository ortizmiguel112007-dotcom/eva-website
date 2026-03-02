import { useState, useEffect } from "react"
import axios from "axios"

import {
  FaUser,
  MdEmail,
  IoMdLock,
  FaPhone,
  FaEdit,
  FaPlus,
  FaTimes,
} from '@/infrastructure/icons/index.js'

import '@/infrastructure/css/CrudAdmin.css'

const BASE_URL = 'http://localhost:3000/admin'

const EMPTY_FORM = { nombre: '', email: '', telefono: '', password: '' }

const CrudAdmin = () => {
  const [usuarios, setUsuarios]     = useState([])
  const [form, setForm]             = useState(EMPTY_FORM)
  const [editandoId, setEditandoId] = useState(null)
  const [modalAbierto, setModal]    = useState(false)
  const [mensaje, setMensaje]       = useState({ texto: '', tipo: '' })
  const [cargando, setCargando]     = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(null) // { id, nombre, activo }

  // ─── Cargar usuarios ────────────────────────────────────
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/usuarios`)
      setUsuarios(res.data)
    } catch (error) {
      mostrarMensaje('Error al cargar los usuarios', 'error')
    }
  }

  useEffect(() => { cargarUsuarios() }, [])

  // ─── Helpers ─────────────────────────────────────────────
  const mostrarMensaje = (texto, tipo = 'ok') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3500)
  }

  const abrirModalCrear = () => {
    setForm(EMPTY_FORM)
    setEditandoId(null)
    setModal(true)
  }

  const abrirModalEditar = (usuario) => {
    setForm({
      nombre:   usuario.nombre   || '',
      email:    usuario.email    || '',
      telefono: usuario.telefono || '',
      password: '',
    })
    setEditandoId(usuario.id)
    setModal(true)
  }

  const cerrarModal = () => {
    setModal(false)
    setForm(EMPTY_FORM)
    setEditandoId(null)
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ─── Crear usuario ────────────────────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      await axios.post(`${BASE_URL}/usuarios`, form)
      mostrarMensaje('Usuario creado correctamente')
      cerrarModal()
      cargarUsuarios()
    } catch (error) {
      mostrarMensaje(error.response?.data?.error || 'Error al crear el usuario', 'error')
    } finally {
      setCargando(false)
    }
  }

  // ─── Actualizar usuario ───────────────────────────────────
  const handleActualizar = async (e) => {
    e.preventDefault()
    setCargando(true)
    const payload = { nombre: form.nombre, email: form.email, telefono: form.telefono }
    if (form.password) payload.password = form.password
    try {
      await axios.put(`${BASE_URL}/usuarios/${editandoId}`, payload)
      mostrarMensaje('Usuario actualizado correctamente')
      cerrarModal()
      cargarUsuarios()
    } catch (error) {
      mostrarMensaje(error.response?.data?.error || 'Error al actualizar el usuario', 'error')
    } finally {
      setCargando(false)
    }
  }

  // ─── Habilitar / Inhabilitar (RN-004) ─────────────────────
  const handleToggleEstado = async () => {
    if (!confirmToggle) return
    setCargando(true)
    try {
      await axios.patch(`${BASE_URL}/usuarios/${confirmToggle.id}/estado`)
      mostrarMensaje(
        confirmToggle.activo
          ? `Usuario "${confirmToggle.nombre}" inhabilitado`
          : `Usuario "${confirmToggle.nombre}" habilitado`
      )
      setConfirmToggle(null)
      cargarUsuarios()
    } catch (error) {
      mostrarMensaje(error.response?.data?.error || 'Error al cambiar el estado', 'error')
    } finally {
      setCargando(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <section className="crud-admin">

      {/* ── Header ── */}
      <div className="crud-header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-primary" onClick={abrirModalCrear}>
          <FaPlus /> Nuevo usuario
        </button>
      </div>

      {/* ── Toast ── */}
      {mensaje.texto && (
        <div className={`crud-toast ${mensaje.tipo === 'error' ? 'toast-error' : 'toast-ok'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="crud-table-wrapper">
        <table className="crud-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="td-empty">No hay usuarios registrados</td>
              </tr>
            ) : (
              usuarios.map((u, i) => (
                <tr key={u.id} className={!u.activo ? 'row-inactivo' : ''}>
                  <td>{i + 1}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono || '—'}</td>
                  <td>
                    {/* RN-002.3: solo visualización del estado */}
                    <span className={`badge-estado ${u.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="td-actions">
                    {/* RN-002.3: botones de navegación hacia funcionalidades */}
                    <button
                      className="btn-icon btn-edit"
                      title="Modificar usuario"
                      onClick={() => abrirModalEditar(u)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn-toggle ${u.activo ? 'btn-inhabilitar' : 'btn-habilitar'}`}
                      title={u.activo ? 'Inhabilitar usuario' : 'Habilitar usuario'}
                      onClick={() => setConfirmToggle({ id: u.id, nombre: u.nombre, activo: u.activo })}
                    >
                      {u.activo ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal crear / editar ── */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <h2>{editandoId ? 'Modificar usuario' : 'Nuevo usuario'}</h2>
              <button className="btn-icon-close" onClick={cerrarModal}><FaTimes /></button>
            </div>

            <form
              onSubmit={editandoId ? handleActualizar : handleCrear}
              className="modal-form"
            >
              <div className="modal-inputs">

                <div className="modal-input-row">
                  <FaUser />
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre" name="nombre"
                    placeholder="Ej: Juan Pérez"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="modal-input-row">
                  <MdEmail />
                  <label htmlFor="email">Correo</label>
                  <input
                    id="email" name="email"
                    type="email"
                    placeholder="Ej: juan@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="modal-input-row">
                  <FaPhone />
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono" name="telefono"
                    type="tel"
                    placeholder="Ej: 1030318920"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-input-row">
                  <IoMdLock />
                  <label htmlFor="password">
                    {editandoId ? 'Nueva contraseña' : 'Contraseña'}
                  </label>
                  <input
                    id="password" name="password"
                    type="password"
                    placeholder={editandoId ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
                    value={form.password}
                    onChange={handleChange}
                    required={!editandoId}
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={cargando}>
                  {cargando
                    ? (editandoId ? 'Guardando...' : 'Creando...')
                    : (editandoId ? 'Guardar cambios' : 'Crear usuario')
                  }
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── Modal confirmar habilitar / inhabilitar (RN-004) ── */}
      {confirmToggle && (
        <div className="modal-overlay" onClick={() => setConfirmToggle(null)}>
          <div className="modal-card modal-confirm" onClick={e => e.stopPropagation()}>
            <h2>
              {confirmToggle.activo ? 'Inhabilitar usuario' : 'Habilitar usuario'}
            </h2>
            <p>
              {confirmToggle.activo
                ? <>¿Deseas inhabilitar a <strong>{confirmToggle.nombre}</strong>? Su información se conservará y podrá ser reactivado en cualquier momento.</>
                : <>¿Deseas habilitar nuevamente a <strong>{confirmToggle.nombre}</strong>?</>
              }
            </p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setConfirmToggle(null)}>
                Cancelar
              </button>
              <button
                className={confirmToggle.activo ? 'btn-danger' : 'btn-success'}
                disabled={cargando}
                onClick={handleToggleEstado}
              >
                {cargando
                  ? 'Procesando...'
                  : confirmToggle.activo ? 'Sí, inhabilitar' : 'Sí, habilitar'
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

export default CrudAdmin