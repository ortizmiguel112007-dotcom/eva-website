import { useState, useEffect } from "react";
import { comentarioService } from "@/features/products/services/comentario.service";
import "@/infrastructure/css/comentarios.css";

export default function Comentarios() {
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [busqueda, setBusqueda]       = useState("");
  const [filtroEstrellas, setFiltroEstrellas] = useState("todos");
  const [toast, setToast]             = useState(null);

  // ── cargar ─────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await comentarioService.listar();
        setComentarios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── ocultar ────────────────────────────────────────────────
  const handleOcultar = async (id_comentario) => {
    if (!confirm("¿Ocultar este comentario?")) return;
    try {
      await comentarioService.ocultar(id_comentario);
      setComentarios(prev => prev.filter(c => c.id_comentario !== id_comentario));
      mostrarToast("Comentario ocultado");
    } catch (err) {
      mostrarToast("Error al ocultar comentario");
    }
  };

  // ── filtrado ───────────────────────────────────────────────
  const filtrados = comentarios.filter(c => {
    const matchBusqueda =
      c.texto.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.usuario?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.producto_nombre?.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstrellas =
      filtroEstrellas === "todos" || c.calificacion === Number(filtroEstrellas);

    return matchBusqueda && matchEstrellas;
  });

  // ── promedio ───────────────────────────────────────────────
  const promedio = comentarios.length > 0
    ? (comentarios.reduce((acc, c) => acc + c.calificacion, 0) / comentarios.length).toFixed(1)
    : "—";

  // ── estrellas ──────────────────────────────────────────────
  const renderEstrellas = (calificacion) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < calificacion ? "estrella-llena" : "estrella-vacia"}>★</span>
    ));

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  const getInitials = (nombre) =>
    nombre ? nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "?";

  if (cargando) return <div className="comentarios-container"><p>Cargando comentarios...</p></div>;

  return (
    <div className="comentarios-container">

      {/* Header */}
      <div className="comentarios-header">
        <h1>Comentarios y Calificaciones</h1>
      </div>
      <p className="comentarios-subtitle">
        Reseñas de tus clientes sobre tus productos y servicios.
      </p>

      {/* Métricas */}
      <div className="comentarios-metricas">
        <div className="comentario-metrica">
          <h3>{comentarios.length}</h3>
          <span>Total reseñas</span>
        </div>
        <div className="comentario-metrica promedio">
          <h3>{promedio} ★</h3>
          <span>Calificación promedio</span>
        </div>
        {[5, 4, 3].map(n => (
          <div key={n} className="comentario-metrica">
            <h3>{comentarios.filter(c => c.calificacion === n).length}</h3>
            <span>{"★".repeat(n)} estrellas</span>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="comentarios-filtros">
        <input
          type="text"
          className="comentarios-search"
          placeholder="Buscar por cliente o producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select
          className="comentarios-select"
          value={filtroEstrellas}
          onChange={e => setFiltroEstrellas(e.target.value)}
        >
          <option value="todos">Todas las calificaciones</option>
          <option value="5">★★★★★ 5 estrellas</option>
          <option value="4">★★★★ 4 estrellas</option>
          <option value="3">★★★ 3 estrellas</option>
          <option value="2">★★ 2 estrellas</option>
          <option value="1">★ 1 estrella</option>
        </select>
      </div>

      {/* Lista */}
      <div className="comentarios-lista">
        {filtrados.length === 0 ? (
          <div className="comentarios-empty">
            {comentarios.length === 0
              ? "Aún no tienes comentarios en tus productos"
              : "No hay comentarios que coincidan con los filtros"}
          </div>
        ) : (
          filtrados.map(comentario => (
            <div key={comentario.id_comentario} className="comentario-card">

              {/* Header */}
              <div className="comentario-card-header">
                <div className="comentario-usuario-info">
                  <div className="comentario-avatar">
                    {getInitials(comentario.usuario?.nombre)}
                  </div>
                  <div>
                    <div className="comentario-usuario-nombre">
                      {comentario.usuario?.nombre}
                    </div>
                    <div className="comentario-fecha">
                      {formatFecha(comentario.fecha)}
                    </div>
                  </div>
                </div>
                <div className="comentario-estrellas">
                  {renderEstrellas(comentario.calificacion)}
                </div>
              </div>

              {/* Producto */}
              <div className="comentario-producto">
                {comentario.producto_imagen
                  ? <img src={comentario.producto_imagen} alt={comentario.producto_nombre} className="comentario-producto-img" />
                  : <div className="comentario-producto-sin-img">📦</div>
                }
                <span className="comentario-producto-nombre">{comentario.producto_nombre}</span>
              </div>

              {/* Texto */}
              <p className="comentario-texto">{comentario.texto}</p>

              {/* Footer */}
              <div className="comentario-card-footer">
                <span className="comentario-calificacion-num">
                  {comentario.calificacion}/5 estrellas
                </span>
                <button
                  className="btn-ocultar-comentario"
                  onClick={() => handleOcultar(comentario.id_comentario)}
                >
                  Ocultar
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && <div className="comentarios-toast">{toast}</div>}

    </div>
  );
}