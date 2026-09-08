import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import {
  FiDollarSign,
  FiSmartphone,
  FiCreditCard,
  FiPackage,
  FiCheck,
} from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function AdminLiquidaciones() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [liquidaciones, setLiquidaciones] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [filtro, setFiltro]               = useState("pendiente")
  const [toast, setToast]                 = useState(null)
  const [pagandoGrupo, setPagandoGrupo]   = useState(null) // id_emprendedora en proceso

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await axios.get(`${BASE}/api/admin/liquidaciones`, { headers })
      setLiquidaciones(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  // marca TODAS las liquidaciones pendientes de una emprendedora como pagadas
  const handleMarcarTodoPagado = async (grupo) => {
    const pendientes = grupo.liquidaciones.filter(l => l.estado === "pendiente")
    if (pendientes.length === 0) return
    if (!window.confirm(`¿Confirmas que ya le transferiste $${grupo.totalPendiente.toLocaleString("es-CO")} en total a ${grupo.nombre} (${pendientes.length} pedido${pendientes.length !== 1 ? "s" : ""})?`))
      return

    setPagandoGrupo(grupo.id_emprendedora)
    try {
      // el backend no tiene un endpoint "pagar varias a la vez", así que se marcan una por una
      for (const l of pendientes) {
        await axios.put(`${BASE}/api/admin/liquidaciones/${l.id_liquidacion}/pagar`, {}, { headers })
      }
      mostrarToast(`Se marcaron ${pendientes.length} liquidación(es) de ${grupo.nombre} como pagadas`)
      cargar()
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al pagar todo el grupo", "error")
    } finally {
      setPagandoGrupo(null)
    }
  }

  const filtradas = useMemo(
    () => liquidaciones.filter(l => filtro === "todos" || l.estado === filtro),
    [liquidaciones, filtro],
  )

  // agrupa por emprendedora
  const grupos = useMemo(() => {
    const mapa = {}
    for (const l of filtradas) {
      const id = l.emprendedora?.id_emprendedora
      if (!id) continue
      if (!mapa[id]) {
        mapa[id] = {
          id_emprendedora: id,
          nombre: l.emprendedora?.usuario?.nombre || "Emprendedora",
          email: l.emprendedora?.usuario?.email,
          datosPago: {
            nequi_numero:       l.emprendedora?.nequi_numero,
            bancolombia_numero: l.emprendedora?.bancolombia_numero,
            bancolombia_tipo:   l.emprendedora?.bancolombia_tipo,
            titular_cuenta:     l.emprendedora?.titular_cuenta,
          },
          liquidaciones: [],
          totalPendiente: 0,
          totalPagado: 0,
        }
      }
      mapa[id].liquidaciones.push(l)
      if (l.estado === "pendiente") mapa[id].totalPendiente += Number(l.monto)
      if (l.estado === "pagado") mapa[id].totalPagado += Number(l.monto)
    }
    // primero quien tiene más plata pendiente
    return Object.values(mapa).sort((a, b) => b.totalPendiente - a.totalPendiente)
  }, [filtradas])

  const totalPendiente = liquidaciones
    .filter(l => l.estado === "pendiente")
    .reduce((acc, l) => acc + Number(l.monto), 0)

  if (cargando) return <div className="pagos-loading">Cargando liquidaciones...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Liquidaciones a emprendedoras</h1>
        <p>
          Total pendiente por pagar:{" "}
          <strong>${totalPendiente.toLocaleString("es-CO")}</strong>
        </p>
      </div>

      <div className="pagos-filtros">
        {["pendiente", "pagado", "todos"].map(f => (
          <button key={f}
            className={`pagos-filtro-btn ${filtro === f ? "active" : ""}`}
            onClick={() => setFiltro(f)}
          >
            {f === "todos" ? "Todas" : f === "pendiente" ? "Pendientes" : "Pagadas"}
            <span className="pagos-filtro-count">
              ({f === "todos" ? liquidaciones.length : liquidaciones.filter(l => l.estado === f).length})
            </span>
          </button>
        ))}
      </div>

      {grupos.length === 0 ? (
        <div className="pagos-empty">
          <FiDollarSign size={40} color="#cbd5e1" />
          <p>No hay liquidaciones con este filtro</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {grupos.map(grupo => {
            const pendientesCount = grupo.liquidaciones.filter(l => l.estado === "pendiente").length
            const { datosPago } = grupo
            const tieneDatosPago = datosPago.nequi_numero || datosPago.bancolombia_numero

            return (
              <div key={grupo.id_emprendedora} className="pagos-grupo">
                <div className="pagos-grupo-header">
                  <div className="pagos-grupo-identidad">
                    <div className="pagos-grupo-avatar">
                      {grupo.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{grupo.nombre}</h3>
                      {grupo.email && <span className="pagos-grupo-email">{grupo.email}</span>}
                    </div>
                  </div>

                  <div className="pagos-grupo-totales">
                    {grupo.totalPendiente > 0 && (
                      <span className="pagos-grupo-pendiente">
                        Pendiente: ${grupo.totalPendiente.toLocaleString("es-CO")}
                      </span>
                    )}
                    {grupo.totalPendiente > 0 && filtro !== "pagado" && (
                      <button
                        className="pagos-btn-pagar-todo"
                        disabled={pagandoGrupo === grupo.id_emprendedora}
                        onClick={() => handleMarcarTodoPagado(grupo)}
                      >
                        {pagandoGrupo === grupo.id_emprendedora
                          ? "Procesando..."
                          : `Marcar todo como pagado (${pendientesCount})`}
                      </button>
                    )}
                  </div>
                </div>

                {tieneDatosPago && (
                  <div className="pagos-grupo-datos-pago">
                    {datosPago.nequi_numero && (
                      <span className="pagos-dato-chip">
                        <FiSmartphone size={12} /> Nequi: <strong>{datosPago.nequi_numero}</strong>
                      </span>
                    )}
                    {datosPago.bancolombia_numero && (
                      <span className="pagos-dato-chip">
                        <FiCreditCard size={12} /> Bancolombia
                        {datosPago.bancolombia_tipo ? ` (${datosPago.bancolombia_tipo})` : ""}:{" "}
                        <strong>{datosPago.bancolombia_numero}</strong>
                        {datosPago.titular_cuenta && <span> — {datosPago.titular_cuenta}</span>}
                      </span>
                    )}
                  </div>
                )}

                <div className="pagos-grupo-items">
                  {grupo.liquidaciones.map(l => (
                    <div key={l.id_liquidacion} className={`pagos-item-row pagos-item-${l.estado}`}>
                      <div className="pagos-item-info">
                        <FiPackage size={14} />
                        <span className="pagos-item-pedido">Pedido #{l.pedido?.id_pedido}</span>
                        <span className="pagos-item-fecha">
                          {new Date(l.fecha_generada).toLocaleDateString("es-CO", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="pagos-item-derecha">
                        {l.estado === "pagado" ? (
                          <span className="pagos-item-tag-pagado">
                            <FiCheck size={12} /> Pagado
                          </span>
                        ) : (
                          <span className="pagos-item-tag-pendiente">Pendiente</span>
                        )}
                        <strong className="pagos-item-monto">{formatPrecio(l.monto)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && <div className={`pagos-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}