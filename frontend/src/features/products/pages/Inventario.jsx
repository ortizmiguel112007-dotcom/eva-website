import { useState, useEffect } from "react";
import { inventarioService } from "@/features/products/services/inventario.service";
import { FiEdit, FiSearch } from "react-icons/fi";
import "@/infrastructure/css/inventario.css";

const getEstado = (item) => {
  if (item.tipo === "servicio") return "servicio";
  if (item.cantidad === 0) return "vacio";
  if (item.cantidad <= item.stock_minimo) return "bajo";
  return "ok";
};

const getPorcentaje = (cantidad, stock_maximo) => {
  if (!stock_maximo || stock_maximo === 0) return 0;
  return Math.min(100, Math.round((cantidad / stock_maximo) * 100));
};

export default function Inventario() {
  const [items, setItems]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [busqueda, setBusqueda]   = useState("");
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState({ cantidad: "", stock_minimo: "", stock_maximo: "" });
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast]         = useState(null);
  const [pagina, setPagina]       = useState(1);
  const POR_PAGINA = 10;

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await inventarioService.listar();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => { setPagina(1); }, [busqueda]);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const abrirModal = (item) => {
    if (item.tipo === "servicio") return;
    setModal(item);
    setForm({
      cantidad: String(item.cantidad),
      stock_minimo: String(item.stock_minimo),
      stock_maximo: String(item.stock_maximo),
    });
  };

  const guardarStock = async () => {
    if (!modal) return;
    setGuardando(true);
    try {
      await inventarioService.actualizarStock(modal.id_producto, {
        cantidad: Number(form.cantidad),
        stock_minimo: Number(form.stock_minimo),
        stock_maximo: Number(form.stock_maximo),
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id_producto === modal.id_producto
            ? {
                ...i,
                cantidad: Number(form.cantidad),
                stock_minimo: Number(form.stock_minimo),
                stock_maximo: Number(form.stock_maximo),
                alerta: Number(form.cantidad) <= Number(form.stock_minimo),
              }
            : i,
        ),
      );
      setModal(null);
      mostrarToast("Stock actualizado correctamente");
    } catch (err) {
      mostrarToast("Error al actualizar stock");
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = items.filter(
    (i) =>
      i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (i.categoria || "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  const totalPaginas    = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const filtradosPagina = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totalProductos = items.length;
  const stockBajo = items.filter(
    (i) => i.tipo !== "servicio" && i.cantidad > 0 && i.cantidad <= i.stock_minimo,
  ).length;
  const sinStock = items.filter(
    (i) => i.tipo !== "servicio" && i.cantidad === 0,
  ).length;

  if (cargando)
    return (
      <div className="inventario-container">
        <p>Cargando inventario...</p>
      </div>
    );

  return (
    <div className="inventario-container">

      {/* Header */}
      <div className="inventario-header">
        <h1>Stock e Inventario</h1>
        <div className="inventario-search-wrapper">
          <FiSearch className="inventario-search-icon" />
          <input
            type="text"
            className="inventario-search"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Métricas */}
      <div className="inventario-metricas">
        <div className="metrica-box">
          <h3>{totalProductos}</h3>
          <span>Total Productos</span>
        </div>
        <div className="metrica-box alerta">
          <h3>{stockBajo}</h3>
          <span>Stock Bajo</span>
        </div>
        <div className="metrica-box peligro">
          <h3>{sinStock}</h3>
          <span>Sin Stock</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="inventario-tabla-wrapper">
        <table className="inventario-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Mín / Máx</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradosPagina.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="inv-empty">No hay productos en el inventario</div>
                </td>
              </tr>
            ) : (
              filtradosPagina.map((item) => {
                const estado     = getEstado(item);
                const esServicio = item.tipo === "servicio";
                const porcentaje = esServicio ? 100 : getPorcentaje(item.cantidad, item.stock_maximo);

                return (
                  <tr key={item.id_producto}>
                    <td>
                      <div className="inv-producto-info">
                        {item.imagen ? (
                          <img src={item.imagen} alt={item.nombre} className="inv-producto-img" />
                        ) : (
                          <div className="inv-producto-sin-img">{esServicio ? "✂️" : "📦"}</div>
                        )}
                        <div>
                          <div className="inv-producto-nombre">
                            {item.nombre}
                            {item.es_alianza && (
                              <span style={{
                                marginLeft: "0.5rem", fontSize: "0.62rem", fontWeight: 700,
                                padding: "2px 7px", borderRadius: "999px",
                                background: "rgba(99,102,241,0.1)", color: "#6366f1",
                                border: "1px solid rgba(99,102,241,0.3)", verticalAlign: "middle",
                              }}>
                                Alianza
                              </span>
                            )}
                          </div>
                          <div className="inv-producto-categoria">
                            {item.es_alianza && item.nombre_seccion
                              ? item.nombre_seccion
                              : item.categoria || "Sin categoría"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      {esServicio ? (
                        <span className="inv-cantidad-num ok">—</span>
                      ) : (
                        <span className={`inv-cantidad-num ${estado}`}>{item.cantidad}</span>
                      )}
                    </td>

                    <td>
                      {esServicio ? (
                        <span style={{ color: "#6b7280", fontSize: "0.82rem" }}>No aplica</span>
                      ) : (
                        <div className="inv-progreso-wrapper">
                          <div className="inv-progreso-labels">
                            <span>Min: {item.stock_minimo}</span>
                            <span>Max: {item.stock_maximo}</span>
                          </div>
                          <div className="inv-progreso-bar">
                            <div className={`inv-progreso-fill ${estado}`} style={{ width: `${porcentaje}%` }} />
                          </div>
                        </div>
                      )}
                    </td>

                    <td>
                      {esServicio ? (
                        <span className="badge-alerta servicio">✦ Servicio</span>
                      ) : (
                        <span className={`badge-alerta ${estado}`}>
                          {estado === "vacio" ? "⊗ Sin Stock" : estado === "bajo" ? "⚠ Stock Bajo" : "✓ Stock OK"}
                        </span>
                      )}
                    </td>

                    <td>
                      {esServicio ? (
                        <button className="btn-editar-stock" disabled style={{ opacity: 0.4, cursor: "not-allowed" }}>
                          <FiEdit size={13} /> No aplica
                        </button>
                      ) : (
                        <button className="btn-editar-stock" onClick={() => abrirModal(item)}>
                          <FiEdit size={13} /> Editar Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="crud-pagination">
          <span className="pagination-info">
            {filtrados.length} producto{filtrados.length !== 1 ? "s" : ""} · Página {pagina} de {totalPaginas}
          </span>
          <div className="pagination-controls">
            <button className="page-btn page-btn-arrow" onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
            <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn ${n === pagina ? "page-btn-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
            ))}
            <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>›</button>
            <button className="page-btn page-btn-arrow" onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>»</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="inv-modal-overlay" onClick={() => setModal(null)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>Editar Stock</h3>
              <span>{modal.nombre}</span>
            </div>
            <div className="inv-modal-field">
              <label>Cantidad actual</label>
              <input type="number" min="0" value={form.cantidad}
                onChange={(e) => setForm((prev) => ({ ...prev, cantidad: e.target.value }))} />
            </div>
            <div className="inv-modal-field">
              <label>Stock mínimo</label>
              <input type="number" min="0" value={form.stock_minimo}
                onChange={(e) => setForm((prev) => ({ ...prev, stock_minimo: e.target.value }))} />
            </div>
            <div className="inv-modal-field">
              <label>Stock máximo</label>
              <input type="number" min="0" value={form.stock_maximo}
                onChange={(e) => setForm((prev) => ({ ...prev, stock_maximo: e.target.value }))} />
            </div>
            <div className="inv-modal-buttons">
              <button className="btn-cancelar-inv" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-guardar-inv" onClick={guardarStock} disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="inv-toast">{toast}</div>}
    </div>
  );
}
