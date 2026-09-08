import { useState, useEffect } from "react"
import axios from "axios"
import { FiSmartphone, FiCreditCard, FiTruck, FiSave } from "react-icons/fi"
import { useAuth } from "@/core/context/AuthConten"
import "@/infrastructure/css/products-emprend/metodopago/MetodosPagoConfig.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function MetodosPagoAdmin() {
  const { token } = useAuth()
  const [form, setForm] = useState({
    nequi_numero:         "",
    bancolombia_numero:   "",
    bancolombia_tipo:     "ahorros",
    titular_cuenta:       "",
    acepta_contraentrega: true,
  })
  const [cargando, setCargando]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast]         = useState(null)

  useEffect(() => {
    axios.get(`${BASE}/api/admin/metodos-pago`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setForm({
        nequi_numero:         res.data.nequi_numero         || "",
        bancolombia_numero:   res.data.bancolombia_numero   || "",
        bancolombia_tipo:     res.data.bancolombia_tipo     || "ahorros",
        titular_cuenta:       res.data.titular_cuenta       || "",
        acepta_contraentrega: res.data.acepta_contraentrega ?? true,
      }))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [token])

  const set = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }))

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      await axios.put(`${BASE}/api/admin/metodos-pago`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setToast({ msg: "Configuración de pago actualizada", tipo: "ok" })
    } catch {
      setToast({ msg: "Error al guardar", tipo: "error" })
    } finally {
      setGuardando(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (cargando) return <div className="mpc-container"><p>Cargando...</p></div>

  return (
    <div className="mpc-container">
      {toast && <div className={`mpc-toast ${toast.tipo}`}>{toast.msg}</div>}

      <div className="mpc-header">
        <h1>Métodos de pago de EVA</h1>
        <p>Esta es la cuenta a la que los clientes transferirán en el checkout (RN-052)</p>
      </div>

      <div className="mpc-card">
        <div className="mpc-card-header">
          <div className="mpc-card-icono nequi"><FiSmartphone size={20} /></div>
          <div><h3>Nequi</h3><p>Los clientes transferirán aquí</p></div>
        </div>
        <div className="mpc-field">
          <label>Número Nequi</label>
          <input type="tel" placeholder="Ej: 3001234567"
            value={form.nequi_numero} onChange={e => set("nequi_numero", e.target.value)} />
        </div>
      </div>

      <div className="mpc-card">
        <div className="mpc-card-header">
          <div className="mpc-card-icono bancolombia"><FiCreditCard size={20} /></div>
          <div><h3>Bancolombia</h3><p>Cuenta oficial de EVA</p></div>
        </div>
        <div className="mpc-field">
          <label>Número de cuenta</label>
          <input type="text" placeholder="Ej: 123-456789-12"
            value={form.bancolombia_numero} onChange={e => set("bancolombia_numero", e.target.value)} />
        </div>
        <div className="mpc-field">
          <label>Tipo de cuenta</label>
          <select value={form.bancolombia_tipo} onChange={e => set("bancolombia_tipo", e.target.value)}>
            <option value="ahorros">Ahorros</option>
            <option value="corriente">Corriente</option>
          </select>
        </div>
        <div className="mpc-field">
          <label>Titular de la cuenta</label>
          <input type="text" placeholder="Nombre completo del titular"
            value={form.titular_cuenta} onChange={e => set("titular_cuenta", e.target.value)} />
        </div>
      </div>

      <div className="mpc-card">
        <div className="mpc-card-header">
          <div className="mpc-card-icono contraentrega"><FiTruck size={20} /></div>
          <div><h3>Contra entrega</h3><p>Habilitar esta opción para todos los clientes</p></div>
          <label className="mpc-toggle">
            <input type="checkbox" checked={form.acepta_contraentrega}
              onChange={e => set("acepta_contraentrega", e.target.checked)} />
            <span className="mpc-toggle-slider" />
          </label>
        </div>
      </div>

      <button className="mpc-btn-guardar" onClick={handleGuardar} disabled={guardando}>
        <FiSave size={15} />
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  )
}