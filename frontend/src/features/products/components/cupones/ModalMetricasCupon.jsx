import { useState, useEffect } from "react"
import { FiX, FiTag, FiUsers, FiDollarSign, FiClock } from "react-icons/fi"

import { cuponService } from "@/features/products/services/cupon.service"
import { formatFecha, formatPrecio } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/products-emprend/cupones/ModalMetricasCupon.css"

// RF-098/RN-086: métricas e historial de uso del cupón, en tiempo real
export function ModalMetricasCupon({ cupon, onCerrar }) {
  const [datos, setDatos]       = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    setCargando(true)
    cuponService.metricas(cupon.id_cupon)
      .then(setDatos)
      .catch(() => setError("No se pudieron cargar las métricas de este cupón"))
      .finally(() => setCargando(false))
  }, [cupon.id_cupon])

  return (
    <div className="mmc-overlay" onClick={onCerrar}>
      <div className="mmc-modal" onClick={e => e.stopPropagation()}>
        <div className="mmc-header">
          <div>
            <h3><FiTag size={16} /> {cupon.codigo}</h3>
            <p>Métricas de uso</p>
          </div>
          <button className="mmc-close" onClick={onCerrar}><FiX size={18} /></button>
        </div>

        {cargando ? (
          <div className="mmc-loading">
            <div className="mmc-spinner" />
            <span>Cargando métricas...</span>
          </div>
        ) : error ? (
          <div className="mmc-error">{error}</div>
        ) : (
          <>
            <div className="mmc-resumen">
              <div className="mmc-stat">
                <div className="mmc-stat-icon"><FiUsers size={15} /></div>
                <div>
                  <h4>{datos.usos_totales}{datos.limite_usos ? ` / ${datos.limite_usos}` : ""}</h4>
                  <span>Usos</span>
                </div>
              </div>
              <div className="mmc-stat">
                <div className="mmc-stat-icon"><FiDollarSign size={15} /></div>
                <div>
                  <h4>{formatPrecio(datos.total_descontado)}</h4>
                  <span>Total descontado</span>
                </div>
              </div>
            </div>

            <div className="mmc-historial">
              <h5>Historial de usos</h5>
              {datos.historial.length === 0 ? (
                <p className="mmc-empty"><FiClock size={14} /> Este cupón todavía no se usó</p>
              ) : (
                <div className="mmc-tabla-wrapper">
                  <table className="mmc-tabla">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Pedido</th>
                        <th>Descuento</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.historial.map(u => (
                        <tr key={u.id_uso}>
                          <td>{u.cliente?.nombre || "—"}</td>
                          <td>#{u.pedido?.id_pedido}</td>
                          <td>{formatPrecio(u.monto_descuento)}</td>
                          <td>{formatFecha(u.fecha)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}