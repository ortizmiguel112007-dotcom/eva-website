/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                           Alert                             ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Componente de alerta visual reutilizable que permite mostrar mensajes
 * informativos al usuario con diferentes variantes (success, error, warning, info).
 * Soporta íconos opcionales, cierre manual o automático, y animaciones de entrada/salida.
 *
 * Ideal para notificaciones rápidas dentro de la interfaz.
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 📦 Importación:
 * import { Alert } from "@/shared/ui/Alert"
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🧩 Ejemplos de uso:
 *
 * [ Uso básico ]
 * <Alert>
 *   Mensaje informativo
 * </Alert>
 *
 * [ Con variante y auto cierre ]
 * <Alert
 *   variant="success"
 *   autoClose
 *   duration={2000}
 * >
 *   Producto agregado correctamente
 * </Alert>
 *
 * [ Con ícono ]
 * import { FiCheckCircle } from "react-icons/fi";
 *
 * <Alert icon={FiCheckCircle} variant="success">
 *   Operación exitosa
 * </Alert>
 *
 * [ Con callback al cerrar ]
 * <Alert onClose={() => console.log("cerrado")}>
 *   Se cerró la alerta
 * </Alert>
 *
 * [ Múltiples alertas (recomendado) ]
 * <div className="alert-container">
 *   <Alert variant="success">Guardado correctamente</Alert>
 *   <Alert variant="error">Error al procesar</Alert>
 * </div>
 *
 * ──────────────────────────────────────────────────────────────
 *
 * ⚙️ Parámetros (props):
 *
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del mensaje (texto o JSX)
 * @param {React.ComponentType} [props.icon] - Componente de ícono opcional
 * @param {string} [props.variant="info"] - Tipo de alerta (info, success, warning, error, etc.)
 * @param {string} [props.className=""] - Clases adicionales para personalización
 * @param {boolean} [props.autoClose=false] - Define si la alerta se cierra automáticamente
 * @param {number} [props.duration=3000] - Tiempo en ms antes de cerrar automáticamente
 * @param {number} [props.animationDuration=300] - Duración de la animación de salida (ms)
 * @param {boolean} [props.showCloseButton=true] - Muestra botón de cierre manual
 * @param {() => void} [props.onClose] - Función callback al cerrar la alerta
 * @param {Object} [props.rest] - Props adicionales (style, id, data-*, etc.)
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔄 Retorno:
 *
 * @returns {React.ReactElement | null}
 *
 * Devuelve:
 * - Un contenedor `<div>` con clases dinámicas según variante y estado (entrada/salida)
 * - Un ícono opcional
 * - Un `<span>` con el contenido
 * - Un botón de cierre opcional
 *
 * Estructura:
 *
 * <div class="alert alert-{variant}">
 *   [Icono opcional]
 *   <span>Mensaje</span>
 *   [Botón de cerrar opcional]
 * </div>
 *
 * Si la alerta se cierra, retorna `null`.
 *
 * ──────────────────────────────────────────────────────────────
 */

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import { IoClose } from "@/infrastructure/icons/index.js"

// Hooks de React para estado y ciclo de vida
import { useEffect, useState } from "react";

// ══ Estilos ══════════
import "@/infrastructure/css/shared/ui/Alert.css";

/**
 * Componente Alert
 */
export function Alert({
    children,
    icon: Icon,
    variant = "info",
    className = "",
    autoClose = false,
    duration = 3000,
    animationDuration = 300,
    showCloseButton = true,
    onClose,
    ...props
}) {
    const [visible, setVisible] = useState(true);
    const [exiting, setExiting] = useState(false);


    /**
     * Maneja el cierre de la alerta con animación
     */
    const close = () => {
        setExiting(true);

        setTimeout(() => {
            setVisible(false);
            onClose && onClose();
        }, animationDuration);
    };

    /**
     * Controla el auto cierre
     */
    useEffect(() => {
        if (!autoClose) return;

        const t = setTimeout(close, duration);
        return () => clearTimeout(t);
    }, [autoClose, duration]);

    /**
     * Reinicia estado cuando cambia el contenido
     */
    useEffect(() => {
        setVisible(true);
        setExiting(false);
    }, [children]);

    if (!visible) return null;

    return (
        <div
            className={`alert alert-${variant} ${exiting ? "alert-exit" : "alert-enter"
                } ${className}`}
            {...props}
        >
            {Icon && <Icon className="alertIcon" />}

            <span>{children}</span>

            {showCloseButton && (
                <button className="alertClose" onClick={close}>
                    <IoClose className="alertIcon"/>
                </button>
            )}
        </div>
    );
}