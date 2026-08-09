import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiDollarSign } from "react-icons/fi"

import { MetricasPagos }    from "../components/pagos/MetricasPagos"
import { FiltroPagos }      from "../components/pagos/FiltroPagos"
import { PagoCard }         from "../components/pagos/PagoCard"
import { ModalComprobante } from "../components/pagos/ModalComprobante"

import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = "http://localhost:3000"

export default function Pagos() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [pagos, setPagos]         = useState([])
  const [cargando, setCargando]   = useState(true)
  const [modalPago, setModalPago] = useState(null)
  const [filtro, setFiltro]       = useState("todos")

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await axios.get(`${BASE}/api/pagos/emprendedora`, { headers })
      setPagos(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const pagosFiltrados = pagos.filter(p => filtro === "todos" || p.estado === filtro)

  if (cargando) return <div className="pagos-loading">Cargando pagos...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Comprobantes de Pago</h1>
        {/* RF-072: la emprendedora solo visualiza, ya no verifica — eso es exclusivo del admin (RN-061) */}
        <p>Consulta el estado de los pagos de tus ventas</p>
      </div>

      <MetricasPagos pagos={pagos} />

      <FiltroPagos pagos={pagos} filtro={filtro} setFiltro={setFiltro} />

      {pagosFiltrados.length === 0 ? (
        <div className="pagos-empty">
          <FiDollarSign size={40} color="#cbd5e1" />
          <p>No hay comprobantes con este filtro</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {pagosFiltrados.map(pago => (
            <PagoCard
              key={pago.id_pago}
              pago={pago}
              soloLectura       // oculta botones de aprobar/rechazar dentro de la card
              onVerDetalle={p => setModalPago(p)}
            />
          ))}
        </div>
      )}

      <ModalComprobante
        pago={modalPago}
        soloLectura          // oculta botones de aprobar/rechazar dentro del modal
        onCerrar={() => setModalPago(null)}
      />
    </div>
  )
}