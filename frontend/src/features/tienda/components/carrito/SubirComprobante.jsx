
import { useState, useRef } from "react"
import axios from "axios"
import { FiCheck, FiImage, FiUpload } from "react-icons/fi"
import "@/infrastructure/css/tienda/carrito/SubirComprobante.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export function SubirComprobante({
  pedidos,
  idPago,
  token,
  metodoPago,
  onEnviado,
}) {
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef(null)

  const handleArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB")
      return
    }

    setArchivo(file)
    setPreview(URL.createObjectURL(file))
    setError("")
  }

  const handleSubir = async () => {
    if (!idPago) {
      setError("No se encontró el pago asociado a esta compra")
      return
    }

    if (!archivo) {
      setError("Selecciona una imagen del comprobante")
      return
    }

    setSubiendo(true)

    try {
      const formData = new FormData()
      formData.append("comprobante", archivo)

      const res = await axios.put(
        `${API_URL}/api/pagos/${idPago}/comprobante`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      onEnviado?.(res.data.pago)
      setEnviado(true)
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.error || "Error al subir comprobante"
      )
    } finally {
      setSubiendo(false)
    }
  }

  if (enviado) {
    return (
      <div className="comprobante-enviado">
        <FiCheck size={16} />
        Comprobante enviado — el admin lo verificará pronto
      </div>
    )
  }

  return (
    <div className="comprobante-wrap">
      <p className="comprobante-titulo">
        Sube tu comprobante de pago
      </p>

      <div
        className={`comprobante-dropzone ${preview ? "has-preview" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Vista previa del comprobante"
            className="comprobante-preview"
          />
        ) : (
          <>
            <FiImage size={28} color="#cbd5e1" />
            <p>Toca para seleccionar imagen</p>
            <span>PNG, JPG hasta 5MB</span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleArchivo}
        style={{ display: "none" }}
      />

      {error && (
        <p className="comprobante-error">{error}</p>
      )}

      <button
        className={`comprobante-btn ${archivo && !subiendo ? "active" : ""}`}
        onClick={handleSubir}
        disabled={subiendo || !archivo}
      >
        <FiUpload size={14} />
        {subiendo ? "Subiendo..." : "Enviar comprobante"}
      </button>
    </div>
  )
}
