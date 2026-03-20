import { useState, useEffect } from "react";
import { inventarioService } from "@/features/products/services/inventario.service";
import { FiEdit } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import "@/infrastructure/css/inventario.css";

// determina el estado semáforo
const getEstado = (cantidad, stock_minimo) => {
  if (cantidad === 0) return "vacio";
  if (cantidad <= stock_minimo) return "bajo";
  return "ok";
};

// porcentaje para la barra (respecto al máximo)
const getPorcentaje = (cantidad, stock_maximo) => {
  if (!stock_maximo || stock_maximo === 0) return 0;
  return Math.min(100, Math.round((cantidad / stock_maximo) * 100));
};

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    cantidad: "",
    stock_minimo: "",
    stock_maximo: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);

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

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const abrirModal = (item) => {
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

  // métricas
  const totalProductos = items.length;
  const stockBajo = items.filter(
    (i) => i.cantidad > 0 && i.cantidad <= i.stock_minimo,
  ).length;
  const sinStock = items.filter((i) => i.cantidad === 0).length;

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
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="inv-empty">
                    No hay productos en el inventario
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((item) => {
                const estado = getEstado(item.cantidad, item.stock_minimo);
                const porcentaje = getPorcentaje(
                  item.cantidad,
                  item.stock_maximo,
                );

                return (
                  <tr key={item.id_producto}>
                    {/* Producto */}
                    <td>
                      <div className="inv-producto-info">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="inv-producto-img"
                          />
                        ) : (
                          <div className="inv-producto-sin-img">📦</div>
                        )}
                        <div>
                          <div className="inv-producto-nombre">
                            {item.nombre}
                          </div>
                          <div className="inv-producto-categoria">
                            {item.categoria || "Sin categoría"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td>
                      <span className={`inv-cantidad-num ${estado}`}>
                        {item.cantidad}
                      </span>
                    </td>

                    {/* Barra progreso */}
                    <td>
                      <div className="inv-progreso-wrapper">
                        <div className="inv-progreso-labels">
                          <span>Min: {item.stock_minimo}</span>
                          <span>Max: {item.stock_maximo}</span>
                        </div>
                        <div className="inv-progreso-bar">
                          <div
                            className={`inv-progreso-fill ${estado}`}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td>
                      <span className={`badge-alerta ${estado}`}>
                        {estado === "vacio"
                          ? "⊗ Sin Stock"
                          : estado === "bajo"
                            ? "⚠ Stock Bajo"
                            : "✓ Stock OK"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td>
                      <button
                        className="btn-editar-stock"
                        onClick={() => abrirModal(item)}
                      >
                        <FiEdit size={13} /> Editar Stock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
              <input
                type="number"
                min="0"
                value={form.cantidad}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cantidad: e.target.value }))
                }
              />
            </div>

            <div className="inv-modal-field">
              <label>Stock mínimo</label>
              <input
                type="number"
                min="0"
                value={form.stock_minimo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, stock_minimo: e.target.value }))
                }
              />
            </div>

            <div className="inv-modal-field">
              <label>Stock máximo</label>
              <input
                type="number"
                min="0"
                value={form.stock_maximo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, stock_maximo: e.target.value }))
                }
              />
            </div>

            <div className="inv-modal-buttons">
              <button
                className="btn-cancelar-inv"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-guardar-inv"
                onClick={guardarStock}
                disabled={guardando}
              >
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
