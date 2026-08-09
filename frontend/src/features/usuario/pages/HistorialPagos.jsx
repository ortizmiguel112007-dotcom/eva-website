import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import { FiClock, FiCheck, FiX, FiEye, FiDollarSign, FiCalendar, FiPackage, FiSmartphone, FiCreditCard, FiTruck } from "react-icons/fi"

import { formatPrecio, formatFecha } from "@/features/tienda/utils/utils"
import { useApiData } from "@/features/usuario/hooks/useApiData"
import { MetricasPagos } from "../components/historial/MetricasPagos"
import { FiltrosPagos, ESTADO } from "../components/historial/FiltrosPagos"
import { PaginacionSimple } from "../components/historial/PaginacionSimple"

import "@/infrastructure/css/usuario/historialpagos/HistorialPagos.css"
import "@/infrastructure/css/auth/CrudAdmin.css"

const POR_PAGINA = 8

const METODO_INFO = {
  nequi:         { icon: <FiSmartphone size={11} />, label: "Nequi"          },
  bancolombia:   { icon: <FiCreditCard  size={11} />, label: "Bancolombia"    },
  contraentrega: { icon: <FiTruck       size={11} />, label: "Contra entrega" },
}

export default function HistorialPagos() {
  const { token } = useAuth()
  const { data: pedidos, cargando } = useApiData("/api/cliente/pedidos", token)
  const [filtro, setFiltro]     = useState("todos")
  const [modalImg, setModalImg] = useState(null)
  const [pagina, setPagina]     = useState(1)

  useEffect(() => { setPagina(1) }, [filtro])

  const filtrados = filtro === "todos"
    ? pedidos
    : filtro === "sin_comprobante"
      ? pedidos.filter(p => !p.pago)
      : pedidos.filter(p => p.pago?.estado === filtro)

  const totalPaginas    = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const filtradosPagina = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  if (cargando) return (
    <div className="hp-loading">
      <div className="hp-spinner" />
      <p>Cargando historial...</p>
    </div>
  )

  return (
    <div className="hp-page">
      <div className="hp-header">
        <div>
          <h1 className="hp-titulo">Historial de Pagos</h1>
          <p className="hp-sub">Comprobantes enviados y su estado de verificación</p>
        </div>
      </div>

      <MetricasPagos pedidos={pedidos} />

      <FiltrosPagos pedidos={pedidos} filtro={filtro} setFiltro={setFiltro} />

      {filtrados.length === 0 ? (
        <div className="hp-empty">
          <div className="hp-empty-icono">
            <FiDollarSign size={32} color="#cbd5e1" />
          </div>
          <p>No hay pagos con este filtro</p>
        </div>
      ) : (
        <>
          <div className="hp-lista">
            {filtradosPagina.map(pedido => {
              const pago   = pedido.pago
              const est    = pago ? (ESTADO[pago.estado] || ESTADO.pendiente) : ESTADO.sin_comprobante
              const tienda = pedido.seccion?.emprendedora?.usuario?.nombre || "EVA"
              const metodo = METODO_INFO[pedido.metodo_pago]

              return (
                <div key={pedido.id_pedido} className="hp-item">
                  <div className="hp-item-indicador" style={{ background: est.color }} />
                  <div className="hp-item-est-icono" style={{ background: est.bg }}>
                    <est.Icon size={16} color={est.color} />
                  </div>

                  <div className="hp-item-info">
                    <div className="hp-item-titulo">
                      <span className="hp-item-pedido">Pedido #{pedido.id_pedido}</span>
                      <span className="hp-item-tienda"><FiPackage size={11} /> {tienda}</span>
                    </div>
                    <div className="hp-item-meta">
                      <span>
                        {metodo?.icon || <FiSmartphone size={11} />}
                        {metodo?.label || pedido.metodo_pago || "—"}
                      </span>
                      <span><FiCalendar size={11} /> {formatFecha(pago?.fecha || pedido.fecha)}</span>
                      {pago?.estado === "rechazado" && pago?.nota_rechazo && (
                        <span className="hp-item-rechazo">Motivo: {pago.nota_rechazo}</span>
                      )}
                    </div>
                  </div>

                  <div className="hp-item-total">
                    <strong>{formatPrecio(pedido.total)}</strong>
                  </div>

                  <span className="hp-badge"
                    style={{ background: est.bg, color: est.color, borderColor: est.border }}>
                    {pago ? est.label : "Sin comprobante"}
                  </span>

                  {pago?.comprobante && (
                    <button className="hp-btn-ver" onClick={() => setModalImg(pago.comprobante)}>
                      <FiEye size={13} /> Ver
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <PaginacionSimple
            pagina={pagina}
            totalPaginas={totalPaginas}
            setPagina={setPagina}
            total={filtrados.length}
            labelSingular="pago"
            labelPlural="pagos"
          />
        </>
      )}

      {modalImg && (
        <div className="hp-modal-overlay" onClick={() => setModalImg(null)}>
          <div className="hp-modal" onClick={e => e.stopPropagation()}>
            <h3>Comprobante de pago</h3>
            <img src={modalImg} alt="Comprobante" />
            <button onClick={() => setModalImg(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}