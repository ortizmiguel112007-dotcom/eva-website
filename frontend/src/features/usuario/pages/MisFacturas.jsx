import { useState } from "react"
import { useAuth } from "@/core/context/AuthConten"
import { FiFileText } from "react-icons/fi"

import { formatPrecio } from "@/features/tienda/utils/utils"
import { useFacturas } from "../hooks/useFacturas"
import { FacturaCard } from "../components/facturas/FacturaCard"
import { FacturaModal } from "../components/facturas/FacturaModal"
import { PaginacionSimple } from "../components/historial/PaginacionSimple"

import "@/infrastructure/css/usuario/facturas/MisFacturas.css"
import "@/infrastructure/css/auth/CrudAdmin.css"

const POR_PAGINA = 6

export default function MisFacturas() {
  const { token } = useAuth()
  const { facturas, cargando, totalGastado, handleDescargar } = useFacturas(token)

  const [preview, setPreview] = useState(null)
  const [pagina, setPagina]   = useState(1)

  const totalPaginas   = Math.max(1, Math.ceil(facturas.length / POR_PAGINA))
  const facturasPagina = facturas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  if (cargando) return (
    <div className="mf-loading">
      <div className="mf-spinner" />
      <p>Cargando facturas...</p>
    </div>
  )

  return (
    <div className="mf-page">
      <div className="mf-header">
        <div className="mf-header-left">
          <div className="mf-header-icon">
            <FiFileText size={22} color="#fff" />
          </div>
          <div>
            <h1 className="mf-titulo">Mis Facturas</h1>
            <p className="mf-sub">Comprobantes digitales de tus compras</p>
          </div>
        </div>
        {facturas.length > 0 && (
          <div className="mf-resumen">
            <div className="mf-resumen-item">
              <span>{facturas.length}</span>
              <p>facturas</p>
            </div>
            <div className="mf-resumen-divider" />
            <div className="mf-resumen-item">
              <span>{formatPrecio(totalGastado)}</span>
              <p>total histórico</p>
            </div>
          </div>
        )}
      </div>

      {facturas.length === 0 ? (
        <div className="mf-empty">
          <div className="mf-empty-ilustracion">
            <div className="mf-empty-papel">
              <FiFileText size={40} color="#c7d2fe" />
            </div>
            <div className="mf-empty-sombra" />
          </div>
          <h3>Sin facturas todavía</h3>
          <p>Las facturas se generan automáticamente cuando se confirma el pago de tu compra</p>
        </div>
      ) : (
        <>
          <div className="mf-lista">
            {facturasPagina.map((factura, idx) => (
              <FacturaCard
                key={factura.id_factura}
                factura={factura}
                idx={idx}
                onPreview={setPreview}
                onDescargar={handleDescargar}
              />
            ))}
          </div>
          <PaginacionSimple
            pagina={pagina}
            totalPaginas={totalPaginas}
            setPagina={setPagina}
            total={facturas.length}
            labelSingular="factura"
            labelPlural="facturas"
          />
        </>
      )}

      <FacturaModal
        factura={preview}
        onCerrar={() => setPreview(null)}
        onDescargar={handleDescargar}
      />
    </div>
  )
}