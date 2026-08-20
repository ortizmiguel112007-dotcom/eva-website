import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import { RiCoupon3Line } from "react-icons/ri"

import { ValidadorCupon } from "../components/cupones/ValidadorCupon"
import { CuponCard } from "../components/cupones/CuponCard"

import "@/infrastructure/css/usuario/cupones/MisCupones.css"

export default function MisCupones() {
  const { token } = useAuth()
  const [cupones, setCupones]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [codigo, setCodigo]       = useState("")
  const [resultado, setResultado] = useState(null)
  const [error, setError]         = useState("")
  const [validando, setValidando] = useState(false)
  const [copiado, setCopiado]     = useState(null)

  useEffect(() => {
    axios.get("http://localhost:3000/api/cupones/publicos", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setCupones(Array.isArray(res.data) ? res.data.filter(c => c.activo) : []))
      .catch(() => setCupones([]))
      .finally(() => setCargando(false))
  }, [token])

  const handleValidar = async () => {
  if (!codigo.trim()) return
  setError(""); setResultado(null); setValidando(true)
  try {
    const res = await axios.post(
      "http://localhost:3000/api/cupones/validar",
      { codigo },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    setResultado(res.data)   // 🆕 antes: res.data.cupon
  } catch (err) {
    setError(err.response?.data?.error || "Cupón inválido o expirado")
  } finally { setValidando(false) }
}

  const handleCopiar = (cod) => {
    navigator.clipboard.writeText(cod)
    setCopiado(cod)
    setTimeout(() => setCopiado(null), 2000)
  }

  if (cargando) return (
    <div className="mc-loading">
      <div className="mc-spinner" />
      <p>Cargando cupones...</p>
    </div>
  )

  return (
    <div className="mc-page">
      <div className="mc-header">
        <div className="mc-header-icon">
          <RiCoupon3Line size={24} color="#6366f1" />
        </div>
        <div>
          <h1 className="mc-titulo">Cupones</h1>
          <p className="mc-sub">Valida y aplica descuentos en tu próxima compra</p>
        </div>
      </div>

      <ValidadorCupon
        codigo={codigo}
        setCodigo={val => { setCodigo(val); setError(""); setResultado(null) }}
        resultado={resultado}
        error={error}
        validando={validando}
        onValidar={handleValidar}
      />

      <div className="mc-seccion-titulo">
        <RiCoupon3Line size={16} />
        <span>Cupones disponibles ({cupones.length})</span>
      </div>

      {cupones.length === 0 ? (
        <div className="mc-empty">
          <div className="mc-empty-icono"><RiCoupon3Line size={32} color="#a5b4fc" /></div>
          <p>No hay cupones disponibles por ahora</p>
          <span>Las emprendedoras publican nuevos cupones periódicamente</span>
        </div>
      ) : (
        <div className="mc-grid">
          {cupones.map((c, idx) => (
            <CuponCard
              key={c.id_cupon}
              cupon={c}
              idx={idx}
              copiado={copiado}
              onCopiar={handleCopiar}
            />
          ))}
        </div>
      )}
    </div>
  )
}