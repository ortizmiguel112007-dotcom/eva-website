import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthConten";
import { FiPackage } from "react-icons/fi";

import { tiendaService } from "../services/tienda.service";
import { useProductoAcciones } from "@/features/tienda/hooks/useProductoAcciones";
// import { ProductCardGrid } from "../components/shared/ProductCardGrid"
import { TiendaHero } from "../components/tiendas/TiendaHero";
import { TiendaToolbar } from "../components/tiendas/TiendaToolbar";
import { ProductoListItem } from "../components/tiendas/ProductoListItem";
import { ProductCard } from "@/shared/product/ProductCard";

import "@/infrastructure/css/tienda/tiendas-perfil/PerfilTienda.css";

export default function PerfilTienda() {
  const { id_emprendedora } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const puedeComprar = !user || user.rol === "usuario";
  const acciones = useProductoAcciones();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [vista, setVista] = useState("grid");

  const nombreTienda =
    productos[0]?.seccion?.emprendedora?.usuario?.nombre || "Tienda";

  useEffect(() => {
    tiendaService
      .obtenerProductos(id_emprendedora)
      .then(setProductos)
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [id_emprendedora]);

  const filtrados = productos.filter(
    (p) => filtroTipo === "todos" || p.tipo === filtroTipo,
  );

  if (cargando)
    return (
      <div className="pt-loading">
        <div className="pt-spinner" />
        <p>Cargando tienda...</p>
      </div>
    );

  return (
    <div className="pt-page">
      <TiendaHero
        nombreTienda={nombreTienda}
        productos={productos}
        onVolver={() => navigate("/tiendas")}
      />

      <TiendaToolbar
        productos={productos}
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        vista={vista}
        setVista={setVista}
      />

      <div className="pt-contenido">
        {filtrados.length === 0 ? (
          <div className="pt-empty">
            <FiPackage size={48} color="#cbd5e1" />
            <h3>Sin productos en esta categoría</h3>
            <p>Prueba con otro filtro</p>
          </div>
        ) : vista === "grid" ? (
          <div className="pt-grid">
            {filtrados.map((p, idx) => (
              <ProductCard // 🆕
                key={p.id_producto}
                producto={p}
                idx={idx}
                onNavigate={(id) => navigate(`/producto/${id}`)}
                onAgregar={acciones.handleAgregar}
                onFavorito={puedeComprar ? acciones.toggleFav : undefined}
                esFavorito={acciones.esFavorito(p.id_producto)}
                yaAgregado={acciones.yaAgregado(p.id_producto)}
                puedeComprar={puedeComprar}
              />
            ))}
          </div>
        ) : (
          <div className="pt-lista">
            {filtrados.map((p, idx) => (
              <ProductoListItem // ← lista se mantiene
                key={p.id_producto}
                p={p}
                onNavigate={(id) => navigate(`/producto/${id}`)}
                acciones={acciones}
                puedeComprar={puedeComprar}
                style={{ animationDelay: `${idx * 0.04}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
