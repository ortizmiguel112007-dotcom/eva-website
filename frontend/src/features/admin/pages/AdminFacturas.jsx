import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiFileText } from "react-icons/fi"
import { FacturaCard } from "@/features/products/components/facturas/FacturaCard"
import { ModalMotivoRegeneracion } from "../components/facturas/ModalMotivoRegeneracion"
import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

// const API_URL = import.meta.env.VITE_API_URL
// const PORT = import.meta.env.PORT

// const BASE = `${API_URL}:${PORT}`

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function AdminFacturas() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [facturas, setFacturas]     = useState([])
  const [cargando, setCargando]     = useState(true)
  const [modalFactura, setModalFactura] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [toast, setToast]           = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await axios.get(`${BASE}/api/admin/facturas`, { headers })
      setFacturas(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const handleConfirmarRegeneracion = async (id_factura, motivo) => {
    setProcesando(true)
    try {
      await axios.put(`${BASE}/api/admin/facturas/${id_factura}/regenerar`, { motivo }, { headers })
      setToast({ msg: "Factura regenerada correctamente", tipo: "ok" })
      setModalFactura(null)
      cargar()
    } catch (err) {
      setToast({ msg: err.response?.data?.error || "Error al regenerar", tipo: "error" })
    } finally {
      setProcesando(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (cargando) return <div className="pagos-loading">Cargando facturas...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Auditoría de facturas</h1>
        <p>Supervisa y, si es necesario, regenera comprobantes de venta</p>
      </div>

      {facturas.length === 0 ? (
        <div className="pagos-empty">
          <FiFileText size={40} color="#cbd5e1" />
          <p>No hay facturas emitidas todavía</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {facturas.map((f) => (
            <FacturaCard
              key={f.id_factura}
              factura={f}
              mostrarCliente
              mostrarTienda
              onRegenerar={setModalFactura}
            />
          ))}
        </div>
      )}

      <ModalMotivoRegeneracion
        factura={modalFactura}
        onConfirmar={handleConfirmarRegeneracion}
        onCerrar={() => setModalFactura(null)}
        procesando={procesando}
      />

      {toast && <div className={`pagos-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}