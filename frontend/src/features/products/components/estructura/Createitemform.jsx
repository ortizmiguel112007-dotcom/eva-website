import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthConten";
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

    setCargando(true);
    setError(null);
    try {
      if (isEdit && initialData?.id_producto) {
        // EDITAR — PUT
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
        // CREAR — POST
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
