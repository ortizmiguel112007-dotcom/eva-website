import { useState, useEffect } from "react"
import { FiX, FiArrowUp, FiArrowDown, FiRefreshCw, FiPackage } from "react-icons/fi"
import { inventarioService } from "@/features/products/services/inventario.service"
import "@/infrastructure/css/products-emprend/inventario/HistorialStock.css"

const TIPO_CONFIG = {
  entrada: { icon: <FiArrowUp  size={14} />, cls: "entrada", label: "Entrada" },
  salida:  { icon: <FiArrowDown size={14} />, cls: "salida",  label: "Salida"  },
  ajuste:  { icon: <FiRefreshCw size={14} />, cls: "ajuste",  label: "Ajuste"  },
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  })
}

export function HistorialStock({ item, onCerrar }) {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando]       = useState(true)

  useEffect(() => {
    inventarioService.listarHistorial(item.id_producto)
      .then(setMovimientos)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [item.id_producto])

  return (
    <div className="hs-overlay" onClick={onCerrar}>
      <div className="hs-panel" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="hs-header">
          <div className="hs-header-info">
            {item.imagen
              ? <img src={item.imagen} alt={item.nombre} className="hs-img" />
              : <div className="hs-img-placeholder"><FiPackage size={18} color="#94a3b8" /></div>
            }
            <div>
              <h3 className="hs-titulo">Historial de movimientos</h3>
              <span className="hs-nombre">{item.nombre}</span>
            </div>
          </div>
          <button className="hs-cerrar" onClick={onCerrar}><FiX size={16} /></button>
        </div>

        {/* ── Stock actual ── */}
        <div className="hs-stock-actual">
          <span className="hs-stock-label">Stock actual</span>
          <span className="hs-stock-valor">{item.cantidad}</span>
        </div>

        {/* ── Lista ── */}
        <div className="hs-body">
          {cargando ? (
            <div className="hs-loading">
              <div className="hs-spinner" />
              <p>Cargando historial...</p>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="hs-empty">
              <FiPackage size={36} color="#cbd5e1" />
              <p>Sin movimientos registrados</p>
            </div>
          ) : movimientos.map(m => {
            const cfg     = TIPO_CONFIG[m.tipo] || TIPO_CONFIG.ajuste
            const diff    = m.cantidad_nueva - m.cantidad_antes
            const diffStr = diff > 0 ? `+${diff}` : String(diff)
            return (
              <div key={m.id_movimiento} className="hs-item">
                <div className={`hs-item-icon ${cfg.cls}`}>
                  {cfg.icon}
                </div>
                <div className="hs-item-info">
                  <div className="hs-item-top">
                    <span className={`hs-badge ${cfg.cls}`}>{cfg.label}</span>
                    <span className={`hs-diff ${diff >= 0 ? "positivo" : "negativo"}`}>
                      {diffStr} uds
                    </span>
                  </div>
                  <p className="hs-item-detalle">
                    {m.cantidad_antes} → <strong>{m.cantidad_nueva}</strong>
                    {m.motivo && <span className="hs-motivo"> · {m.motivo}</span>}
                  </p>
                  <div className="hs-item-meta">
                    <span>{m.usuario?.nombre || "Sistema"}</span>
                    <span>·</span>
                    <span>{formatFecha(m.fecha)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}