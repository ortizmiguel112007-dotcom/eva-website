import { useState } from "react"
import { FiX, FiEye, FiCheck, FiTruck } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import { Badge } from "./PagoCard"
import "@/infrastructure/css/products-emprend/pagos/ModalComprobante.css"
import { HistorialPago } from "./HistorialPago"
import { useAuth } from "@/core/context/AuthConten"

export function ModalComprobante({
  pago, notaRechazo, setNotaRechazo, procesando, onVerificar, onCerrar, soloLectura = false,
}) {
   const { token } = useAuth()
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  if (!pago) return null

  const pedidos = pago.pedidos || []

  return (
    <div className="pagos-modal-overlay" onClick={onCerrar}>
      <div className="pagos-modal" onClick={e => e.stopPropagation()}>

        <div className="pagos-modal-header">
          <h3>Comprobante — Pago #{pago.id_pago}</h3>
          <button className="pagos-modal-cerrar" onClick={onCerrar}>
            <FiX size={18} />
          </button>
        </div>

        <div className="pagos-modal-body">

          {pago.metodo === "contraentrega" ? (
            <div className="pagos-modal-contraentrega">
              <FiTruck size={28} color="#16a34a" />
              <p>Pago contra entrega — no requiere comprobante</p>
              <p className="pagos-modal-monto">
                El cliente pagará <strong>{formatPrecio(pago.monto_total)}</strong> al recibir
              </p>
            </div>
          ) : pago.comprobante ? (
            <div className="pagos-modal-img">
              <img src={pago.comprobante} alt="Comprobante" />
              <a href={pago.comprobante} target="_blank" rel="noopener noreferrer">
                Ver imagen completa →
              </a>
            </div>
          ) : (
            <div className="pagos-modal-sin-comprobante">
              <FiEye size={28} color="#cbd5e1" />
              <p>Sin comprobante adjunto aún</p>
            </div>
          )}

          <div className="pagos-modal-info">
            <div className="pagos-modal-info-row">
              <span>Cliente</span>
              <strong>{pago.cliente?.nombre}</strong>
            </div>
            <div className="pagos-modal-info-row">
              <span>Total</span>
              <strong>{formatPrecio(pago.monto_total)}</strong>
            </div>
            <div className="pagos-modal-info-row">
              <span>Método</span>
              <strong style={{ textTransform: "capitalize" }}>{pago.metodo}</strong>
            </div>
            <div className="pagos-modal-info-row">
              <span>Estado</span>
              <Badge estado={pago.estado} />
            </div>
          </div>

          {/* Pedidos incluidos en este pago */}
          <div className="pagos-modal-pedidos">
            <strong>Pedidos incluidos</strong>
            {pedidos.map(p => (
              <div key={p.id_pedido} className="pagos-modal-info-row">
                <span>Pedido #{p.id_pedido}</span>
                <strong>{formatPrecio(p.total)}</strong>
              </div>
            ))}
          </div>

          {/* Acciones — solo si NO es solo-lectura, está pendiente y no es contraentrega */}
          {!soloLectura && pago.estado === "pendiente" && pago.metodo !== "contraentrega" && (
            <>
              <div className="pagos-modal-rechazo">
                <label>Motivo de rechazo (si aplica)</label>
                <textarea
                  value={notaRechazo}
                  onChange={e => setNotaRechazo(e.target.value)}
                  placeholder="Ej: El comprobante no coincide con el monto..."
                />
              </div>
              <div className="pagos-modal-btns">
                <button className="pago-btn-rechazar-modal"
                  onClick={() => onVerificar(pago.id_pago, "rechazado")}
                  disabled={procesando}>
                  <FiX size={14} /> Rechazar
                </button>
                <button className="pago-btn-verificar-modal"
                  onClick={() => onVerificar(pago.id_pago, "aprobado")}
                  disabled={procesando}>
                  <FiCheck size={14} /> {procesando ? "Procesando..." : "Aprobar pago"}
                </button>
              </div>
            </>
          )}

          {pago.estado === "rechazado" && pago.nota_rechazo && (
            <div className="pagos-modal-motivo">
              <strong>Motivo:</strong> {pago.nota_rechazo}
            </div>
          )}

        {/* Historial de auditoría — RF-069, solo visible para admin */}
          {!soloLectura && (
            <>
              <div className="pagos-modal-historial-toggle">
                <button
                  className="pago-btn-historial"
                  onClick={() => setMostrarHistorial(v => !v)}
                  type="button"
                >
                  {mostrarHistorial ? "Ocultar historial" : "Ver historial de auditoría"}
                </button>
              </div>

              {mostrarHistorial && <HistorialPago id_pago={pago.id_pago} token={token} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}