import { useState } from "react"
import axios from "axios"
import "@/infrastructure/css/usuario/pedidos/ModalComentario.css"
export function ModalComentario({ pedido, token, onClose, onEnviado }) {
  if (!pedido) return null

  const [productoId, setProductoId] = useState(pedido.detalles?.[0]?.producto?.id_producto || null)
  const [calificacion, setCalificacion] = useState(0)
  const [hover, setHover]               = useState(0)
  const [texto, setTexto]               = useState("")
  const [enviando, setEnviando]         = useState(false)
  const [error, setError]               = useState("")

  const handleEnviar = async () => {
    if (calificacion === 0) { setError("Selecciona una calificación"); return }
    if (!texto.trim())      { setError("Escribe un comentario"); return }
    setEnviando(true)
    try {
      await axios.post(
        "http://localhost:3000/api/comentarios",
        { id_producto: productoId, id_pedido: pedido.id_pedido, calificacion, texto },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onEnviado()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar comentario")
    } finally { setEnviando(false) }
  }

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal-comentario" onClick={e => e.stopPropagation()}>
        <h3>⭐ Dejar reseña</h3>

        {pedido.detalles?.length > 1 ? (
          <select value={productoId}
            onChange={e => setProductoId(Number(e.target.value))}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1.5px solid #e5e7eb", fontSize: "0.88rem", outline: "none" }}>
            {pedido.detalles.map(d => (
              <option key={d.id_detalle} value={d.producto?.id_producto}>
                {d.producto?.nombre_producto}
              </option>
            ))}
          </select>
        ) : (
          <p className="mp-modal-producto-label">
            Reseña para: <strong>{pedido.detalles?.[0]?.producto?.nombre_producto}</strong>
          </p>
        )}

        <div>
          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", margin: "0 0 0.5rem" }}>
            Calificación
          </p>
          <div className="mp-estrellas">
            {[1,2,3,4,5].map(i => (
              <button key={i}
                className={`mp-estrella ${i <= (hover || calificacion) ? "llena" : "vacia"}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setCalificacion(i)}>★
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="¿Cómo fue tu experiencia?"
          value={texto}
          onChange={e => { setTexto(e.target.value); setError("") }}
        />

        {error && <p style={{ fontSize: "0.78rem", color: "#ef4444", margin: 0 }}>{error}</p>}

        <div className="mp-modal-btns">
          <button className="mp-btn-cancelar" onClick={onClose}>Cancelar</button>
          <button className="mp-btn-enviar" onClick={handleEnviar} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar reseña"}
          </button>
        </div>
      </div>
    </div>
  )
}