import "@/infrastructure/css/tienda/tiendas-perfil/TiendaAlianza.css"


// tienda/components/tiendas/AlianzaStats.jsx
export function AlianzaStats({ totalProductos, totalParticipantes }) {
  const stats = [
    { label: "Productos en alianza", valor: totalProductos,    color: "#3b82f6" },
    { label: "Emprendedoras",        valor: totalParticipantes, color: "#16a34a" },
  ]

  return (
    <div className="ta-stats">
      {stats.map(s => (
        <div key={s.label} className="ta-stat-card" style={{ borderTopColor: s.color }}>
          <strong style={{ color: s.color }}>{s.valor}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  )
}