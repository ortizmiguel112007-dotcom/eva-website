import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import { FiTag, FiPlus, FiAlertCircle, FiPackage } from "react-icons/fi"

import { PanelProductos } from "../components/reglas/PanelProductos"
import { ReglaCard }      from "../components/reglas/ReglaCard"
import { FormNuevaRegla } from "../components/reglas/FormNuevaRegla"
import { formatPrecio }   from "@/features/tienda/utils/utils"

import "@/infrastructure/css/products-emprend/reglas/ReglaDescuento.css"

const BASE = "http://localhost:3000"
const hdrs = token => ({ Authorization: `Bearer ${token}` })

export default function ReglaDescuento() {
  const { token } = useAuth()

  const [productos, setProductos]         = useState([])
  const [productoSel, setProductoSel]     = useState(null)
  const [reglas, setReglas]               = useState([])
  const [cargando, setCargando]           = useState(false)
  const [cargandoProds, setCargandoProds] = useState(true)
  const [busqueda, setBusqueda]           = useState("")
  const [toast, setToast]                 = useState(null)
  const [mostrarForm, setMostrarForm]     = useState(false)
  const [guardando, setGuardando]         = useState(false)

  useEffect(() => {
    axios.get(`${BASE}/api/items/mis-items`, { headers: hdrs(token) })
      .then(res => setProductos(res.data.filter(p => p.tipo === "producto")))
      .catch(console.error)
      .finally(() => setCargandoProds(false))
  }, [])

  useEffect(() => {
    if (!productoSel) return
    setCargando(true)
    axios.get(`${BASE}/api/reglas-descuento/${productoSel.id_producto}`, { headers: hdrs(token) })
      .then(res => setReglas(res.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [productoSel])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSeleccionar = p => {
    setProductoSel(p)
    setMostrarForm(false)
  }

  const handleCrear = async (datos) => {
    setGuardando(true)
    try {
      const res = await axios.post(`${BASE}/api/reglas-descuento`, {
        ...datos,
        id_producto: productoSel.id_producto,
      }, { headers: hdrs(token) })
      setReglas(prev => [...prev, res.data.regla])
      setMostrarForm(false)
      mostrarToast("Regla creada correctamente")
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al crear regla", "error")
    } finally { setGuardando(false) }
  }

  const handleToggle = async id_regla => {
    try {
      const res = await axios.put(`${BASE}/api/reglas-descuento/${id_regla}/toggle`, {}, { headers: hdrs(token) })
      setReglas(prev => prev.map(r => r.id_regla === id_regla ? res.data.regla : r))
      mostrarToast(res.data.message)
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al cambiar estado", "error")
    }
  }

  const handleEliminar = async id_regla => {
    try {
      await axios.delete(`${BASE}/api/reglas-descuento/${id_regla}`, { headers: hdrs(token) })
      setReglas(prev => prev.filter(r => r.id_regla !== id_regla))
      mostrarToast("Regla eliminada")
    } catch { mostrarToast("Error al eliminar", "error") }
  }

  return (
    <div className="rd-page">
      {toast && <div className={`rd-toast ${toast.tipo}`}>{toast.msg}</div>}

      <div className="rd-header">
        <h1 className="rd-titulo">
          <FiTag size={22} color="#3b82f6" /> Reglas de Descuento
        </h1>
        <p className="rd-subtitulo">
          Configura descuentos automáticos según el stock de tus productos
        </p>
      </div>

      <div className="rd-layout">
        <PanelProductos
          productos={productos}
          productoSel={productoSel}
          cargando={cargandoProds}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          onSeleccionar={handleSeleccionar}
        />

        <div className="rd-panel-reglas">
          {!productoSel ? (
            <div className="rd-no-sel">
              <FiTag size={40} color="#cbd5e1" />
              <p>Selecciona un producto para ver y gestionar sus reglas de descuento</p>
            </div>
          ) : (
            <>
              <div className="rd-producto-sel-header">
                <div className="rd-producto-sel-info">
                  {productoSel.imagen
                    ? <img src={productoSel.imagen} alt="" className="rd-producto-sel-img" />
                    : <div className="rd-producto-sel-placeholder"><FiPackage size={18} color="#94a3b8" /></div>
                  }
                  <div>
                    <p className="rd-producto-sel-nombre">{productoSel.nombre_producto}</p>
                    <p className="rd-producto-sel-precio">{formatPrecio(productoSel.precio)}</p>
                  </div>
                </div>
                <button className="rd-btn-nueva" onClick={() => setMostrarForm(true)}>
                  <FiPlus size={14} /> Nueva regla
                </button>
              </div>

              {mostrarForm && (
                <FormNuevaRegla
                  prioridad={reglas.length + 1}
                  guardando={guardando}
                  onCrear={handleCrear}
                  onCancelar={() => setMostrarForm(false)}
                />
              )}

              {cargando ? (
                <p className="rd-cargando">Cargando reglas...</p>
              ) : reglas.length === 0 ? (
                <div className="rd-empty">
                  <FiAlertCircle size={32} color="#cbd5e1" />
                  <p>No hay reglas configuradas para este producto</p>
                </div>
              ) : reglas.map(r => (
                <ReglaCard
                  key={r.id_regla}
                  regla={r}
                  onToggle={handleToggle}
                  onEliminar={handleEliminar}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}