import { useState } from "react";
import { StoreCard } from "@/shared/store/storeCard";
import { PaginacionSimple } from "@/features/usuario/components/historial/PaginacionSimple";
import { FiPackage, FiZap, FiUsers } from "@/infrastructure/icons/index.js";

const POR_PAGINA = 12;

export function TiendasCartShop({
  alianzasFiltradas = [],
  tiendasFiltradas = [],
  navigate,
  tiendaState,
}) {
  const [pagina, setPagina] = useState(1);

  if (tiendaState.cargando) {
    return (
      <div className="cat-loading">
        <div className="cat-spinner" />
        <p>Cargando tiendas...</p>
      </div>
    );
  }

  if (tiendasFiltradas.length === 0 && alianzasFiltradas.length === 0) {
    return (
      <div className="cat-empty">
        <FiPackage size={48} color="#cbd5e1" />
        <h3>Sin resultados</h3>
        <p>Intenta con otros filtros</p>
      </div>
    );
  }

  const totalPaginas = Math.max(
    1,
    Math.ceil(tiendasFiltradas.length / POR_PAGINA),
  );
  const tiendasPagina = tiendasFiltradas.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  return (
    <div className="ti-contenido">
      {/* ── Campañas colaborativas ── */}
      {alianzasFiltradas.length > 0 && (
        <div className="ti-seccion">
          <div className="ti-seccion-header">
            <div className="ti-seccion-tag">
              <FiZap size={12} /> Campañas Colaborativas
            </div>
            <h2 className="ti-seccion-titulo">Tiendas en Alianza</h2>
            <p className="ti-seccion-sub">
              Emprendedoras que se unen para ofrecerte más
            </p>
          </div>

          <div className="ip-tiendas-grid">
            {alianzasFiltradas.map((a) => {
              const productos = a.secciones?.flatMap((s) => s.productos) || [];
              return (
                <div key={a.id_alianza} className="ti-card-wrap">
                  <span className="ti-badge-collab">
                    <FiZap size={10} /> Campaña Colaborativa
                  </span>
                  <StoreCard
                    className="ip-tienda-card ti-card-alianza"
                    nombre={a.nombre}
                    productos={productos}
                    onClick={() => navigate(`/alianza/${a.id_alianza}`)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Emprendedoras ── */}
      {tiendasFiltradas.length > 0 && (
        <div className="ti-seccion">
          <div className="ti-seccion-header">
            <div className="ti-seccion-tag">
              <FiUsers size={12} /> Emprendedoras
            </div>
            <h2 className="ti-seccion-titulo">Tiendas Independientes</h2>
            <p className="ti-seccion-sub">
              {tiendasFiltradas.length} emprendedoras disponibles
            </p>
          </div>

          <div className="ip-tiendas-grid">
            {tiendasPagina.map((t) => {
              const productos =
                t.secciones
                  ?.filter((s) => s.id_alianza === null)
                  .flatMap((s) => s.productos || []) || [];
              return (
                <StoreCard
                  key={t.id_emprendedora}
                  className="ip-tienda-card"
                  productos={productos}
                  nombre={t.usuario?.nombre}
                  onClick={() => navigate(`/tienda/${t.id_emprendedora}`)}
                />
              );
            })}
          </div>

          <PaginacionSimple
            pagina={pagina}
            totalPaginas={totalPaginas}
            setPagina={setPagina}
            total={tiendasFiltradas.length}
            labelSingular="tienda"
            labelPlural="tiendas"
          />
        </div>
      )}
    </div>
  );
}
