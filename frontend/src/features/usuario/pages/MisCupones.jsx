import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import {
  FiCheck, FiX, FiClock, FiZap,
  FiTag, FiCopy, FiAlertCircle
} from "react-icons/fi"
import { RiCoupon3Line } from "react-icons/ri"
import "@/infrastructure/css/MisCupones.css"

function formatPrecio(p) { return "$" + Number(p).toLocaleString("es-CO") }
function formatFecha(f) {
  if (!f) return "Sin vencimiento"
  return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

const COLORES = [
  { bg: "#eef2ff", acento: "#6366f1", borde: "#c7d2fe" },
  { bg: "#ecfdf5", acento: "#10b981", borde: "#6ee7b7" },
  { bg: "#fff7ed", acento: "#f97316", borde: "#fed7aa" },
  { bg: "#fdf4ff", acento: "#a855f7", borde: "#e9d5ff" },
  { bg: "#fffbeb", acento: "#f59e0b", borde: "#fde68a" },
]

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
    const cargar = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/cupones/publicos", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCupones(Array.isArray(res.data) ? res.data.filter(c => c.activo) : [])
      } catch { setCupones([]) }
      finally { setCargando(false) }
    }
    cargar()
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
      setResultado(res.data.cupon)
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

      {/* Header */}
      <div className="mc-header">
        <div className="mc-header-icon">
          <RiCoupon3Line size={24} color="#6366f1" />
        </div>
        <div>
          <h1 className="mc-titulo">Cupones</h1>
          <p className="mc-sub">Valida y aplica descuentos en tu próxima compra</p>
        </div>
      </div>

      {/* Validador */}
      <div className="mc-validador">
        <div className="mc-validador-deco" />
        <div className="mc-validador-inner">
          <div className="mc-validador-label">
            <FiZap size={14} color="#6366f1" />
            <span>Validar código de cupón</span>
          </div>
          <div className="mc-validador-input-row">
            <div className="mc-input-wrap">
              <FiTag size={15} color="#94a3b8" />
              <input
                type="text"
                value={codigo}
                placeholder="Ej: DESC10, PROMO25..."
                onChange={e => { setCodigo(e.target.value.toUpperCase()); setError(""); setResultado(null) }}
                onKeyDown={e => e.key === "Enter" && handleValidar()}
                className="mc-input"
              />
            </div>
            <button
              onClick={handleValidar}
              disabled={validando || !codigo.trim()}
              className="mc-btn-validar"
            >
              {validando ? "Validando..." : "Validar"}
            </button>
          </div>

          {/* Resultado válido */}
          {resultado && (
            <div className="mc-resultado ok">
              <div className="mc-resultado-icono ok"><FiCheck size={16} /></div>
              <div>
                <p className="mc-resultado-titulo">¡Cupón válido!</p>
                <p className="mc-resultado-sub">
                  Descuento: <strong>
                    {resultado.tipo === "porcentaje"
                      ? `${resultado.valor}% OFF`
                      : `${formatPrecio(resultado.valor)} de descuento`}
                  </strong>
                  {resultado.descripcion && ` — ${resultado.descripcion}`}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mc-resultado error">
              <div className="mc-resultado-icono error"><FiAlertCircle size={16} /></div>
              <div>
                <p className="mc-resultado-titulo">Cupón no válido</p>
                <p className="mc-resultado-sub">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cupones disponibles */}
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
          {cupones.map((c, idx) => {
            const col = COLORES[idx % COLORES.length]
            const vencido = c.fecha_fin && new Date(c.fecha_fin) < new Date()
            const yaCopiado = copiado === c.codigo
            return (
              <div key={c.id_cupon} className={`mc-card ${vencido ? "vencido" : ""}`}
                style={{ "--col-bg": col.bg, "--col-acento": col.acento, "--col-borde": col.borde }}>

                {/* Recorte decorativo */}
                <div className="mc-card-cut left" />
                <div className="mc-card-cut right" />

                {/* Top */}
                <div className="mc-card-top">
                  <div className="mc-card-descuento" style={{ color: col.acento }}>
                    {c.tipo === "porcentaje"
                      ? <><span className="mc-card-valor">{c.valor}</span><span className="mc-card-pct">% OFF</span></>
                      : <><span className="mc-card-valor" style={{ fontSize: '1.4rem' }}>{formatPrecio(c.valor)}</span><span className="mc-card-pct">OFF</span></>
                    }
                  </div>
                  {vencido
                    ? <span className="mc-card-tag vencido">Expirado</span>
                    : <span className="mc-card-tag activo" style={{ background: col.acento }}>Activo</span>
                  }
                </div>

                {/* Línea punteada */}
                <div className="mc-card-divider" />

                {/* Bottom */}
                <div className="mc-card-bottom">
                  <div className="mc-card-codigo-wrap">
                    <span className="mc-card-codigo">{c.codigo}</span>
                    <button className="mc-card-copiar"
                      onClick={() => handleCopiar(c.codigo)}
                      style={{ color: yaCopiado ? col.acento : "#94a3b8" }}
                      title="Copiar código">
                      {yaCopiado ? <FiCheck size={13} /> : <FiCopy size={13} />}
                    </button>
                  </div>
                  {c.descripcion && <p className="mc-card-desc">{c.descripcion}</p>}
                  <div className="mc-card-info">
                    <span><FiClock size={10} /> {vencido ? "Expirado" : `Vence: ${formatFecha(c.fecha_fin)}`}</span>
                    {c.limite_usos && (
                      <span>{c.usos}/{c.limite_usos} usos</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}