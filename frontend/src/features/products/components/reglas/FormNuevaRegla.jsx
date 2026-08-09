import { useState } from "react"
import "@/infrastructure/css/products-emprend/reglas/FormNuevaRegla.css"

const CONDICIONES = [
  { value: "siempre",       label: "Siempre activo"           },
  { value: "stock_bajo",    label: "Cuando el stock sea bajo" },
  { value: "stock_menor_a", label: "Cuando stock sea menor a" },
]

const TIPOS = [
  { value: "porcentaje", label: "Porcentaje (%)" },
  { value: "valor_fijo", label: "Valor fijo ($)" },
]

const FORM_INICIAL = {
  nombre: "", tipo: "porcentaje", valor: "",
  condicion: "siempre", stock_limite: "", fecha_fin: ""
}

export function FormNuevaRegla({ prioridad, onCrear, onCancelar, guardando }) {
  const [form, setForm]     = useState(FORM_INICIAL)
  const [errors, setErrors] = useState({})

  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrors(prev => ({ ...prev, [campo]: null }))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio"
    if (!form.valor)         e.valor  = "El valor es obligatorio"
    if (Number(form.valor) <= 0) e.valor = "El valor debe ser mayor a 0"
    if (form.tipo === "porcentaje" && Number(form.valor) > 100)
      e.valor = "El porcentaje no puede ser mayor a 100"
    if (form.condicion === "stock_menor_a" && !form.stock_limite)
      e.stock_limite = "Indica el límite de stock"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validar()) return
    onCrear({
      nombre:       form.nombre,
      tipo:         form.tipo,
      valor:        Number(form.valor),
      condicion:    form.condicion,
      stock_limite: form.stock_limite ? Number(form.stock_limite) : null,
      fecha_fin:    form.fecha_fin || null,
      prioridad,
    })
  }

  return (
    <div className="rd-form">
      <h3 className="rd-form-titulo">Nueva regla de descuento</h3>
      <div className="rd-form-grid">

        <div className="rd-form-group rd-form-full">
          <label>Nombre *</label>
          <input value={form.nombre}
            onChange={e => set("nombre", e.target.value)}
            placeholder="Ej: Descuento por stock bajo"
            className={errors.nombre ? "error" : ""} />
          {errors.nombre && <p className="rd-form-error">{errors.nombre}</p>}
        </div>

        <div className="rd-form-group">
          <label>Tipo de descuento *</label>
          <select value={form.tipo} onChange={e => set("tipo", e.target.value)}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="rd-form-group">
          <label>Valor * {form.tipo === "porcentaje" ? "(1-100%)" : "(en pesos)"}</label>
          <input type="number" min="1" max={form.tipo === "porcentaje" ? 100 : undefined}
            value={form.valor}
            onChange={e => set("valor", e.target.value)}
            placeholder={form.tipo === "porcentaje" ? "Ej: 20" : "Ej: 5000"}
            className={errors.valor ? "error" : ""} />
          {errors.valor && <p className="rd-form-error">{errors.valor}</p>}
        </div>

        <div className="rd-form-group">
          <label>Condición *</label>
          <select value={form.condicion} onChange={e => set("condicion", e.target.value)}>
            {CONDICIONES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {form.condicion === "stock_menor_a" && (
          <div className="rd-form-group">
            <label>Límite de stock *</label>
            <input type="number" min="1" value={form.stock_limite}
              onChange={e => set("stock_limite", e.target.value)}
              placeholder="Ej: 10"
              className={errors.stock_limite ? "error" : ""} />
            {errors.stock_limite && <p className="rd-form-error">{errors.stock_limite}</p>}
          </div>
        )}

        <div className="rd-form-group">
          <label>Fecha de vencimiento (opcional)</label>
          <input type="date" value={form.fecha_fin}
            onChange={e => set("fecha_fin", e.target.value)} />
        </div>

      </div>

      <div className="rd-form-btns">
        <button className="rd-btn-cancelar" onClick={onCancelar}>Cancelar</button>
        <button className="rd-btn-guardar" onClick={handleSubmit} disabled={guardando}>
          {guardando ? "Guardando..." : "Crear regla"}
        </button>
      </div>
    </div>
  )
}