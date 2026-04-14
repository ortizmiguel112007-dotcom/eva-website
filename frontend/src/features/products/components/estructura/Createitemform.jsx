import { useState, useEffect } from "react";
import { FiX, FiShoppingBag, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthConten";
import { alianzaService } from "@/features/products/services/alianza.service";
import axios from "axios";

function CreateItemForm({
  type = "product",
  onSubmit,
  isEdit = false,
  initialData,
}) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const isProduct = type === "product";

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [seccionesAlianza, setSeccionesAlianza] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("propia"); // "propia" o id_seccion

  const [form, setForm] = useState(
    initialData || {
      nombre_producto: "",
      descripcion: "",
      categoria: "",
      precio: "",
      stock_minimo: "",
      imagen: null,
      imagePreview: null,
      duracion: "",
    },
  );

  const [errors, setErrors] = useState({});

  // Cargar secciones de alianza activas
  useEffect(() => {
    if (!isEdit) {
      alianzaService
        .listarSeccionesAlianza()
        .then((data) => setSeccionesAlianza(Array.isArray(data) ? data : []))
        .catch(() => setSeccionesAlianza([]));
    }
  }, [isEdit]);

  const formatCOP = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO").format(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const valor = Math.max(0, Number(raw));
    setForm((prev) => ({ ...prev, precio: valor === 0 ? "" : String(valor) }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        imagen: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleClose = () => navigate("/dashboard");

  const validate = () => {
    const newErrors = {};
    if (!form.nombre_producto.trim())
      newErrors.nombre_producto = "Nombre obligatorio";
    if (!form.descripcion.trim())
      newErrors.descripcion = "Descripción obligatoria";
    if (!form.categoria) newErrors.categoria = "Categoría obligatoria";
    if (form.precio === "" || Number(form.precio) < 0)
      newErrors.precio = "El precio debe ser mayor o igual a 0";
    if (!form.imagen && !form.imagePreview)
      newErrors.imagen = "La imagen es obligatoria";
    if (isProduct) {
      if (form.stock_minimo === "" || Number(form.stock_minimo) < 0)
        newErrors.stock_minimo = "El stock debe ser mayor o igual a 0";
    } else {
      if (!form.duracion.trim()) newErrors.duracion = "Duración obligatoria";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("nombre_producto", form.nombre_producto);
    formData.append("descripcion", form.descripcion);
    formData.append("precio", form.precio);
    formData.append("categoria", form.categoria);
    formData.append("stock_minimo", form.stock_minimo);
    formData.append("cantidad", form.cantidad || 0);
    formData.append("duracion", form.duracion || "");
    formData.append("tipo", type === "product" ? "producto" : "servicio");
    if (form.imagen instanceof File) formData.append("imagen", form.imagen);

    // Si eligió sección de alianza, enviarla
    if (seccionSeleccionada !== "propia") {
      formData.append("id_seccion_alianza", seccionSeleccionada);
    }

    setCargando(true);
    setError(null);
    try {
      if (isEdit && initialData?.id_producto) {
        await axios.put(
          `http://localhost:3000/api/items/${initialData.id_producto}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/items/crearitem",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setCargando(false);
    }
  };

  const categoryOptions = isProduct
    ? [
        { value: "tecnologia", label: "Tecnología" },
        { value: "belleza", label: "Belleza" },
        { value: "hogar", label: "Hogar" },
        { value: "moda", label: "Moda y Accesorios" },
        { value: "alimentacion", label: "Alimentación" },
        { value: "salud", label: "Salud y Bienestar" },
        { value: "deporte", label: "Deporte y Fitness" },
        { value: "arte", label: "Arte y Manualidades" },
        { value: "infantil", label: "Infantil y Bebés" },
        { value: "papeleria", label: "Papelería y Oficina" },
        { value: "mascotas", label: "Mascotas" },
        { value: "joyeria", label: "Joyería y Bisutería" },
        { value: "decoracion", label: "Decoración" },
        { value: "libros", label: "Libros y Revistas" },
        { value: "electronica", label: "Electrónica" },
        { value: "juguetes", label: "Juguetes y Juegos" },
        { value: "otros", label: "Otros" },
      ]
    : [
        { value: "marketing", label: "Marketing" },
        { value: "consultoria", label: "Consultoría" },
        { value: "educacion", label: "Educación" },
        { value: "diseno", label: "Diseño Gráfico" },
        { value: "fotografia", label: "Fotografía y Video" },
        { value: "desarrollo_web", label: "Desarrollo Web" },
        { value: "redes_sociales", label: "Redes Sociales" },
        { value: "contabilidad", label: "Contabilidad y Finanzas" },
        { value: "legal", label: "Legal y Jurídico" },
        { value: "salud_mental", label: "Salud Mental y Coaching" },
        { value: "nutricion", label: "Nutrición y Dieta" },
        { value: "idiomas", label: "Idiomas y Traducción" },
        { value: "musica", label: "Música y Audio" },
        { value: "eventos", label: "Eventos y Bodas" },
        { value: "limpieza", label: "Limpieza y Hogar" },
        { value: "transporte", label: "Transporte y Logística" },
        { value: "otros", label: "Otros" },
      ];

  const title = isEdit
    ? isProduct
      ? "Editar producto"
      : "Editar servicio"
    : isProduct
      ? "Crear nuevo producto"
      : "Crear nuevo servicio";

  const submitLabel = isEdit
    ? "Guardar cambios"
    : isProduct
      ? "Crear producto"
      : "Crear servicio";

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="close-btn"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <FiX size={22} />
          </button>
        </div>

        <form className="form-container" onSubmit={handleSubmit}>
          {/* ── Selector de sección (solo al crear) ── */}
          {!isEdit && seccionesAlianza.length > 0 && (
            <div className="form-group">
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <FiUsers size={14} color="#3b82f6" /> ¿Dónde publicar?
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {/* Opción tienda propia */}
                <div
                  onClick={() => setSeccionSeleccionada("propia")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.65rem 1rem",
                    borderRadius: "0.6rem",
                    cursor: "pointer",
                    border: `1.5px solid ${seccionSeleccionada === "propia" ? "#3b82f6" : "#e5e7eb"}`,
                    background:
                      seccionSeleccionada === "propia" ? "#eff6ff" : "#fff",
                  }}
                >
                  <FiShoppingBag size={16} color="#3b82f6" />
                  <span
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    Mi tienda propia
                  </span>
                  {seccionSeleccionada === "propia" && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.72rem",
                        color: "#3b82f6",
                        fontWeight: 700,
                      }}
                    >
                      ✓ Seleccionada
                    </span>
                  )}
                </div>

                {/* Opciones alianza */}
                {seccionesAlianza.map((s) => (
                  <div
                    key={s.id_seccion}
                    onClick={() => setSeccionSeleccionada(s.id_seccion)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.65rem 1rem",
                      borderRadius: "0.6rem",
                      cursor: "pointer",
                      border: `1.5px solid ${seccionSeleccionada === s.id_seccion ? "#3b82f6" : "#e5e7eb"}`,
                      background:
                        seccionSeleccionada === s.id_seccion
                          ? "#eff6ff"
                          : "#fff",
                    }}
                  >
                    <FiUsers size={16} color="#8b5cf6" />
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {s.nombre_alianza}
                    </span>
                    {seccionSeleccionada === s.id_seccion && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.72rem",
                          color: "#3b82f6",
                          fontWeight: 700,
                        }}
                      >
                        ✓ Seleccionada
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {seccionSeleccionada !== "propia" && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#3b82f6",
                    margin: "0.3rem 0 0",
                    fontWeight: 500,
                  }}
                >
                  Este producto se publicará en la tienda conjunta de la alianza
                </p>
              )}
            </div>
          )}

          <div className="form-group">
            <label>{isProduct ? "Nombre:" : "Nombre del servicio"}</label>
            <input
              name="nombre_producto"
              type="text"
              value={form.nombre_producto}
              onChange={handleChange}
              placeholder={
                isProduct ? "Ej: Audífonos Bluetooth" : "Ej: Asesoría contable"
              }
            />
            {errors.nombre_producto && (
              <span className="error">{errors.nombre_producto}</span>
            )}
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder={
                isProduct
                  ? "Describe las características principales..."
                  : "Describe el servicio"
              }
            />
            {errors.descripcion && (
              <span className="error">{errors.descripcion}</span>
            )}
          </div>

          {isProduct ? (
            <>
              <div className="form-group">
                <label>Categoría:</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar categoría</option>
                  {categoryOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <span className="error">{errors.categoria}</span>
                )}
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Precio:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="$ 0"
                    value={form.precio ? `$ ${formatCOP(form.precio)}` : ""}
                    onChange={handlePriceChange}
                  />
                  {errors.precio && (
                    <span className="error">{errors.precio}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Stock mínimo:</label>
                  <input
                    type="number"
                    min="1"
                    name="stock_minimo"
                    value={form.stock_minimo}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        stock_minimo: Math.max(1, e.target.value),
                      }))
                    }
                  />
                  {errors.stock_minimo && (
                    <span className="error">{errors.stock_minimo}</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar</option>
                    {categoryOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {errors.categoria && (
                    <span className="error">{errors.categoria}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Precio:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="$ 0"
                    value={form.precio ? `$ ${formatCOP(form.precio)}` : ""}
                    onChange={handlePriceChange}
                  />
                  {errors.precio && (
                    <span className="error">{errors.precio}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Duración</label>
                <input
                  name="duracion"
                  value={form.duracion}
                  onChange={handleChange}
                  placeholder="Ej: 1 hora"
                />
                {errors.duracion && (
                  <span className="error">{errors.duracion}</span>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label>Imagen:</label>
            <div
              className={`upload-box ${errors.imagen ? "input-error" : ""}`}
              onClick={() => document.getElementById("fileInput").click()}
            >
              {form.imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
            </div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {form.imagePreview && (
              <img
                src={form.imagePreview}
                alt="preview"
                className="image-preview"
              />
            )}
            {errors.imagen && <span className="error">{errors.imagen}</span>}
          </div>

          {error && <p className="error">{error}</p>}

          <div className="button-row">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn" disabled={cargando}>
              {cargando ? "Guardando..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateItemForm;
