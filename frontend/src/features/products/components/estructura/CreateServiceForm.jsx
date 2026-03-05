import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const CreateServiceForm = ({
  onSubmit,
  onClose,
  isEdit = false,
  initialData,
}) => {
  const navigate = useNavigate();

  const [form, setForm] = useState(
    initialData || {
      name: "",
      description: "",
      category: "",
      price: "",
      duration: "",
    },
  );

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm({ ...form, price: raw });
  };
  const formatCOP = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO").format(value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.(form);
      navigate("/dashboard");
    }
  };
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Nombre obligatorio";
    if (!form.description.trim())
      newErrors.description = "Descripción obligatoria";
    if (!form.category) newErrors.category = "Categoría obligatoria";

    if (form.price === "" || Number(form.price) < 0)
      newErrors.price = "El precio debe ser mayor o igual a 0";

    if (!form.duration.trim()) newErrors.duration = "Duración obligatoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? "Editar servicio" : "Crear nuevo servicio"}</h2>
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
            <label>Nombre del servicio</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Asesoría contable"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe el servicio"
            />
          </div>

          <div className="row">
            <div className="form-group">
              <label>Categoría</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="marketing">Marketing</option>
                <option value="consultoria">Consultoría</option>
                <option value="educacion">Educación</option>
              </select>
            </div>

            <div className="form-group">
              <label>Precio:</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="$ 0"
                value={form.price ? `$ ${formatCOP(form.price)}` : ""}
                onChange={handlePriceChange}
              />
              {errors.price && <span className="error">{errors.price}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Duración</label>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="Ej: 1 hora"
            />
          </div>

          <div className="button-row">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              {isEdit ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceForm;
