import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import { FiPackage, FiX } from "react-icons/fi"

import { useApiData }        from "@/features/usuario/hooks/useApiData"
import { MetricasPedidos }   from "../components/pedidos/MetricasPedidos"
import { PedidoCard }        from "../components/pedidos/PedidoCard"
import { ModalDetalle }      from "../components/pedidos/ModalDetalle"
import { ModalComentario }   from "../components/pedidos/ModalComentario"
import { PaginacionSimple }  from "../components/historial/PaginacionSimple"
import { SubirComprobante }  from "@/features/tienda/components/carrito/SubirComprobante"

import "@/infrastructure/css/usuario/pedidos/MisPedidos.css"
import "@/infrastructure/css/auth/CrudAdmin.css"

const TABS = [
  { key: "todos",          label: "Todos"             },
  { key: "pendiente_pago", label: "Pendiente de pago" },
  { key: "activos",        label: "Activos"           },
  { key: "entregado",      label: "Entregados"        },
]

const POR_PAGINA = 5

export default function MisPedidos() {
  const navigate  = useNavigate()
  const { token } = useAuth()
  const { data: pedidos, cargando } = useApiData("/api/cliente/pedidos", token)

  const [filtro, setFiltro]                   = useState("todos")
  const [modalDetalle, setModalDetalle]         = useState(null)
  const [modalResena, setModalResena]           = useState(null)
  const [modalComprobante, setModalComprobante] = useState(null)
  const [toast, setToast]                       = useState(null)
  const [pagina, setPagina]                     = useState(1)

  useEffect(() => { setPagina(1) }, [filtro])

  const mostrarToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const filtrados = pedidos.filter(p => {
    if (filtro === "todos")          return true
    if (filtro === "pendiente_pago") return p.estado === "pendiente_pago" || p.estado === "pago_rechazado"
    if (filtro === "activos")        return ["pago_enviado", "en_proceso", "enviado"].includes(p.estado)
    if (filtro === "entregado")      return p.estado === "entregado"
    return true
  })

  const totalPaginas    = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const filtradosPagina = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  if (cargando) return <div className="mp-loading">Cargando pedidos...</div>

  return (
    <div className="mp-page">
      <div className="mp-page-header">
        <h1 className="mp-page-title"><FiPackage size={22} /> Mis Pedidos</h1>
        <p className="mp-page-subtitle">Gestiona y revisa el estado de tus pedidos</p>
      </div>

      <MetricasPedidos pedidos={pedidos} />

      <div className="mp-tabs">
        {TABS.map(t => (
          <button key={t.key}
            className={`mp-tab ${filtro === t.key ? "active" : ""}`}
            onClick={() => setFiltro(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="mp-empty">
          <FiPackage size={48} color="#cbd5e1" />
          <p>No tienes pedidos aún</p>
          <button onClick={() => navigate("/")}>Explorar productos</button>
        </div>
      ) : (
        <>
          <div className="mp-lista">
            {filtradosPagina.map(pedido => (
              <PedidoCard
                key={pedido.id_pedido}
                pedido={pedido}
                onVerDetalle={setModalDetalle}
                onSubirComprobante={setModalComprobante}
              />
            ))}
          </div>
          <PaginacionSimple
            pagina={pagina}
            totalPaginas={totalPaginas}
            setPagina={setPagina}
            total={filtrados.length}
            labelSingular="pedido"
            labelPlural="pedidos"
          />
        </>
      )}

      <ModalDetalle
        pedido={modalDetalle}
        onClose={() => setModalDetalle(null)}
        onResena={p => setModalResena(p)}
        onSubirComprobante={setModalComprobante}
      />

      <ModalComentario
        pedido={modalResena}
        token={token}
        onClose={() => setModalResena(null)}
        onEnviado={() => mostrarToast("Reseña enviada correctamente")}
      />

      {modalComprobante && (
        <div className="mp-modal-overlay" onClick={() => setModalComprobante(null)}>
          <div className="mp-modal-detalle" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-detalle-header">
              <div>
                <h3>Subir comprobante</h3>
                <p>Pedido #{modalComprobante.id_pedido}</p>
              </div>
              <button className="mp-modal-cerrar" onClick={() => setModalComprobante(null)}>
                <FiX size={14} />
              </button>
            </div>
            <div className="mp-modal-body">
              <SubirComprobante pedido={modalComprobante} token={token} />
            </div>
          </div>
        </div>
      )}

      {toast && <div className="mp-toast">{toast}</div>}
    </div>
  )
}
