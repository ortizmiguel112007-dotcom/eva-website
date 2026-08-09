import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { FiCheck, FiImage, FiUpload, FiAlertTriangle } from "react-icons/fi"
import "@/infrastructure/css/tienda/carrito/SubirComprobante.css"

export function SubirComprobante({ pago, token, onEnviado }) {
  const [archivo, setArchivo]   = useState(null)
  const [preview, setPreview]   = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [enviado, setEnviado]   = useState(false)
  const [error, setError]       = useState("")
  const inputRef = useRef(null)

  const esReenvio = pago?.estado === "rechazado"

  const handleArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
    setError("")
  }

  const handleSubir = async () => {
    if (!archivo) { setError("Selecciona una imagen del comprobante"); return }
    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append("comprobante", archivo)
      const { data } = await axios.put(
        `http://localhost:3000/api/pagos/${pago.id_pago}/comprobante`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      )
      setEnviado(true)
      onEnviado?.(data.pago)
    } catch (err) {
      setError(err.response?.data?.error || "Error al subir comprobante")
    } finally {
      setSubiendo(false)
    }
  }

  if (pago?.estado === "aprobado") {
    return (
      <div className="comprobante-enviado">
        <FiCheck size={16} /> Pago confirmado
      </div>
    )
  }

  if (enviado || (pago?.comprobante && pago?.estado === "pendiente")) {
    return (
      <div className="comprobante-enviado">
        <FiCheck size={16} /> Comprobante enviado — se verificará pronto
      </div>
    )
  }

  return (
    <div className="comprobante-wrap">
      <p className="comprobante-titulo">
        {esReenvio ? "Vuelve a subir tu comprobante" : "Sube tu comprobante de pago"}
      </p>

      {esReenvio && pago.nota_rechazo && (
        <p className="comprobante-rechazo">
          <FiAlertTriangle size={14} /> {pago.nota_rechazo}
        </p>
      )}

      <div
        className={`comprobante-dropzone ${preview ? "has-preview" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        {preview
          ? <img src={preview} alt="preview" className="comprobante-preview" />
          : <>
              <FiImage size={28} color="#cbd5e1" />
              <p>Toca para seleccionar imagen</p>
              <span>PNG, JPG hasta 5MB</span>
            </>
        }
      </div>

      <input ref={inputRef} type="file" accept="image/*"
        onChange={handleArchivo} style={{ display: "none" }} />

      {error && <p className="comprobante-error">{error}</p>}

      <button
        className={`comprobante-btn ${archivo && !subiendo ? "active" : ""}`}
        onClick={handleSubir}
        disabled={subiendo || !archivo}
      >
        <FiUpload size={14} />
        {subiendo ? "Subiendo..." : esReenvio ? "Reenviar comprobante" : "Enviar comprobante"}
      </button>
    </div>
  )
}