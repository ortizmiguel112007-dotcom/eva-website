export default function CategoryFilter({
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  visibilityFilter,
  setVisibilityFilter,
  categories = ["Todos"],
}) {
  const types = [
    { label: "Todos",    value: "Todos" },
    { label: "Producto", value: "producto" },
    { label: "Servicio", value: "servicio" },
  ];

  return (
    <div className="filters-container">
      {/* Tipo */}
      <div className="filters">
        {types.map((t) => (
          <button
            key={t.value}
            className={selectedType === t.value ? "filter active" : "filter"}
            onClick={() => setSelectedType(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Categorías dinámicas */}
      <div className="filters secondary">
        {categories.map((c) => (
          <button
            key={c}
            className={selectedCategory === c ? "filter active" : "filter"}
            onClick={() => setSelectedCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Visibilidad */}
      <div className="filters visibility">
        <button
          className={visibilityFilter === "Todos" ? "filter active" : "filter"}
          onClick={() => setVisibilityFilter("Todos")}
        >
          Todos
        </button>
        <button
          className={visibilityFilter === "Activos" ? "filter active" : "filter"}
          onClick={() => setVisibilityFilter("Activos")}
        >
          Activos
        </button>
        <button
          className={visibilityFilter === "Ocultos" ? "filter active" : "filter"}
          onClick={() => setVisibilityFilter("Ocultos")}
        >
          Ocultos
        </button>
      </div>
    </div>
  );
}