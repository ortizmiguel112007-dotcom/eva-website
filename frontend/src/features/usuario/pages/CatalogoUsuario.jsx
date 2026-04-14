import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "@/core/context/CarritoContext";
import { tiendaService } from "@/features/tienda/services/tienda.service";
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiX,
  FiSliders,
  FiPackage,
  FiTag,
  FiClock,
  FiChevronDown,
  FiFeather,
  FiHome,
  FiBook,
  FiCpu,
  FiScissors,
  FiTrendingUp,
  FiMonitor,
  FiShoppingBag,
  FiCheck,
  FiEye,
} from "react-icons/fi";
import "@/infrastructure/css/CatalogoUsuario.css";

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
  { label: "Limpieza", value: "limpieza", Icon: FiTag },
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

function Estrellas({ promedio, total }) {
  if (!promedio) return null;
  return (
    <div className="cu-estrellas">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar
          key={i}
          size={11}
          fill={i <= Math.round(promedio) ? "#f59e0b" : "none"}
          color={i <= Math.round(promedio) ? "#f59e0b" : "#d1d5db"}
        />
      ))}
      <span className="cu-estrellas-count">({total})</span>
    </div>
  );
}

export default function CatalogoUsuario() {
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();

  const [todos, setTodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tipoActivo, setTipoActivo] = useState("");
  const [cats, setCats] = useState([]);
  const [ordenar, setOrdenar] = useState("recientes");
  const [pagina, setPagina] = useState(1);
  const [rangoMax, setRangoMax] = useState(5000000);
  const [agregados, setAgregados] = useState({});
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favoritos") || "[]");
    } catch {
      return [];
    }
  });
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
  useEffect(() => {
    if (precioMax > 0) setRangoMax(precioMax);
  }, [precioMax]);

  const toggleCat = (val) => {
    setCats((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val],
    );
    setPagina(1);
  };

  const toggleFavorito = (e, id) => {
    e.stopPropagation();
    setFavoritos((prev) => {
      const nuevo = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem("favoritos", JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const handleAgregar = (e, p) => {
    e.stopPropagation();
    agregarAlCarrito({
      id_producto: p.id_producto,
      nombre_producto: p.nombre_producto,
      precio: p.precio,
      imagen: p.imagen,
      categoria: p.categoria,
    });
    setAgregados((prev) => ({ ...prev, [p.id_producto]: true }));
    setTimeout(
      () => setAgregados((prev) => ({ ...prev, [p.id_producto]: false })),
      2000,
    );
  };

  const limpiarFiltros = () => {
    setCats([]);
    setTipoActivo("");
    setRangoMax(precioMax);
    setPagina(1);
  };
  const hayFiltros = cats.length > 0 || tipoActivo || rangoMax < precioMax;

  const filtrados = useMemo(() => {
    let result = todos.filter((p) => {
      const matchB =
        p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.seccion?.emprendedora?.usuario?.nombre || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      const matchT = !tipoActivo || p.tipo === tipoActivo;
      const matchC =
        cats.length === 0 || cats.includes((p.categoria || "").toLowerCase());
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
      (p) =>
        (p.categoria || "").toLowerCase() === val &&
        (!tipoActivo || p.tipo === tipoActivo),
    ).length;

  const visible = filtrados.slice(0, pagina * POR_PAGINA);
  const hayMas = visible.length < filtrados.length;

  return (
    <div className="cu-page">
      {/* ── Hero ── */}
      <div className="cu-hero">
        <div className="cu-hero-blur cu-b1" />
        <div className="cu-hero-blur cu-b2" />
        <div className="cu-hero-content">
          <h1 className="cu-hero-titulo">Explorar Catálogo</h1>
          <p className="cu-hero-sub">
            <strong>{filtrados.length}</strong> productos y servicios
            disponibles
          </p>

          {/* Buscador */}
          <div className="cu-search-wrap">
            <FiSearch size={16} color="#94a3b8" />
            <input
              className="cu-search-input"
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
                className="cu-search-clear"
                onClick={() => setBusqueda("")}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Pills tipo */}
          <div className="cu-tipo-pills">
            {[
              { label: "Todo", value: "" },
              { label: "Productos", value: "producto" },
              { label: "Servicios", value: "servicio" },
            ].map((t) => (
              <button
                key={t.value}
                className={`cu-tipo-pill ${tipoActivo === t.value ? "active" : ""}`}
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
      <div className="cu-body">
        {/* Sidebar */}
        <aside className={`cu-sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="cu-sidebar-header">
            <div className="cu-sidebar-titulo">
              <FiSliders size={14} /> Filtros
              {hayFiltros && (
                <span className="cu-filtros-badge">
                  {cats.length +
                    (tipoActivo ? 1 : 0) +
                    (rangoMax < precioMax ? 1 : 0)}
                </span>
              )}
            </div>
            {hayFiltros && (
              <button className="cu-btn-limpiar" onClick={limpiarFiltros}>
                <FiX size={11} /> Limpiar
              </button>
            )}
          </div>

          {/* Precio */}
          <div className="cu-sidebar-seccion">
            <h4 className="cu-sidebar-seccion-titulo">Precio máximo</h4>
            <input
              type="range"
              min={0}
              max={precioMax}
              value={rangoMax}
              step={10000}
              className="cu-slider"
              onChange={(e) => {
                setRangoMax(Number(e.target.value));
                setPagina(1);
              }}
            />
            <div className="cu-precio-labels">
              <span>$0</span>
              <span className="cu-precio-val">{formatPrecio(rangoMax)}</span>
            </div>
          </div>

          {/* Tipo */}
          <div className="cu-sidebar-seccion">
            <h4 className="cu-sidebar-seccion-titulo">Tipo</h4>
            {[
              { label: "Productos", value: "producto", Icon: FiPackage },
              { label: "Servicios", value: "servicio", Icon: FiTag },
            ].map((t) => (
              <label
                key={t.value}
                className={`cu-check-label ${tipoActivo === t.value ? "active" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={tipoActivo === t.value}
                  onChange={() => {
                    setTipoActivo((prev) => (prev === t.value ? "" : t.value));
                    setPagina(1);
                  }}
                />
                <t.Icon size={13} />
                <span className="cu-check-txt">{t.label}</span>
              </label>
            ))}
          </div>

          {/* Categorías */}
          <div className="cu-sidebar-seccion">
            <h4 className="cu-sidebar-seccion-titulo">Categorías</h4>
            <div className="cu-cats-list">
              {CATEGORIAS.map((c) => (
                <label
                  key={c.value}
                  className={`cu-check-label ${cats.includes(c.value) ? "active" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={cats.includes(c.value)}
                    onChange={() => toggleCat(c.value)}
                  />
                  <c.Icon size={13} />
                  <span className="cu-check-txt">{c.label}</span>
                  <span className="cu-check-count">{contadorCat(c.value)}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="cu-main">
          {/* Toolbar */}
          <div className="cu-toolbar">
            <button
              className="cu-toggle-sidebar"
              onClick={() => setSidebarOpen((p) => !p)}
            >
              <FiSliders size={14} /> {sidebarOpen ? "Ocultar" : "Filtros"}
            </button>
            <span className="cu-toolbar-count">
              <strong>{visible.length}</strong> de{" "}
              <strong>{filtrados.length}</strong>
            </span>
            <div className="cu-ordenar-wrap">
              <select
                className="cu-ordenar"
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
              >
                {ORDENAR.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FiChevronDown size={13} className="cu-ordenar-icon" />
            </div>
          </div>

          {/* Pills categoría */}
          <div className="cu-cats-pills">
            <button
              className={`cu-cat-pill ${cats.length === 0 ? "active" : ""}`}
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
                className={`cu-cat-pill ${cats.includes(c.value) ? "active" : ""}`}
                onClick={() => toggleCat(c.value)}
              >
                <c.Icon size={12} /> {c.label}
                <span className="cu-cat-pill-count">
                  {contadorCat(c.value)}
                </span>
              </button>
            ))}
          </div>

          {/* Grid */}
          {cargando ? (
            <div className="cu-loading">
              <div className="cu-spinner" />
              <p>Cargando productos...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="cu-empty">
              <FiSearch size={48} color="#cbd5e1" />
              <h3>Sin resultados</h3>
              <p>Intenta con otros filtros o busca algo diferente</p>
              {hayFiltros && (
                <button
                  className="cu-btn-limpiar-grande"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="cu-grid">
                {visible.map((p, idx) => {
                  const agotado =
                    p.tipo !== "servicio" && p.inventario?.cantidad === 0;
                  const yaAgregado = agregados[p.id_producto];
                  const esFavorito = favoritos.includes(p.id_producto);
                  const calPromedio = p.comentarios?.length
                    ? p.comentarios.reduce(
                        (acc, c) => acc + c.calificacion,
                        0,
                      ) / p.comentarios.length
                    : 0;

                  return (
                    <div
                      key={p.id_producto}
                      className="cu-card"
                      style={{ animationDelay: `${(idx % 9) * 0.04}s` }}
                      onClick={() => navigate(`/producto/${p.id_producto}`)}
                    >
                      {/* Imagen */}
                      <div className="cu-card-img">
                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre_producto} />
                        ) : (
                          <div className="cu-no-img">
                            <FiPackage size={36} color="#cbd5e1" />
                          </div>
                        )}
                        {/* dentro de cu-card-img, después de la imagen */}
                        <div className="cu-card-img-overlay">
                          <span className="cu-card-ver-btn">
                            <FiEye size={16} /> Ver detalle
                          </span>
                        </div>
                        <span className={`cu-badge cu-badge--${p.tipo}`}>
                          {p.tipo}
                        </span>

                        {/* Favorito */}
                        <button
                          className={`cu-fav-btn ${esFavorito ? "active" : ""}`}
                          onClick={(e) => toggleFavorito(e, p.id_producto)}
                        >
                          <FiHeart
                            size={13}
                            fill={esFavorito ? "#ef4444" : "none"}
                            color={esFavorito ? "#ef4444" : "#94a3b8"}
                          />
                        </button>

                        {/* Agotado overlay */}
                        {agotado && (
                          <div className="cu-agotado-overlay">
                            <span>Agotado</span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="cu-card-body">
                        <span className="cu-card-cat">{p.categoria}</span>
                        <h3 className="cu-card-nombre">{p.nombre_producto}</h3>

                        <Estrellas
                          promedio={calPromedio}
                          total={p.comentarios?.length}
                        />

                        {p.descripcion && (
                          <p className="cu-card-desc">{p.descripcion}</p>
                        )}

                        {p.tipo === "servicio" && p.duracion && (
                          <div className="cu-card-duracion">
                            <FiClock size={11} /> {p.duracion}
                          </div>
                        )}

                        <span className="cu-card-tienda">
                          <FiTag size={11} />{" "}
                          {p.seccion?.alianza
                            ? p.seccion.alianza.participantes
                                ?.map((p) => p.usuario?.nombre)
                                .join(" & ")
                            : p.seccion?.emprendedora?.usuario?.nombre || "EVA"}
                        </span>

                        <div className="cu-card-footer">
                          <span className="cu-card-precio">
                            {formatPrecio(p.precio)}
                          </span>
                          <button
                            disabled={agotado}
                            className={`cu-btn-agregar ${yaAgregado ? "agregado" : ""} ${agotado ? "agotado" : ""}`}
                            onClick={(e) => handleAgregar(e, p)}
                          >
                            {yaAgregado ? (
                              <>
                                <FiCheck size={13} /> Listo
                              </>
                            ) : agotado ? (
                              "Agotado"
                            ) : p.tipo === "servicio" ? (
                              "Reservar"
                            ) : (
                              <>
                                <FiShoppingCart size={13} /> Agregar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hayMas && (
                <div className="cu-cargar-mas-wrap">
                  <button
                    className="cu-btn-cargar-mas"
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
