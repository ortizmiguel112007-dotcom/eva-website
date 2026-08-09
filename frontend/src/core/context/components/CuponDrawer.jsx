import { useState } from "react"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import { FiTag } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/carrito/CuponDrawer.css"


export function CuponDrawer({ onCuponAplicado }) {
  const { token }                     = useAuth()
  const [codigoCupon, setCodigoCupon] = useState("")
  const [cupon, setCupon]             = useState(null)
  const [cuponError, setCuponError]   = useState("")

  const handleAplicar = async () => {
    if (!codigoCupon.trim()) return
    setCuponError(""); setCupon(null)
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cupones/validar",
        { codigo: codigoCupon },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCupon(res.data.cupon)
      onCuponAplicado?.(res.data.cupon)
    } catch (err) {
      setCuponError(err.response?.data?.error || "Cupón inválido")
      onCuponAplicado?.(null)
    }
  }

  return (
    <>
      <div className="drawer-cupon">
        <input type="text" placeholder="Código de cupón"
          value={codigoCupon}
          onChange={e => setCodigoCupon(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && handleAplicar()}
        />
        <button onClick={handleAplicar} title="Aplicar cupón">
          <FiTag size={14} />
        </button>
      </div>
      {cupon && (
        <p className="drawer-cupon-ok">
          ✓ {cupon.tipo === "porcentaje"
            ? `${cupon.valor}% de descuento`
            : `${formatPrecio(cupon.valor)} de descuento`}
        </p>
      )}
      {cuponError && <p className="drawer-cupon-error">⚠️ {cuponError}</p>}
    </>
  )
}