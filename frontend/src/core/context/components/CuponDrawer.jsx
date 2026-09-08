import { useState } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { useCarrito } from "@/core/context/CarritoContext"
import { FiTag, FiCheck } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export function CuponDrawer() {
  const { token } = useAuth()
  const { carrito: items, cupon, setCupon } = useCarrito()

  const [codigo, setCodigo]     = useState("")
  const [error, setError]       = useState("")
  const [cargando, setCargando] = useState(false)

  const handleAplicar = async () => {
    if (!codigo.trim()) return
    setError(""); setCargando(true)
    try {
      const res = await axios.post(
        `${API_URL}/api/cupones/validar`,
        { codigo: codigo.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = res.data

      const idsSeccionCarrito = items.map(i => i.id_seccion)
      const aplica = data.secciones_aplicables?.some(id => idsSeccionCarrito.includes(id))

      if (!aplica) {
        setError("Este cupón no aplica a los productos de tu carrito")
        return
      }

      setCupon(data)
    } catch (err) {
      setError(err.response?.data?.error || "Cupón inválido")
    } finally {
      setCargando(false)
    }
  }

  const handleQuitar = () => {
    setCupon(null)
    setCodigo("")
    setError("")
  }

  return (
    <div className="drawer-cupon">
      {!cupon ? (
        <div className="drawer-cupon-input">
          <input
            type="text"
            placeholder="Código de cupón"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleAplicar()}
          />
          <button onClick={handleAplicar} disabled={cargando} type="button">
            <FiTag size={12} /> {cargando ? "..." : "Aplicar"}
          </button>
        </div>
      ) : (
        <div className="drawer-cupon-ok">
          <span>
            <FiCheck size={12} /> Cupón {cupon.codigo} —{" "}
            {cupon.tipo === "porcentaje" ? `${cupon.valor}%` : formatPrecio(cupon.valor)}
          </span>
          <button className="drawer-cupon-quitar" onClick={handleQuitar} type="button">
            Quitar
          </button>
        </div>
      )}
      {error && <div className="drawer-cupon-error">{error}</div>}
    </div>
  )
}