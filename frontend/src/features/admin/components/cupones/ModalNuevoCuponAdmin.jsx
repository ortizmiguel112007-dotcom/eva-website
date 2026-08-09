import "@/infrastructure/css/admin/cupones/ModalNuevoCuponAdmin.css"

const CAMPOS = [
  { label: "Código*",              key: "codigo",      placeholder: "Ej: DESCUENTO20", upper: true },
  { label: "Descripción",          key: "descripcion", placeholder: "Descripción opcional" },
  { label: "Valor*",               key: "valor",       placeholder: "Ej: 20", type: "number" },
  { label: "Fecha de vencimiento", key: "fecha_fin",   type: "date" },
  { label: "Límite de usos",       key: "limite_usos", placeholder: "Sin límite", type: "number" },
]

export function ModalNuevoCuponAdmin({ form, setForm, guardando, onCrear, onCerrar }) {
  return (
    <div className="ac-modal-overlay" onClick={onCerrar}>
      <div className="ac-modal" onClick={e => e.stopPropagation()}>
        <h3>Nuevo Cupón</h3>

        {CAMPOS.map(f => (
          <div key={f.key} className="ac-field">
            <label>{f.label}</label>
            <input type={f.type || "text"} value={form[f.key]}
              placeholder={f.placeholder}
              onChange={e => setForm(prev => ({
                ...prev, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value
              }))}
            />
          </div>
        ))}

        <div className="ac-field">
          <label>Tipo*</label>
          <select value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}>
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="valor_fijo">Valor fijo ($)</option>
          </select>
        </div>

        <div className="ac-modal-btns">
          <button className="ac-btn-cancelar" onClick={onCerrar}>Cancelar</button>
          <button className="ac-btn-guardar" onClick={onCrear} disabled={guardando}>
            {guardando ? "Creando..." : "Crear cupón"}
          </button>
        </div>
      </div>
    </div>
  )
}