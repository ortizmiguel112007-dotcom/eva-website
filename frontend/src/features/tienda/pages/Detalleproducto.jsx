import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrito } from "@/core/context/CarritoContext";
import axios from "axios";
import {
  FiMinus,
  FiPlus,
  FiHeart,
  FiPackage,
  FiClock,
  FiTag,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

import { tiendaService } from "../services/tienda.service";
import { formatPrecio } from "@/features/tienda/utils/utils";
import { SeccionComentarios } from "../components/detalle/SeccionComentarios";
import { ProductosRelacionados } from "../components/detalle/ProductosRelacionados";
import { TiendaCard } from "../components/detalle/TiendaCard";
import { StockBadge } from "../components/detalle/StockBadge";
import { RatingEstrellas } from "../components/shared/RatingEstrellas";
import { BtnAgregar } from "../components/shared/BtnAgregar";

import "@/infrastructure/css/tienda/detalle/DetalleProducto.css";

export default function DetalleProducto({ token, rutaCatalogo = "/catalogo" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();

  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [toast, setToast] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [agregado, setAgregado] = useState(false);
  const [pedido, setPedido] = useState(null);

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (token) {
      axios
        .get(`http://localhost:3000/api/favoritos/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setFavorito(res.data.favorito))
        .catch(() => {});
    } else {
      const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
      setFavorito(favs.includes(Number(id)));
    }
  }, [id, token]);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await tiendaService.getProducto(id);
        setProducto(data);
        if (data.categoria) {
          const todos = await tiendaService.getCatalogo({
            categoria: data.categoria?.toLowerCase(),
          });
          setRelacionados(
            todos.filter((p) => p.id_producto !== data.id_producto).slice(0, 4),
          );
        }
        try {
          const coms = await tiendaService.getComentariosProducto(id);
          setComentarios(coms);
        } catch {
          setComentarios([]);
        }

        if (token) {
          try {
            const res = await axios.get(
              "http://localhost:3000/api/cliente/pedidos",
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const encontrado = res.data.find(
              (p) =>
                p.estado === "entregado" &&
                p.detalles?.some((d) => d.producto?.id_producto === Number(id)),
            );
            setPedido(encontrado || null);
          } catch {
            setPedido(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
    window.scrollTo(0, 0);
  }, [id, token]);

  const stock = producto?.inventario?.cantidad ?? 0;
  const agotado = stock === 0;

  const handleAgregar = () => {
    if (!producto) return;
    agregarAlCarrito(
      {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio:          precioFinal,
        imagen: producto.imagen,
        categoria: producto.categoria,
      },
      cantidad,
    );
    setAgregado(true);
    mostrarToast(`${producto.nombre_producto} agregado al carrito`);
    setTimeout(() => setAgregado(false), 2000);
  };

  const handleFavorito = async () => {
    if (token) {
      try {
        const res = await axios.post(
          `http://localhost:3000/api/favoritos/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setFavorito(res.data.favorito);
      } catch {}
    } else {
      const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
      const nuevo = favorito
        ? favs.filter((f) => f !== Number(id))
        : [...favs, Number(id)];
      localStorage.setItem("favoritos", JSON.stringify(nuevo));
      setFavorito(!favorito);
    }
  };

  if (cargando)
    return (
      <div className="dp-loading">
        <div className="dp-spinner" />
        <p>Cargando producto...</p>
      </div>
    );
  if (!producto)
    return (
      <div className="dp-loading">
        <FiPackage size={48} color="#cbd5e1" />
        <p>Producto no encontrado</p>
      </div>
    );

  const promedio = comentarios.length
    ? (
        comentarios.reduce((acc, c) => acc + c.calificacion, 0) /
        comentarios.length
      ).toFixed(1)
    : null;

  const d = producto.descuento;
  const precioFinal = d ? d.precio_con_descuento : Number(producto.precio);
  const porcentaje =
    d?.tipo === "porcentaje"
      ? `-${d.valor}%`
      : d
        ? `-${formatPrecio(d.descuento)}`
        : null;

  return (
    <div className="dp-page">
      {toast && (
        <div className={`dp-toast dp-toast--${toast.tipo}`}>
          {toast.tipo === "ok" ? (
            <FiCheck size={14} />
          ) : (
            <FiAlertCircle size={14} />
          )}
          {toast.msg}
        </div>
      )}

      <div className="dp-breadcrumb">
        <button
          className="dp-btn-volver"
          onClick={() => navigate(rutaCatalogo)}
        >
          ← Catálogo
        </button>
        <span className="dp-breadcrumb-sep">›</span>
        <span className="dp-breadcrumb-actual">{producto.nombre_producto}</span>
      </div>

      <div className="dp-main">
        {/* Imagen */}
        <div className="dp-col-img">
          <div className="dp-img-principal">
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre_producto} />
            ) : (
              <div className="dp-img-placeholder">
                <FiPackage size={64} color="#cbd5e1" />
              </div>
            )}
            <span className={`dp-badge dp-badge--${producto.tipo}`}>
              {producto.tipo}
            </span>
            <button
              className={`dp-fav-btn ${favorito ? "active" : ""}`}
              onClick={handleFavorito}
            >
              <FiHeart
                size={16}
                fill={favorito ? "#ef4444" : "none"}
                color={favorito ? "#ef4444" : "#94a3b8"}
              />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="dp-col-info">
          <div className="dp-cat-row">
            <FiTag size={12} />
            <span>{producto.categoria}</span>
          </div>
          <h1 className="dp-nombre">{producto.nombre_producto}</h1>

          <RatingEstrellas promedio={promedio} total={comentarios.length} />

          <div className="dp-precios">
            {d && (
              <span className="dp-precio-original">
                {formatPrecio(producto.precio)}
              </span>
            )}
            <div className="dp-precio-row">
              <span className="dp-precio">{formatPrecio(precioFinal)}</span>
              {porcentaje && (
                <span className="dp-descuento-badge">{porcentaje}</span>
              )}
            </div>
          </div>
          {producto.descripcion && (
            <p className="dp-descripcion">{producto.descripcion}</p>
          )}
          {producto.tipo === "servicio" && producto.duracion && (
            <div className="dp-duracion">
              <FiClock size={14} /> {producto.duracion}
            </div>
          )}

          <StockBadge inventario={producto.inventario} tipo={producto.tipo} />

          <div className="dp-acciones">
            {producto.tipo === "producto" && (
              <div className="dp-cantidad">
                <button onClick={() => setCantidad((p) => Math.max(1, p - 1))}>
                  <FiMinus size={13} />
                </button>
                <span>{cantidad}</span>
                <button
                  onClick={() =>
                    setCantidad((p) => Math.min(stock || 99, p + 1))
                  }
                >
                  <FiPlus size={13} />
                </button>
              </div>
            )}
            <BtnAgregar
              agregado={agregado}
              agotado={agotado}
              tipo={producto.tipo}
              onClick={handleAgregar}
            />
          </div>

          <TiendaCard producto={producto} onNavigate={navigate} />
        </div>
      </div>

      <SeccionComentarios
        comentarios={comentarios}
        promedio={promedio}
        token={token}
        pedidoEntregado={pedido}
        onSubmitComentario={
          token
            ? async ({ calificacion, texto }) => {
                await axios.post(
                  "http://localhost:3000/api/comentarios",
                  {
                    id_producto: Number(id),
                    id_pedido: pedido.id_pedido,
                    calificacion,
                    texto,
                  },
                  { headers: { Authorization: `Bearer ${token}` } },
                );
                const coms = await tiendaService.getComentariosProducto(id);
                setComentarios(coms);
                mostrarToast("¡Reseña publicada!");
              }
            : undefined
        }
      />

      <ProductosRelacionados
        relacionados={relacionados}
        onToast={mostrarToast}
      />
    </div>
  );
}
