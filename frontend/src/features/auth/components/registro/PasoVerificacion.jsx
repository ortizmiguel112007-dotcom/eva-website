import { FiMail } from "react-icons/fi"

export function PasoVerificacion({ email, codigo, setCodigo, error, cargando, onVolver, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="container-form">
      <div className="container-paddin">
        <p className="mensaje-info">
          Te enviamos un código a <strong>{email}</strong>. Ingrésalo para activar tu cuenta.
        </p>
        <div className="container-input">
          <FiMail />
          <label htmlFor="codigo">Código</label>
          <input id="codigo" placeholder="6 dígitos" maxLength={6}
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            className="re-codigo-input"
            required />
        </div>
      </div>
      {error && <p className="mensaje">{error}</p>}
      <div className="container-button">
        <button type="button" className="btn-secondary" onClick={onVolver}>Volver</button>
        <button type="submit" disabled={cargando}>
          {cargando ? "Verificando..." : "Verificar"}
        </button>
      </div>
    </form>
  )
}