import { useState, useEffect, useMemo } from "react";
import axios from "axios";

import {
  FaUser,
  MdEmail,
  IoMdLock,
  FaPhone,
  FaEdit,
  FaPlus,
  FaTimes,
} from "@/infrastructure/icons/index.js";

import "@/infrastructure/css/CrudAdmin.css";

const BASE_URL = "http://localhost:3000/admin";
const getToken = () => localStorage.getItem("token");

const EMPTY_FORM = { nombre: "", email: "", telefono: "", password: "" };
const PAGE_SIZE = 10;

const CrudAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAbierto, setModal] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);

  // ─── Buscador y paginación ────────────────────────────────
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const headers = { Authorization: `Bearer ${getToken()}` };

  // ─── Cargar usuarios ─────────────────────────────────────
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/usuarios`, { headers });
      setUsuarios(res.data);
    } catch (error) {
      mostrarMensaje("Error al cargar los usuarios", "error");
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // ─── Filtrado por búsqueda ────────────────────────────────
  const usuariosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return usuarios;
    return usuarios.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(termino) ||
        u.email?.toLowerCase().includes(termino)
    );
  }, [usuarios, busqueda]);

  // ─── Paginación ───────────────────────────────────────────
  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / PAGE_SIZE));

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const usuariosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * PAGE_SIZE;
    return usuariosFiltrados.slice(inicio, inicio + PAGE_SIZE);
  }, [usuariosFiltrados, paginaActual]);

  const irAPagina = (n) => {
    if (n < 1 || n > totalPaginas) return;
    setPaginaActual(n);
  };

  // Generar array de páginas visibles (máximo 5 botones)
  const paginasVisibles = useMemo(() => {
    const delta = 2;
    const rango = [];
    for (
      let i = Math.max(1, paginaActual - delta);
      i <= Math.min(totalPaginas, paginaActual + delta);
      i++
    ) {
      rango.push(i);
    }
    return rango;
  }, [paginaActual, totalPaginas]);

  // ─── Helpers ─────────────────────────────────────────────
  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3500);
  };

  const abrirModalCrear = () => {
    setForm(EMPTY_FORM);
    setEditandoId(null);
    setModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setForm({
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      password: "",
    });
    setEditandoId(usuario.id);
    setModal(true);
  };

  const cerrarModal = () => {
    setModal(false);
    setForm(EMPTY_FORM);
    setEditandoId(null);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ─── Crear usuario ────────────────────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await axios.post(`${BASE_URL}/usuarios`, form, { headers });
      mostrarMensaje("Usuario creado correctamente");
      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      mostrarMensaje(
        error.response?.data?.error || "Error al crear el usuario",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // ─── Actualizar usuario ───────────────────────────────────
  const handleActualizar = async (e) => {
    e.preventDefault();
    setCargando(true);
    const payload = {
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
    };
    if (form.password) payload.password = form.password;
    try {
      await axios.put(`${BASE_URL}/usuarios/${editandoId}`, payload, {
        headers,
      });
      mostrarMensaje("Usuario actualizado correctamente");
      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      mostrarMensaje(
        error.response?.data?.error || "Error al actualizar el usuario",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // ─── Habilitar / Inhabilitar ──────────────────────────────
  const handleToggleEstado = async () => {
    if (!confirmToggle) return;
    setCargando(true);
    try {
      await axios.patch(
        `${BASE_URL}/usuarios/${confirmToggle.id}/estado`,
        {},
        { headers }
      );
      mostrarMensaje(
        confirmToggle.activo
          ? `Usuario "${confirmToggle.nombre}" inhabilitado`
          : `Usuario "${confirmToggle.nombre}" habilitado`
      );
      setConfirmToggle(null);
      cargarUsuarios();
    } catch (error) {
      mostrarMensaje(
        error.response?.data?.error || "Error al cambiar el estado",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <section className="crud-admin">
      <div className="crud-header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-primary" onClick={abrirModalCrear}>
          <FaPlus /> Nuevo usuario
        </button>
      </div>

      {mensaje.texto && (
        <div
          className={`crud-toast ${mensaje.tipo === "error" ? "toast-error" : "toast-ok"}`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* ─── Barra de búsqueda ─── */}
      <div className="crud-search-bar">
        <span className="crud-search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="crud-search-input"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button
            className="crud-search-clear"
            onClick={() => setBusqueda("")}
            title="Limpiar búsqueda"
          >
            <FaTimes />
          </button>
        )}
      </div>

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
            {usuariosPagina.length === 0 ? (
              <tr>
                <td colSpan={6} className="td-empty">
                  {busqueda
                    ? "No se encontraron usuarios con ese criterio"
                    : "No hay usuarios registrados"}
                </td>
              </tr>
            ) : (
              usuariosPagina.map((u, i) => (
                <tr key={u.id} className={!u.activo ? "row-inactivo" : ""}>
                  <td>{(paginaActual - 1) * PAGE_SIZE + i + 1}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono || "—"}</td>
                  <td>
                    <span
                      className={`badge-estado ${u.activo ? "badge-activo" : "badge-inactivo"}`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button
                      className="btn-icon btn-edit"
                      title="Modificar usuario"
                      onClick={() => abrirModalEditar(u)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn-toggle ${u.activo ? "btn-inhabilitar" : "btn-habilitar"}`}
                      onClick={() =>
                        setConfirmToggle({
                          id: u.id,
                          nombre: u.nombre,
                          activo: u.activo,
                        })
                      }
                    >
                      {u.activo ? "Inhabilitar" : "Habilitar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Paginación ─── */}
      {totalPaginas > 1 && (
        <div className="crud-pagination">
          <span className="pagination-info">
            {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
            {busqueda ? " encontrados" : ""} · Página {paginaActual} de {totalPaginas}
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn page-btn-arrow"
              onClick={() => irAPagina(1)}
              disabled={paginaActual === 1}
              title="Primera página"
            >
              «
            </button>
            <button
              className="page-btn page-btn-arrow"
              onClick={() => irAPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              title="Anterior"
            >
              ‹
            </button>

            {paginasVisibles[0] > 1 && (
              <>
                <button className="page-btn" onClick={() => irAPagina(1)}>1</button>
                {paginasVisibles[0] > 2 && <span className="page-ellipsis">…</span>}
              </>
            )}

            {paginasVisibles.map((n) => (
              <button
                key={n}
                className={`page-btn ${n === paginaActual ? "page-btn-active" : ""}`}
                onClick={() => irAPagina(n)}
              >
                {n}
              </button>
            ))}

            {paginasVisibles[paginasVisibles.length - 1] < totalPaginas && (
              <>
                {paginasVisibles[paginasVisibles.length - 1] < totalPaginas - 1 && (
                  <span className="page-ellipsis">…</span>
                )}
                <button className="page-btn" onClick={() => irAPagina(totalPaginas)}>
                  {totalPaginas}
                </button>
              </>
            )}

            <button
              className="page-btn page-btn-arrow"
              onClick={() => irAPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              title="Siguiente"
            >
              ›
            </button>
            <button
              className="page-btn page-btn-arrow"
              onClick={() => irAPagina(totalPaginas)}
              disabled={paginaActual === totalPaginas}
              title="Última página"
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* ─── Modal Crear / Editar ─── */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editandoId ? "Modificar usuario" : "Nuevo usuario"}</h2>
              <button className="btn-icon-close" onClick={cerrarModal}>
                <FaTimes />
              </button>
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
                    id="nombre"
                    name="nombre"
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
                    id="email"
                    name="email"
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
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="Ej: 1030318920"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal-input-row">
                  <IoMdLock />
                  <label htmlFor="password">
                    {editandoId ? "Nueva contraseña" : "Contraseña"}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={
                      editandoId
                        ? "Dejar vacío para no cambiar"
                        : "Mínimo 8 caracteres"
                    }
                    value={form.password}
                    onChange={handleChange}
                    required={!editandoId}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={cargando}
                >
                  {cargando
                    ? editandoId
                      ? "Guardando..."
                      : "Creando..."
                    : editandoId
                      ? "Guardar cambios"
                      : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal Confirmar Toggle ─── */}
      {confirmToggle && (
        <div className="modal-overlay" onClick={() => setConfirmToggle(null)}>
          <div
            className="modal-card modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>
              {confirmToggle.activo
                ? "Inhabilitar usuario"
                : "Habilitar usuario"}
            </h2>
            <p>
              {confirmToggle.activo ? (
                <>
                  <strong>{confirmToggle.nombre}</strong> será inhabilitado. Su
                  información se conservará.
                </>
              ) : (
                <>
                  ¿Deseas habilitar nuevamente a{" "}
                  <strong>{confirmToggle.nombre}</strong>?
                </>
              )}
            </p>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setConfirmToggle(null)}
              >
                Cancelar
              </button>
              <button
                className={confirmToggle.activo ? "btn-danger" : "btn-success"}
                disabled={cargando}
                onClick={handleToggleEstado}
              >
                {cargando
                  ? "Procesando..."
                  : confirmToggle.activo
                    ? "Sí, inhabilitar"
                    : "Sí, habilitar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CrudAdmin;

