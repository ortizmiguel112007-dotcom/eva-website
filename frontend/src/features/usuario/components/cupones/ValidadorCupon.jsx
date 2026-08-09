import { FiZap, FiTag, FiCheck, FiAlertCircle } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/usuario/cupones/ValidadorCupon.css"

export function ValidadorCupon({ codigo, setCodigo, resultado, error, validando, onValidar }) {
  return (
    <div className="mc-validador">
      <div className="mc-validador-deco" />
      <div className="mc-validador-inner">
        <div className="mc-validador-label">
          <FiZap size={14} color="#6366f1" />
          <span>Validar código de cupón</span>
        </div>
        <div className="mc-validador-input-row">
          <div className="mc-input-wrap">
            <FiTag size={15} color="#94a3b8" />
            <input
              type="text"
              value={codigo}
              placeholder="Ej: DESC10, PROMO25..."
              onChange={e => { setCodigo(e.target.value.toUpperCase()) }}
              onKeyDown={e => e.key === "Enter" && onValidar()}
              className="mc-input"
            />
          </div>
          <button
            onClick={onValidar}
            disabled={validando || !codigo.trim()}
            className="mc-btn-validar"
          >
            {validando ? "Validando..." : "Validar"}
          </button>
        </div>

        {resultado && (
          <div className="mc-resultado ok">
            <div className="mc-resultado-icono ok"><FiCheck size={16} /></div>
            <div>
              <p className="mc-resultado-titulo">¡Cupón válido!</p>
              <p className="mc-resultado-sub">
                Descuento: <strong>
                  {resultado.tipo === "porcentaje"
                    ? `${resultado.valor}% OFF`
                    : `${formatPrecio(resultado.valor)} de descuento`}
                </strong>
                {resultado.descripcion && ` — ${resultado.descripcion}`}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mc-resultado error">
            <div className="mc-resultado-icono error"><FiAlertCircle size={16} /></div>
            <div>
              <p className="mc-resultado-titulo">Cupón no válido</p>
              <p className="mc-resultado-sub">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}