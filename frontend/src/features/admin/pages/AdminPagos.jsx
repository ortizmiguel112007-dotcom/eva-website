
import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import {
  FiDollarSign,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi"

import { MetricasPagos } from "@/features/products/components/pagos/MetricasPagos"
import { FiltroPagos } from "@/features/products/components/pagos/FiltroPagos"
import { PagoCard } from "@/features/products/components/pagos/PagoCard"
import { ModalComprobante } from "@/features/products/components/pagos/ModalComprobante"

import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

const formatearFecha = (fecha) => {
  if (!fecha) return "Fecha no disponible"

  return new Date(fecha).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const nombreEvento = (evento) => {
  const eventos = {
    error_monto_invalido: "Monto inválido",
    error_creacion: "Error al crear el pago",
    error_subida: "Error al subir comprobante",
    error_verificacion: "Error de verificación",
    rechazado: "Pago rechazado",
  }

  return eventos[evento] || evento?.replaceAll("_", " ") || "Error"
}

export default function AdminPagos() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalPago, setModalPago] = useState(null)
  const [notaRechazo, setNotaRechazo] = useState("")
  const [procesando, setProcesando] = useState(false)
  const [toast, setToast] = useState(null)
  const [filtro, setFiltro] = useState("todos")

  // Estados para la auditoría de errores de pago
  const [erroresPagos, setErroresPagos] = useState([])
  const [cargandoErrores, setCargandoErrores] = useState(true)
  const [errorAuditoria, setErrorAuditoria] = useState("")

  const cargar = async () => {
    setCargando(true)

    try {
      const res = await axios.get(`${BASE}/api/admin/pagos`, { headers })
      setPagos(res.data)
    } catch (err) {
      console.error("Error al cargar pagos:", err)
    } finally {
      setCargando(false)
    }
  }

  // Consultar los errores e intentos fallidos registrados
  const cargarErrores = async () => {
    setCargandoErrores(true)
    setErrorAuditoria("")

    try {
      const res = await axios.get(
        `${BASE}/api/admin/pagos/errores`,
        { headers }
      )

      setErroresPagos(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error("Error al cargar auditoría de pagos:", err)

      setErrorAuditoria(
        err.response?.data?.error ||
        "No fue posible cargar los errores de pago."
      )
    } finally {
      setCargandoErrores(false)
    }
  }

  useEffect(() => {
    cargar()
    cargarErrores()
  }, [])

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

      mostrarToast(
        estado === "aprobado"
          ? "Pago aprobado correctamente"
          : "Pago rechazado"
      )

      setModalPago(null)
      setNotaRechazo("")
      cargar()
      cargarErrores()
    } catch (err) {
      mostrarToast(
        err.response?.data?.error || "Error al procesar",
        "error"
      )
    } finally {
      setProcesando(false)
    }
  }

  const pagosFiltrados = pagos.filter(
    (p) => filtro === "todos" || p.estado === filtro
  )

  if (cargando) {
    return <div className="pagos-loading">Cargando pagos...</div>
  }

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Gestión de pagos</h1>
        <p>
          Supervisa y verifica todos los pagos de la plataforma (RF-073)
        </p>
      </div>

      <MetricasPagos pagos={pagos} />

      <FiltroPagos
        pagos={pagos}
        filtro={filtro}
        setFiltro={setFiltro}
      />

      {pagosFiltrados.length === 0 ? (
        <div className="pagos-empty">
          <FiDollarSign size={40} color="#cbd5e1" />
          <p>No hay pagos con este filtro</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {pagosFiltrados.map((pago) => (
            <PagoCard
              key={pago.id_pago}
              pago={pago}
              onVerDetalle={(p) => {
                setModalPago(p)
                setNotaRechazo("")
              }}
              onVerificar={handleVerificar}
            />
          ))}
        </div>
      )}

      {/* Auditoría de errores e intentos fallidos */}
      <section className="pagos-errores">
        <div className="pagos-errores-header">
          <div className="pagos-errores-titulo">
            <div className="pagos-errores-icono">
              <FiAlertTriangle size={21} />
            </div>

            <div>
              <h2>Errores e intentos de pago fallidos</h2>
              <p>
                Registro de errores para auditoría (RN-057)
              </p>
            </div>
          </div>

          <button
            type="button"
            className="pagos-errores-refresh"
            onClick={cargarErrores}
            disabled={cargandoErrores}
          >
            <FiRefreshCw
              className={cargandoErrores ? "girando" : ""}
              size={16}
            />
            Actualizar
          </button>
        </div>

        {cargandoErrores ? (
          <div className="pagos-errores-mensaje">
            Cargando registros de errores...
          </div>
        ) : errorAuditoria ? (
          <div className="pagos-errores-error">
            <FiAlertTriangle size={20} />
            <span>{errorAuditoria}</span>
          </div>
        ) : erroresPagos.length === 0 ? (
          <div className="pagos-errores-vacio">
            <FiAlertTriangle size={30} />
            <p>No hay errores ni intentos fallidos registrados.</p>
          </div>
        ) : (
          <div className="pagos-errores-lista">
            {erroresPagos.map((registro) => (
              <article
                className="pagos-error-card"
                key={registro.id_log}
              >
                <div className="pagos-error-card-top">
                  <span className="pagos-error-tipo">
                    <FiAlertTriangle size={15} />
                    {nombreEvento(registro.evento)}
                  </span>

                  <span className="pagos-error-fecha">
                    {formatearFecha(registro.fecha)}
                  </span>
                </div>

                <p className="pagos-error-detalle">
                  {registro.detalle || "Sin descripción del error."}
                </p>

                <div className="pagos-error-datos">
                  <span>
                    <strong>Usuario:</strong>{" "}
                    {registro.usuario?.nombre ||
                      registro.usuario?.email ||
                      "No disponible"}
                  </span>

                  <span>
                    <strong>ID de pago:</strong>{" "}
                    {registro.pago?.id_pago ?? "No generado"}
                  </span>

                  {registro.pago?.monto_total != null && (
                    <span>
                      <strong>Monto:</strong>{" "}
                      {Number(registro.pago.monto_total).toLocaleString(
                        "es-CO",
                        {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }
                      )}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ModalComprobante
        pago={modalPago}
        notaRechazo={notaRechazo}
        setNotaRechazo={setNotaRechazo}
        procesando={procesando}
        onVerificar={handleVerificar}
        onCerrar={() => setModalPago(null)}
      />

      {toast && (
        <div className={`pagos-toast ${toast.tipo}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
