import { FiStar, FiAlertCircle } from "react-icons/fi"

import "@/infrastructure/css/tienda/detalle/FormComentario.css"

function EstrellasInteractivas({ cal, onSelect }) {
  return (
    <div className="dp-estrellas">
      {[1, 2, 3, 4, 5].map(i => (
        <FiStar key={i} size={22}
          fill={i <= cal ? "#f59e0b" : "none"}
          color={i <= cal ? "#f59e0b" : "#d1d5db"}
          style={{ cursor: "pointer", transition: "all 0.1s" }}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  )
}

export function FormComentario({ calForm, setCalForm, textoForm, setTextoForm, errorCom, setErrorCom, enviandoCom, onSubmit, onCancelar }) {
  return (
    <div className="dp-form-card">
      <h4 className="dp-form-titulo">Tu reseña</h4>
      <form onSubmit={onSubmit}>
        <div className="dp-form-field">
          <label>Calificación</label>
          <EstrellasInteractivas cal={calForm} onSelect={setCalForm} />
        </div>
        <div className="dp-form-field">
          <label>Comentario</label>
          <textarea
            className="dp-form-textarea"
            value={textoForm}
            onChange={e => { setTextoForm(e.target.value); setErrorCom("") }}
            placeholder="¿Cómo fue tu experiencia?"
          />
        </div>
        {errorCom && (
          <p className="dp-form-error">
            <FiAlertCircle size={13} /> {errorCom}
          </p>
        )}
        <div className="dp-form-btns">
          <button type="button" className="dp-form-btn-cancel" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="dp-form-btn-submit" disabled={enviandoCom}>
            {enviandoCom ? "Enviando..." : "Publicar reseña"}
          </button>
        </div>
      </form>
    </div>
  )
}