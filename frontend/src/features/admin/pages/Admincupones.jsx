import { useState, useEffect } from "react"
import axios from "axios"
import { FiSearch, FiX, FiTag, FiDownload } from "react-icons/fi"

import { CuponAdminCard }       from "../components/cupones/CuponAdminCard"
import { ModalDesactivarCupon } from "../components/cupones/ModalDesactivarCupon"
import { getHeaders }           from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/cupones/AdminCupones.css"

const BASE = "http://localhost:3000"

export default function AdminCupones() {
  const [cupones, setCupones]                   = useState([])
  const [cargando, setCargando]                 = useState(true)
  const [busqueda, setBusqueda]                 = useState("")
  const [filtro, setFiltro]                     = useState("todos")
  const [toast, setToast]                       = useState(null)
  const [cuponADesactivar, setCuponADesactivar] = useState(null) // RF-101/RN-089
  const [exportando, setExportando]             = useState(false)

  const cargar = () => {
    setCargando(true)
    axios.get(`${BASE}/api/admin/cupones`, { headers: getHeaders() })
      .then(res => setCupones(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  // RF-101/RN-089: el admin SOLO puede desactivar cupones ajenos (nunca crear,
  // editar, reactivar ni eliminar — eso rompería RN-083/RN-088). Usa el
  // endpoint exclusivo de admin, que además notifica a la emprendedora dueña.
  const confirmarDesactivar = async (motivo) => {
    const id = cuponADesactivar.id_cupon
    try {
      await axios.put(`${BASE}/api/admin/cupones/${id}/desactivar`, { motivo }, { headers: getHeaders() })
      setCupones(prev => prev.map(c => c.id_cupon === id ? { ...c, activo: false } : c))
      mostrarToast("Cupón desactivado y emprendedora notificada")
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al desactivar", "error")
    } finally {
      setCuponADesactivar(null)
    }
  }

  // RF-101/RN-086: reportes exportables de todos los cupones de la plataforma
  const exportar = async (formato) => {
    setExportando(true)
    try {
      const res = await axios.get(`${BASE}/api/admin/cupones/metricas/export`, {
        params: { formato },
        responseType: "blob",
        headers: getHeaders(),
      })
      const ext = formato === "excel" ? "xlsx" : "pdf"
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `metricas_cupones.${ext}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      mostrarToast("Error al exportar", "error")
    } finally {
      setExportando(false)
    }
  }

  const filtrados = cupones.filter(c => {
    const matchB =
      c.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" ? true : filtro === "activos" ? c.activo : !c.activo
    return matchB && matchF
  })

  return (
    <div className="ac-page">
      {toast && <div className={`ac-toast ${toast.tipo}`}>{toast.msg}</div>}

      <div className="ac-header">
        <div>
          <h1 className="ac-titulo">Cupones</h1>
          <p className="ac-sub">Supervisa y audita los cupones de descuento de la plataforma</p>
        </div>
        <div className="ac-header-acciones">
          <button className="ac-btn-exportar" disabled={exportando} onClick={() => exportar("pdf")}>
            <FiDownload size={14} /> Exportar PDF
          </button>
          <button className="ac-btn-exportar" disabled={exportando} onClick={() => exportar("excel")}>
            <FiDownload size={14} /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="ac-metricas">
        <div className="ac-metrica ac-metrica--total">
          <p className="ac-metrica-label">Total</p>
          <strong className="ac-metrica-valor">{cupones.length}</strong>
        </div>
        <div className="ac-metrica ac-metrica--activo">
          <p className="ac-metrica-label">Activos</p>
          <strong className="ac-metrica-valor">{cupones.filter(c => c.activo).length}</strong>
        </div>
        <div className="ac-metrica ac-metrica--inactivo">
          <p className="ac-metrica-label">Inactivos</p>
          <strong className="ac-metrica-valor">{cupones.filter(c => !c.activo).length}</strong>
        </div>
      </div>

      <div className="ac-filtros">
        <div className="ac-search">
          <FiSearch size={14} color="#94a3b8" />
          <input className="ac-search-input" value={busqueda}
            onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por código, emprendedora o descripción..." />
          {busqueda && (
            <button className="ac-search-clear" onClick={() => setBusqueda("")}>
              <FiX size={13} />
            </button>
          )}
        </div>
        <select className="ac-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      <p className="ac-contador">Mostrando {filtrados.length} de {cupones.length} cupones</p>

      {cargando ? (
        <p className="ac-cargando">Cargando cupones...</p>
      ) : filtrados.length === 0 ? (
        <div className="ac-empty">
          <FiTag size={40} color="#e5e7eb" />
          <p>No hay cupones</p>
        </div>
      ) : (
        <div className="ac-lista">
          {filtrados.map(c => (
            <CuponAdminCard
              key={c.id_cupon}
              cupon={c}
              onDesactivar={() => setCuponADesactivar(c)}
            />
          ))}
        </div>
      )}

      {cuponADesactivar && (
        <ModalDesactivarCupon
          cupon={cuponADesactivar}
          onConfirmar={confirmarDesactivar}
          onCerrar={() => setCuponADesactivar(null)}
        />
      )}
    </div>
  )
}