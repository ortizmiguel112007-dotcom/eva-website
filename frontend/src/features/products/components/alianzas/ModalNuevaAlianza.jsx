import { useState, useEffect } from "react"
import axios from "axios"
import { FiX, FiUsers } from "react-icons/fi"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export function ModalNuevaAlianza({ abierto, onCerrar, onCreada, token }) {
  const [emprendedoras, setEmprendedoras] = useState([])
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [idInvitada, setIdInvitada] = useState("")
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!abierto) return
    axios.get(`${BASE}/api/alianzas/emprendedoras`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setEmprendedoras(res.data))
      .catch(() => setEmprendedoras([]))
  }, [abierto, token])

  if (!abierto) return null

  const handleCrear = async () => {
    if (!nombre.trim() || !idInvitada) { setError("Nombre y emprendedora invitada son obligatorios"); return }
    setProcesando(true)
    try {
      await axios.post(`${BASE}/api/alianzas`, {
        nombre, descripcion, fecha_fin: fechaFin || null, id_invitada: Number(idInvitada),
      }, { headers: { Authorization: `Bearer ${token}` } })
      onCreada()
      onCerrar()
      setNombre(""); setDescripcion(""); setFechaFin(""); setIdInvitada("")
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear alianza")
    } finally { setProcesando(false) }
  }

  return (
    <div className="pagos-modal-overlay" onClick={onCerrar}>
      <div className="pagos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pagos-modal-header">
          <h3><FiUsers size={16} /> Nueva alianza promocional</h3>
          <button className="pagos-modal-cerrar" onClick={onCerrar}><FiX size={18} /></button>
        </div>
        <div className="pagos-modal-body">
          <div className="pagos-modal-rechazo">
            <label>Nombre de la alianza</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1.5px solid #e5e7eb" }} />
          </div>
          <div className="pagos-modal-rechazo">
            <label>Descripción (opcional)</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div className="pagos-modal-rechazo">
            <label>Invitar a</label>
            <select value={idInvitada} onChange={(e) => setIdInvitada(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1.5px solid #e5e7eb" }}>
              <option value="">Selecciona una emprendedora</option>
              {emprendedoras.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre} — {e.email}</option>
              ))}
            </select>
          </div>
          <div className="pagos-modal-rechazo">
            <label>Fecha de finalización (opcional)</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1.5px solid #e5e7eb" }} />
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>{error}</p>}

          <div className="pagos-modal-btns">
            <button className="pago-btn-rechazar-modal" onClick={onCerrar} disabled={procesando}>Cancelar</button>
            <button className="pago-btn-verificar-modal" onClick={handleCrear} disabled={procesando}>
              {procesando ? "Creando..." : "Enviar invitación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}