import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { tiendaService } from "../services/tienda.service";
import {
  FiShoppingBag,
  FiArrowRight,
  FiStar,
  FiMapPin,
  FiPackage,
  FiZap,
  FiHeart,
  FiMail,
  FiPhone,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiGrid,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import "@/infrastructure/css/inicio.css";

const CATEGORIAS = [
  { label: "Todas", value: "", Icon: FiGrid },
  { label: "Artesanías", value: "artesanias", Icon: FiHeart },
  { label: "Belleza", value: "belleza", Icon: FiStar },
  { label: "Alimentos", value: "alimentacion", Icon: FiZap },
  { label: "Hogar", value: "hogar", Icon: FiMapPin },
  { label: "Moda", value: "moda", Icon: FiShoppingBag },
];

const AVATAR_COLORS = [
  "#3b82f6",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#ef4444",
  "#0891b2",
  "#be185d",
  "#65a30d",
];

function getAvatarColor(nombre) {
  if (!nombre) return AVATAR_COLORS[0];
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getInitials(nombre) {
  if (!nombre) return "?";
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO");
}

function ProductCard({ p }) {
  const navigate = useNavigate();
  return (
    <div
      className="ip-product-card"
      onClick={() => navigate(`/producto/${p.id_producto}`)}
    >
      <div className="ip-product-img">
        {p.imagen ? (
          <img src={p.imagen} alt={p.nombre_producto} />
        ) : (
          <div className="ip-no-img">
            <FiPackage size={40} color="#94a3b8" />
          </div>
        )}
        <span className={`ip-tipo-badge ip-tipo-${p.tipo}`}>{p.tipo}</span>
      </div>
      <div className="ip-product-body">
        <h3>{p.nombre_producto}</h3>
        <span className="ip-cat">{p.categoria}</span>
        <span className="ip-tienda-name">
          {p.seccion?.alianza
            ? p.seccion.alianza.participantes
                ?.map((p) => p.usuario?.nombre)
                .join(" & ")
            : p.seccion?.emprendedora?.usuario?.nombre || "EVA"}
        </span>
        <div className="ip-product-footer">
          <span className="ip-precio">{formatPrecio(p.precio)}</span>
          <button
            className="ip-btn-agregar"
            onClick={(e) => e.stopPropagation()}
          >
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Inicio() {
  const navigate = useNavigate();
  const location = useLocation();
  const mensajePendiente = location.state?.mensaje;

  const [destacados, setDestacados] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [catActiva, setCatActiva] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dest, tiend, cat] = await Promise.all([
          tiendaService.getDestacados(),
          tiendaService.getTiendas(),
          tiendaService.getCatalogo(),
        ]);
        setDestacados(dest);
        setTiendas(tiend);
        setCatalogo(cat);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleCategoria = async (cat) => {
    setCatActiva(cat);
    try {
      const data = await tiendaService.getCatalogo(
        cat ? { categoria: cat } : {},
      );
      setCatalogo(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="inicio-page">
      {/* Aviso pendiente */}
      {mensajePendiente && (
        <div className="ip-aviso">
          <FiZap size={14} /> {mensajePendiente}
        </div>
      )}

      {/* ── HERO ── */}
      <section className="ip-hero">
        <div className="ip-hero-inner">
          <div className="ip-hero-text">
            <div className="ip-hero-tag">
              <FiZap size={12} /> Marketplace de Emprendedoras
            </div>
            <h1>
              Descubre productos y servicios de{" "}
              <span className="ip-hero-span">mujeres emprendedoras</span>
            </h1>
            <p className="ip-hero-desc">
              Apoya el talento local. Encuentra productos únicos, servicios
              profesionales y conecta directamente con emprendedoras de tu
              ciudad.
            </p>
            <div className="ip-hero-actions">
              <button
                className="ip-btn-primary"
                onClick={() => navigate("/productos")}
              >
                <FiShoppingBag size={15} /> Explorar productos
              </button>
              <button
                className="ip-btn-secondary"
                onClick={() => navigate("/tiendas")}
              >
                <FiUsers size={15} /> Ver tiendas
              </button>
            </div>
            <div className="ip-hero-stats">
              <div className="ip-stat">
                <strong>{tiendas.length}+</strong>
                <span>Emprendedoras</span>
              </div>
              <div className="ip-stat-divider" />
              <div className="ip-stat">
                <strong>{catalogo.length}+</strong>
                <span>Productos</span>
              </div>
              <div className="ip-stat-divider" />
              <div className="ip-stat">
                <strong>100%</strong>
                <span>Local</span>
              </div>
            </div>
          </div>

          {destacados.length > 0 && (
            <div className="ip-hero-visual">
              {destacados.slice(0, 3).map((p, i) => (
                <div
                  key={p.id_producto}
                  className={`ip-hero-card ${i === 0 ? "ip-hero-card--wide" : ""}`}
                >
                  {p.imagen ? (
                    <img
                      src={p.imagen}
                      alt={p.nombre_producto}
                      style={{ height: i === 0 ? "140px" : "95px" }}
                    />
                  ) : (
                    <div
                      className="ip-hero-card-placeholder"
                      style={{ height: i === 0 ? "140px" : "95px" }}
                    >
                      <FiPackage size={28} color="rgba(255,255,255,0.4)" />
                    </div>
                  )}
                  <div className="ip-hero-card-info">
                    <h4>{p.nombre_producto}</h4>
                    <span>{formatPrecio(p.precio)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── DESTACADOS ── */}
      {destacados.length > 0 && (
        <section className="ip-seccion">
          <div className="ip-seccion-header">
            <div>
              <div className="ip-seccion-tag">
                <FiStar size={12} /> Destacados
              </div>
              <h2>Productos Destacados</h2>
              <p>Los más populares de nuestras emprendedoras</p>
            </div>
            <button
              className="ip-btn-ver-mas"
              onClick={() => navigate("/productos")}
            >
              Ver todos <FiArrowRight size={14} />
            </button>
          </div>
          <div className="ip-grid-4">
            {destacados.map((p) => (
              <ProductCard key={p.id_producto} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── CATEGORÍAS ── */}
      <section className="ip-seccion ip-seccion-alt">
        <div className="ip-seccion-header ip-centrado">
          <div className="ip-seccion-tag">
            <FiGrid size={12} /> Explorar
          </div>
          <h2>Por Categoría</h2>
          <p>Encuentra exactamente lo que buscas</p>
        </div>
        <div className="ip-cats-grid">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              className={`ip-cat-pill ${catActiva === cat.value ? "active" : ""}`}
              onClick={() => handleCategoria(cat.value)}
            >
              <cat.Icon size={15} /> {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── CATÁLOGO ── */}
      <section className="ip-seccion">
        <div className="ip-seccion-header">
          <div>
            <div className="ip-seccion-tag">
              <FiPackage size={12} /> Catálogo
            </div>
            <h2>Todos los Productos</h2>
            <p>La creatividad de nuestras emprendedoras</p>
          </div>
          <button
            className="ip-btn-ver-mas"
            onClick={() => navigate("/productos")}
          >
            Ver catálogo completo <FiArrowRight size={14} />
          </button>
        </div>

        {cargando ? (
          <div className="ip-loading">
            <div className="ip-spinner" />
            <span>Cargando productos...</span>
          </div>
        ) : (
          <div className="ip-grid-3">
            {catalogo.slice(0, 6).map((p) => (
              <ProductCard key={p.id_producto} p={p} />
            ))}
            {catalogo.length === 0 && (
              <div className="ip-empty">
                <FiPackage size={40} color="#cbd5e1" />
                <p>No hay productos disponibles</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── TIENDAS ── */}
      {tiendas.length > 0 && (
        <section className="ip-seccion ip-seccion-alt">
          <div className="ip-seccion-header">
            <div>
              <div className="ip-seccion-tag">
                <FiUsers size={12} /> Comunidad
              </div>
              <h2>Tiendas de Emprendedoras</h2>
              <p>Conoce a las mujeres detrás de cada producto</p>
            </div>
            <button
              className="ip-btn-ver-mas"
              onClick={() => navigate("/tiendas")}
            >
              Ver todas <FiArrowRight size={14} />
            </button>
          </div>

          <div className="ip-tiendas-grid">
            {tiendas.slice(0, 4).map((t) => {
              const productos = t.secciones?.flatMap((s) => s.productos) || [];
              return (
                <div
                  key={t.id_emprendedora}
                  className="ip-tienda-card"
                  onClick={() => navigate(`/tienda/${t.id_emprendedora}`)}
                >
                  <div className="ip-tienda-banner">
                    {productos.slice(0, 3).map((p, i) => (
                      <div key={i} className="ip-tienda-banner-img">
                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre_producto} />
                        ) : (
                          <div className="ip-tienda-banner-placeholder">
                            <FiPackage size={20} color="#94a3b8" />
                          </div>
                        )}
                      </div>
                    ))}
                    {productos.length === 0 && (
                      <div className="ip-tienda-banner-empty">
                        <FiShoppingBag size={32} color="#94a3b8" />
                      </div>
                    )}
                  </div>
                  <div className="ip-tienda-body">
                    <div className="ip-tienda-avatar-row">
                      <div
                        className="ip-tienda-avatar"
                        style={{
                          background: `linear-gradient(135deg, ${getAvatarColor(t.usuario?.nombre)}, ${getAvatarColor(t.usuario?.nombre)}bb)`,
                        }}
                      >
                        {getInitials(t.usuario?.nombre)}
                      </div>
                      <div>
                        <p className="ip-tienda-nombre">{t.usuario?.nombre}</p>
                        <span className="ip-tienda-count">
                          <FiPackage size={11} /> {productos.length} productos
                        </span>
                      </div>
                    </div>
                    <button
                      className="ip-btn-visitar"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tienda/${t.id_emprendedora}`);
                      }}
                    >
                      Visitar tienda <FiArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="ip-footer">
        <div className="ip-footer-inner">
          <div className="ip-footer-brand">
            <div className="ip-footer-logo">
              <FiHeart size={18} color="#f59e0b" /> EVA
            </div>
            <p>Apoyando a mujeres emprendedoras desde Colombia.</p>
            <div className="ip-footer-social">
              <a href="#">
                <FiInstagram size={18} />
              </a>
              <a href="#">
                <FiFacebook size={18} />
              </a>
              <a href="#">
                <FiTwitter size={18} />
              </a>
            </div>
          </div>

          <div className="ip-footer-col">
            <h4>Explorar</h4>
            <ul>
              <li onClick={() => navigate("/catalogo")}>
                <FiArrowRight size={12} /> Catálogo
              </li>
              <li onClick={() => navigate("/tiendas")}>
                <FiArrowRight size={12} /> Tiendas
              </li>
            </ul>
          </div>

          <div className="ip-footer-col">
            <h4>Contacto</h4>
            <p>
              <FiMail size={13} /> soporte@eva.com
            </p>
            <p>
              <FiPhone size={13} /> +57 300 000 0000
            </p>
            <p>
              <FiMapPin size={13} /> Colombia
            </p>
          </div>
        </div>

        <div className="ip-footer-bottom">
          <span>© 2026 EVA Marketplace — Todos los derechos reservados</span>
          <span>
            Hecho con <FiHeart size={12} color="#f59e0b" /> en Colombia
          </span>
        </div>
      </footer>
    </div>
  );
}
