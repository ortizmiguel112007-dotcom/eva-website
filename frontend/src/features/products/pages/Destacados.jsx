import { useState, useEffect } from "react"
import { destacadoService } from "@/features/products/services/destacado.service"

import { MetricasDestacados } from "../components/destacados/MetricasDestacados"
import { FiltrosDestacados }  from "../components/destacados/FiltrosDestacados"
import { DestacadoCard }      from "../components/destacados/DestacadoCard"

import "@/infrastructure/css/products-emprend/destacados/Destacados.css"

export default function Destacados() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)

  useEffect(() => {
    destacadoService.listar()
      .then(setProductos)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const mostrarToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggle = async id_producto => {
    try {
      const res = await destacadoService.toggle(id_producto)
      setProductos(prev => prev.map(p =>
        p.id_producto === id_producto ? { ...p, destacado: res.producto.destacado } : p
      ))
      mostrarToast(res.message)
    } catch { mostrarToast("Error al actualizar destacado") }
  }

  const filtrados = productos.filter(p => {
    const matchBusqueda =
      p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase())
    const matchFiltro =
      filtro === "todos"      ? true
      : filtro === "destacados" ? p.destacado
      : !p.destacado
    return matchBusqueda && matchFiltro
  })

  if (cargando) return <div className="destacados-container"><p>Cargando productos...</p></div>

  return (
    <div className="destacados-container">
      <div className="destacados-header">
        <h1>Productos Destacados</h1>
        <p className="destacados-subtitle">
          Gestiona qué productos y servicios quieres destacar en tu catálogo
        </p>
      </div>

      <MetricasDestacados productos={productos} />

      <FiltrosDestacados
        busqueda={busqueda} setBusqueda={setBusqueda}
        filtro={filtro}     setFiltro={setFiltro}
      />

      <div className="destacados-grid">
        {filtrados.length === 0 ? (
          <div className="destacados-empty">No hay productos que coincidan</div>
        ) : filtrados.map(p => (
          <DestacadoCard key={p.id_producto} producto={p} onToggle={handleToggle} />
        ))}
      </div>

      {toast && <div className="destacados-toast">{toast}</div>}
    </div>
  )
}