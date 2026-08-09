import {
  FiGift, FiTag, FiPercent, FiDollarSign,
  FiCalendar, FiAlertCircle, FiClock, FiPlus
} from "react-icons/fi"


import "@/infrastructure/css/products-emprend/cupones/ModalNuevoCupon.css"

export function ModalNuevoCupon({ form, setForm, formErrors, guardando, onCrear, onCerrar }) {
  return (
    <div className="cupon-modal-overlay" onClick={onCerrar}>
      <div className="cupon-modal" onClick={e => e.stopPropagation()}>
        <div className="cupon-modal-header">
          <FiGift size={20} />
          <h3>Nuevo Cupón</h3>
        </div>

        <div className="cupon-modal-row">
          <div className="cupon-modal-field">
            <label>Código</label>
            <div className="cupon-input-icon-wrapper">
              <FiTag size={14} className="cupon-input-icon" />
              <input type="text" value={form.codigo} className="with-icon"
                onChange={e => setForm(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
                placeholder="Ej: VERANO20"
              />
            </div>
            {formErrors.codigo && (
              <span className="cupon-modal-error"><FiAlertCircle size={11} /> {formErrors.codigo}</span>
            )}
          </div>
          <div className="cupon-modal-field">
            <label>Tipo</label>
            <select value={form.tipo}
              onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}>
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="valor_fijo">Valor fijo ($)</option>
            </select>
          </div>
        </div>

        <div className="cupon-modal-field">
          <label>{form.tipo === "porcentaje" ? "Porcentaje (1–100)" : "Valor de descuento"}</label>
          <div className="cupon-input-icon-wrapper">
            {form.tipo === "porcentaje"
              ? <FiPercent size={14} className="cupon-input-icon" />
              : <FiDollarSign size={14} className="cupon-input-icon" />
            }
            <input type="number" min="1" value={form.valor} className="with-icon"
              max={form.tipo === "porcentaje" ? "100" : undefined}
              onChange={e => setForm(prev => ({ ...prev, valor: e.target.value }))}
              placeholder={form.tipo === "porcentaje" ? "Ej: 20" : "Ej: 10000"}
            />
          </div>
          {formErrors.valor && (
            <span className="cupon-modal-error"><FiAlertCircle size={11} /> {formErrors.valor}</span>
          )}
        </div>

        <div className="cupon-modal-field">
          <label>Descripción <span className="cupon-modal-hint">(opcional)</span></label>
          <input type="text" value={form.descripcion}
            onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Ej: Descuento de temporada"
          />
        </div>

        <div className="cupon-modal-row">
          <div className="cupon-modal-field">
            <label>Fecha de vencimiento <span className="cupon-modal-hint">(opcional)</span></label>
            <div className="cupon-input-icon-wrapper">
              <FiCalendar size={14} className="cupon-input-icon" />
              <input type="date" value={form.fecha_fin} className="with-icon"
                onChange={e => setForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
              />
            </div>
          </div>
          <div className="cupon-modal-field">
            <label>Límite de usos <span className="cupon-modal-hint">(opcional)</span></label>
            <input type="number" min="1" value={form.limite_usos}
              onChange={e => setForm(prev => ({ ...prev, limite_usos: e.target.value }))}
              placeholder="Sin límite"
            />
          </div>
        </div>

        <div className="cupon-modal-buttons">
          <button className="btn-cancelar-cupon" onClick={onCerrar}>Cancelar</button>
          <button className="btn-crear-cupon" onClick={onCrear} disabled={guardando}>
            {guardando
              ? <><FiClock size={14} /> Creando...</>
              : <><FiPlus  size={14} /> Crear cupón</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}