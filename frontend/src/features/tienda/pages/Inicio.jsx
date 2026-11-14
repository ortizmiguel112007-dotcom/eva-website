/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                      Página: Inicio                          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Punto de entrada principal de la tienda (Landing Page). Este componente 
 * actúa como el "Orquestador" del flujo de datos, gestionando el estado 
 * global de la vista, la navegación y la comunicación con la API.
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * 🎯 Responsabilidades:
 * - Centralizar el consumo de datos mediante el hook `useHomeData`.
 * - Gestionar mensajes de estado/alertas provenientes de la navegación.
 * - Implementar el filtrado dinámico del catálogo por categorías.
 * - Componer la interfaz mediante la unión de secciones especializadas.
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🧠 Lógica de Negocio:
 * - Alerta inicial: Captura mensajes del `location.state` (ej. después de un login).
 * - Filtrado: `handleCategoria` realiza peticiones asíncronas a `tiendaService`
 *   para actualizar el estado del catálogo sin recargar la página.
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * 🔗 Dependencias:
 * - useHomeData: Hook personalizado para la carga inicial de datos.
 * - tiendaService: Capa de servicios para peticiones al backend.
 * - Componentes Inicio (Hero, Destacados, Categorias, Catalogo, Tiendas, Footer).
 *
 * ──────────────────────────────────────────────────────────────
 */

/**
 * Página: Inicio (único para todos los roles)
 *
 * Mismo diseño para todos; cambia según el rol:
 *  - visitante:    cifras públicas de la plataforma
 *  - usuario:      sus pedidos, citas y favoritos
 *  - emprendedora: pedidos y citas por atender, y su catálogo
 *  - admin:        accesos a la gestión de la plataforma
 */

// Hooks de navegación (routing)
import { useNavigate, useLocation } from "react-router-dom";

// Icono de la alerta
import { FiZap } from "react-icons/fi";

// ══ Contexto ══════════
import { useAuth } from "@/core/context/AuthConten";

// ══ Estilos ══════════
import "@/infrastructure/css/tienda/inicio/inicio.css";

// ══ Shared ════════════
import { Alert } from "@/shared/ui/Alert";

// ══ Hooks ═════════════
import { useHomeData } from "@/features/tienda/hooks/inicio/useHomeData";
import { useInicioRol } from "@/features/tienda/hooks/inicio/useInicioRol";

// ══ Componentes ══════
import { InicioHero } from "../components/inicio/InicioHero";
import { InicioResumen } from "../components/inicio/InicioResumen";
import { InicioDestacados } from "../components/inicio/InicioDestacados";
import { InicioTiendas } from "../components/inicio/InicioTiendas";
import { InicioFooter } from "../components/inicio/InicioFooter";

export default function Inicio() {
  const navigate = useNavigate();
  const location = useLocation();
  const mensajePendiente = location.state?.mensaje;

  const { user, token } = useAuth();
  const tienda = useHomeData();
  const { rol, resumen } = useInicioRol(user, token);

  return (
    <div>
      <div className="alert-container">
        {mensajePendiente && <Alert icon={FiZap}>{mensajePendiente}</Alert>}
      </div>

      {/* ───── HERO (cambia según el rol) ───── */}
      <InicioHero
        navigate={navigate}
        tienda={tienda}
        rol={rol}
        user={user}
        resumen={resumen}
      />

      {/* ── ACCESOS RÁPIDOS (solo con sesión) ── */}
      {rol && <InicioResumen navigate={navigate} rol={rol} resumen={resumen} />}

      {/* ── DESTACADOS ── */}
      {tienda.destacados.length > 0 && (
        <InicioDestacados navigate={navigate} tienda={tienda} rol={rol} />
      )}

      {/* ── TIENDAS ── */}
      <InicioTiendas navigate={navigate} tienda={tienda} />

      {/* ── FOOTER ── */}
      <InicioFooter navigate={navigate} />
    </div>
  );
}