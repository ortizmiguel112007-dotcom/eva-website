import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiDollarSign } from "react-icons/fi"

import { MetricasPagos }    from "@/features/products/components/pagos/MetricasPagos"
import { FiltroPagos }      from "@/features/products/components/pagos/FiltroPagos"
import { PagoCard }         from "@/features/products/components/pagos/PagoCard"
import { ModalComprobante } from "@/features/products/components/pagos/ModalComprobante"

import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = "http://localhost:3000"

export default function AdminPagos() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [pagos, setPagos]             = useState([])
  const [cargando, setCargando]       = useState(true)
  const [modalPago, setModalPago]     = useState(null)
  const [notaRechazo, setNotaRechazo] = useState("")
  const [procesando, setProcesando]   = useState(false)
  const [toast, setToast]             = useState(null)
  const [filtro, setFiltro]           = useState("todos")

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await axios.get(`${BASE}/api/admin/pagos`, { headers })
      setPagos(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleVerificar = async (id_pago, estado) => {
    if (estado === "rechazado" && !notaRechazo.trim()) {
      mostrarToast("Escribe el motivo del rechazo", "error"); return
    }
    setProcesando(true)
    try {
      await axios.put(`${BASE}/api/pagos/${id_pago}/verificar`,
        { estado, nota_rechazo: notaRechazo || null }, { headers })
      mostrarToast(estado === "aprobado" ? "Pago aprobado correctamente" : "Pago rechazado")
      setModalPago(null); setNotaRechazo(""); cargar()
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al procesar", "error")
    } finally { setProcesando(false) }
  }

  const pagosFiltrados = pagos.filter(p => filtro === "todos" || p.estado === filtro)

  if (cargando) return <div className="pagos-loading">Cargando pagos...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Gestión de pagos</h1>
        <p>Supervisa y verifica todos los pagos de la plataforma (RF-073)</p>
      </div>

      <MetricasPagos pagos={pagos} />

      <FiltroPagos pagos={pagos} filtro={filtro} setFiltro={setFiltro} />

      {pagosFiltrados.length === 0 ? (
        <div className="pagos-empty">
          <FiDollarSign size={40} color="#cbd5e1" />
          <p>No hay pagos con este filtro</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {pagosFiltrados.map(pago => (
            <PagoCard
              key={pago.id_pago}
              pago={pago}
              onVerDetalle={p => { setModalPago(p); setNotaRechazo("") }}
              onVerificar={handleVerificar}
            />
          ))}
        </div>
      )}

      <ModalComprobante
        pago={modalPago}
        notaRechazo={notaRechazo}
        setNotaRechazo={setNotaRechazo}
        procesando={procesando}
        onVerificar={handleVerificar}
        onCerrar={() => setModalPago(null)}
      />

      {toast && <div className={`pagos-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}