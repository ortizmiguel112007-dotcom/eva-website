/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                         InicioFooter                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Pie de página institucional del marketplace. Provee información de 
 * contacto, enlaces de navegación rápida, redes sociales y el 
 * branding final de la plataforma (EVA).
 *
 * 🎯 Responsabilidades:
 * - Mostrar la identidad de marca y redes sociales.
 * - Facilitar el acceso rápido a secciones principales (Catálogo, Tiendas).
 * - Centralizar los canales oficiales de soporte y contacto técnico.
 * - Mostrar los créditos y derechos de autor del proyecto.
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔗 Dependencias:
 * - infrastructure/icons: Centraliza una amplia gama de íconos (FiHeart, 
 *   FiInstagram, FiFacebook, FiTwitter, FiArrowRight, FiMail, FiPhone, FiMapPin).
 * - React Router: Requiere la función navigate para la redirección desde los enlaces.
 *
 * ──────────────────────────────────────────────────────────────
 */

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
  FiHeart,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiArrowRight,
  FiMail,
  FiPhone,
  FiMapPin
} from "@/infrastructure/icons/index.js";

// ══ Estilos ══════════
import "@/infrastructure/css/tienda/inicio/inicioFooter.css";

/**
 * ⚙️ Parámetros (props):
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.navigate - Función para gestionar el enrutamiento hacia catálogo o tiendas.
 */
export function InicioFooter({
    navigate
}) {
    return (
        <footer className="ip-footer">
            <div className="ip-footer-inner">
                <div className="ip-footer-brand">
                    <div className="ip-footer-logo">
                        <FiHeart size={18} color="#f59e0b" /> EVA
                    </div>
                    <p>Apoyando a mujeres emprendedoras desde Colombia.</p>
                    <div className="ip-footer-social">
                        <a href="#"><FiInstagram size={18} /></a>
                        <a href="#"><FiFacebook size={18} /></a>
                        <a href="#"><FiTwitter size={18} /></a>
                    </div>
                </div>

                <div className="ip-footer-col">
                    <h4>Explorar</h4>
                    <ul>
                        <li onClick={() => navigate("/catalogo")}>
                            <FiArrowRight size={12} /> Catálogo
                        </li>
                        <li onClick={() => navigate("/tiendas")}>
                            <FiArrowRight size={12} /> Tiendas
                        </li>
                    </ul>
                </div>

                <div className="ip-footer-col">
                    <h4>Contacto</h4>
                    <p><FiMail size={13} /> soporte@eva.com</p>
                    <p><FiPhone size={13} /> +57 300 000 0000</p>
                    <p><FiMapPin size={13} /> Colombia</p>
                </div>
            </div>

            <div className="ip-footer-bottom">
                <span>© 2026 EVA Marketplace — Todos los derechos reservados</span>
                <span>
                    Hecho con <FiHeart size={12} color="#f59e0b" /> en Colombia
                </span>
            </div>
        </footer>
    )
}
/**
 * 🧩 Ejemplo de implementación:
 * 
 * <InicioFooter 
 *    navigate={navigate} 
 * />
 */