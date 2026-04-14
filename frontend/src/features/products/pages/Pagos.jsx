import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import {
  FiCheck, FiX, FiEye, FiClock,
  FiDollarSign, FiPackage, FiUser
} from "react-icons/fi"
import { MdOutlineQrCode2 } from "react-icons/md"

const BASE = "http://localhost:3000"

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO")
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  })
}

const ESTADO_BADGE = {
  pendiente:  { bg: '#fffbeb', color: '#f59e0b', border: '#fde68a', label: 'Pendiente' },
  verificado: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Verificado' },
  rechazado:  { bg: '#fef2f2', color: '#ef4444', border: '#fecaca', label: 'Rechazado' },
}

function Badge({ estado }) {
  const s = ESTADO_BADGE[estado] || ESTADO_BADGE.pendiente
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
      padding: '0.25rem 0.75rem', display: 'inline-block'
    }}>
      {s.label}
    </span>
  )
}

export default function Pagos() {
  const { token } = useAuth()
  const [pagos, setPagos]           = useState([])
  const [cargando, setCargando]     = useState(true)
  const [modalPago, setModalPago]   = useState(null)
  const [notaRechazo, setNotaRechazo] = useState("")
  const [procesando, setProcesando] = useState(false)
  const [toast, setToast]           = useState(null)
  const [filtro, setFiltro]         = useState("todos")

  const headers = { Authorization: `Bearer ${token}` }

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await axios.get(`${BASE}/api/pagos/emprendedora`, { headers })
      setPagos(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleVerificar = async (id_pago, estado) => {
    if (estado === "rechazado" && !notaRechazo.trim()) {
      mostrarToast("Escribe el motivo del rechazo", "error")
      return
    }
    setProcesando(true)
    try {
      await axios.put(
        `${BASE}/api/pagos/${id_pago}/verificar`,
        { estado, nota_rechazo: notaRechazo || null },
        { headers }
      )
      mostrarToast(estado === "verificado" ? "Pago verificado correctamente" : "Pago rechazado")
      setModalPago(null)
      setNotaRechazo("")
      cargar()
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al procesar", "error")
    } finally {
      setProcesando(false)
    }
  }

  const pagosFiltrados = pagos.filter(p =>
    filtro === "todos" ? true : p.estado === filtro
  )

  const metricas = {
    total:      pagos.length,
    pendientes: pagos.filter(p => p.estado === "pendiente").length,
    verificados: pagos.filter(p => p.estado === "verificado").length,
    rechazados: pagos.filter(p => p.estado === "rechazado").length,
  }

  if (cargando) return <div style={{ padding: '2rem', color: '#64748b' }}>Cargando pagos...</div>

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
          background: toast.tipo === "error" ? '#ef4444' : '#16a34a',
          color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '0.5rem',
          fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
          Comprobantes de Pago
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Verifica los comprobantes enviados por tus clientes
        </p>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', valor: metricas.total, color: '#1e293b', bg: '#f8fafc', Icon: FiDollarSign },
          { label: 'Pendientes', valor: metricas.pendientes, color: '#f59e0b', bg: '#fffbeb', Icon: FiClock },
          { label: 'Verificados', valor: metricas.verificados, color: '#16a34a', bg: '#f0fdf4', Icon: FiCheck },
          { label: 'Rechazados', valor: metricas.rechazados, color: '#ef4444', bg: '#fef2f2', Icon: FiX },
        ].map(m => (
          <div key={m.label} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem',
            padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div>
              <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{m.label}</p>
              <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>{m.valor}</strong>
            </div>
            <div style={{ width: '2.4rem', height: '2.4rem', borderRadius: '0.5rem', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.Icon size={16} color={m.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['todos', 'pendiente', 'verificado', 'rechazado'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '999px', border: '1.5px solid',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
              borderColor: filtro === f ? '#1e293b' : '#e5e7eb',
              background: filtro === f ? '#1e293b' : '#fff',
              color: filtro === f ? '#fff' : '#64748b',
            }}>
            {f === 'todos' ? 'Todos' : ESTADO_BADGE[f]?.label}
            {f !== 'todos' && (
              <span style={{ marginLeft: '0.4rem', fontSize: '0.72rem' }}>
                ({pagos.filter(p => p.estado === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista pagos */}
      {pagosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <FiDollarSign size={40} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No hay comprobantes con este filtro</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {pagosFiltrados.map(pago => (
            <div key={pago.id_pago} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '0.85rem', padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
            }}>
              {/* Info pedido */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <FiPackage size={14} color="#64748b" />
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                    Pedido #{pago.pedido?.id_pedido}
                  </span>
                  <Badge estado={pago.estado} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <FiUser size={12} color="#94a3b8" />
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {pago.pedido?.cliente?.nombre} — {pago.pedido?.cliente?.email}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MdOutlineQrCode2 size={12} color="#94a3b8" />
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {pago.metodo?.toUpperCase()} · {formatFecha(pago.fecha)}
                  </span>
                </div>
                {/* Productos */}
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                  {pago.pedido?.detalles?.map(d => (
                    <span key={d.id_detalle} style={{ marginRight: '0.5rem' }}>
                      {d.producto?.nombre_producto}
                    </span>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>
                  {formatPrecio(pago.pedido?.total)}
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>Total pedido</p>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => { setModalPago(pago); setNotaRechazo("") }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.5rem 1rem', borderRadius: '0.5rem',
                    border: '1.5px solid #e5e7eb', background: '#fff',
                    color: '#374151', fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.18s'
                  }}>
                  <FiEye size={13} /> Ver comprobante
                </button>

                {pago.estado === 'pendiente' && (
                  <>
                    <button onClick={() => handleVerificar(pago.id_pago, 'verificado')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        border: 'none', background: '#16a34a', color: '#fff',
                        fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                      }}>
                      <FiCheck size={13} /> Verificar
                    </button>
                    <button onClick={() => { setModalPago(pago); setNotaRechazo("") }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        border: 'none', background: '#ef4444', color: '#fff',
                        fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                      }}>
                      <FiX size={13} /> Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal comprobante */}
      {modalPago && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(3px)', padding: '1rem'
        }} onClick={() => setModalPago(null)}>
          <div style={{
            background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>
                Comprobante — Pedido #{modalPago.pedido?.id_pedido}
              </h3>
              <button onClick={() => setModalPago(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                <FiX size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* Comprobante imagen */}
              {modalPago.comprobante ? (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <img src={modalPago.comprobante} alt="Comprobante"
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '0.65rem', border: '1px solid #e5e7eb' }} />
                  <a href={modalPago.comprobante} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.78rem', color: '#3b82f6' }}>
                    Ver imagen completa →
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '0.65rem', marginBottom: '1rem', color: '#94a3b8' }}>
                  <FiEye size={28} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Sin comprobante adjunto aún</p>
                </div>
              )}

              {/* Info */}
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Cliente</span><strong style={{ color: '#1e293b' }}>{modalPago.pedido?.cliente?.nombre}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Total</span><strong style={{ color: '#1e293b' }}>{formatPrecio(modalPago.pedido?.total)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                  <span>Estado</span><Badge estado={modalPago.estado} />
                </div>
              </div>

              {/* Rechazo */}
              {modalPago.estado === 'pendiente' && (
                <>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                      Motivo de rechazo (si aplica)
                    </label>
                    <textarea value={notaRechazo} onChange={e => setNotaRechazo(e.target.value)}
                      placeholder="Ej: El comprobante no coincide con el monto..."
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #e5e7eb', fontSize: '0.85rem', resize: 'vertical', minHeight: '70px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => handleVerificar(modalPago.id_pago, 'rechazado')} disabled={procesando}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <FiX size={14} /> Rechazar
                    </button>
                    <button onClick={() => handleVerificar(modalPago.id_pago, 'verificado')} disabled={procesando}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <FiCheck size={14} /> {procesando ? "Procesando..." : "Verificar pago"}
                    </button>
                  </div>
                </>
              )}

              {modalPago.estado === 'rechazado' && modalPago.nota_rechazo && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca', fontSize: '0.82rem', color: '#991b1b' }}>
                  <strong>Motivo:</strong> {modalPago.nota_rechazo}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}