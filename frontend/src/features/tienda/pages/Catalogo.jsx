import { useState, useEffect, useMemo } from "react";
import { tiendaService } from "../services/tienda.service";
import { FiSearch } from "react-icons/fi";
import "@/infrastructure/css/inicio.css";
import "@/infrastructure/css/catalogo.css";

const CATEGORIAS = [
  { label: "Artesanías", value: "artesanias", emoji: "🎨" },
  { label: "Belleza", value: "belleza", emoji: "💄" },
  { label: "Alimentos", value: "alimentos", emoji: "🍕" },
  { label: "Hogar", value: "hogar", emoji: "🏠" },
  { label: "Moda", value: "moda", emoji: "👗" },
  { label: "Consultoría", value: "consultoria", emoji: "💼" },
  { label: "Educación", value: "educacion", emoji: "📚" },
  { label: "Marketing", value: "marketing", emoji: "📣" },
  { label: "Tecnología", value: "tecnologia", emoji: "💻" },
];

const ORDENAR = [
  { label: "Más recientes", value: "recientes" },
  { label: "Precio: menor a mayor", value: "precio_asc" },
  { label: "Precio: mayor a menor", value: "precio_desc" },
];

const POR_PAGINA = 9;

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO");
}

export default function Catalogo() {
  const [todos, setTodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tipoActivo, setTipoActivo] = useState("");
  const [cats, setCats] = useState([]); // categorías seleccionadas
  const [ordenar, setOrdenar] = useState("recientes");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await tiendaService.getCatalogo();
        setTodos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // precio max dinámico
  const precioMax = useMemo(
    () =>
      todos.length
        ? Math.ceil(Math.max(...todos.map((p) => Number(p.precio))) / 1000) *
          1000
        : 5000000,
    [todos],
  );

  const [rangoMax, setRangoMax] = useState(5000000);

  useEffect(() => {
    if (precioMax > 0) setRangoMax(precioMax);
  }, [precioMax]);

  // toggle categoría
  const toggleCat = (val) => {
    setCats((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val],
    );
    setPagina(1);
  };

  // filtrado + ordenamiento
  const filtrados = useMemo(() => {
    let result = todos.filter((p) => {
      const matchBusqueda =
        p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.seccion?.emprendedora?.usuario?.nombre || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      const matchTipo = !tipoActivo || p.tipo === tipoActivo;
      const matchCat = cats.length === 0 || cats.includes(p.categoria);
      const matchPrecio = Number(p.precio) <= rangoMax;
      return matchBusqueda && matchTipo && matchCat && matchPrecio;
    });

    if (ordenar === "precio_asc")
      result = [...result].sort((a, b) => Number(a.precio) - Number(b.precio));
    if (ordenar === "precio_desc")
      result = [...result].sort((a, b) => Number(b.precio) - Number(a.precio));

    return result;
  }, [todos, busqueda, tipoActivo, cats, rangoMax, ordenar]);

  // contador por categoría
  const contadorCat = (val) =>
    todos.filter(
      (p) => p.categoria === val && (!tipoActivo || p.tipo === tipoActivo),
    ).length;

  const visible = filtrados.slice(0, pagina * POR_PAGINA);
  const hayMas = visible.length < filtrados.length;

  return (
    <div className="inicio-page">
      <div className="catalogo-wrapper">
        {/* ── Header ── */}
        <div className="catalogo-header">
          <div>
            <h1 className="catalogo-titulo">Catálogo de Productos</h1>
            <p className="catalogo-subtitulo">
              {filtrados.length} productos y servicios disponibles
            </p>
          </div>

          {/* Buscador */}
          <div className="catalogo-search-wrapper">
            <FiSearch className="catalogo-search-icon" />
            <input
              type="text"
              className="catalogo-search"
              placeholder="Buscar productos, servicios, emprendedoras..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        {/* ── Pills tipo ── */}
        <div className="catalogo-pills-row">
          {[
            { label: "Todas", value: "" },
            { label: "Productos", value: "producto" },
            { label: "Servicios", value: "servicio" },
          ].map((t) => (
            <button
              key={t.value}
              className={`categoria-pill ${tipoActivo === t.value ? "active" : ""}`}
              onClick={() => {
                setTipoActivo(t.value);
                setPagina(1);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Pills categoría ── */}
        <div className="catalogo-pills-row" style={{ marginBottom: "1.5rem" }}>
          <button
            className={`categoria-pill ${cats.length === 0 ? "active" : ""}`}
            onClick={() => {
              setCats([]);
              setPagina(1);
            }}
          >
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              className={`categoria-pill ${cats.includes(cat.value) ? "active" : ""}`}
              onClick={() => toggleCat(cat.value)}
            >
              {cat.emoji} {cat.label}
              <span className="cat-count">{contadorCat(cat.value)}</span>
            </button>
          ))}
        </div>

        {/* ── Contenido principal ── */}
        <div className="catalogo-content">
          {/* Sidebar filtros */}
          <aside className="catalogo-sidebar">
            <h3 className="sidebar-titulo">Filtros</h3>

            {/* Rango de precio */}
            <div className="sidebar-seccion">
              <h4 className="sidebar-seccion-titulo">Rango de Precio</h4>
              <input
                type="range"
                min={0}
                max={precioMax}
                value={rangoMax}
                step={10000}
                onChange={(e) => {
                  setRangoMax(Number(e.target.value));
                  setPagina(1);
                }}
                className="precio-slider"
              />
              <div className="precio-labels">
                <span>$0</span>
                <span>{formatPrecio(rangoMax)}</span>
              </div>
            </div>

            {/* Tipo */}
            <div className="sidebar-seccion">
              <h4 className="sidebar-seccion-titulo">Tipo</h4>
              {[
                { label: "Productos", value: "producto" },
                { label: "Servicios", value: "servicio" },
              ].map((t) => (
                <label key={t.value} className="sidebar-checkbox">
                  <input
                    type="checkbox"
                    checked={tipoActivo === t.value}
                    onChange={() => {
                      setTipoActivo((prev) =>
                        prev === t.value ? "" : t.value,
                      );
                      setPagina(1);
                    }}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>

            {/* Categorías */}
            <div className="sidebar-seccion">
              <h4 className="sidebar-seccion-titulo">Categorías</h4>
              {CATEGORIAS.map((cat) => (
                <label key={cat.value} className="sidebar-checkbox">
                  <input
                    type="checkbox"
                    checked={cats.includes(cat.value)}
                    onChange={() => toggleCat(cat.value)}
                  />
                  <span>
                    {cat.emoji} {cat.label}
                  </span>
                  <span className="sidebar-count">
                    {contadorCat(cat.value)}
                  </span>
                </label>
              ))}
            </div>

            {/* Limpiar filtros */}
            {(cats.length > 0 || tipoActivo || rangoMax < precioMax) && (
              <button
                className="btn-limpiar"
                onClick={() => {
                  setCats([]);
                  setTipoActivo("");
                  setRangoMax(precioMax);
                  setPagina(1);
                }}
              >
                Limpiar filtros
              </button>
            )}
          </aside>

          {/* Grid */}
          <div className="catalogo-main">
            {/* Toolbar */}
            <div className="catalogo-toolbar">
              <span className="catalogo-resultados">
                Mostrando <strong>{visible.length}</strong> de{" "}
                <strong>{filtrados.length}</strong> resultados
              </span>
              <select
                className="catalogo-ordenar"
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
              >
                {ORDENAR.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {cargando ? (
              <div className="pub-loading">Cargando productos...</div>
            ) : filtrados.length === 0 ? (
              <div className="catalogo-empty">
                <p>No encontramos productos que coincidan</p>
                <span>Intenta con otros filtros o busca algo diferente</span>
              </div>
            ) : (
              <>
                <div className="pub-grid-3">
                  {visible.map((p) => (
                    <div
                      key={p.id_producto}
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
                        <span className={`pub-tipo-badge ${p.tipo}`}>
                          {p.tipo}
                        </span>
                      </div>
                      <div className="pub-product-body">
                        <h3>{p.nombre_producto}</h3>
                        <span className="cat">{p.categoria}</span>
                        {p.descripcion && (
                          <span
                            style={{
                              fontSize: "0.78rem",
                              color: "#6b7280",
                              lineHeight: 1.4,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {p.descripcion}
                          </span>
                        )}
                        {p.tipo === "servicio" && p.duracion && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#16a34a",
                              fontWeight: 600,
                            }}
                          >
                            ⏱ {p.duracion}
                          </span>
                        )}
                        <span className="tienda-name">
                          {p.seccion?.emprendedora?.usuario?.nombre || "EVA"}
                        </span>
                        <div className="pub-product-footer">
                          <span className="pub-precio">
                            {formatPrecio(p.precio)}
                          </span>
                          <button className="btn-agregar">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hayMas && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "2rem",
                    }}
                  >
                    <button
                      className="btn-cargar-mas"
                      onClick={() => setPagina((prev) => prev + 1)}
                    >
                      Cargar más productos
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
