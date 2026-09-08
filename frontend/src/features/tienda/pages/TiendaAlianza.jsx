import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPackage } from "react-icons/fi";
import { useAuth } from "@/core/context/AuthConten";

import { useProductoAcciones } from "@/features/tienda/hooks/useProductoAcciones";
import { ProductCardGrid } from "@/features/tienda/components/shared/ProductCardGrid";
import { AlianzaHero } from "../components/tiendas/AlianzaHero";
import { AlianzaStats } from "../components/tiendas/AlianzaStats";

import "@/infrastructure/css/tienda/tiendas-perfil/TiendaAlianza.css";
import "@/infrastructure/css/tienda/tiendas-perfil/PerfilTienda.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function TiendaAlianza() {
  const { id_alianza } = useParams();
  const navigate = useNavigate();
  const acciones = useProductoAcciones();

  const [alianza, setAlianza] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { user } = useAuth();
  const puedeComprar = user?.rol === "usuario" || !user;

  useEffect(() => {
    axios
      .get(`${API_URL}/api/publico/alianza/${id_alianza}`)
      .then((r) => setAlianza(r.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [id_alianza]);

  if (cargando)
    return (
      <div className="pt-loading">
        <div className="pt-spinner" />
        <p>Cargando tienda...</p>
      </div>
    );
  if (!alianza)
    return (
      <div className="pt-empty">
        <p>Alianza no encontrada</p>
      </div>
    );

  const productosAlianza = alianza.secciones?.flatMap((s) => s.productos) || [];
  const participantes = alianza.participantes || [];

  return (
    <div className="pt-page">
      <AlianzaHero alianza={alianza} onVolver={() => navigate(-1)} />

      <div className="pt-contenido">
        <AlianzaStats
          totalProductos={productosAlianza.length}
          totalParticipantes={participantes.length}
        />

        <h2 className="ta-seccion-titulo">Productos de la Campaña</h2>

        {productosAlianza.length === 0 ? (
          <div className="ta-empty-productos">
            <FiPackage size={40} color="#e5e7eb" />
            <p>Aún no hay productos en esta campaña</p>
            <span>Las emprendedoras están preparando su catálogo</span>
          </div>
        ) : (
          <div className="pt-grid">
            {productosAlianza.map((p, idx) => (
              <ProductCardGrid
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
