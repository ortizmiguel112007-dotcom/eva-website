import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import {
  FiPackage, FiClock, FiCheckCircle, FiDollarSign,
  FiCalendar, FiEye, FiX, FiDownload, FiStar,
  FiMapPin, FiHash, FiTruck
} from "react-icons/fi"
import "@/infrastructure/css/MisPedidos.css"

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric"
  })
}

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO")
}

function formatId(id) {
  return `ORD-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`
}

// Modal comentario
function ModalComentario({ pedido, onClose, onEnviado, token }) {
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
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal-comentario" onClick={e => e.stopPropagation()}>
        <h3>⭐ Dejar reseña</h3>
        {pedido.detalles?.length > 1 ? (
          <select value={productoId} onChange={e => setProductoId(Number(e.target.value))}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none' }}>
            {pedido.detalles.map(d => (
              <option key={d.id_detalle} value={d.producto?.id_producto}>{d.producto?.nombre_producto}</option>
            ))}
          </select>
        ) : (
          <p className="mp-modal-producto-label">Reseña para: <strong>{pedido.detalles?.[0]?.producto?.nombre_producto}</strong></p>
        )}
        <div>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', margin: '0 0 0.5rem' }}>Calificación</p>
          <div className="mp-estrellas">
            {[1,2,3,4,5].map(i => (
              <button key={i} className={`mp-estrella ${i <= (hover || calificacion) ? "llena" : "vacia"}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setCalificacion(i)}>★</button>
            ))}
          </div>
        </div>
        <textarea placeholder="¿Cómo fue tu experiencia?" value={texto}
          onChange={e => { setTexto(e.target.value); setError("") }} />
        {error && <p style={{ fontSize: '0.78rem', color: '#ef4444', margin: 0 }}>{error}</p>}
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

// Modal detalle pedido
function ModalDetalle({ pedido, onClose, onResena }) {
  const id = formatId(pedido.id_pedido)

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal-detalle" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mp-modal-detalle-header">
          <div>
            <h3>{id}</h3>
            <p>Fecha: {formatFecha(pedido.fecha)}</p>
          </div>
          <button className="mp-modal-cerrar" onClick={onClose}>
            <FiX size={14} />
          </button>
        </div>

        <div className="mp-modal-body">

          {/* Estado */}
          <div className="mp-modal-seccion">
            <h4>Estado del pedido</h4>
            <span className={`mp-badge ${pedido.estado}`}>
              {pedido.estado === "en_proceso" ? "En proceso" :
               pedido.estado === "enviado"    ? "Enviado"    :
               pedido.estado === "entregado"  ? "Entregado"  : "Cancelado"}
            </span>
          </div>

          {/* Productos */}
          <div className="mp-modal-seccion">
            <h4>Productos</h4>
            {pedido.detalles.map(d => (
              <div key={d.id_detalle} className="mp-modal-producto">
                {d.producto?.imagen
                  ? <img src={d.producto.imagen} alt={d.producto.nombre_producto} className="mp-modal-producto-img" />
                  : <div className="mp-modal-producto-placeholder"><FiPackage size={18} color="#94a3b8" /></div>
                }
                <div className="mp-modal-producto-info">
                  <p>{d.producto?.nombre_producto}</p>
                  <span>Cantidad: {d.cantidad}</span>
                  <span>{formatPrecio(d.precio_unit)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Método de pago */}
          {pedido.metodo_pago && (
            <div className="mp-modal-seccion">
              <h4>Método de pago</h4>
              <div className="mp-modal-info-row">
                <FiDollarSign size={14} color="#64748b" />
                <span style={{ textTransform: 'capitalize' }}>{pedido.metodo_pago}</span>
              </div>
            </div>
          )}

          {/* Nota */}
          {pedido.nota && (
            <div className="mp-modal-seccion">
              <h4>Nota</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{pedido.nota}</p>
            </div>
          )}

          {/* Número seguimiento */}
          <div className="mp-modal-seccion">
            <h4>Número de seguimiento</h4>
            <span className="mp-seguimiento-num">
              EVA{String(pedido.id_pedido).padStart(9, "0")}
            </span>
          </div>

          {/* Total */}
          <div className="mp-modal-total">
            <span>Total</span>
            <span>{formatPrecio(pedido.total)}</span>
          </div>

          {/* Reseña si está entregado */}
          {pedido.estado === "entregado" && (
            <button className="mp-btn-resena-modal" onClick={() => { onClose(); onResena(pedido) }}>
              <FiStar size={14} /> Dejar reseña
            </button>
          )}

          {/* Descargar factura */}
          <button className="mp-btn-factura">
            <FiDownload size={16} /> Descargar factura
          </button>

        </div>
      </div>
    </div>
  )
}

export default function MisPedidos() {
  const navigate  = useNavigate()
  const { token } = useAuth()

  const [pedidos, setPedidos]           = useState([])
  const [cargando, setCargando]         = useState(true)
  const [filtro, setFiltro]             = useState("todos")
  const [modalDetalle, setModalDetalle] = useState(null)
  const [modalResena, setModalResena]   = useState(null)
  const [toast, setToast]               = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/cliente/pedidos", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPedidos(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const mostrarToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const TABS = [
    { key: "todos",     label: "Todos"      },
    { key: "activos",   label: "Activos"    },
    { key: "entregado", label: "Entregados" },
  ]

  const filtrados = pedidos.filter(p => {
    if (filtro === "todos")     return true
    if (filtro === "activos")   return p.estado === "en_proceso" || p.estado === "enviado"
    if (filtro === "entregado") return p.estado === "entregado"
    return true
  })

  const gastoTotal = pedidos.reduce((acc, p) => acc + Number(p.total), 0)
  const activos    = pedidos.filter(p => p.estado === "en_proceso" || p.estado === "enviado").length
  const entregados = pedidos.filter(p => p.estado === "entregado").length

  if (cargando) return <div className="mp-loading">Cargando pedidos...</div>

  return (
    <div className="mp-page">

      {/* Header */}
      <div className="mp-page-header">
        <h1 className="mp-page-title">
          <FiPackage size={22} /> Mis Pedidos
        </h1>
        <p className="mp-page-subtitle">Gestiona y revisa el estado de tus pedidos</p>
      </div>

      {/* Métricas */}
      <div className="mp-metricas">
        <div className="mp-metrica">
          <div className="mp-metrica-left">
            <h3>Total de pedidos</h3>
            <span>{pedidos.length}</span>
          </div>
          <div className="mp-metrica-icono-right total">
            <FiPackage size={18} />
          </div>
        </div>
        <div className="mp-metrica">
          <div className="mp-metrica-left">
            <h3>Activos</h3>
            <span style={{ color: '#3b82f6' }}>{activos}</span>
          </div>
          <div className="mp-metrica-icono-right activos">
            <FiClock size={18} />
          </div>
        </div>
        <div className="mp-metrica">
          <div className="mp-metrica-left">
            <h3>Entregados</h3>
            <span style={{ color: '#16a34a' }}>{entregados}</span>
          </div>
          <div className="mp-metrica-icono-right entregados">
            <FiCheckCircle size={18} />
          </div>
        </div>
        <div className="mp-metrica">
          <div className="mp-metrica-left">
            <h3>Gasto total</h3>
            <span className="gasto">{formatPrecio(gastoTotal)}</span>
          </div>
          <div className="mp-metrica-icono-right gasto">
            <FiPackage size={18} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mp-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`mp-tab ${filtro === t.key ? "active" : ""}`}
            onClick={() => setFiltro(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="mp-empty">
          <FiPackage size={48} color="#cbd5e1" />
          <p>No tienes pedidos aún</p>
          <button onClick={() => navigate("/")}>Explorar productos</button>
        </div>
      ) : (
        <div className="mp-lista">
          {filtrados.map(pedido => {
            const primera = pedido.detalles?.[0]?.producto
            return (
              <div key={pedido.id_pedido} className="mp-card-nuevo">

                {/* Thumbnail */}
                <div className="mp-card-thumb">
                  {primera?.imagen
                    ? <img src={primera.imagen} alt={primera.nombre_producto} />
                    : <FiPackage size={20} color="#94a3b8" />
                  }
                </div>

                {/* Info */}
                <div className="mp-card-info">
                  <p className="mp-card-id">{formatId(pedido.id_pedido)}</p>
                  <div className="mp-card-meta">
                    <FiCalendar size={11} />
                    <span>{formatFecha(pedido.fecha)}</span>
                  </div>
                  <p className="mp-card-articulos">
                    {pedido.detalles.length} {pedido.detalles.length === 1 ? "artículo" : "artículos"}
                  </p>
                </div>

                {/* Derecha */}
                <div className="mp-card-right">
                  <span className={`mp-badge ${pedido.estado}`}>
                    {pedido.estado === "en_proceso" ? <><FiClock size={11} /> En proceso</> :
                     pedido.estado === "enviado"    ? <><FiTruck size={11} /> Enviado</> :
                     pedido.estado === "entregado"  ? <><FiCheckCircle size={11} /> Entregado</> :
                                                      "Cancelado"}
                  </span>
                  <div className="mp-card-total-wrap">
                    <span className="mp-card-total-label">Total</span>
                    <span className="mp-card-total-valor">{formatPrecio(pedido.total)}</span>
                  </div>
                  <button className="mp-btn-detalle" onClick={() => setModalDetalle(pedido)}>
                    <FiEye size={14} /> Ver detalles
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Modal detalle */}
      {modalDetalle && (
        <ModalDetalle
          pedido={modalDetalle}
          onClose={() => setModalDetalle(null)}
          onResena={(p) => setModalResena(p)}
        />
      )}

      {/* Modal reseña */}
      {modalResena && (
        <ModalComentario
          pedido={modalResena}
          token={token}
          onClose={() => setModalResena(null)}
          onEnviado={() => mostrarToast("✅ Reseña enviada correctamente")}
        />
      )}

      {toast && <div className="mp-toast">{toast}</div>}

    </div>
  )
}
