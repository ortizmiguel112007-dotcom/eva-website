export function PaginacionSimple({ pagina, totalPaginas, setPagina, total, labelSingular, labelPlural }) {
  if (totalPaginas <= 1) return null
  return (
    <div className="crud-pagination">
      <span className="pagination-info">
        {total} {total !== 1 ? labelPlural : labelSingular} · Página {pagina} de {totalPaginas}
      </span>
      <div className="pagination-controls">
        <button className="page-btn page-btn-arrow" onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
        <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>‹</button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
          <button key={n}
            className={`page-btn ${n === pagina ? "page-btn-active" : ""}`}
            onClick={() => setPagina(n)}
          >{n}</button>
        ))}
        <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>›</button>
        <button className="page-btn page-btn-arrow" onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>»</button>
      </div>
    </div>
  )
}