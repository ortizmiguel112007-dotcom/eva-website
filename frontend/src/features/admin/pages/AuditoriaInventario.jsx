import { useState, useEffect } from "react"
import axios from "axios"
import { FiPackage, FiLock } from "react-icons/fi"

import { MetricasAuditoria } from "../components/auditoria/MetricasAuditoria"
import { FiltrosAuditoria }  from "../components/auditoria/FiltrosAuditoria"
import { TablaAuditoria }    from "../components/auditoria/TablaAuditoria"
import { PaginacionSimple }  from "@/features/usuario/components/historial/PaginacionSimple"

import "@/infrastructure/css/admin/auditoria_inventario/AuditoriaInventario.css"
import "@/infrastructure/css/auth/CrudAdmin.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })
const PAGE_SIZE = 15

function getEstado(item) {
  if (item.producto?.tipo === "servicio") return "servicio"
  if (item.cantidad === 0)                return "agotado"
  if (item.cantidad <= item.stock_minimo) return "bajo"
  return "ok"
}

export default function AuditoriaInventario() {
  const [inventario, setInventario]     = useState([])
  const [cargando, setCargando]         = useState(true)
  const [busqueda, setBusqueda]         = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroEmp, setFiltroEmp]       = useState("todas")
  const [pagina, setPagina]             = useState(1)

  useEffect(() => {
    axios.get(`${BASE}/api/admin/inventario`, { headers: hdrs() })
      .then(res => setInventario(res.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { setPagina(1) }, [busqueda, filtroEstado, filtroEmp])

  const emprendedoras = [...new Set(
    inventario.map(i => i.producto?.seccion?.emprendedora?.usuario?.nombre).filter(Boolean)
  )].sort()

  const filtrados = inventario.filter(i => {
    const nombre = i.producto?.nombre_producto?.toLowerCase() || ""
    const emp    = i.producto?.seccion?.emprendedora?.usuario?.nombre || ""
    const estado = getEstado(i)

    const matchB = nombre.includes(busqueda.toLowerCase()) || emp.toLowerCase().includes(busqueda.toLowerCase())
    const matchE = filtroEstado === "todos" || estado === filtroEstado
    const matchP = filtroEmp   === "todas"  || emp === filtroEmp

    return matchB && matchE && matchP
  })

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const paginaItems  = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  const totalItems   = inventario.filter(i => i.producto?.tipo !== "servicio").length
  const totalOk      = inventario.filter(i => getEstado(i) === "ok").length
  const totalBajo    = inventario.filter(i => getEstado(i) === "bajo").length
  const totalAgotado = inventario.filter(i => getEstado(i) === "agotado").length

  if (cargando) return <div className="ai-loading">Cargando auditoría...</div>

  return (
    <div className="ai-page">

      <div className="ai-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="ai-titulo">
              <FiPackage size={22} color="#3b82f6" /> Auditoría de Inventario
            </h1>
            <p className="ai-subtitulo">Supervisión de stock de todos los productos de la plataforma</p>
          </div>
          <span className="ai-readonly-badge">
            <FiLock size={11} /> Solo lectura
          </span>
        </div>
      </div>

      <MetricasAuditoria
        totalItems={totalItems}
        totalOk={totalOk}
        totalBajo={totalBajo}
        totalAgotado={totalAgotado}
      />

      <FiltrosAuditoria
        busqueda={busqueda}       setBusqueda={setBusqueda}
        filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
        filtroEmp={filtroEmp}     setFiltroEmp={setFiltroEmp}
        emprendedoras={emprendedoras}
      />

      <TablaAuditoria items={paginaItems} pagina={pagina} />

      <PaginacionSimple
        pagina={pagina}
        totalPaginas={totalPaginas}
        setPagina={setPagina}
        total={filtrados.length}
        labelSingular="producto"
        labelPlural="productos"
      />

    </div>
  )
}