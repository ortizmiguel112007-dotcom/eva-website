import { MdOutlineQrCode2 } from "react-icons/md"
import { FiArrowRight, FiZap, FiShield } from "react-icons/fi"
import "@/infrastructure/css/MetodosPago.css"

const metodos = [
  {
    id: "qr",
    Icon: MdOutlineQrCode2,
    titulo: "Pago QR",
    descripcion: "Escanea el código QR generado para cada pedido directamente desde tu app bancaria. Rápido, seguro y sin contacto.",
    disponible: true,
    tag: "Recomendado",
    pasos: ["Confirma tu pedido", "Escanea el QR único", "Sube el comprobante"],
    acento: "#6366f1",
    acentoClaro: "#eef2ff",
  },
  {
    id: "transferencia",
    Icon: FiShield,
    titulo: "Transferencia Bancaria",
    descripcion: "Transfiere al número de cuenta de la emprendedora y sube tu comprobante para que lo verifique.",
    disponible: true,
    tag: "Disponible",
    pasos: ["Obtén los datos bancarios", "Realiza la transferencia", "Sube el comprobante"],
    acento: "#10b981",
    acentoClaro: "#ecfdf5",
  },
]

export default function MetodosPago() {
  return (
    <div className="mp-page">

      {/* Hero */}
      <div className="mp-hero">
        <div className="mp-hero-badge">
          <FiZap size={12} /> Pagos seguros
        </div>
        <h1 className="mp-hero-titulo">Métodos de Pago</h1>
        <p className="mp-hero-sub">Elige cómo quieres pagar en EVA. Simple, seguro y sin complicaciones.</p>
      </div>

      {/* Cards */}
      <div className="mp-grid">
        {metodos.map(m => (
          <div key={m.id} className="mp-card" style={{ "--acento": m.acento, "--acento-claro": m.acentoClaro }}>

            {/* Top bar decorativa */}
            <div className="mp-card-bar" />

            <div className="mp-card-inner">
              {/* Header */}
              <div className="mp-card-header">
                <div className="mp-card-icono">
                  <m.Icon size={28} color={m.acento} />
                </div>
                <span className="mp-card-tag" style={{ background: m.acentoClaro, color: m.acento }}>
                  {m.tag}
                </span>
              </div>

              <h2 className="mp-card-titulo">{m.titulo}</h2>
              <p className="mp-card-desc">{m.descripcion}</p>

              {/* Pasos */}
              <div className="mp-pasos">
                {m.pasos.map((paso, i) => (
                  <div key={i} className="mp-paso">
                    <span className="mp-paso-num" style={{ background: m.acento }}>{i + 1}</span>
                    <span className="mp-paso-texto">{paso}</span>
                    {i < m.pasos.length - 1 && <FiArrowRight size={12} className="mp-paso-arrow" />}
                  </div>
                ))}
              </div>

              {/* Estado */}
              <div className="mp-card-footer">
                <div className="mp-disponible" style={{ color: m.acento }}>
                  <span className="mp-dot" style={{ background: m.acento }} />
                  Disponible ahora
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="mp-info">
        <div className="mp-info-icono"><FiShield size={20} color="#6366f1" /></div>
        <div>
          <p className="mp-info-titulo">Tus pagos están protegidos</p>
          <p className="mp-info-desc">Cada comprobante es verificado por la emprendedora antes de procesar tu pedido. Si hay algún problema, puedes contactarnos.</p>
        </div>
      </div>

    </div>
  )
}