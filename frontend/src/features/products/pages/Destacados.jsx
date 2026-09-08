import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiStar } from "react-icons/fi"

import { DestacadoCard } from "../components/destacados/DestacadoCard"
import { MetricasDestacados } from "../components/destacados/MetricasDestacados"
import { ModalSolicitarDestacado } from "../components/destacados/ModalSolicitarDestacado"

import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function Destacados() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [productos, setProductos] = useState([])
  const [metricas, setMetricas]   = useState([])
  const [cargando, setCargando]   = useState(true)
  const [vista, setVista]         = useState("lista")
  const [modalProducto, setModalProducto] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [toast, setToast] = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const [prods, mets] = await Promise.all([
        axios.get(`${BASE}/api/destacados`, { headers }).then((r) => r.data),
        axios.get(`${BASE}/api/emprendedora/destacados/metricas`, { headers }).then((r) => r.data),
      ])
      setProductos(prods)
      setMetricas(mets)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSolicitar = async (id_producto, categoria) => {
    setProcesando(true)
    try {
      await axios.post(`${BASE}/api/destacados/${id_producto}/solicitar`, { categoria: categoria || null }, { headers })
      mostrarToast("Solicitud enviada, pendiente de aprobación")
      setModalProducto(null)
      cargar()
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al solicitar", "error")
    } finally { setProcesando(false) }
  }

  if (cargando) return <div className="pagos-loading">Cargando productos...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Productos Destacados</h1>
        <p>Solicita que tus productos aparezcan en la página principal</p>
      </div>

      <div className="comentarios-tabs">
        <button className={vista === "lista" ? "active" : ""} onClick={() => setVista("lista")}>Mis productos</button>
        <button className={vista === "metricas" ? "active" : ""} onClick={() => setVista("metricas")}>Métricas</button>
      </div>

      {vista === "metricas" ? (
        <MetricasDestacados metricas={metricas} />
      ) : productos.length === 0 ? (
        <div className="pagos-empty">
          <FiStar size={40} color="#cbd5e1" />
          <p>No tienes productos activos para destacar</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {productos.map((p) => (
            <DestacadoCard
              key={p.id_producto}
              producto={p}
              contexto="emprendedora"
              onSolicitar={setModalProducto}
            />
          ))}
        </div>
      )}

      <ModalSolicitarDestacado
        producto={modalProducto}
        onConfirmar={handleSolicitar}
        onCerrar={() => setModalProducto(null)}
        procesando={procesando}
      />

      {toast && <div className={`pagos-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}