import { useState, useEffect } from "react"
import { FiX } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"

import { alianzaService } from "@/features/products/services/alianza.service"
import { SelectorSeccion } from "./SelectorSeccion"
import { CampoImagen } from "./CampoImagen"
import { CamposProducto } from "./CamposProducto"
import { CamposServicio } from "./CamposServicio"


import "@/infrastructure/css/products-emprend/form/CreateItemForm.css"

function CreateItemForm({ type = "product", isEdit = false, initialData }) {
  const navigate  = useNavigate()
  const { token } = useAuth()
  const isProduct = type === "product"

  const [cargando, setCargando]   = useState(false)
  const [error, setError]         = useState(null)
  const [errors, setErrors]       = useState({})
  const [seccionesAlianza, setSeccionesAlianza]       = useState([])
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("propia")

  const [form, setForm] = useState(initialData || {
    nombre_producto: "", descripcion: "", categoria: "",
    precio: "", stock_minimo: "", imagen: null, imagePreview: null, duracion: "",
  })

  useEffect(() => {
    if (!isEdit) {
      alianzaService.listarSeccionesAlianza()
        .then(data => setSeccionesAlianza(Array.isArray(data) ? data : []))
        .catch(() => setSeccionesAlianza([]))
    }
  }, [isEdit])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePriceChange = e => {
    const raw   = e.target.value.replace(/\D/g, "")
    const valor = Math.max(0, Number(raw))
    setForm(prev => ({ ...prev, precio: valor === 0 ? "" : String(valor) }))
  }

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) setForm(prev => ({
      ...prev, imagen: file, imagePreview: URL.createObjectURL(file)
    }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre_producto.trim()) e.nombre_producto = "Nombre obligatorio"
    if (!form.descripcion.trim())     e.descripcion     = "Descripción obligatoria"
    if (!form.categoria)              e.categoria       = "Categoría obligatoria"
    if (form.precio === "" || Number(form.precio) < 0)
      e.precio = "El precio debe ser mayor o igual a 0"
    if (!form.imagen && !form.imagePreview)
      e.imagen = "La imagen es obligatoria"
    if (isProduct) {
      if (form.stock_minimo === "" || Number(form.stock_minimo) < 0)
        e.stock_minimo = "El stock debe ser mayor o igual a 0"
    } else {
      if (!form.duracion.trim()) e.duracion = "Duración obligatoria"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return

    const formData = new FormData()
    formData.append("nombre_producto", form.nombre_producto)
    formData.append("descripcion",     form.descripcion)
    formData.append("precio",          form.precio)
    formData.append("categoria",       form.categoria)
    formData.append("stock_minimo",    form.stock_minimo)
    formData.append("cantidad",        form.cantidad || 0)
    formData.append("duracion",        form.duracion || "")
    formData.append("tipo",            isProduct ? "producto" : "servicio")
    if (form.imagen instanceof File)   formData.append("imagen", form.imagen)
    if (seccionSeleccionada !== "propia")
      formData.append("id_seccion_alianza", seccionSeleccionada)

    setCargando(true); setError(null)
    try {
      if (isEdit && initialData?.id_producto) {
        await axios.put(`http://localhost:3000/api/items/${initialData.id_producto}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        })
      } else {
        await axios.post("http://localhost:3000/api/items/crearitem", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        })
      }
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar")
    } finally { setCargando(false) }
  }

  const title = isEdit
    ? isProduct ? "Editar producto"      : "Editar servicio"
    : isProduct ? "Crear nuevo producto" : "Crear nuevo servicio"

  const submitLabel = isEdit ? "Guardar cambios"
    : isProduct ? "Crear producto" : "Crear servicio"

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={() => navigate("/dashboard")}>
            <FiX size={22} />
          </button>
        </div>

        <form className="form-container" onSubmit={handleSubmit}>

          {!isEdit && (
            <SelectorSeccion
              secciones={seccionesAlianza}
              seleccionada={seccionSeleccionada}
              onChange={setSeccionSeleccionada}
            />
          )}

          <div className="form-group">
            <label>{isProduct ? "Nombre:" : "Nombre del servicio"}</label>
            <input name="nombre_producto" type="text" value={form.nombre_producto}
              onChange={handleChange}
              placeholder={isProduct ? "Ej: Audífonos Bluetooth" : "Ej: Asesoría contable"}
            />
            {errors.nombre_producto && <span className="error">{errors.nombre_producto}</span>}
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              placeholder={isProduct ? "Describe las características principales..." : "Describe el servicio"}
            />
            {errors.descripcion && <span className="error">{errors.descripcion}</span>}
          </div>

          {isProduct
            ? <CamposProducto form={form} setForm={setForm} errors={errors} onPriceChange={handlePriceChange} />
            : <CamposServicio form={form} setForm={setForm} errors={errors} onPriceChange={handlePriceChange} />
          }

          <CampoImagen
            imagePreview={form.imagePreview}
            error={errors.imagen}
            onChange={handleFileChange}
          />

          {error && <p className="error">{error}</p>}

          <div className="button-row">
            <button type="button" className="cancel-btn" onClick={() => navigate("/dashboard")}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn" disabled={cargando}>
              {cargando ? "Guardando..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateItemForm
