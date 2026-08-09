/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                        UiButton                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Componente de botón reutilizable y modular diseñado para la interfaz
 * del proyecto. Permite la integración de íconos en posiciones variables
 * y soporta todas las propiedades nativas de un botón HTML.
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 📦 Importación:
 * import { UiButton } from "@/shared/ui/UiButton"
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🧩 Ejemplos de uso:
 * 
 * [ 1️⃣ Uso básico ]
 * <UiButton>
 *    Confirmar
 * </UiButton>
 * 
 * [ 2️⃣ Con evento y deshabilitado ]
 * <UiButton 
 *    onClick={() => alert("Enviado")} 
 *    className="btn-submit"
 * >
 *    Enviar formulario
 * </UiButton>
 * 
 * [ 3️⃣ Con ícono a la izquierda (por defecto) ]
 * import { IconUser } from "@/icons/IconUser";
 * 
 * <UiButton icon={IconUser}>
 *    Ver Perfil
 * </UiButton>
 * 
 *  [ 4️⃣ Con ícono a la derecha ]
 * import { IconArrowRight } from "@/icons/IconArrowRight";
 * 
 * <UiButton icon={IconArrowRight} iconPosition="r">
 *    Siguiente paso
 * </UiButton>
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * ⚙️ Parámetros (props):
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ComponentType} [props.icon] - Componente de ícono a renderizar.
 * @param {"l" | "r"} [props.iconPosition="l"] - Define la posición del ícono: "l" para izquierda, "r" para derecha.
 * @param {React.ReactNode} props.children - Contenido principal del botón.
 * @param {Function} [props.onClick] - Manejador de eventos para el click.
 * @param {Object} [props.props] - Atributos adicionales (id, disabled, title, etc.).
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔄 Estructura de renderizado:
 *
 * <button>
 *   { iconPosition === "l" && <Icon /> }
 *   <span>{children}</span>
 *   { iconPosition === "r" && <Icon /> }
 * </button>
 *
 * ──────────────────────────────────────────────────────────────
 */
// ══ Estilos ══════════
import "@/infrastructure/css/shared/ui/UiButton.css";

/**
 * Componente UiButton
 * 
 * Implementa lógica de renderizado condicional para la posición de los íconos
 * y asegura la compatibilidad con atributos estándar de HTML.
 */
export function UiButton({
    icon: Icon,
    iconPosition = "l",
    children,
    onClick,
    ...props
}){
    return (
        <button onClick={onClick} {...props}>
            {iconPosition === "l" && Icon && (
                <Icon className="uiIcon" />
            )}
            <span>
                {children}
            </span>
            {iconPosition === "r" && Icon && (
                <Icon className="uiIcon" />
            )}
        </button>
    )
}