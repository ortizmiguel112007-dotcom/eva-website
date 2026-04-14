import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCarrito } from "@/core/context/CarritoContext"
import axios from "axios"
import {
  FiArrowLeft, FiShoppingCart, FiHeart, FiUsers,
  FiPackage, FiClock, FiCheck, FiTag, FiCalendar
} from "react-icons/fi"

const BASE = "http://localhost:3000"

const fmtPrecio = (p) => "$" + Number(p).toLocaleString("es-CO")
const fmtFecha  = (f) => f ? new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : null

const AVATAR_COLORS = ["#3b82f6","#16a34a","#f97316","#a855f7","#ec4899","#0891b2"]
function getAvatarColor(nombre) {
  if (!nombre) return AVATAR_COLORS[0]
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}
function getInitials(nombre) {
  if (!nombre) return "?"
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

export default function TiendaAlianza() {
  const { id_alianza } = useParams()
  const navigate = useNavigate()
  const { agregarAlCarrito } = useCarrito()

  const [alianza, setAlianza]   = useState(null)
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro]     = useState("todos") // "todos" | id_usuario
  const [agregados, setAgregados] = useState({})
  const [favoritos, setFavoritos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("favoritos") || "[]") } catch { return [] }
  })

  useEffect(() => {
    axios.get(`${BASE}/api/publico/alianza/${id_alianza}`)
      .then(r => setAlianza(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [id_alianza])

  const handleAgregar = (e, p) => {
    e.stopPropagation()
    agregarAlCarrito({
      id_producto: p.id_producto, nombre_producto: p.nombre_producto,
      precio: p.precio, imagen: p.imagen, categoria: p.categoria
    })
    setAgregados(prev => ({ ...prev, [p.id_producto]: true }))
    setTimeout(() => setAgregados(prev => ({ ...prev, [p.id_producto]: false })), 2000)
  }

  const toggleFav = (e, id) => {
    e.stopPropagation()
    setFavoritos(prev => {
      const nuevo = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem("favoritos", JSON.stringify(nuevo))
      return nuevo
    })
  }

  if (cargando) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "1rem", color: "#64748b" }}>
      <div style={{ width: "2.5rem", height: "2.5rem", border: "3px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p>Cargando tienda...</p>
    </div>
  )

  if (!alianza) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
      <FiUsers size={48} />
      <p>Alianza no encontrada</p>
    </div>
  )

  // Productos de la sección conjunta de alianza
  const productosAlianza = alianza.secciones?.flatMap(s => s.productos) || []

  // Productos propios de cada participante (filtrados)
  const participantes = alianza.participantes || []

  const productosFiltrados = filtro === "todos"
    ? productosAlianza
    : productosAlianza.filter(p => {
        const seccion = alianza.secciones?.find(s =>
          s.productos.some(prod => prod.id_producto === p.id_producto)
        )
        return seccion?.id_emprendedora === Number(filtro)
      })

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", fontFamily: "'DM Sans', system-ui" }}>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0f1f3a 50%, #1e3a6e 100%)",
        padding: "2.5rem 3rem 4rem", position: "relative", overflow: "hidden"
      }}>
        {/* Blobs decorativos */}
        <div style={{ position: "absolute", width: 300, height: 300, background: "#3b82f6", borderRadius: "50%", filter: "blur(80px)", opacity: 0.15, top: -100, left: -50, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 200, height: 200, background: "#f59e0b", borderRadius: "50%", filter: "blur(60px)", opacity: 0.1, bottom: -60, right: 80, pointerEvents: "none" }} />

        <button onClick={() => navigate(-1)} style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.75)", borderRadius: "999px", padding: "0.4rem 0.9rem",
          fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem",
          position: "relative", zIndex: 2
        }}>
          <FiArrowLeft size={14} /> Volver
        </button>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 900, margin: "0 auto" }}>
          {/* Badge alianza */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.4)",
            color: "#93c5fd", borderRadius: "999px", padding: "0.3rem 0.9rem",
            fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem"
          }}>
            <FiUsers size={12} /> Tienda Colaborativa
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem", lineHeight: 1.1 }}>
            {alianza.nombre}
          </h1>

          {alianza.descripcion && (
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", margin: "0 0 1.5rem" }}>
              {alianza.descripcion}
            </p>
          )}

          {/* Participantes */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {participantes.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{
                  width: "2.5rem", height: "2.5rem", borderRadius: "0.65rem",
                  background: getAvatarColor(p.usuario?.nombre),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "0.82rem",
                  color: "#fff", border: "2px solid rgba(255,255,255,0.2)"
                }}>
                  {getInitials(p.usuario?.nombre)}
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700, margin: 0 }}>{p.usuario?.nombre}</p>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem" }}>Emprendedora EVA</span>
                </div>
              </div>
            ))}

            {alianza.fecha_fin && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginLeft: "auto" }}>
                <FiCalendar size={12} /> Campaña hasta: {fmtFecha(alianza.fecha_fin)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 3rem" }}>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Productos en alianza", valor: productosAlianza.length, color: "#3b82f6" },
            { label: "Emprendedoras", valor: participantes.length, color: "#16a34a" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "0.85rem",
              padding: "1rem 1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              borderTop: `3px solid ${s.color}`
            }}>
              <strong style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: s.color, display: "block" }}>
                {s.valor}
              </strong>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Título sección */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
            Productos de la Campaña
          </h2>
        </div>

        {/* Grid productos */}
        {productosAlianza.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
            padding: "4rem", background: "#fff", border: "2px dashed #e5e7eb",
            borderRadius: "1.25rem", color: "#94a3b8"
          }}>
            <FiPackage size={40} color="#e5e7eb" />
            <p style={{ margin: 0, fontWeight: 600 }}>Aún no hay productos en esta campaña</p>
            <span style={{ fontSize: "0.82rem" }}>Las emprendedoras están preparando su catálogo</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.1rem" }}>
            {productosAlianza.map((p, idx) => {
              const agotado = p.tipo !== "servicio" && p.inventario?.cantidad === 0
              const esFav   = favoritos.includes(p.id_producto)
              const yaAgregado = agregados[p.id_producto]

              return (
                <div key={p.id_producto} onClick={() => navigate(`/producto/${p.id_producto}`)} style={{
                  background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem",
                  overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  animation: `fadeUp 0.4s ease ${idx * 0.04}s both`
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor = "#bfdbfe" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#e5e7eb" }}
                >
                  {/* Imagen */}
                  <div style={{ height: 200, position: "relative", background: "#f8fafc", overflow: "hidden" }}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre_producto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }}>
                          <FiPackage size={36} color="#cbd5e1" />
                        </div>
                    }

                    {/* Badge tipo */}
                    <span style={{
                      position: "absolute", top: 10, left: 10,
                      background: p.tipo === "servicio" ? "#f0fdf4" : "#eff6ff",
                      color: p.tipo === "servicio" ? "#16a34a" : "#3b82f6",
                      fontSize: "0.62rem", fontWeight: 800, padding: "3px 9px",
                      borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.05em"
                    }}>
                      {p.tipo}
                    </span>

                    {/* Favorito */}
                    <button onClick={e => toggleFav(e, p.id_producto)} style={{
                      position: "absolute", top: 10, right: 10,
                      width: "2rem", height: "2rem", borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}>
                      <FiHeart size={13} fill={esFav ? "#ef4444" : "none"} color={esFav ? "#ef4444" : "#94a3b8"} />
                    </button>

                    {/* Agotado */}
                    {agotado && (
                      <div style={{
                        position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <span style={{ background: "#ef4444", color: "#fff", padding: "0.4rem 1rem", borderRadius: "999px", fontWeight: 800, fontSize: "0.82rem" }}>Agotado</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: "1rem 1.1rem" }}>
                    <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {p.categoria}
                    </span>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.92rem", fontWeight: 800, color: "#1e293b", margin: "0.2rem 0 0.5rem", lineHeight: 1.25 }}>
                      {p.nombre_producto}
                    </h3>

                    {p.tipo === "servicio" && p.duracion && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#64748b", marginBottom: "0.5rem" }}>
                        <FiClock size={11} /> {p.duracion}
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
                      <strong style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 800, color: "#1e293b" }}>
                        {fmtPrecio(p.precio)}
                      </strong>
                      <button
                        disabled={agotado}
                        onClick={e => handleAgregar(e, p)}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.3rem",
                          padding: "0.45rem 0.85rem", borderRadius: "0.55rem", border: "none",
                          background: agotado ? "#e5e7eb" : yaAgregado ? "#16a34a" : "#1e293b",
                          color: agotado ? "#94a3b8" : "#fff",
                          fontSize: "0.78rem", fontWeight: 700, cursor: agotado ? "not-allowed" : "pointer",
                          fontFamily: "'DM Sans', system-ui", transition: "all 0.2s"
                        }}
                      >
                        {yaAgregado ? <><FiCheck size={12} /> Listo</> :
                         agotado ? "Agotado" :
                         p.tipo === "servicio" ? "Reservar" :
                         <><FiShoppingCart size={12} /> Agregar</>}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}