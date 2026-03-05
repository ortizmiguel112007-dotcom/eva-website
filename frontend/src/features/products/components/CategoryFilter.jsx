export default function CategoryFilter({
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  visibilityFilter,
  setVisibilityFilter,
}) {
  const types = ["Todos", "Producto", "Servicio"];

  const categories = [
    { label: "Electrónica", value: "electronica" },
    { label: "Ropa", value: "ropa" },
    { label: "Alimentos", value: "alimentos" },
    { label: "Belleza", value: "belleza" },
    { label: "Hogar", value: "hogar" },
  ];

  return (
    <div className="filters-container">
      {/* Tipo */}
      <div className="filters">
        {types.map((t) => (
          <button
            key={t}
            className={selectedType === t ? "filter active" : "filter"}
            onClick={() => setSelectedType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Categorías */}
      <div className="filters secondary">
        <button
          className={selectedCategory === "Todos" ? "filter active" : "filter"}
          onClick={() => setSelectedCategory("Todos")}
        >
          Todas
        </button>

        {categories.map((c) => (
          <button
            key={c.value}
            className={
              selectedCategory === c.value ? "filter active" : "filter"
            }
            onClick={() => setSelectedCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="filters visibility">
        <button
          className={visibilityFilter === "Todos" ? "filter active" : "filter"}
          onClick={() => setVisibilityFilter("Todos")}
        >
          Todos
        </button>

        <button
          className={
            visibilityFilter === "Activos" ? "filter active" : "filter"
          }
          onClick={() => setVisibilityFilter("Activos")}
        >
          Activos
        </button>

        <button
          className={
            visibilityFilter === "Ocultos" ? "filter active" : "filter"
          }
          onClick={() => setVisibilityFilter("Ocultos")}
        >
          Ocultos
        </button>
      </div>
    </div>
  );
}
