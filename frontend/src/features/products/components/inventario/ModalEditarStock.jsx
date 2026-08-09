import { useState } from "react";
import { FiX, FiPlus, FiEdit3 } from "react-icons/fi";
import "@/infrastructure/css/products-emprend/inventario/ModalEditarStock.css";

export function ModalEditarStock({
  item,
  form,
  setForm,
  guardando,
  onGuardar,
  onCerrar,
}) {
  if (!item) return null;

  const [modoSuma, setModoSuma] = useState(false);
  const [cantidadASumar, setCantidadASumar] = useState("");
  const [errors, setErrors] = useState({});

  const set = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => ({ ...prev, [campo]: null }));
  };

  const validar = () => {
    const e = {};
    if (modoSuma) {
      if (!cantidadASumar || Number(cantidadASumar) < 1)
        e.sumar = "Debe ser mayor a 0";
    } else {
      if (Number(form.cantidad) < 0) e.cantidad = "No puede ser negativo";
    }
    if (Number(form.stock_minimo) < 0) e.stock_minimo = "No puede ser negativo";
    if (Number(form.stock_maximo) < 0) e.stock_maximo = "No puede ser negativo";
    if (Number(form.stock_minimo) > Number(form.stock_maximo))
      e.stock_minimo = "El mínimo no puede ser mayor al máximo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;

    if (modoSuma) {
      // Calcular directamente sin depender del estado
      const cantidadFinal = item.cantidad + Number(cantidadASumar);
      onGuardar({
        cantidad: cantidadFinal,
        stock_minimo: Number(form.stock_minimo),
        stock_maximo: Number(form.stock_maximo),
      });
    } else {
      onGuardar({
        cantidad: Number(form.cantidad),
        stock_minimo: Number(form.stock_minimo),
        stock_maximo: Number(form.stock_maximo),
      });
    }
  };

  const cambiarModo = (suma) => {
    setModoSuma(suma);
    setCantidadASumar("");
    setErrors({});
    // Restaurar cantidad original al cambiar de modo
    setForm((prev) => ({ ...prev, cantidad: String(item.cantidad) }));
  };

  return (
    <div className="inv-modal-overlay" onClick={onCerrar}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="inv-modal-header">
          <div className="inv-modal-header-top">
            <div>
              <h3>Editar Stock</h3>
              <span>{item.nombre}</span>
            </div>
            <button className="inv-modal-cerrar" onClick={onCerrar}>
              <FiX size={16} />
            </button>
          </div>

          <div className="inv-modal-tabs">
            <button
              className={`inv-tab ${!modoSuma ? "activo" : ""}`}
              onClick={() => cambiarModo(false)}
            >
              <FiEdit3 size={13} /> Establecer cantidad
            </button>
            <button
              className={`inv-tab ${modoSuma ? "activo" : ""}`}
              onClick={() => cambiarModo(true)}
            >
              <FiPlus size={13} /> Agregar al stock
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="inv-modal-body">
          {/* Stock actual */}
          <div className="inv-stock-actual">
            <span className="inv-stock-actual-label">Stock actual</span>
            <span className="inv-stock-actual-valor">{item.cantidad}</span>
          </div>

          {modoSuma ? (
            <div className="inv-modal-field">
              <label>Cantidad a agregar</label>
              <input
                type="number"
                min="1"
                value={cantidadASumar}
                onChange={(e) => {
                  setCantidadASumar(e.target.value);
                  setErrors((p) => ({ ...p, sumar: null }));
                }}
                placeholder="Ej: 10"
                className={errors.sumar ? "error" : ""}
              />
              {errors.sumar && (
                <span className="inv-field-error">{errors.sumar}</span>
              )}
              {cantidadASumar && Number(cantidadASumar) > 0 && (
                <span className="inv-preview">
                  Resultado: {item.cantidad} + {cantidadASumar} ={" "}
                  <strong>{item.cantidad + Number(cantidadASumar)}</strong>
                </span>
              )}
            </div>
          ) : (
            <div className="inv-modal-field">
              <label>Nueva cantidad</label>
              <input
                type="number"
                min="0"
                value={form.cantidad}
                onChange={(e) => set("cantidad", e.target.value)}
                placeholder="Ingresa la nueva cantidad"
                className={errors.cantidad ? "error" : ""}
              />
              {errors.cantidad && (
                <span className="inv-field-error">{errors.cantidad}</span>
              )}
            </div>
          )}

          <div className="inv-modal-row">
            <div className="inv-modal-field">
              <label>Stock mínimo</label>
              <input
                type="number"
                min="0"
                value={form.stock_minimo}
                onChange={(e) => set("stock_minimo", e.target.value)}
                className={errors.stock_minimo ? "error" : ""}
              />
              {errors.stock_minimo && (
                <span className="inv-field-error">{errors.stock_minimo}</span>
              )}
            </div>
            <div className="inv-modal-field">
              <label>Stock máximo</label>
              <input
                type="number"
                min="0"
                value={form.stock_maximo}
                onChange={(e) => set("stock_maximo", e.target.value)}
                className={errors.stock_maximo ? "error" : ""}
              />
              {errors.stock_maximo && (
                <span className="inv-field-error">{errors.stock_maximo}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="inv-modal-buttons">
          <button className="btn-cancelar-inv" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            className="btn-guardar-inv"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
