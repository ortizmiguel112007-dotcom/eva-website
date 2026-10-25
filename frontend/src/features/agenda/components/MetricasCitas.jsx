export default function MetricasCitas({ items }) {
  return (
    <div className="ag-metricas">
      {items.map(({ etiqueta, valor, Icono, tono = "neutro" }) => (
        <div key={etiqueta} className={`ag-metrica ag-metrica--${tono}`}>
          <div>
            <h3>{etiqueta}</h3>
            <span>{valor}</span>
          </div>
          <div className={`ag-metrica-icono ag-metrica-icono--${tono}`}>
            <Icono size={18} />
          </div>
        </div>
      ))}
    </div>
  );
}