import { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";

import { TablaProductosAdmin } from "../components/productos/TablaProductosAdmin";
import { PaginacionSimple } from "@/features/usuario/components/historial/PaginacionSimple";
import { getHeaders } from "@/features/admin/utils/utils";

import "@/infrastructure/css/admin/productos/AdminProductos.css";
import "@/infrastructure/css/auth/CrudAdmin.css";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PAGE_SIZE = 10;

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [toast, setToast] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [modalAccion, setModalAccion] = useState(null); // 🆕
  const [motivo, setMotivo] = useState(""); // 🆕
  const [errorMotivo, setErrorMotivo] = useState(""); // 🆕

  useEffect(() => {
    axios
      .get(`${BASE}/api/items/admin/todos`, { headers: getHeaders() })
      .then((res) => setProductos(res.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtro]);

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleVisible = async (id, visible) => {
    try {
      await axios.patch(
        `${BASE}/api/items/${id}/visible`,
        {},
        { headers: getHeaders() },
      );
      setProductos((prev) =>
        prev.map((p) =>
          p.id_producto === id ? { ...p, visible: !visible } : p,
        ),
      );
      mostrarToast(visible ? "Producto ocultado" : "Producto visible");
    } catch {
      mostrarToast("Error al cambiar visibilidad", "error");
    }
  };

  const toggleDestacado = async (id, destacado) => {
    try {
      await axios.put(
        `${BASE}/api/destacados/${id}`,
        {},
        { headers: getHeaders() },
      );
      setProductos((prev) =>
        prev.map((p) =>
          p.id_producto === id ? { ...p, destacado: !destacado } : p,
        ),
      );
      mostrarToast(
        destacado ? "Quitado de destacados" : "Marcado como destacado",
      );
    } catch {
      mostrarToast("Error", "error");
    }
  };

  // 🆕 Aprobar
  const aprobarProducto = async (id) => {
    try {
      await axios.patch(
        `${BASE}/api/items/${id}/aprobar`,
        {},
        { headers: getHeaders() },
      );
      setProductos((prev) =>
        prev.map((p) =>
          p.id_producto === id
            ? { ...p, estado_producto: "activo", visible: true }
            : p,
        ),
      );
      mostrarToast("Producto aprobado");
    } catch {
      mostrarToast("Error al aprobar", "error");
    }
  };

  // 🆕 Ejecutar acción del modal (rechazar/eliminar)
  const ejecutarAccion = async () => {
    if (!motivo.trim()) {
      setErrorMotivo("El motivo es obligatorio");
      return;
    }
    try {
      await axios.delete(
        `${BASE}/api/items/${modalAccion.producto.id_producto}`,
        { headers: getHeaders(), data: { motivo } },
      );
      setProductos((prev) =>
        prev.filter((p) => p.id_producto !== modalAccion.producto.id_producto),
      );
      mostrarToast(
        modalAccion.tipo === "rechazar"
          ? "Producto rechazado"
          : "Producto deshabilitado",
      );
    } catch (err) {
      mostrarToast(
        err.response?.data?.error || "Error al ejecutar acción",
        "error",
      );
    } finally {
      setModalAccion(null);
      setMotivo("");
      setErrorMotivo("");
    }
  };

  const filtrados = productos.filter((p) => {
    const matchB =
      p.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.seccion?.emprendedora?.usuario?.nombre
        ?.toLowerCase()
        .includes(busqueda.toLowerCase());
    const matchF =
      filtro === "todos"
        ? true
        : filtro === "pendientes"
          ? p.estado_producto === "pendiente" // 🆕
          : filtro === "activos"
            ? p.visible
            : filtro === "ocultos"
              ? !p.visible
              : filtro === "destacados"
                ? p.destacado
                : true;
    return matchB && matchF;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const productosPagina = filtrados.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE,
  );

  return (
    <div className="ap-container">
      {toast && <div className={`ap-toast ${toast.tipo}`}>{toast.msg}</div>}

      <div className="ap-header">
        <h1>Gestionar Productos</h1>
        <p>Supervisa y modera todos los productos de la plataforma</p>
      </div>

      <div className="ap-metricas">
        <div className="ap-metrica-card">
          <p>Total</p>
          <strong className="ap-metrica-valor total">{productos.length}</strong>
        </div>
        <div className="ap-metrica-card">
          <p>Pendientes</p>
          <strong className="ap-metrica-valor" style={{ color: "#f59e0b" }}>
            {productos.filter((p) => p.estado_producto === "pendiente").length}
          </strong>
        </div>
        <div className="ap-metrica-card">
          <p>Visibles</p>
          <strong className="ap-metrica-valor visibles">
            {productos.filter((p) => p.visible).length}
          </strong>
        </div>
        <div className="ap-metrica-card">
          <p>Ocultos</p>
          <strong className="ap-metrica-valor ocultos">
            {productos.filter((p) => !p.visible).length}
          </strong>
        </div>
        <div className="ap-metrica-card">
          <p>Destacados</p>
          <strong className="ap-metrica-valor destacados">
            {productos.filter((p) => p.destacado).length}
          </strong>
        </div>
      </div>

      <div className="ap-filtros">
        <div className="ap-search-box">
          <FiSearch size={14} color="#94a3b8" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto o emprendedora..."
          />
          {busqueda && (
            <button className="ap-search-clear" onClick={() => setBusqueda("")}>
              <FiX size={13} />
            </button>
          )}
        </div>
        <select
          className="ap-select"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="pendientes">Pendientes</option>
          <option value="activos">Visibles</option>
          <option value="ocultos">Ocultos</option>
          <option value="destacados">Destacados</option>
        </select>
      </div>

      {cargando ? (
        <p className="ap-loading">Cargando...</p>
      ) : (
        <>
          <TablaProductosAdmin
            productos={productosPagina}
            pagina={pagina}
            onToggleVisible={toggleVisible}
            onToggleDestacado={toggleDestacado}
            onAprobar={aprobarProducto}
            onRechazar={(p) => {
              setModalAccion({ producto: p, tipo: "rechazar" });
              setMotivo("");
              setErrorMotivo("");
            }}
            onEliminar={(p) => {
              setModalAccion({ producto: p, tipo: "eliminar" });
              setMotivo("");
              setErrorMotivo("");
            }}
          />
          <PaginacionSimple
            pagina={pagina}
            totalPaginas={totalPaginas}
            setPagina={setPagina}
            total={filtrados.length}
            labelSingular="producto"
            labelPlural="productos"
          />
        </>
      )}

      {/* ── Modal confirmación ── */}
      {modalAccion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => {
            setModalAccion(null);
            setMotivo("");
            setErrorMotivo("");
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "1rem",
              padding: "1.75rem",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {modalAccion.tipo === "rechazar"
                ? "Rechazar producto"
                : "Deshabilitar producto"}
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              <strong>{modalAccion.producto.nombre_producto}</strong>
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Motivo *
              </label>
              <textarea
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setErrorMotivo("");
                }}
                placeholder="Describe el motivo..."
                rows={3}
                style={{
                  padding: "0.6rem 0.85rem",
                  borderRadius: "0.55rem",
                  border: `1.5px solid ${errorMotivo ? "#ef4444" : "#e5e7eb"}`,
                  fontFamily: "inherit",
                  fontSize: "0.88rem",
                  resize: "vertical",
                  boxSizing: "border-box",
                  width: "100%",
                  outline: "none",
                  background: "#f9fafb",
                }}
              />
              {errorMotivo && (
                <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: 0 }}>
                  {errorMotivo}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setModalAccion(null);
                  setMotivo("");
                  setErrorMotivo("");
                }}
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "0.55rem",
                  border: "1.5px solid #e5e7eb",
                  background: "transparent",
                  color: "#6b7280",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarAccion}
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "0.55rem",
                  border: "none",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#fff",
                  background:
                    modalAccion.tipo === "rechazar" ? "#f59e0b" : "#ef4444",
                }}
              >
                {modalAccion.tipo === "rechazar" ? "Rechazar" : "Deshabilitar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
