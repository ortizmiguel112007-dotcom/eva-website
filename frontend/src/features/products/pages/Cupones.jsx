import { useState, useEffect } from "react"
import { FiPlus, FiGift, FiCheckCircle, FiXCircle } from "react-icons/fi"
import { cuponService } from "@/features/products/services/cupon.service"

import { MetricasCupones }  from "../components/cupones/MetricasCupones"
import { TablaCupones }     from "../components/cupones/TablaCupones"
import { ModalNuevoCupon }  from "../components/cupones/ModalNuevoCupon"

import "@/infrastructure/css/products-emprend/cupones/Cupones.css"

const FORM_INICIAL = {
  codigo: "", tipo: "porcentaje", valor: "",
  descripcion: "", fecha_fin: "", limite_usos: "",
}

const getEstado = cupon => {
  if (cupon.fecha_fin && new Date() > new Date(cupon.fecha_fin)) return "expirado"
  if (cupon.limite_usos && cupon.usos >= cupon.limite_usos)       return "agotado"
  if (!cupon.activo)                                               return "inactivo"
  return "activo"
}

export default function Cupones() {
  const [cupones, setCupones]       = useState([])
  const [cargando, setCargando]     = useState(true)
  const [modal, setModal]           = useState(false)
  const [form, setForm]             = useState(FORM_INICIAL)
  const [formErrors, setFormErrors] = useState({})
  const [guardando, setGuardando]   = useState(false)
  const [toast, setToast]           = useState(null)

  useEffect(() => {
    cuponService.listar()
      .then(setCupones)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const mostrarToast = (msg, tipo = "success") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const validar = () => {
    const errors = {}
    if (!form.codigo.trim()) errors.codigo = "El código es obligatorio"
    if (!form.valor)         errors.valor  = "El valor es obligatorio"
    if (form.tipo === "porcentaje" && (Number(form.valor) < 1 || Number(form.valor) > 100))
      errors.valor = "El porcentaje debe estar entre 1 y 100"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCrear = async () => {
    if (!validar()) return
    setGuardando(true)
    try {
      await cuponService.crear({
        codigo:      form.codigo.toUpperCase(),
        tipo:        form.tipo,
        valor:       Number(form.valor),
        descripcion: form.descripcion || null,
        fecha_fin:   form.fecha_fin   || null,
        limite_usos: form.limite_usos ? Number(form.limite_usos) : null,
      })
      setCupones(await cuponService.listar())
      setModal(false)
      setForm(FORM_INICIAL)
      mostrarToast("Cupón creado correctamente")
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al crear cupón", "error")
    } finally { setGuardando(false) }
  }

  const handleToggle = async (id_cupon) => {
    try {
      const res = await cuponService.toggle(id_cupon)
      setCupones(prev => prev.map(c =>
        c.id_cupon === id_cupon ? { ...c, activo: res.cupon.activo } : c
      ))
      mostrarToast(res.message)
    } catch { mostrarToast("Error al cambiar estado", "error") }
  }

  const handleEliminar = async (id_cupon) => {
    if (!confirm("¿Seguro que quieres eliminar este cupón?")) return
    try {
      await cuponService.eliminar(id_cupon)
      setCupones(prev => prev.filter(c => c.id_cupon !== id_cupon))
      mostrarToast("Cupón eliminado")
    } catch { mostrarToast("Error al eliminar", "error") }
  }

  if (cargando) return (
    <div className="cupones-container">
      <div className="cupones-loading"><FiGift size={28} /><span>Cargando cupones...</span></div>
    </div>
  )

  return (
    <div className="cupones-container">
      <div className="cupones-header">
        <h1>Cupones de Descuento</h1>
        <button className="btn-nuevo-cupon" onClick={() => setModal(true)}>
          <FiPlus size={16} /> Nuevo Cupón
        </button>
      </div>

      <MetricasCupones cupones={cupones} getEstado={getEstado} />

      <div className="cupones-tabla-wrapper">
        <TablaCupones
          cupones={cupones}
          getEstado={getEstado}
          onToggle={handleToggle}
          onEliminar={handleEliminar}
          onNuevo={() => setModal(true)}
        />
      </div>

      {modal && (
        <ModalNuevoCupon
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          guardando={guardando}
          onCrear={handleCrear}
          onCerrar={() => { setModal(false); setForm(FORM_INICIAL) }}
        />
      )}

      {toast && (
        <div className={`cupones-toast ${toast.tipo}`}>
          {toast.tipo === "success"
            ? <FiCheckCircle size={15} />
            : <FiXCircle     size={15} />
          }
          {toast.msg}
        </div>
      )}
    </div>
  )
}