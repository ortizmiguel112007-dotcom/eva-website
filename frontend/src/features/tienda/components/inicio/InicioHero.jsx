/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                        InicioHero                            ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Sección principal (Hero) de la página de inicio del marketplace. 
 * Actúa como la primera impresión para el usuario, presentando la 
 * propuesta de valor y métricas de impacto de la plataforma.
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * 🎯 Responsabilidades:
 * - Comunicar el propósito del marketplace (apoyo a emprendedoras).
 * - Facilitar la navegación rápida hacia productos y tiendas.
 * - Visualizar datos dinámicos de participación (conteo de tiendas y productos).
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔗 Dependencias:
 * - react-router-dom → Provee la función navigate para el flujo de la app.
 * - UiButton → Componente base para las llamadas a la acción (CTAs).
 * - infrastructure/icons → Centraliza los íconos FiZap, FiShoppingBag y FiUsers.
 *
 * ──────────────────────────────────────────────────────────────
 */

/**
 * Hero del inicio único de la plataforma.
 * Mantiene el mismo diseño para todos y cambia textos, botones y cifras
 * según el rol: visitante, cliente (usuario), emprendedora o administrador.
 */

import { Fragment } from "react";
import {
  FiBarChart2,
  FiPackage,
  FiPlus,
  FiShoppingBag,
  FiUsers,
  FiZap,
} from "react-icons/fi";

// ══ Estilos ══════════
import "@/infrastructure/css/tienda/inicio/InicioHero.css";

// ══ Shared ════════════
import { UiButton } from "@/shared/ui/UiButton";

// ══ Image ═════════════
import Imagen from "@/infrastructure/imgs/HeroInicio.png";

const primerNombre = (nombre = "") => nombre.trim().split(/\s+/)[0] || "";
/**
 * ⚙️ Parámetros (props):
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.navigate - Función para gestionar el enrutamiento.
 * @param {Array} [props.tiendas=[]] - Arreglo de tiendas para calcular el total de emprendedoras.
 * @param {Array} [props.catalogo=[]] - Arreglo de productos para mostrar el volumen del catálogo.
 */

function configurarHero({ rol, user, tienda, resumen }) {
  const n = (clave) => resumen?.[clave] ?? "—";

  if (rol === "usuario") {
    const nombre = primerNombre(user?.nombre);
    return {
      tag: "Tu espacio EVA",
      antes: nombre
        ? `Hola, ${nombre}. Descubre productos y servicios de`
        : "Descubre productos y servicios de",
      destacado: "mujeres emprendedoras",
      desc: "Sigue tus pedidos, gestiona tus citas y encuentra nuevos productos y servicios de emprendedoras de tu ciudad.",
      acciones: [
        { texto: "Explorar productos", icono: FiShoppingBag, ruta: "/productos", clase: "primary" },
        { texto: "Mis pedidos", icono: FiPackage, ruta: "/mis-pedidos", clase: "secondary" },
      ],
      stats: [
        { valor: n("pedidosActivos"), etiqueta: "Pedidos activos" },
        { valor: n("favoritos"), etiqueta: "Favoritos" },
        { valor: n("citasProximas"), etiqueta: "Citas próximas" },
      ],
    };
  }

  if (rol === "emprendedora") {
    const nombre = primerNombre(user?.nombre);
    return {
      tag: "Panel de emprendedora",
      antes: nombre ? `Bienvenida, ${nombre}. Haz crecer` : "Haz crecer",
      destacado: "tu negocio",
      desc: "Gestiona tus productos, atiende los pedidos y responde las solicitudes de cita de tus clientes desde un solo lugar.",
      acciones: [
        { texto: "Publicar producto o servicio", icono: FiPlus, ruta: "/crear-item", clase: "primary" },
        { texto: "Ver pedidos", icono: FiShoppingBag, ruta: "/pedidos", clase: "secondary" },
      ],
      stats: [
        { valor: n("productos"), etiqueta: "Publicados" },
        { valor: n("pedidosPorAtender"), etiqueta: "Pedidos por atender" },
        { valor: n("citasPorResponder"), etiqueta: "Citas por responder" },
      ],
    };
  }

  if (rol === "admin") {
    return {
      tag: "Administración",
      antes: "Panel de",
      destacado: "administración",
      desc: "Supervisa usuarios, pedidos y productos, y mantén la plataforma de emprendedoras en orden.",
      acciones: [
        { texto: "Ir al panel", icono: FiBarChart2, ruta: "/admin", clase: "primary" },
        { texto: "Gestionar usuarios", icono: FiUsers, ruta: "/Admincrud", clase: "secondary" },
      ],
      stats: [
        { valor: n("usuarios"), etiqueta: "Usuarios" },
        { valor: n("pedidos"), etiqueta: "Pedidos" },
        { valor: n("productos"), etiqueta: "Productos" },
      ],
    };
  }

  // Visitante
  return {
    tag: "Marketplace de Emprendedoras",
    antes: "Descubre productos y servicios de",
    destacado: "mujeres emprendedoras",
    desc: "Apoya el talento local. Encuentra productos únicos, servicios profesionales y conecta directamente con emprendedoras de tu ciudad.",
    acciones: [
      { texto: "Explorar productos", icono: FiShoppingBag, ruta: "/catalogo", clase: "primary" },
      { texto: "Ver tiendas", icono: FiUsers, ruta: "/tiendas", clase: "secondary" },
    ],
    stats: [
      { valor: `${tienda.tiendas.length}+`, etiqueta: "Emprendedoras" },
      { valor: `${tienda.catalogo.length}+`, etiqueta: "Productos" },
      { valor: "100%", etiqueta: "Local" },
    ],
  };
}

export function InicioHero({ navigate, tienda, rol = null, user = null, resumen = null }) {
  const cfg = configurarHero({ rol, user, tienda, resumen });

  return (
    <section className="ip-hero">
      <div className="ip-hero-content">
        <div className="ip-hero-container">
          <div className="ip-hero-tag">
            <FiZap size={12} />
            {cfg.tag}
          </div>

          <h1>
            {cfg.antes} <span className="ip-hero-span">{cfg.destacado}</span>
          </h1>

          <p className="ip-hero-desc">{cfg.desc}</p>

          <div className="ip-hero-actions">
            {cfg.acciones.map((a) => (
              <UiButton
                key={a.ruta}
                icon={a.icono}
                onClick={() => navigate(a.ruta)}
                className={`ip-btn ${a.clase}`}
              >
                {a.texto}
              </UiButton>
            ))}
          </div>

          <div className="ip-hero-stats">
            {cfg.stats.map((s, i) => (
              <Fragment key={s.etiqueta}>
                {i > 0 && <div className="ip-stat-divider" />}
                <div className="ip-stat">
                  <strong>{s.valor}</strong>
                  <span>{s.etiqueta}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="image-container">
          <img src={Imagen} alt="Ilustración del marketplace EVA" />
        </div>
      </div>
      <div className="fondoPapel"></div>
    </section>
  );
}
/**
 * 🧩 Ejemplo de implementación:
 * 
 * <InicioHero 
 *    navigate={navigate} 
 *    tiendas={listaDeTiendas} 
 *    catalogo={listaDeProductos} 
 * />
 */