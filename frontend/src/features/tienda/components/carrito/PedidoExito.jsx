import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineQrCode2 } from "react-icons/md";
import { FiTruck, FiSmartphone, FiCreditCard } from "react-icons/fi";
import axios from "axios";
import { SubirComprobante } from "./SubirComprobante";
import { formatPrecio } from "@/features/tienda/utils/utils";
import "@/infrastructure/css/tienda/carrito/PedidoExito.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
// Datos de la cuenta de EVA (única, no por emprendedora)
function useMetodosPagoEva(token) {
  const [metodos, setMetodos] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/metodos-pago/eva`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMetodos(res.data))
      .catch(() => setMetodos(null));
  }, [token]);

  return metodos;
}

function InstruccionesPago({ metodoPago, metodos, monto }) {
  if (metodoPago === "contraentrega") {
    return (
      <div className="pe-instrucciones pe-instrucciones--contraentrega">
        <div className="pe-instrucciones-icono">
          <FiTruck size={24} />
        </div>
        <h4>Pago contra entrega</h4>
        <p>
          Pagarás <strong>{formatPrecio(monto)}</strong> al recibir tu pedido.
        </p>
        <p className="pe-instrucciones-nota">
          No necesitas subir ningún comprobante.
        </p>
      </div>
    );
  }

  if (metodoPago === "nequi") {
    return (
      <div className="pe-instrucciones pe-instrucciones--nequi">
        <div className="pe-instrucciones-icono">
          <FiSmartphone size={24} />
        </div>
        <h4>Pago por Nequi</h4>
        {metodos?.nequi_numero ? (
          <>
            <p>
              Transfiere <strong>{formatPrecio(monto)}</strong> al siguiente
              número:
            </p>
            <div className="pe-dato-pago">
              <span className="pe-dato-label">Número Nequi</span>
              <span className="pe-dato-valor">{metodos.nequi_numero}</span>
            </div>
            {metodos.titular_cuenta && (
              <div className="pe-dato-pago">
                <span className="pe-dato-label">Titular</span>
                <span className="pe-dato-valor">{metodos.titular_cuenta}</span>
              </div>
            )}
          </>
        ) : (
          <p>
            Estamos actualizando nuestros datos de pago. Contáctanos
            directamente.
          </p>
        )}
        <p className="pe-instrucciones-nota">
          Sube el comprobante de pago para confirmar tu compra.
        </p>
      </div>
    );
  }

  if (metodoPago === "bancolombia") {
    return (
      <div className="pe-instrucciones pe-instrucciones--bancolombia">
        <div className="pe-instrucciones-icono">
          <FiCreditCard size={24} />
        </div>
        <h4>Transferencia Bancolombia</h4>
        {metodos?.bancolombia_numero ? (
          <>
            <p>
              Transfiere <strong>{formatPrecio(monto)}</strong> a la siguiente
              cuenta:
            </p>
            <div className="pe-dato-pago">
              <span className="pe-dato-label">Número de cuenta</span>
              <span className="pe-dato-valor">
                {metodos.bancolombia_numero}
              </span>
            </div>
            {metodos.bancolombia_tipo && (
              <div className="pe-dato-pago">
                <span className="pe-dato-label">Tipo</span>
                <span
                  className="pe-dato-valor"
                  style={{ textTransform: "capitalize" }}
                >
                  {metodos.bancolombia_tipo}
                </span>
              </div>
            )}
            {metodos.titular_cuenta && (
              <div className="pe-dato-pago">
                <span className="pe-dato-label">Titular</span>
                <span className="pe-dato-valor">{metodos.titular_cuenta}</span>
              </div>
            )}
          </>
        ) : (
          <p>
            Estamos actualizando nuestros datos de pago. Contáctanos
            directamente.
          </p>
        )}
        <p className="pe-instrucciones-nota">
          Sube el comprobante de pago para confirmar tu compra.
        </p>
      </div>
    );
  }

  return null;
}

function PedidoCard({ pedido }) {
  const emprendedora = pedido.seccion?.emprendedora?.usuario?.nombre || "EVA";

  const ESTADOS_LABEL = {
    pendiente_pago: { label: "Pendiente de pago", clase: "pendiente" },
    pago_enviado: { label: "Comprobante enviado", clase: "enviado" },
    pago_rechazado: { label: "Pago rechazado", clase: "rechazado" },
    en_proceso: { label: "En proceso", clase: "proceso" },
  };
  const info = ESTADOS_LABEL[pedido.estado] || {
    label: pedido.estado,
    clase: "pendiente",
  };

  return (
    <div className="pedido-exito-card">
      <div className="pedido-exito-card-header">
        <div>
          <p className="pedido-exito-id">Pedido #{pedido.id_pedido}</p>
          <p className="pedido-exito-tienda">
            Tienda de <strong>{emprendedora}</strong>
          </p>
        </div>
        <span
          className={`pedido-exito-estado pe-estado--${pedido.estado === "en_proceso" ? "proceso" : "pendiente"}`}
        >
          {pedido.estado === "en_proceso" ? "En proceso" : "Pendiente de pago"}
        </span>
      </div>

      <div className="pedido-exito-detalles">
        {pedido.detalles?.map((d) => (
          <div key={d.id_detalle} className="pedido-exito-detalle-row">
            <span>
              {d.producto?.nombre_producto} x{d.cantidad}
            </span>
            <span>{formatPrecio(Number(d.precio_unit) * d.cantidad)}</span>
          </div>
        ))}
        <div className="pedido-exito-total-row">
          <span>Total</span>
          <span>{formatPrecio(pedido.total)}</span>
        </div>
      </div>
    </div>
  );
}

export function PedidoExito({ pedidos: pedidosIniciales, pago, token }) {
  const navigate = useNavigate();
  const metodosEva = useMetodosPagoEva(token);
  const [pagoActual, setPagoActual] = useState(pago);
  const [pedidos, setPedidos] = useState(pedidosIniciales);

  const necesitaComprobante =
    pagoActual?.metodo !== "contraentrega" && pagoActual?.estado !== "aprobado";

  const handleEnviado = (pagoActualizado) => {
    setPagoActual(pagoActualizado);
    setPedidos((prev) => prev.map((p) => ({ ...p, estado: "pago_enviado" })));
  };

  return (
    <div className="carrito-page">
      <div className="carrito-wrapper">
        <div className="pedido-exito">
          <div className="pedido-exito-icono" />
          <h2>
            ¡
            {pedidos.length > 1
              ? `${pedidos.length} Pedidos confirmados`
              : "Pedido confirmado"}
            !
          </h2>
          <p className="pedido-exito-sub">
            {pagoActual?.metodo === "contraentrega"
              ? "Tu pedido está en proceso. Pagarás al recibirlo."
              : "Realiza tu transferencia y sube el comprobante para confirmar."}
          </p>

          {/* Instrucciones y comprobante: UNA sola vez para toda la compra */}
          <InstruccionesPago
            metodoPago={pagoActual?.metodo}
            metodos={metodosEva}
            monto={pagoActual?.monto_total}
          />
          {necesitaComprobante && (
            <SubirComprobante
              pedidos={pedidos}
              metodoPago={pagoActual?.metodo}
              token={token}
              onEnviado={handleEnviado}
            />
          )}
          <div className="pedido-exito-lista">
            {pedidos.map((pedido) => (
              <PedidoCard key={pedido.id_pedido} pedido={pedido} />
            ))}
          </div>

          <div className="pedido-exito-acciones">
            <button
              className="btn-hero-secondary"
              onClick={() => navigate("/productos")}
            >
              Seguir comprando
            </button>
            <button
              className="btn-hero-primary"
              onClick={() => navigate("/mis-pedidos")}
            >
              Ver mis pedidos →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
