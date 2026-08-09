import { CATEGORIAS_SERVICIO } from "@/features/products/constants/categorias"

function formatCOP(value) {
  return value ? new Intl.NumberFormat("es-CO").format(value) : ""
}

export function CamposServicio({ form, setForm, errors, onPriceChange }) {
  return (
    <>
      <div className="row">
        <div className="form-group">
          <label>Categoría</label>
          <select name="categoria" value={form.categoria}
            onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))}>
            <option value="">Seleccionar</option>
            {CATEGORIAS_SERVICIO.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.categoria && <span className="error">{errors.categoria}</span>}
        </div>
        <div className="form-group">
          <label>Precio:</label>
          <input type="text" inputMode="numeric" placeholder="$ 0"
            value={form.precio ? `$ ${formatCOP(form.precio)}` : ""}
            onChange={onPriceChange}
          />
          {errors.precio && <span className="error">{errors.precio}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Duración</label>
        <input name="duracion" value={form.duracion}
          onChange={e => setForm(prev => ({ ...prev, duracion: e.target.value }))}
          placeholder="Ej: 1 hora"
        />
        {errors.duracion && <span className="error">{errors.duracion}</span>}
      </div>
    </>
  )
}