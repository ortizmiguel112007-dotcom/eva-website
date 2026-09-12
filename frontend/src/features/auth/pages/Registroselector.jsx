import { useNavigate, NavLink } from "react-router-dom"
import { FiShoppingBag, FiTrendingUp } from "react-icons/fi"
import background from "@/infrastructure/imgs/Fondo2.png"
import "@/infrastructure/css/Registre.css"

export default function RegistroSelector() {
  const navigate = useNavigate()

  return (
    <section className="container-register">
      <div className="container-img">
        <div className="container-formulario rs-formulario">
          <h2>Únete a EVA</h2>

          <div className="container-paddin">
            <p className="rs-subtitulo">¿Cómo quieres usar la plataforma?</p>

            <div className="rs-opciones">
              <div className="rs-opcion rs-opcion--cliente"
                onClick={() => navigate("/registro/cliente")}>
                <div className="rs-icono rs-icono--cliente">
                  <FiShoppingBag className="rs-icon" />
                </div>
                <h3 className="rs-opcion-titulo">Soy cliente</h3>
                <p className="rs-opcion-desc">
                  Explora productos y servicios de emprendedoras, realiza compras y deja reseñas.
                </p>
                <button className="rs-btn rs-btn--cliente">
                  Registrarme como cliente
                </button>
              </div>

              <div className="rs-opcion rs-opcion--emprendedora"
                onClick={() => navigate("/registro/emprendedora")}>
                <div className="rs-icono rs-icono--emprendedora">
                  <FiTrendingUp className="rs-icon" />
                </div>
                <h3 className="rs-opcion-titulo">Soy emprendedora</h3>
                <p className="rs-opcion-desc">
                  Crea tu tienda, publica productos y servicios, y llega a más clientes.
                </p>
                <button className="rs-btn rs-btn--emprendedora">
                  Quiero vender en EVA
                </button>
              </div>
            </div>
          </div>

          <div className="container-button rs-footer">
            <p className="rs-login-link">
              ¿Ya tienes cuenta?{" "}
              <NavLink to="/login">Inicia sesión aquí</NavLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}