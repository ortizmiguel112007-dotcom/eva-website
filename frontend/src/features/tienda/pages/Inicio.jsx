import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { tiendaService } from "../services/tienda.service";
import "@/infrastructure/css/inicio.css";

const CATEGORIAS = [
  { label: "Todas", value: "", emoji: "" },
  { label: "Artesanías", value: "artesanias", emoji: "🎨" },
  { label: "Belleza", value: "belleza", emoji: "💄" },
  { label: "Alimentos", value: "alimentos", emoji: "🍕" },
  { label: "Hogar", value: "hogar", emoji: "🏠" },
  { label: "Moda", value: "moda", emoji: "👗" },
  { label: "Accesorios", value: "accesorios", emoji: "💍" },
  { label: "Joyería", value: "joyeria", emoji: "✨" },
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

export default function Inicio() {
  const navigate = useNavigate();

  const [destacados, setDestacados] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const location = useLocation();            
  const mensajePendiente = location.state?.mensaje;  

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
    setCategoriaActiva(cat);
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
      {/* ── Hero ── */}

      {mensajePendiente && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            padding: "0.75rem 1.5rem",
            fontSize: "0.88rem",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          ⏳ {mensajePendiente}
        </div>
      )}
      <section className="inicio-hero">
        <div className="inicio-hero-inner">
          <div className="inicio-hero-text">
            <div className="inicio-hero-tag">
              ✨ Marketplace de Emprendedoras
            </div>
            <h1>
              Descubre productos y servicios de{" "}
              <span>mujeres emprendedoras</span>
            </h1>
            <p className="inicio-hero-desc">
              Apoya el talento local. Encuentra productos únicos, servicios
              profesionales y conecta directamente con emprendedoras de tu
              ciudad.
            </p>
            <div className="inicio-hero-actions">
              <button
                className="btn-hero-primary"
                onClick={() => navigate("/productos")}
              >
                Explorar productos →
              </button>
              <button
                className="btn-hero-secondary"
                onClick={() => navigate("/tiendas")}
              >
                Ver tiendas
              </button>
            </div>
            <div className="inicio-hero-stats">
              <div className="hero-stat">
                <h3>{tiendas.length}+</h3>
                <span>Emprendedoras</span>
              </div>
              <div className="hero-stat">
                <h3>{catalogo.length}+</h3>
                <span>Productos</span>
              </div>
              <div className="hero-stat">
                <h3>100%</h3>
                <span>Local</span>
              </div>
            </div>
          </div>

          {destacados.length > 0 && (
            <div className="inicio-hero-visual">
              {destacados.slice(0, 3).map((p, i) => (
                <div
                  key={p.id_producto}
                  className="hero-card-preview"
                  style={i === 0 ? { gridColumn: "span 2" } : {}}
                >
                  {p.imagen ? (
                    <img
                      src={p.imagen}
                      alt={p.nombre_producto}
                      style={{
                        width: "100%",
                        height: i === 0 ? "130px" : "90px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: i === 0 ? "130px" : "90px",
                        background: "rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                      }}
                    >
                      📦
                    </div>
                  )}
                  <div className="hero-card-info">
                    <h4>{p.nombre_producto}</h4>
                    <span>{formatPrecio(p.precio)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Productos Destacados ── */}
      {destacados.length > 0 && (
        <>
          <div className="inicio-seccion">
            <div className="inicio-seccion-header centrado">
              <div style={{ textAlign: "center" }}>
                <h2>Productos Destacados</h2>
                <p>Los productos más populares de nuestras emprendedoras</p>
              </div>
            </div>
            <div className="pub-grid-4">
              {destacados.map((p) => (
                <ProductCard key={p.id_producto} p={p} />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="btn-ver-mas"
                onClick={() => navigate("/productos")}
              >
                Ver todos →
              </button>
            </div>
          </div>
          <hr className="inicio-divider" />
        </>
      )}

      {/* ── Categorías ── */}
      <div
        className="inicio-seccion inicio-seccion-bg"
        style={{ padding: "2.5rem 3rem" }}
      >
        <div className="inicio-seccion-header centrado">
          <div style={{ textAlign: "center" }}>
            <h2>Explorar por Categoría</h2>
            <p>Encuentra exactamente lo que buscas</p>
          </div>
        </div>
        <div className="categorias-pub-grid">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              className={`categoria-pill ${categoriaActiva === cat.value ? "active" : ""}`}
              onClick={() => handleCategoria(cat.value)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Catálogo ── */}
      <div className="inicio-seccion">
        <div className="inicio-seccion-header centrado">
          <div style={{ textAlign: "center" }}>
            <h2>Catálogo de Productos</h2>
            <p>Descubre la creatividad de nuestras emprendedoras</p>
          </div>
        </div>

        {cargando ? (
          <div className="pub-loading">Cargando productos...</div>
        ) : (
          <>
            <div className="pub-grid-3">
              {catalogo.slice(0, 6).map((p) => (
                <ProductCard key={p.id_producto} p={p} />
              ))}
              {catalogo.length === 0 && (
                <div className="pub-empty">No hay productos disponibles</div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="btn-ver-mas"
                onClick={() => navigate("/productos")}
              >
                Ver catálogo completo →
              </button>
            </div>
          </>
        )}
      </div>

      <hr className="inicio-divider" />

      {/* ── Tiendas ── */}
      {tiendas.length > 0 && (
        <div className="inicio-seccion">
          <div className="inicio-seccion-header centrado">
            <div style={{ textAlign: "center" }}>
              <h2>Tiendas de Emprendedoras</h2>
              <p>Conoce a las mujeres detrás de cada producto</p>
            </div>
          </div>

          <div className="tiendas-pub-grid">
            {tiendas.slice(0, 4).map((t) => {
              const productos = t.secciones?.flatMap((s) => s.productos) || [];
              return (
                <div
                  key={t.id_emprendedora}
                  className="tienda-pub-card"
                  onClick={() => navigate(`/tienda/${t.id_emprendedora}`)}
                >
                  {/* Banner */}
                  <div className="tienda-pub-banner">
                    {productos.slice(0, 3).map((p, i) => (
                      <div key={i} style={{ overflow: "hidden" }}>
                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre_producto} />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "110px",
                              background: "#e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            📦
                          </div>
                        )}
                      </div>
                    ))}
                    {productos.length === 0 && (
                      <div
                        style={{
                          gridColumn: "span 3",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "2rem",
                        }}
                      >
                        🏪
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="tienda-pub-body">
                    <div className="tienda-pub-avatar-row">
                      <div
                        className="tienda-pub-avatar"
                        style={{
                          background: `linear-gradient(135deg, ${getAvatarColor(t.usuario?.nombre)}, ${getAvatarColor(t.usuario?.nombre)}bb)`,
                        }}
                      >
                        {getInitials(t.usuario?.nombre)}
                      </div>
                      <div>
                        <p className="tienda-pub-nombre">{t.usuario?.nombre}</p>
                        <span className="tienda-pub-count">
                          {productos.length} productos disponibles
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn-visitar-tienda"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tienda/${t.id_emprendedora}`);
                      }}
                    >
                      Visitar tienda →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1.5rem",
            }}
          >
            <button
              className="btn-ver-mas"
              onClick={() => navigate("/tiendas")}
            >
              Ver todas las tiendas →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente tarjeta producto reutilizable
function ProductCard({ p }) {
  const navigate = useNavigate();
  return (
    <div
      className="pub-product-card"
      onClick={() => navigate(`/producto/${p.id_producto}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="pub-product-img">
        {p.imagen ? (
          <img src={p.imagen} alt={p.nombre_producto} />
        ) : (
          <div className="no-img">📦</div>
        )}
        <span className={`pub-tipo-badge ${p.tipo}`}>{p.tipo}</span>
      </div>
      <div className="pub-product-body">
        <h3>{p.nombre_producto}</h3>
        <span className="cat">{p.categoria}</span>
        <span className="tienda-name">
          {p.seccion?.emprendedora?.usuario?.nombre || "EVA"}
        </span>
        <div className="pub-product-footer">
          <span className="pub-precio">
            ${Number(p.precio).toLocaleString("es-CO")}
          </span>
          <button className="btn-agregar">+</button>
        </div>
      </div>
    </div>
  );
}
