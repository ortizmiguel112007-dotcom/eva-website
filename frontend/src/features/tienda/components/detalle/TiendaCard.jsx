// tienda/components/detalle/TiendaCard.jsx
import { getAvatarGradient, getInitials } from "@/features/tienda/utils/avatar"
import "@/infrastructure/css/tienda/detalle/TiendaCard.css"

export function TiendaCard({ producto, onNavigate }) {
  const esAlianza    = !!producto.seccion?.alianza
  const participantes = producto.seccion?.alianza?.participantes || []
  const emprendedora  = producto.seccion?.emprendedora
  const nombreTienda  = emprendedora?.usuario?.nombre || "EVA"
  const idEmprendedora = emprendedora?.id_emprendedora
  const [c1, c2]      = getAvatarGradient(nombreTienda)

  if (esAlianza) return (
    <div className="dp-tienda-card">
      <div className="dp-tienda-left" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Campaña Colaborativa
        </span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {participantes.map(p => {
            const [ca, cb] = getAvatarGradient(p.usuario?.nombre)
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div className="dp-tienda-avatar" style={{ background: `linear-gradient(135deg, ${ca}, ${cb})` }}>
                  {getInitials(p.usuario?.nombre)}
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>
                  {p.usuario?.nombre}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <button className="dp-btn-ver-tienda"
        onClick={() => onNavigate(`/alianza/${producto.seccion.alianza.id_alianza}`)}>
        Ver campaña →
      </button>
    </div>
  )

  return (
    <div className="dp-tienda-card">
      <div className="dp-tienda-left">
        <div className="dp-tienda-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
          {getInitials(nombreTienda)}
        </div>
        <div>
          <p className="dp-tienda-nombre">{nombreTienda}</p>
          <span className="dp-tienda-sub">Emprendedora EVA</span>
        </div>
      </div>
      {idEmprendedora && (
        <button className="dp-btn-ver-tienda" onClick={() => onNavigate(`/tienda/${idEmprendedora}`)}>
          Ver tienda →
        </button>
      )}
    </div>
  )
}