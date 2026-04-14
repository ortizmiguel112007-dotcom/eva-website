import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthConten";
import { useCarrito } from "@/core/context/CarritoContext";
import { catalogoService } from "../services/catalogo_service";
import axios from "axios";
import {
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiHeart,
  FiShoppingCart,
  FiArrowRight,
  FiCalendar,
  FiTruck,
  FiPackage,
  FiMapPin,
} from "react-icons/fi";
import "@/infrastructure/css/UsuarioDashboard.css";

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO");
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatId(id) {
  return `ORD-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;
}

export default function UsuarioDashboard() {
  const { user, token } = useAuth();
  const { agregarAlCarrito } = useCarrito();
  const navigate = useNavigate();

  const [destacados, setDestacados] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [totalFavoritos, setTotalFavoritos] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dest, cat] = await Promise.all([
          catalogoService.getDestacados(),
          catalogoService.getCatalogo(),
        ]);
        setDestacados(dest);
        setCatalogo(cat);

        if (token) {
          const resPedidos = await axios.get(
            "http://localhost:3000/api/cliente/pedidos",
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setPedidos(resPedidos.data.slice(0, 3));

          try {
            const favRes = await axios.get(
              "http://localhost:3000/api/favoritos",
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            setTotalFavoritos(
              Array.isArray(favRes.data) ? favRes.data.length : 0,
            );
          } catch {
            setTotalFavoritos(0);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    const buscar = async () => {
      try {
        const data = await catalogoService.getCatalogo({
          busqueda,
          categoria,
          tipo,
        });
        setCatalogo(data);
      } catch (err) {
        console.error(err);
      }
    };
    buscar();
  }, [busqueda, categoria, tipo]);

  const categorias = [
    ...new Set(catalogo.map((p) => p.categoria).filter(Boolean)),
  ];
  const activos = pedidos.filter(
    (p) => p.estado === "en_proceso" || p.estado === "enviado",
  ).length;
  const enCamino = pedidos.filter((p) => p.estado === "enviado").length;
  const completados = pedidos.filter((p) => p.estado === "entregado").length;

  if (cargando) return <div className="ud-loading">Cargando...</div>;

  return (
    <div className="ud-container">
      {/* ── Bienvenida ── */}
      <div className="ud-welcome">
        <div>
          <h1>Bienvenid@, {user?.nombre} 👋</h1>
          <p>Explora productos y servicios de nuestras emprendedoras</p>
        </div>
      </div>

      {/* ── Métricas ── */}
      <div className="ud-metricas">
        <div className="ud-metrica">
          <div className="ud-metrica-left">
            <h3>Pedidos activos</h3>
            <span className="ud-metrica-num">{activos}</span>
            <span className="ud-metrica-sub">+{activos} esta semana</span>
          </div>
          <div className="ud-metrica-icono" style={{ background: "#eff6ff" }}>
            <FiShoppingBag size={20} color="#3b82f6" />
          </div>
        </div>

        <div className="ud-metrica">
          <div className="ud-metrica-left">
            <h3>En camino</h3>
            <span className="ud-metrica-num">{enCamino}</span>
            <span className="ud-metrica-sub">Llegan pronto</span>
          </div>
          <div className="ud-metrica-icono" style={{ background: "#fff7ed" }}>
            <FiClock size={20} color="#f97316" />
          </div>
        </div>

        <div className="ud-metrica">
          <div className="ud-metrica-left">
            <h3>Completados</h3>
            <span className="ud-metrica-num">{completados}</span>
            <span className="ud-metrica-sub">Este mes</span>
          </div>
          <div className="ud-metrica-icono" style={{ background: "#f0fdf4" }}>
            <FiCheckCircle size={20} color="#16a34a" />
          </div>
        </div>

        <div className="ud-metrica">
          <div className="ud-metrica-left">
            <h3>Productos favoritos</h3>
            <span className="ud-metrica-num">{totalFavoritos}</span>
            <span className="ud-metrica-sub">En tu lista</span>
          </div>
          <div className="ud-metrica-icono" style={{ background: "#faf5ff" }}>
            <FiHeart size={20} color="#a855f7" />
          </div>
        </div>
      </div>

      {/* ── Productos Destacados ── */}
      {destacados.length > 0 && (
        <section className="ud-section">
          <div className="ud-section-header">
            <h2>Productos destacados</h2>
            <button
              className="ud-ver-todos"
              onClick={() => navigate("/productos")}
            >
              Ver todos <FiArrowRight size={14} />
            </button>
          </div>

          <div className="ud-grid">
            {destacados.slice(0, 4).map((p) => (
              <div key={p.id_producto} className="ud-card">
                <div
                  className="ud-card-img"
                  onClick={() => navigate(`/producto/${p.id_producto}`)}
                >
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre_producto} />
                  ) : (
                    <div className="ud-card-placeholder">
                      <FiPackage size={32} color="#94a3b8" />
                    </div>
                  )}
                  <span className="ud-badge">
                    {p.tipo === "producto" ? "Producto" : "Servicio"}
                  </span>
                  {p.inventario?.cantidad === 0 && (
                    <div className="ud-agotado">Agotado</div>
                  )}
                </div>
                <div className="ud-card-body">
                  <h3>{p.nombre_producto}</h3>
                  <span className="ud-precio">{formatPrecio(p.precio)}</span>
                  <span
                    className={
                      p.inventario?.cantidad === 0
                        ? "ud-agotado-label"
                        : "ud-disponible"
                    }
                  >
                    {p.inventario?.cantidad === 0
                      ? "No disponible"
                      : "Disponible"}
                  </span>
                  <button
                    className="ud-btn-agregar"
                    disabled={p.inventario?.cantidad === 0}
                    onClick={() =>
                      agregarAlCarrito({
                        id_producto: p.id_producto,
                        nombre_producto: p.nombre_producto,
                        precio: p.precio,
                        imagen: p.imagen,
                        categoria: p.categoria,
                      })
                    }
                  >
                    <FiShoppingCart size={14} />
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Catálogo ── */}
      <section className="ud-section">
        <div className="ud-section-header">
          <h2>Catálogo</h2>
          <button
            className="ud-ver-todos"
            onClick={() => navigate("/productos")}
          >
            Ver todos <FiArrowRight size={14} />
          </button>
        </div>

        <div className="ud-filtros">
          <input
            type="text"
            placeholder="Buscar producto o servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="ud-search"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="ud-select"
          >
            <option value="">Todos</option>
            <option value="producto">Producto</option>
            <option value="servicio">Servicio</option>
          </select>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="ud-select"
          >
            <option value="">Categoría</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {catalogo.length === 0 ? (
          <p className="ud-empty">No se encontraron productos</p>
        ) : (
          <div className="ud-grid">
            {catalogo.map((p) => (
              <div key={p.id_producto} className="ud-card">
                <div
                  className="ud-card-img"
                  onClick={() => navigate(`/producto/${p.id_producto}`)}
                >
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre_producto} />
                  ) : (
                    <div className="ud-card-placeholder">
                      <FiPackage size={32} color="#94a3b8" />
                    </div>
                  )}
                  <span className="ud-badge">
                    {p.tipo === "producto" ? "Producto" : "Servicio"}
                  </span>
                  {p.inventario?.cantidad === 0 && (
                    <div className="ud-agotado">Agotado</div>
                  )}
                </div>
                <div className="ud-card-body">
                  <h3>{p.nombre_producto}</h3>
                  <span className="ud-precio">{formatPrecio(p.precio)}</span>
                  <span
                    className={
                      p.inventario?.cantidad === 0
                        ? "ud-agotado-label"
                        : "ud-disponible"
                    }
                  >
                    {p.inventario?.cantidad === 0
                      ? "No disponible"
                      : "Disponible"}
                  </span>
                  <button
                    className="ud-btn-agregar"
                    disabled={p.inventario?.cantidad === 0}
                    onClick={() =>
                      agregarAlCarrito({
                        id_producto: p.id_producto,
                        nombre_producto: p.nombre_producto,
                        precio: p.precio,
                        imagen: p.imagen,
                        categoria: p.categoria,
                      })
                    }
                  >
                    <FiShoppingCart size={14} />
                    {p.inventario?.cantidad === 0
                      ? "Agotado"
                      : "Agregar al carrito"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Pedidos recientes ── */}
      {pedidos.length > 0 && (
        <section className="ud-section">
          <div className="ud-section-header">
            <h2>Pedidos recientes</h2>
            <button
              className="ud-ver-todos"
              onClick={() => navigate("/mis-pedidos")}
            >
              Ver todos <FiArrowRight size={14} />
            </button>
          </div>

          <div className="ud-pedidos-lista">
            {pedidos.map((pedido) => (
              <div key={pedido.id_pedido} className="ud-pedido-card">
                <div className="ud-pedido-thumb">
                  <FiPackage size={18} color="#94a3b8" />
                </div>

                <div className="ud-pedido-info">
                  <p className="ud-pedido-id">{formatId(pedido.id_pedido)}</p>
                  <div className="ud-pedido-meta">
                    <FiCalendar size={11} />
                    <span>{formatFecha(pedido.fecha)}</span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      margin: "0.1rem 0 0",
                    }}
                  >
                    {pedido.detalles?.length}{" "}
                    {pedido.detalles?.length === 1 ? "artículo" : "artículos"}
                  </p>
                </div>

                <div className="ud-pedido-right">
                  <span className={`ud-estado ${pedido.estado}`}>
                    {pedido.estado === "en_proceso" ? (
                      <>
                        <FiClock size={11} /> En proceso
                      </>
                    ) : pedido.estado === "enviado" ? (
                      <>
                        <FiTruck size={11} /> Enviado
                      </>
                    ) : pedido.estado === "entregado" ? (
                      <>
                        <FiCheckCircle size={11} /> Entregado
                      </>
                    ) : (
                      "Cancelado"
                    )}
                  </span>

                  <div className="ud-pedido-total-wrap">
                    <span className="ud-pedido-total-label">Total</span>
                    <span className="ud-pedido-total-valor">
                      {formatPrecio(pedido.total)}
                    </span>
                  </div>

                  <button
                    className="ud-btn-ver"
                    onClick={() => navigate("/mis-pedidos")}
                  >
                    Ver detalles
                  </button>

                  {pedido.estado === "enviado" && (
                    <button
                      className="ud-btn-rastrear"
                      onClick={() => navigate("/seguimiento")}
                    >
                      Rastrear
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer>
        <div className="ud-footer">
          <div className="ud-footer-brand">
            <h3>EVA</h3>
            <p>
              Marketplace de emprendedoras. Conectamos talento con personas que
              valoran lo hecho a mano.
            </p>
          </div>
          <div className="ud-footer-col">
            <h4>Compras</h4>
            <ul>
              <li onClick={() => navigate("/productos")}>Explorar catálogo</li>
              <li onClick={() => navigate("/tiendas")}>Ver tiendas</li>
              <li onClick={() => navigate("/carrito")}>Mi carrito</li>
              <li onClick={() => navigate("/mis-pedidos")}>Mis pedidos</li>
            </ul>
          </div>
          <div className="ud-footer-col">
            <h4>Mi cuenta</h4>
            <ul>
              <li onClick={() => navigate("/perfil")}>Mi perfil</li>
              <li onClick={() => navigate("/mis-pedidos")}>Historial</li>
              <li onClick={() => navigate("/seguimiento")}>Seguimiento</li>
              <li onClick={() => navigate("/mis-resenas")}>Mis reseñas</li>
            </ul>
          </div>
          <div className="ud-footer-col">
            <h4>Ayuda</h4>
            <ul>
              <li>Preguntas frecuentes</li>
              <li>Políticas de envío</li>
              <li>Devoluciones</li>
              <li>Contacto</li>
            </ul>
          </div>
        </div>

        <div className="ud-footer-bottom">
          <p>
            © {new Date().getFullYear()} EVA Marketplace. Todos los derechos
            reservados.
          </p>
          <p>Hecho con amor por emprendedoras</p>
        </div>
      </footer>
    </div>
  );
}
