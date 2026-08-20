import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "@/core/context/CarritoContext";
import { useAuth } from "@/core/context/AuthConten";
import axios from "axios";
import { FiShoppingCart, FiPackage } from "react-icons/fi";

import { formatPrecio } from "@/features/tienda/utils/utils";
import { PedidoExito } from "../components/carrito/PedidoExito";
import { CarritoGrupo } from "../components/carrito/CarritoGrupo";
import { ResumenPedido } from "../components/carrito/ResumenPedido";
import { useMetodosDisponibles } from "@/features/tienda/hooks/useMetodosDisponibles";
import "@/infrastructure/css/tienda/carrito/Carrito.css";

export default function Carrito() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const {
    items,
    quitar,
    cambiarCantidad,
    vaciar,
    total,
    totalItems,
    cargarCarrito,
    cupon,      
   setCupon,
  } = useCarrito();

  const [nota, setNota] = useState("");
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponError, setCuponError] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [pedidosExito, setPedidosExito] = useState(null);
  const [pagoExito, setPagoExito] = useState(null);
  const [toast, setToast] = useState(null);
  const [metodoPago, setMetodoPago] = useState("");

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 🆕 agrupado por id_seccion (no por nombre) — así coincide 1:1 con
  // secciones_aplicables que devuelve el backend y con cómo pedido.controller
  // parte el carrito en pedidos separados
  const gruposEmprendedora = useMemo(() => {
    const grupos = {};
    items.forEach((item) => {
      const key = item.id_seccion ?? item.emprendedora ?? "EVA";
      if (!grupos[key])
        grupos[key] = {
          nombre: item.emprendedora || "EVA",
          id_seccion: item.id_seccion,
          id_emprendedora: item.id_emprendedora,
          items: [],
          subtotal: 0,
        };
      grupos[key].items.push(item);
      grupos[key].subtotal += Number(item.precio) * item.cantidad;
    });
    return Object.values(grupos);
  }, [items]);

  const { metodosDisponibles, cargando: cargandoMetodos } =
    useMetodosDisponibles(token);

  // 🆕 valida contra secciones_aplicables antes de aceptar el cupón
  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setCuponError("");
    setCupon(null);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cupones/validar",
        { codigo: codigoCupon },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data;

      const idsSeccionCarrito = gruposEmprendedora.map((g) => g.id_seccion);
      const aplica = data.secciones_aplicables?.some((id) =>
        idsSeccionCarrito.includes(id),
      );

      if (!aplica) {
        setCuponError("Este cupón no aplica a los productos de tu carrito");
        return;
      }

      setCupon(data);
    } catch (err) {
      setCuponError(err.response?.data?.error || "Cupón inválido");
    }
  };

  const handleConfirmar = async () => {
    if (!token) {
      navigate("/login", { state: { from: "/carrito" } });
      return;
    }
    if (!metodoPago) {
      mostrarToast("Selecciona un método de pago");
      return;
    }
    if (items.length === 0) return;

    setConfirmando(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cliente/pedidos",
        {
          items: items.map((i) => ({
            id_producto: i.id_producto,
            cantidad: i.cantidad,
          })),
          metodo_pago: metodoPago,
          nota,
          id_cupon: cupon?.id_cupon || null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await vaciar();
      await cargarCarrito();
      setPagoExito(res.data.pago);
      setPedidosExito(res.data.pedidos);
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al confirmar pedido");
    } finally {
      setConfirmando(false);
    }
  };

  if (pedidosExito)
    return (
      <PedidoExito
        pedidos={pedidosExito}
        pago={pagoExito}
        token={token}
        metodoPago={metodoPago}
      />
    );

  return (
    <div className="carrito-page">
      <div className="carrito-wrapper">
        <h1 className="carrito-titulo">Mi Carrito</h1>
        <p className="carrito-subtitulo">
          {totalItems > 0
            ? `${totalItems} producto${totalItems !== 1 ? "s" : ""} seleccionado${totalItems !== 1 ? "s" : ""}`
            : "Tu carrito está vacío"}
        </p>

        {items.length === 0 ? (
          <div className="carrito-vacio">
            <FiShoppingCart size={48} color="#cbd5e1" />
            <h3>Tu carrito está vacío</h3>
            <p>Explora nuestro catálogo y agrega productos</p>
            <button
              className="btn-hero-primary"
              onClick={() => navigate("/productos")}
            >
              Explorar productos →
            </button>
          </div>
        ) : (
          <div className="carrito-layout">
            <div className="carrito-items">
              {gruposEmprendedora.map((grupo) => (
                <CarritoGrupo
                  key={grupo.id_seccion ?? grupo.nombre}
                  grupo={grupo}
                  onCambiarCantidad={cambiarCantidad}
                  onQuitar={quitar}
                />
              ))}
              {gruposEmprendedora.length > 1 && (
                <div className="carrito-multi-aviso">
                  <FiPackage size={15} />
                  <span>
                    Tienes productos de{" "}
                    <strong>{gruposEmprendedora.length} tiendas</strong>. Se
                    crearán <strong>{gruposEmprendedora.length} pedidos</strong>{" "}
                    separados — uno por tienda.
                  </span>
                </div>
              )}
            </div>

            <ResumenPedido
              gruposEmprendedora={gruposEmprendedora}
              total={total}
              cupon={cupon}
              cuponError={cuponError}
              codigoCupon={codigoCupon}
              setCodigoCupon={setCodigoCupon}
              onAplicarCupon={handleAplicarCupon}
              nota={nota}
              setNota={setNota}
              metodoPago={metodoPago}
              setMetodoPago={setMetodoPago}
              metodosDisponibles={metodosDisponibles}
              cargandoMetodos={cargandoMetodos}
              confirmando={confirmando}
              token={token}
              onConfirmar={handleConfirmar}
              onVaciar={vaciar}
            />
          </div>
        )}
      </div>
      {toast && <div className="carrito-toast">{toast}</div>}
    </div>
  );
}