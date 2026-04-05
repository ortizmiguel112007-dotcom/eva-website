import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { tiendaService } from "../services/tienda.service";
import {
  FiSearch,
  FiPackage,
  FiX,
  FiSliders,
  FiShoppingCart,
  FiClock,
  FiChevronDown,
  FiHeart,
  FiHome,
  FiBook,
  FiMonitor,
  FiTrendingUp,
  FiScissors,
  FiStar,
  FiShoppingBag,
  FiCpu,
  FiFeather,
  FiEye 
} from "react-icons/fi";
import "@/infrastructure/css/catalogo.css";

const CATEGORIAS = [
  { label: "Artesanías", value: "artesanias", Icon: FiFeather },
  { label: "Belleza", value: "belleza", Icon: FiScissors },
  { label: "Alimentos", value: "alimentacion", Icon: FiStar },
  { label: "Hogar", value: "hogar", Icon: FiHome },
  { label: "Moda", value: "moda", Icon: FiShoppingBag },
  { label: "Consultoría", value: "consultoria", Icon: FiTrendingUp },
  { label: "Educación", value: "educacion", Icon: FiBook },
  { label: "Marketing", value: "marketing", Icon: FiMonitor },
  { label: "Tecnología", value: "tecnologia", Icon: FiCpu },
];

const ORDENAR = [
  { label: "Más recientes", value: "recientes" },
  { label: "Precio: menor a mayor", value: "precio_asc" },
  { label: "Precio: mayor a menor", value: "precio_desc" },
];

const POR_PAGINA = 9;

function formatPrecio(p) {
  return "$" + Number(p).toLocaleString("es-CO");
}

export default function Catalogo() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tipoActivo, setTipoActivo] = useState("");
  const [cats, setCats] = useState([]);
  const [ordenar, setOrdenar] = useState("recientes");
  const [pagina, setPagina] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const toggleCat = (val) => {
    setCats((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val],
    );
    setPagina(1);
  };

  const filtrados = useMemo(() => {
    let result = todos.filter((p) => {
      const matchB =
        p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.seccion?.emprendedora?.usuario?.nombre || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      const matchT = !tipoActivo || p.tipo === tipoActivo;
      const matchC = cats.length === 0 || cats.includes(p.categoria);
      const matchP = Number(p.precio) <= rangoMax;
      return matchB && matchT && matchC && matchP;
    });
    if (ordenar === "precio_asc")
      result = [...result].sort((a, b) => Number(a.precio) - Number(b.precio));
    if (ordenar === "precio_desc")
      result = [...result].sort((a, b) => Number(b.precio) - Number(a.precio));
    return result;
  }, [todos, busqueda, tipoActivo, cats, rangoMax, ordenar]);

  const contadorCat = (val) =>
    todos.filter(
      (p) => p.categoria === val && (!tipoActivo || p.tipo === tipoActivo),
    ).length;
  const visible = filtrados.slice(0, pagina * POR_PAGINA);
  const hayMas = visible.length < filtrados.length;
  const hayFiltros = cats.length > 0 || tipoActivo || rangoMax < precioMax;

  return (
    <div className="cat-page">
      {/* ── Hero ── */}
      <div className="cat-hero">
        <div className="cat-hero-blur cat-b1" />
        <div className="cat-hero-blur cat-b2" />
        <div className="cat-hero-content">
          <h1 className="cat-hero-titulo">Catálogo</h1>
          <p className="cat-hero-sub">
            {filtrados.length} productos y servicios disponibles
          </p>

          {/* Buscador */}
          <div className="cat-search-wrap">
            <FiSearch size={16} color="#94a3b8" />
            <input
              className="cat-search-input"
              type="text"
              placeholder="Buscar productos, servicios, emprendedoras..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
            {busqueda && (
              <button
                className="cat-search-clear"
                onClick={() => setBusqueda("")}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Pills tipo */}
          <div className="cat-tipo-pills">
            {[
              { label: "Todo", value: "" },
              { label: "Productos", value: "producto" },
              { label: "Servicios", value: "servicio" },
            ].map((t) => (
              <button
                key={t.value}
                className={`cat-tipo-pill ${tipoActivo === t.value ? "active" : ""}`}
                onClick={() => {
                  setTipoActivo(t.value);
                  setPagina(1);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="cat-body">
        {/* Sidebar */}
        <aside className={`cat-sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="cat-sidebar-header">
            <div className="cat-sidebar-titulo">
              <FiSliders size={14} /> Filtros
              {hayFiltros && (
                <span className="cat-filtros-badge">
                  {cats.length +
                    (tipoActivo ? 1 : 0) +
                    (rangoMax < precioMax ? 1 : 0)}
                </span>
              )}
            </div>
            {hayFiltros && (
              <button
                className="cat-btn-limpiar"
                onClick={() => {
                  setCats([]);
                  setTipoActivo("");
                  setRangoMax(precioMax);
                  setPagina(1);
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Precio */}
          <div className="cat-sidebar-seccion">
            <h4 className="cat-sidebar-seccion-titulo">Precio máximo</h4>
            <input
              type="range"
              min={0}
              max={precioMax}
              value={rangoMax}
              step={10000}
              className="cat-slider"
              onChange={(e) => {
                setRangoMax(Number(e.target.value));
                setPagina(1);
              }}
            />
            <div className="cat-precio-labels">
              <span>$0</span>
              <span className="cat-precio-val">{formatPrecio(rangoMax)}</span>
            </div>
          </div>

          {/* Categorías */}
          <div className="cat-sidebar-seccion">
            <h4 className="cat-sidebar-seccion-titulo">Categorías</h4>
            <div className="cat-cats-list">
              {CATEGORIAS.map((c) => (
                <label
                  key={c.value}
                  className={`cat-check-label ${cats.includes(c.value) ? "active" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={cats.includes(c.value)}
                    onChange={() => toggleCat(c.value)}
                  />
                  <c.Icon size={13} />
                  <span className="cat-check-txt">{c.label}</span>
                  <span className="cat-check-count">
                    {contadorCat(c.value)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="cat-main">
          {/* Toolbar */}
          <div className="cat-toolbar">
            <button
              className="cat-toggle-sidebar"
              onClick={() => setSidebarOpen((p) => !p)}
            >
              <FiSliders size={14} />{" "}
              {sidebarOpen ? "Ocultar filtros" : "Mostrar filtros"}
            </button>
            <span className="cat-toolbar-count">
              <strong>{visible.length}</strong> de{" "}
              <strong>{filtrados.length}</strong> resultados
            </span>
            <div className="cat-ordenar-wrap">
              <select
                className="cat-ordenar"
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
              >
                {ORDENAR.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FiChevronDown size={13} className="cat-ordenar-icon" />
            </div>
          </div>

          {/* Pills categoría horizontal */}
          <div className="cat-cats-pills">
            <button
              className={`cat-cat-pill ${cats.length === 0 ? "active" : ""}`}
              onClick={() => {
                setCats([]);
                setPagina(1);
              }}
            >
              <FiPackage size={12} /> Todas
            </button>
            {CATEGORIAS.map((c) => (
              <button
                key={c.value}
                className={`cat-cat-pill ${cats.includes(c.value) ? "active" : ""}`}
                onClick={() => toggleCat(c.value)}
              >
                <c.Icon size={12} /> {c.label}
                <span className="cat-cat-pill-count">
                  {contadorCat(c.value)}
                </span>
              </button>
            ))}
          </div>

          {/* Grid */}
          {cargando ? (
            <div className="cat-loading">
              <div className="cat-spinner" />
              <p>Cargando productos...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="cat-empty">
              <FiPackage size={48} color="#cbd5e1" />
              <h3>Sin resultados</h3>
              <p>Intenta con otros filtros</p>
            </div>
          ) : (
            <>
              <div className="cat-grid">
                {visible.map((p, idx) => (
                  <div
                    key={p.id_producto}
                    className="cat-card"
                    style={{ animationDelay: `${(idx % 9) * 0.04}s` }}
                    onClick={() => navigate(`/producto/${p.id_producto}`)}
                  >
                    <div className="cat-card-img">
                      {p.imagen ? (
                        <img src={p.imagen} alt={p.nombre_producto} />
                      ) : (
                        <div className="cat-card-no-img">
                          <FiPackage size={36} color="#cbd5e1" />
                        </div>
                      )}
                      <div className="cat-card-img-overlay">
                        <span className="cat-card-ver-btn">
                          <FiEye size={15} /> Ver detalle
                        </span>
                      </div>
                      <span className={`cat-badge cat-badge--${p.tipo}`}>
                        {p.tipo}
                      </span>
                    </div>

                    <div className="cat-card-body">
                      <span className="cat-card-cat">{p.categoria}</span>
                      <h3 className="cat-card-nombre">{p.nombre_producto}</h3>
                      {p.descripcion && (
                        <p className="cat-card-desc">{p.descripcion}</p>
                      )}
                      {p.tipo === "servicio" && p.duracion && (
                        <div className="cat-card-duracion">
                          <FiClock size={11} /> {p.duracion}
                        </div>
                      )}
                      <span className="cat-card-tienda">
                        {p.seccion?.emprendedora?.usuario?.nombre || "EVA"}
                      </span>
                      <div className="cat-card-footer">
                        <span className="cat-card-precio">
                          {formatPrecio(p.precio)}
                        </span>
                        <button
                          className="cat-btn-ver"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/producto-detalle/${p.id_producto}`);
                          }}
                        >
                          <FiShoppingCart size={13} /> Ver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hayMas && (
                <div className="cat-cargar-mas-wrap">
                  <button
                    className="cat-btn-cargar-mas"
                    onClick={() => setPagina((p) => p + 1)}
                  >
                    Cargar más productos
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
