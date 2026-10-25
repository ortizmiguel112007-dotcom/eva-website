/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                        ProductCard                          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Componente visual reutilizable que representa un producto en forma de tarjeta.
 * Muestra información clave como imagen, nombre, categoría, tienda/emprendedor
 * y precio. Incluye interacción mediante click y un botón de acción.
 *
 * Maneja estados como:
 * - Imagen disponible o placeholder
 * - Tipo de producto (badge visual)
 * - Nombre del vendedor o alianza
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 📦 Importación:
 * import { ProductCard } from "@/shared/product/ProductCard"
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🧩 Ejemplos de uso:
 *
 * const product = {
 *   nombre_producto: "Camiseta",
 *   categoria: "Ropa",
 *   precio: 50000,
 *   tipo: "nuevo",
 *   imagen: "https://...",
 *   seccion: {
 *     emprendedora: {
 *       usuario: { nombre: "María" }
 *     }
 *   }
 * };
 *
 * [ Uso básico ]
 * <ProductCard product={product} />
 *
 * [ Con evento click ]
 * <ProductCard
 *   product={product}
 *   onClick={() => console.log("Producto seleccionado")}
 * />
 *
 * ──────────────────────────────────────────────────────────────
 *
 * ⚙️ Parámetros (props):
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - Objeto con la información del producto
 * @param {string} [props.product.nombre_producto] - Nombre del producto
 * @param {string} [props.product.categoria] - Categoría del producto
 * @param {number} [props.product.precio] - Precio del producto
 * @param {string} [props.product.tipo] - Tipo de producto (nuevo, usado, etc.)
 * @param {string} [props.product.imagen] - URL de la imagen del producto
 * @param {Object} [props.product.seccion] - Información de la sección/vendedor
 * @param {Object} [props.product.seccion.emprendedora] - Datos del emprendedor
 * @param {Object} [props.product.seccion.alianza] - Datos de alianza (múltiples participantes)
 * @param {Function} [props.onClick] - Función ejecutada al hacer click en la tarjeta
 * @param {Object} [props.rest] - Props adicionales (className, style, etc.)
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔄 Retorno:
 *
 * @returns {React.ReactElement}
 *
 * Devuelve una tarjeta (`div`) con la siguiente estructura:
 *
 * <div class="ip-product-card">
 *   <div class="ip-product-img">
 *     [Imagen o placeholder]
 *     <span class="ip-tipo-badge">Tipo</span>
 *   </div>
 *
 *   <div class="ip-product-body">
 *     <h3>Nombre</h3>
 *     <span>Categoría</span>
 *     <span>Nombre tienda/emprendedor</span>
 *
 *     <div class="ip-product-footer">
 *       <span>Precio formateado</span>
 *       <button>Acción</button>
 *     </div>
 *   </div>
 * </div>
 *
 * ──────────────────────────────────────────────────────────────
 */

// Hooks de navegación (routing)
// import { useNavigate } from "react-router-dom";

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
// import {
//     FiPackage,
//     FiArrowRight
// } from "@/infrastructure/icons/index.js";

import { FiPackage, FiHeart, FiShoppingCart, FiCheck, FiClock, FiEye, FiArrowRight } from "react-icons/fi"

import { RatingEstrellas } from "@/features/tienda/components/shared/RatingEstrellas"

// ══ Estilos ══════════
import "@/infrastructure/css/shared/product/ProductCard.css";

// ══ utils ════════════
import { formatPrecio } from "@/features/tienda/utils/utils";

// ══ Shared ════════════
import { UiButton } from "@/shared/ui/UiButton"

// ══ Agenda (reserva de servicios) ════════════
import { useReservar } from "@/features/agenda/hooks/useReservar"

/**
 * Componente ProductCard
 */
export function ProductCard({
  // acepta tanto "product" (viejo) como "producto" (nuevo)
  product,
  producto,
  idx = 0,
  onClick,
  onNavigate,
  onAgregar,
  onFavorito,
  esFavorito = false,
  yaAgregado = false,
  puedeComprar = true,
  ...props
}) {
  const p = producto || product || {}
  const { irAReservar } = useReservar()
  const agotado    = p.tipo !== "servicio" && p.inventario?.cantidad === 0
  const d          = p.descuento
  const precioFinal = d ? d.precio_con_descuento : Number(p.precio)
  const porcentaje  = d?.tipo === "porcentaje"
    ? `-${d.valor}%`
    : d ? `-${formatPrecio(d.descuento)}` : null

  const calPromedio = p.comentarios?.length
    ? p.comentarios.reduce((acc, c) => acc + c.calificacion, 0) / p.comentarios.length
    : 0

  const nombreTienda = p.seccion?.alianza
    ? p.seccion.alianza.participantes?.map(x => x.usuario?.nombre).join(" & ")
    : p.seccion?.emprendedora?.usuario?.nombre || "EVA"

  const handleClick = () => {
    if (onNavigate) onNavigate(p.id_producto)
    else if (onClick) onClick()
  }

  // ── Modo simple (sin onAgregar ni onFavorito) ──
  const modoSimple = !onAgregar && !onFavorito

   return (
    <div
      className="pc-card"
      style={{ animationDelay: `${(idx % 9) * 0.04}s` }}
      onClick={handleClick}
      {...props}
    >
      {/* ── Imagen ── */}
      <div className="pc-img">
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre_producto} />
          : <div className="pc-no-img"><FiPackage size={36} color="#cbd5e1" /></div>
        }
        <div className="pc-img-overlay">
          <span className="pc-ver-btn"><FiEye size={16} /> Ver detalle</span>
        </div>
        <span className={`pc-badge pc-badge--${p.tipo}`}>{p.tipo}</span>
        {onFavorito && (
          <button
            className={`pc-fav-btn ${esFavorito ? "active" : ""}`}
            onClick={e => onFavorito(e, p.id_producto)}
          >
            <FiHeart size={13}
              fill={esFavorito ? "#ef4444" : "none"}
              color={esFavorito ? "#ef4444" : "#94a3b8"}
            />
          </button>
        )}
        {agotado && <div className="pc-agotado-overlay"><span>Agotado</span></div>}
      </div>

      {/* ── Body ── */}
      <div className="pc-body">
        <span className="pc-cat">{p.categoria}</span>
        <h3 className="pc-nombre">{p.nombre_producto}</h3>

        {calPromedio > 0 && (
          <RatingEstrellas promedio={calPromedio} total={p.comentarios?.length} size={11} />
        )}

        {p.descripcion && <p className="pc-desc">{p.descripcion}</p>}

        {p.tipo === "servicio" && p.duracion && (
          <div className="pc-duracion"><FiClock size={11} /> {p.duracion}</div>
        )}

        {!modoSimple && (
          <span className="pc-tienda"><span>◎</span> {nombreTienda}</span>
        )}

        {/* ── Footer ── */}
        <div className="pc-footer">
          <div className="pc-precios">
            {d && <span className="pc-precio-original">{formatPrecio(p.precio)}</span>}
            <div className="pc-precio-row">
              <span className="pc-precio">{formatPrecio(precioFinal)}</span>
              {porcentaje && <span className="pc-descuento-badge">{porcentaje}</span>}
            </div>
          </div>

          {modoSimple ? (
            <button className="pc-btn-simple" onClick={e => { e.stopPropagation(); handleClick() }}>
              <FiArrowRight size={16} />
            </button>
          ) : puedeComprar ? (
            <button
              className={`pc-btn-agregar ${yaAgregado ? "agregado" : ""} ${agotado ? "agotado" : ""}`}
              disabled={agotado}
               onClick={e => {
                e.stopPropagation()

                // Los servicios no van al carrito: se reservan como cita.
                if (p.tipo === "servicio") {
                  irAReservar(p.id_producto)
                  return
                }

                onAgregar(e, p)
              }}
            >
              {yaAgregado
                ? <><FiCheck size={13} /> Listo</>
                : agotado ? "Agotado"
                : p.tipo === "servicio" ? "Reservar"
                : <><FiShoppingCart size={13} /> Agregar</>
              }
            </button>
          ) : (
            <button className="pc-btn-agregar" style={{ opacity: 0.5, cursor: "not-allowed" }}
              onClick={e => { e.stopPropagation(); handleClick() }}>
              <FiEye size={13} /> Ver
            </button>
          )}
        </div>
      </div>
    </div>
  )
}