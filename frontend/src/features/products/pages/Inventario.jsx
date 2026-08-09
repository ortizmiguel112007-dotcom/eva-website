import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { inventarioService } from "@/features/products/services/inventario.service";

import { MetricasInventario } from "../components/inventario/MetricasInventario";
import { TablaInventario } from "../components/inventario/TablaInventario";
import { ModalEditarStock } from "../components/inventario/ModalEditarStock";
import { HistorialStock } from "../components/inventario/HistorialStock";
import { PaginacionSimple } from "@/features/usuario/components/historial/PaginacionSimple";

import "@/infrastructure/css/products-emprend/inventario/Inventario.css";
import "@/infrastructure/css/auth/CrudAdmin.css";

const POR_PAGINA = 10;

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
  const [pagina, setPagina] = useState(1);
  const [historialItem, setHistorialItem] = useState(null);

  useEffect(() => {
    inventarioService
      .listar()
      .then(setItems)
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

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

  const guardarStock = async (datos) => {
    if (!modal) return;
    setGuardando(true);
    try {
      await inventarioService.actualizarStock(modal.id_producto, datos);
      setItems((prev) =>
        prev.map((i) =>
          i.id_producto === modal.id_producto
            ? {
                ...i,
                cantidad: datos.cantidad,
                stock_minimo: datos.stock_minimo,
                stock_maximo: datos.stock_maximo,
                alerta: datos.cantidad <= datos.stock_minimo,
              }
            : i,
        ),
      );
      setModal(null);
      mostrarToast("Stock actualizado correctamente");
    } catch {
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
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const filtradosPagina = filtrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  if (cargando)
    return (
      <div className="inventario-container">
        <p>Cargando inventario...</p>
      </div>
    );

  return (
    <div className="inventario-container">
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

      <MetricasInventario items={items} />

      <TablaInventario
        items={filtradosPagina}
        onEditar={abrirModal}
        onVerHistorial={setHistorialItem}
      />

      <PaginacionSimple
        pagina={pagina}
        totalPaginas={totalPaginas}
        setPagina={setPagina}
        total={filtrados.length}
        labelSingular="producto"
        labelPlural="productos"
      />

      <ModalEditarStock
        item={modal}
        form={form}
        setForm={setForm}
        guardando={guardando}
        onGuardar={guardarStock}
        onCerrar={() => setModal(null)}
      />

      {historialItem && ( 
        <HistorialStock
          item={historialItem}
          onCerrar={() => setHistorialItem(null)}
        />
      )}

      {toast && <div className="inv-toast">{toast}</div>}
    </div>
  );
}
