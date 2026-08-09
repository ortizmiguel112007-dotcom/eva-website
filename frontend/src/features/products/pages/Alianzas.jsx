import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import { alianzaService } from "@/features/products/services/alianza.service"

import { MetricasAlianzas } from "../components/alianzas/MetricasAlianzas"
import { AlianzaCard }      from "../components/alianzas/AlianzaCard"
import { ModalNuevaAlianza } from "../components/alianzas/ModalNuevaAlianza"

import "@/infrastructure/css/products-emprend/alianzas/Alianzas.css"

const FORM_INICIAL = { nombre: "", descripcion: "", fecha_fin: "", id_invitada: "" }

export default function Alianzas() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [alianzas, setAlianzas]           = useState([])
  const [emprendedoras, setEmprendedoras] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [modal, setModal]                 = useState(false)
  const [guardando, setGuardando]         = useState(false)
  const [toast, setToast]                 = useState(null)
  const [form, setForm]                   = useState(FORM_INICIAL)
  const [formErrors, setFormErrors]       = useState({})

  useEffect(() => {
    Promise.all([alianzaService.listar(), alianzaService.listarEmprendedoras()])
      .then(([dataAlianzas, dataEmprendedoras]) => {
        setAlianzas(dataAlianzas)
        setEmprendedoras(dataEmprendedoras)
      })
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const mostrarToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const validar = () => {
    const errors = {}
    if (!form.nombre.trim())  errors.nombre     = "El nombre es obligatorio"
    if (!form.id_invitada)    errors.id_invitada = "Debes seleccionar una emprendedora"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCrear = async () => {
    if (!validar()) return
    setGuardando(true)
    try {
      await alianzaService.crear({
        nombre:      form.nombre,
        descripcion: form.descripcion,
        fecha_fin:   form.fecha_fin || null,
        id_invitada: Number(form.id_invitada),
      })
      setAlianzas(await alianzaService.listar())
      setModal(false)
      setForm(FORM_INICIAL)
      mostrarToast("Alianza creada correctamente")
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al crear alianza")
    } finally { setGuardando(false) }
  }

  const handleAutorizar = async (id_alianza) => {
    try {
      const res = await alianzaService.autorizar(id_alianza)
      setAlianzas(prev => prev.map(a =>
        a.id_alianza === id_alianza
          ? { ...a, estado: res.activa ? "activa" : a.estado,
              participantes: a.participantes.map(p =>
                p.id_usuario === user.id ? { ...p, autorizado: true } : p
              )}
          : a
      ))
      mostrarToast(res.activa ? "¡Alianza activada!" : "Autorización registrada")
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al autorizar")
    }
  }

  const handleFinalizar = async (id_alianza) => {
    try {
      await alianzaService.finalizar(id_alianza)
      setAlianzas(prev => prev.map(a =>
        a.id_alianza === id_alianza ? { ...a, estado: "finalizada" } : a
      ))
      mostrarToast("Alianza finalizada")
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al finalizar")
    }
  }

  if (cargando) return <div className="alianzas-container"><p>Cargando alianzas...</p></div>

  return (
    <div className="alianzas-container">
      <div className="alianzas-header">
        <h1>Alianzas Promocionales</h1>
        <button className="btn-nueva-alianza" onClick={() => setModal(true)}>
          + Nueva Alianza
        </button>
      </div>

      <MetricasAlianzas alianzas={alianzas} />

      <div className="alianzas-grid">
        {alianzas.length === 0 ? (
          <div className="alianzas-empty">
            <p>No tienes alianzas todavía</p>
            <button className="btn-nueva-alianza" onClick={() => setModal(true)}>
              Crear primera alianza
            </button>
          </div>
        ) : alianzas.map(alianza => (
          <AlianzaCard
            key={alianza.id_alianza}
            alianza={alianza}
            userId={user.id}
            onAutorizar={handleAutorizar}
            onFinalizar={handleFinalizar}
            onVerTienda={id => navigate(`/alianza/${id}`)}
          />
        ))}
      </div>

      {modal && (
        <ModalNuevaAlianza
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          emprendedoras={emprendedoras}
          guardando={guardando}
          onCrear={handleCrear}
          onCerrar={() => setModal(false)}
        />
      )}

      {toast && <div className="alianzas-toast">{toast}</div>}
    </div>
  )
}