import { FiUser, FiSmartphone, FiCreditCard, FiCheck, FiClock } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/products-emprend/liquidaciones/LiquidacionCard.css"

export function LiquidacionCard({ liquidacion, onMarcarPagado }) {
  const { emprendedora, pedido, monto, estado, fecha_generada, fecha_pagado, nota } = liquidacion

  return (
    <div className="liq-card">
      <div className="liq-card-info">
        <div className="liq-card-row">
          <FiUser size={14} color="#64748b" />
          <span className="liq-card-nombre">{emprendedora?.usuario?.nombre}</span>
          <span className={`liq-badge ${estado}`}>
            {estado === "pagado" ? "Pagado" : "Pendiente"}
          </span>
        </div>

        <div className="liq-card-row liq-card-meta">
          Pedido #{pedido?.id_pedido} · Generada el{" "}
          {new Date(fecha_generada).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
        </div>

        <div className="liq-card-datos-pago">
          {emprendedora?.nequi_numero && (
            <div className="liq-dato">
              <FiSmartphone size={12} /> Nequi: <strong>{emprendedora.nequi_numero}</strong>
            </div>
          )}
          {emprendedora?.bancolombia_numero && (
            <div className="liq-dato">
              <FiCreditCard size={12} /> Bancolombia ({emprendedora.bancolombia_tipo}):{" "}
              <strong>{emprendedora.bancolombia_numero}</strong>
              {emprendedora.titular_cuenta && <span> — {emprendedora.titular_cuenta}</span>}
            </div>
          )}
          {!emprendedora?.nequi_numero && !emprendedora?.bancolombia_numero && (
            <div className="liq-dato liq-dato-vacio">
              La emprendedora no ha configurado sus métodos de pago aún
            </div>
          )}
        </div>

        {estado === "pagado" && (
          <div className="liq-card-pagado-info">
            <FiCheck size={12} color="#16a34a" />
            Pagado el {new Date(fecha_pagado).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
            {nota && <span className="liq-nota"> — {nota}</span>}
          </div>
        )}
      </div>

      <div className="liq-card-monto">
        <strong>{formatPrecio(monto)}</strong>
        {estado === "pendiente" && onMarcarPagado && (
          <button className="liq-btn-pagar" onClick={() => onMarcarPagado(liquidacion)}>
            <FiClock size={13} /> Marcar como pagado
          </button>
        )}
      </div>
    </div>
  )
}