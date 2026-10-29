import {
  FiArrowRight,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiHeart,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiUsers,
} from "react-icons/fi";

import "@/infrastructure/css/tienda/inicio/InicioResumen.css";

/**
 * Accesos rápidos del inicio según el rol.
 * `cantidad` muestra cuántos elementos esperan atención; con `urgente`
 * la tarjeta se resalta cuando hay algo pendiente.
 */
function crearTarjetas(rol, r = {}) {
  if (rol === "usuario") {
    return {
      tag: "Tu actividad",
      titulo: "Todo lo tuyo en un solo lugar",
      desc: "Pedidos, citas y favoritos al alcance de un clic",
      tarjetas: [
        {
          ruta: "/mis-pedidos",
          icono: FiShoppingBag,
          titulo: "Mis pedidos",
          desc: "Consulta el estado de tus compras",
          cantidad: r.pedidosActivos,
          etiqueta: "activos",
        },
        {
          ruta: "/seguimiento",
          icono: FiTruck,
          titulo: "Seguimiento",
          desc: "Mira dónde va tu pedido",
          cantidad: r.pagosPendientes,
          etiqueta: "pagos por revisar",
          urgente: true,
        },
        {
          ruta: "/mis-citas",
          icono: FiCalendar,
          titulo: "Mis citas",
          desc: "Reprograma o cancela tus reservas",
          cantidad: r.citasPendientes,
          etiqueta: "por confirmar",
        },
        {
          ruta: "/favoritos",
          icono: FiHeart,
          titulo: "Favoritos",
          desc: "Lo que te gustó, guardado",
          cantidad: r.favoritos,
          etiqueta: "guardados",
        },
      ],
    };
  }

  if (rol === "emprendedora") {
    return {
      tag: "Tu negocio",
      titulo: "Lo que necesita tu atención",
      desc: "Pedidos, citas y el catálogo de tu tienda",
      tarjetas: [
        {
          ruta: "/pedidos",
          icono: FiShoppingBag,
          titulo: "Pedidos",
          desc: "Valida pagos y prepara envíos",
          cantidad: r.pedidosPorAtender,
          etiqueta: "por atender",
          urgente: true,
        },
        {
          ruta: "/gestion-citas",
          icono: FiCalendar,
          titulo: "Gestión de citas",
          desc: "Responde solicitudes y cambios de horario",
          cantidad: r.citasPorResponder,
          etiqueta: "por responder",
          urgente: true,
        },
        {
          ruta: "/dashboard",
          icono: FiPackage,
          titulo: "Mis productos",
          desc: "Edita y organiza tu catálogo",
          cantidad: r.productos,
          etiqueta: "publicados",
        },
        {
          ruta: "/disponibilidad",
          icono: FiClock,
          titulo: "Mi disponibilidad",
          desc: "Define cuándo atiendes",
        },
      ],
    };
  }

  if (rol === "admin") {
    return {
      tag: "Plataforma",
      titulo: "Resumen de la plataforma",
      desc: "Accesos directos a la gestión de EVA",
      tarjetas: [
        {
          ruta: "/Admincrud",
          icono: FiUsers,
          titulo: "Usuarios",
          desc: "Gestiona cuentas y roles",
          cantidad: r.usuarios,
          etiqueta: "registrados",
        },
        {
          ruta: "/admin/pedidos",
          icono: FiShoppingBag,
          titulo: "Pedidos",
          desc: "Supervisa todas las compras",
          cantidad: r.pedidos,
          etiqueta: "en total",
        },
        {
          ruta: "/admin/productos",
          icono: FiPackage,
          titulo: "Productos",
          desc: "Revisa el catálogo completo",
          cantidad: r.productos,
          etiqueta: "publicados",
        },
        {
          ruta: "/admin",
          icono: FiBarChart2,
          titulo: "Panel de control",
          desc: "Ventas, gráficas y alertas",
        },
      ],
    };
  }

  return null;
}

export function InicioResumen({ navigate, rol, resumen }) {
  const config = crearTarjetas(rol, resumen ?? {});
  if (!config) return null;

  return (
    <section className="ip-seccion ir-seccion">
      <div className="ip-seccion-header">
        <div>
          <div className="ip-seccion-tag">{config.tag}</div>
          <h2>{config.titulo}</h2>
          <p>{config.desc}</p>
        </div>
      </div>

      <div className="ir-grid">
        {config.tarjetas.map((t) => {
          const Icono = t.icono;
          const hayCantidad = typeof t.cantidad === "number";
          const resaltar = t.urgente && hayCantidad && t.cantidad > 0;

          return (
            <button
              key={t.ruta}
              type="button"
              className={`ir-card ${resaltar ? "ir-card--urgente" : ""}`}
              onClick={() => navigate(t.ruta)}
            >
              <span className="ir-card-icono">
                <Icono size={20} />
              </span>

              <span className="ir-card-texto">
                <strong>{t.titulo}</strong>
                <small>{t.desc}</small>
              </span>

              {hayCantidad && (
                <span className="ir-card-cifra">
                  <b>{t.cantidad}</b> {t.etiqueta}
                </span>
              )}

              <FiArrowRight size={16} className="ir-card-flecha" />
            </button>
          );
        })}
      </div>
    </section>
  );
}