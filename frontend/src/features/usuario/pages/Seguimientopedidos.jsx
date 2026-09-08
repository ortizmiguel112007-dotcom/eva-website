import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import { FiMapPin, FiPackage } from "react-icons/fi"

import { useApiData } from "@/features/usuario/hooks/useApiData"
import { SeguimientoCard } from "../components/seguimiento/SeguimientoCard"
import { ModalComentario } from "../components/pedidos/ModalComentario"
import { PaginacionSimple } from "../components/historial/PaginacionSimple"

import "@/infrastructure/css/usuario/seguimiento/SeguimientoPedidos.css"
import "@/infrastructure/css/auth/CrudAdmin.css"

const POR_PAGINA = 3

export default function SeguimientoPedidos() {
  const navigate  = useNavigate()
  const { token } = useAuth()

  const { data: todosPedidos, cargando } = useApiData("/api/cliente/pedidos", token)
  const pedidos = todosPedidos.filter(p => p.estado !== "cancelado")

  const [modalPedido, setModalPedido] = useState(null)
  const [toast, setToast]             = useState(null)
  const [pagina, setPagina]           = useState(1)

  const mostrarToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const totalPaginas  = Math.max(1, Math.ceil(pedidos.length / POR_PAGINA))
  const pedidosPagina = pedidos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  if (cargando) return <div className="mp-loading">Cargando seguimiento...</div>

  return (
    <div className="mp-page">
      <div className="mp-page-header">
        <h1 className="mp-page-title">
          <FiMapPin size={20} /> Seguimiento de Pedidos
        </h1>
        <p className="mp-page-subtitle">
          Rastrea el estado y ubicación de tus pedidos en tiempo real
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="mp-empty">
          <FiPackage size={48} style={{ color: "#94a3b8", marginBottom: "1rem" }} />
          <p>No tienes pedidos activos</p>
          <button onClick={() => navigate("/")}>Explorar productos</button>
        </div>
      ) : (
        <>
          {pedidosPagina.map(pedido => (
            <SeguimientoCard
              key={pedido.id_pedido}
              pedido={pedido}
              onResena={setModalPedido}
            />
          ))}

          <PaginacionSimple
            pagina={pagina}
            totalPaginas={totalPaginas}
            setPagina={setPagina}
            total={pedidos.length}
            labelSingular="pedido"
            labelPlural="pedidos"
          />
        </>
      )}

      <ModalComentario
        pedido={modalPedido}
        token={token}
        onClose={() => setModalPedido(null)}
        onEnviado={() => mostrarToast("Reseña enviada correctamente")}
      />

      {toast && <div className="mp-toast">{toast}</div>}
    </div>
  )
}
