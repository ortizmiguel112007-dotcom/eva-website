export function MetricasComentarios({ resenas }) {
  const metricas = [
    { label: "Total",   valor: resenas.length,                        cls: "total"  },
    { label: "Activos", valor: resenas.filter(r => r.activo).length,  cls: "activo" },
    { label: "Ocultos", valor: resenas.filter(r => !r.activo).length, cls: "oculto" },
  ]

  return (
    <div className="ar-metricas">
      {metricas.map(m => (
        <div key={m.label} className={`ar-metrica ar-metrica--${m.cls}`}>
          <p className="ar-metrica-label">{m.label}</p>
          <strong className="ar-metrica-valor">{m.valor}</strong>
        </div>
      ))}
    </div>
  )
}