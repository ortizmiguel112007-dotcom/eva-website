import { useState, useEffect } from "react"
import axios from "axios"
import { FiMessageSquare } from "react-icons/fi"

import { MetricasComentarios } from "./MetricasComentarios"
import { FiltrosComentarios } from "./FiltrosComentarios"
import { ComentarioCard } from "./ComentarioCard"
import { ReporteRetroalimentacion } from "./ReporteRetroalimentacion"
import { PaginacionSimple } from "@/features/usuario/components/historial/PaginacionSimple"

import "@/infrastructure/css/admin/resenas/AdminResenas.css"
import "@/infrastructure/css/auth/CrudAdmin.css"
import "@/infrastructure/css/products-emprend/comentarios/Comentarios.css"

const BASE      = "http://localhost:3000"
const PAGE_SIZE = 10

export function ResenasModeracion({ titulo, subtitulo, endpointComentarios, endpointReporte, headers }) {
  const [resenas, setResenas]   = useState([])
  const [reporte, setReporte]   = useState(null)
  const [cargando, setCargando] = useState(true)
  const [vista, setVista]       = useState("lista")
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro]     = useState("activos")
  const [toast, setToast]       = useState(null)
  const [pagina, setPagina]     = useState(1)

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE}${endpointComentarios}`, { headers }).then(res => res.data),
      endpointReporte
        ? axios.get(`${BASE}${endpointReporte}`, { headers }).then(res => res.data)
        : Promise.resolve(null),
    ])
      .then(([listaComentarios, reporteData]) => {
        setResenas(Array.isArray(listaComentarios) ? listaComentarios : [])
        setReporte(reporteData)
      })
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { setPagina(1) }, [busqueda, filtro])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const ocultar = async (id) => {
    try {
      await axios.put(`${BASE}/api/comentarios/${id}/ocultar`, {}, { headers })
      setResenas(prev => prev.map(r => r.id_comentario === id ? { ...r, activo: false } : r))
      mostrarToast("Comentario ocultado")
    } catch {
      mostrarToast("Error al ocultar", "error")
    }
  }

  const filtrados = resenas.filter(r => {
    const matchB =
      r.texto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.producto_nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" ? true : filtro === "activos" ? r.activo : !r.activo
    return matchB && matchF
  })

  const totalPaginas  = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const resenasPagina = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  return (
    <div className="ar-page">
      {toast && <div className={`ar-toast ${toast.tipo}`}>{toast.msg}</div>}

      <div className="ar-header">
        <h1 className="ar-titulo">{titulo}</h1>
        <p className="ar-sub">{subtitulo}</p>
      </div>

      <div className="comentarios-tabs">
        <button className={vista === "lista" ? "active" : ""} onClick={() => setVista("lista")}>Lista</button>
        <button className={vista === "reporte" ? "active" : ""} onClick={() => setVista("reporte")}>Reporte</button>
      </div>

      {vista === "reporte" ? (
        <ReporteRetroalimentacion reporte={reporte} />
      ) : (
        <>
          <MetricasComentarios resenas={resenas} />
          <FiltrosComentarios
            busqueda={busqueda} setBusqueda={setBusqueda}
            filtro={filtro} setFiltro={setFiltro}
          />

          <p className="ar-contador">
            Mostrando {filtrados.length} de {resenas.length} comentarios
          </p>

          {cargando ? (
            <p className="ar-cargando">Cargando comentarios...</p>
          ) : (
            <>
              <div className="ar-lista">
                {resenasPagina.length === 0 ? (
                  <div className="ar-empty">
                    <FiMessageSquare size={40} color="#4a3050" />
                    <p>No hay comentarios</p>
                  </div>
                ) : resenasPagina.map(r => (
                  <ComentarioCard key={r.id_comentario} resena={r} onOcultar={ocultar} />
                ))}
              </div>

              <PaginacionSimple
                pagina={pagina}
                totalPaginas={totalPaginas}
                setPagina={setPagina}
                total={filtrados.length}
                labelSingular="comentario"
                labelPlural="comentarios"
              />
            </>
          )}
        </>
      )}
    </div>
  )
}