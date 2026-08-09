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

// Hooks de React para estado y ciclo de vida
import { useState, useEffect } from "react";

// Hooks de navegación (routing)
import { useNavigate, useLocation } from "react-router-dom";

// ══ Data ═════════════
import { Categories } from "@/data/categories.js";

// ══ Estilos ══════════
import "@/infrastructure/css/tienda/inicio/inicio.css";

// ══ Shared ════════════
import { Alert } from "@/shared/ui/Alert";

// ══ Utils ═════════════
import { useHomeData } from "@/features/tienda/hooks/inicio/useHomeData";

// ══ Componentes ══════
import { InicioHero } from "../components/inicio/InicioHero";
import { InicioDestacados } from "../components/inicio/InicioDestacados";
import { InicioCatalogo } from "../components/inicio/InicioCatalogo";
import { InicioTiendas } from "../components/inicio/InicioTiendas";
import { InicioFooter } from "../components/inicio/InicioFooter"

// ══ API ══════════════
import { tiendaService } from "@/features/tienda/services/tienda.service";

export default function Inicio() {
  const navigate = useNavigate();
  const location = useLocation();
  const mensajePendiente = location.state?.mensaje;

  const tienda = useHomeData();

  const handleCategoria = async (Eleccion) => {
    try {
      const data = await tiendaService.getCatalogo(
        Eleccion ? { categoria: Eleccion } : {}
      );
      setCatalogo(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // INICIO --------------------------------------------------------------------------
    <div>
      <div className="alert-container">
        {mensajePendiente && <Alert
          icon={FiZap}
        >{mensajePendiente}</Alert>}
      </div>

      {/* ───── HERO ───── */}
      <InicioHero
        navigate={navigate}
        tienda={tienda}
      />

      {/* ── DESTACADOS ── */}
      {tienda.destacados.length > 0 && (
        <InicioDestacados
          navigate={navigate}
          tienda={tienda}
        />
      )}

      {/* ── CATÁLOGO ── */}
      {/* <InicioCatalogo
        navigate={navigate}
        tienda={tienda}
      /> */}

      {/* ── TIENDAS ── */}
      <InicioTiendas
        navigate={navigate}
        tienda={tienda}
      />

      {/* ── FOOTER ── */}
      <InicioFooter
        navigate={navigate}
      />
    </div>
  );
}