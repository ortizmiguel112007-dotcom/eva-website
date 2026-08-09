import { FiSmartphone, FiCreditCard, FiTruck, FiZap, FiShield } from "react-icons/fi"
import { MetodoCard } from "../components/metodos/MetodoCard"
import "@/infrastructure/css/usuario/metodospago/MetodosPago.css"

const METODOS = [
  {
    id:          "nequi",
    Icon:        FiSmartphone,
    titulo:      "Nequi",
    descripcion: "Transfiere desde tu app Nequi al número de la emprendedora y sube el comprobante.",
    disponible:  true,
    tag:         "Recomendado",
    pasos:       ["Confirma tu pedido", "Transfiere por Nequi", "Sube el comprobante"],
    acento:      "#7c3aed",
    acentoClaro: "#f5f3ff",
  },
  {
    id:          "bancolombia",
    Icon:        FiCreditCard,
    titulo:      "Bancolombia",
    descripcion: "Transfiere al número de cuenta de la emprendedora y sube tu comprobante para verificación.",
    disponible:  true,
    tag:         "Disponible",
    pasos:       ["Obtén los datos bancarios", "Realiza la transferencia", "Sube el comprobante"],
    acento:      "#2563eb",
    acentoClaro: "#eff6ff",
  },
  {
    id:          "contraentrega",
    Icon:        FiTruck,
    titulo:      "Contra entrega",
    descripcion: "Paga en efectivo cuando recibas tu pedido. Sin necesidad de transferencias ni comprobantes.",
    disponible:  true,
    tag:         "Sin comprobante",
    pasos:       ["Confirma tu pedido", "Recibe tu pedido", "Paga al recibirlo"],
    acento:      "#16a34a",
    acentoClaro: "#f0fdf4",
  },
]

export default function MetodosPago() {
  return (
    <div className="mp-page">
      <div className="mp-hero">
        <div className="mp-hero-badge">
          <FiZap size={12} /> Pagos seguros
        </div>
        <h1 className="mp-hero-titulo">Métodos de Pago</h1>
        <p className="mp-hero-sub">Elige cómo quieres pagar en EVA. Simple, seguro y sin complicaciones.</p>
      </div>

      <div className="mp-grid">
        {METODOS.map(m => <MetodoCard key={m.id} metodo={m} />)}
      </div>

      <div className="mp-info">
        <div className="mp-info-icono"><FiShield size={20} color="#6366f1" /></div>
        <div>
          <p className="mp-info-titulo">Tus pagos están protegidos</p>
          <p className="mp-info-desc">
            Cada comprobante es verificado por la emprendedora antes de procesar tu pedido.
            Si hay algún problema, puedes contactarnos.
          </p>
        </div>
      </div>
    </div>
  )
}