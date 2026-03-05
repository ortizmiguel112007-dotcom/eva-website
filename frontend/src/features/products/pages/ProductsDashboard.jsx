import { useState } from "react";

import TopBar from "@/features/products/components/TopBar.jsx";
import CategoryFilter from "@/features/products/components/CategoryFilter.jsx";
import ProductList from "@/features/products/components/ProductList.jsx";
import items from "@/data/products.js";

import "@/infrastructure/css/form.css";
import "@/infrastructure/css/categoryFilter.css";
import "@/infrastructure/css/createItem.css";
import "@/infrastructure/css/dashboard.css";
import "@/infrastructure/css/productCard.css";
import "@/infrastructure/css/topbar.css";

let initialItems = items;

export default function ProductsDashboard() {
  // estado principal
  const [items, setItems] = useState(
    initialItems.map((item) => ({ ...item, visible: true })),
  );

  // filtros
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("Todos");

  // eliminar definitivamente
  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // ocultar / mostrar
  const toggleVisibility = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item,
      ),
    );
  };

  // categorías dinámicas
  const categories = ["Todos", ...new Set(items.map((i) => i.category))];

  // filtrado
  const filteredItems = items.filter((item) => {
    const matchType = selectedType === "Todos" || item.type === selectedType;

    const matchCategory =
      selectedCategory === "Todos" || item.category === selectedCategory;

    const matchVisibility =
      visibilityFilter === "Todos" ||
      (visibilityFilter === "Activos" && item.visible) ||
      (visibilityFilter === "Ocultos" && !item.visible);

    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());

    return matchType && matchCategory && matchVisibility && matchSearch;
  });

  return (
    <div className="layout">
      <main className="main-content">
        <TopBar search={search} setSearch={setSearch} />

        <CategoryFilter
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          visibilityFilter={visibilityFilter}
          setVisibilityFilter={setVisibilityFilter}
        />

        {/* filtro activos / ocultos */}
        <div className="filters visibility"></div>

        <ProductList
          items={filteredItems}
          onDelete={handleDelete}
          onToggleVisibility={toggleVisibility}
        />
      </main>
    </div>
  );
}
