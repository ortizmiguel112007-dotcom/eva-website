import { CATEGORIAS_PRODUCTO } from "@/features/products/constants/categorias"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/products-emprend/form/CamposCampos.css"

function formatCOP(value) {
  return value ? new Intl.NumberFormat("es-CO").format(value) : ""
}

export function CamposProducto({ form, setForm, errors, onPriceChange }) {
  return (
    <>
      <div className="form-group">
        <label>Categoría:</label>
        <select name="categoria" value={form.categoria}
          onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))}>
          <option value="">Seleccionar categoría</option>
          {CATEGORIAS_PRODUCTO.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {errors.categoria && <span className="error">{errors.categoria}</span>}
      </div>

      <div className="row">
        <div className="form-group">
          <label>Precio:</label>
          <input type="text" inputMode="numeric" placeholder="$ 0"
            value={form.precio ? `$ ${formatCOP(form.precio)}` : ""}
            onChange={onPriceChange}
          />
          {errors.precio && <span className="error">{errors.precio}</span>}
        </div>
        <div className="form-group">
          <label>Stock mínimo:</label>
          <input type="number" min="1" name="stock_minimo" value={form.stock_minimo}
            onChange={e => setForm(prev => ({
              ...prev, stock_minimo: Math.max(1, e.target.value)
            }))}
          />
          {errors.stock_minimo && <span className="error">{errors.stock_minimo}</span>}
        </div>
      </div>
    </>
  )
}