export function PasoExito({ onIrLogin, esEmprendedora = false }) {
  return (
    <div className="container-form">
      <div className="container-paddin re-exito">
        <div className="re-exito-emoji">🎉</div>
        <p className="mensaje-info re-exito-titulo">
          {esEmprendedora ? "¡Solicitud enviada!" : "¡Cuenta creada!"}
        </p>
        <p className="mensaje-info">
          {esEmprendedora
            ? "El administrador revisará tu documento y te notificará cuando sea aprobada."
            : "Tu cuenta ha sido verificada correctamente."}
        </p>
        <p className="mensaje-info re-exito-verde">
          {esEmprendedora
            ? "Mientras tanto, puedes ingresar como cliente y explorar la plataforma."
            : "Ya puedes iniciar sesión."}
        </p>
      </div>
      <div className="container-button">
        <button type="button" onClick={onIrLogin}>Ir al login</button>
      </div>
    </div>
  )
}