import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";

function CreateProductForm({ onSubmit, onClose, isEdit = false, initialData }) {
  const navigate = useNavigate();

  const [useUrl, setUseUrl] = useState(false);

  const [form, setForm] = useState(
    initialData || {
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      image: null,
      imagePreview: null,
    },
  );

  const [errors, setErrors] = useState({});

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setForm({ ...form, price: rawValue });
  };

  const formatCOP = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO").format(value);
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Nombre obligatorio";
    if (!form.description.trim())
      newErrors.description = "Descripción obligatoria";
    if (!form.category) newErrors.category = "Categoría obligatoria";

    if (form.price === "" || Number(form.price) < 0)
      newErrors.price = "El precio debe ser ≥ 0";

    if (form.stock === "" || Number(form.stock) < 0)
      newErrors.stock = "El stock debe ser ≥ 0";

    if (!form.image && !form.imagePreview) {
      newErrors.image = "La imagen es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
      navigate("/dashboard");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleUrlChange = (e) => {
    setForm({
      ...form,
      image: e.target.value,
      imagePreview: e.target.value,
    });
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? "Editar producto" : "Crear nuevo producto"}</h2>
          <button
            className="close-btn"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <FiX size={22} />
          </button>
        </div>

        <form className="form-container" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Audífonos Bluetooth"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe las características principales..."
            />
            {errors.description && (
              <span className="error">{errors.description}</span>
            )}
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label>Categoría:</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Seleccionar categoría</option>
              <option value="tecnologia">Tecnología</option>
              <option value="belleza">Belleza</option>
              <option value="hogar">Hogar</option>
            </select>
            {errors.category && (
              <span className="error">{errors.category}</span>
            )}
          </div>

          {/* Precio y Stock */}
          <div className="row">
            <div className="form-group">
              <label>Precio:</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="$ 0"
                value={form.price ? `$ ${formatCOP(form.price)}` : ""}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, price: rawValue });
                }}
              />
              {errors.price && <span className="error">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label>Stock:</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  setForm({ ...form, stock: value });
                }}
              />
              {errors.stock && <span className="error">{errors.stock}</span>}
            </div>
          </div>

          {/* Imagen */}
          <div className="form-group">
            <label>Imagen:</label>

            <div className="image-toggle">
              <button
                type="button"
                className={!useUrl ? "active" : ""}
                onClick={() => setUseUrl(false)}
              >
                Subir archivo
              </button>

              <button
                type="button"
                className={useUrl ? "active" : ""}
                onClick={() => setUseUrl(true)}
              >
                Usar URL
              </button>
            </div>

            {!useUrl ? (
              <>
                <div
                  className={`upload-box ${errors.image ? "input-error" : ""}`}
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

                {errors.image && <span className="error">{errors.image}</span>}
              </>
            ) : (
              <input
                type="text"
                placeholder="Pegar URL de la imagen"
                onChange={handleUrlChange}
              />
            )}

            {form.imagePreview && (
              <img
                src={form.imagePreview}
                alt="preview"
                className="image-preview"
              />
            )}

            {errors.image && <span className="error">{errors.image}</span>}
          </div>

          {/* Botones */}
          <div className="button-row">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancelar
            </button>

            <button type="submit" className="submit-btn">
              {isEdit ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProductForm;
