import { useState, useEffect } from "react";
import { useAuth } from "@/core/context/AuthConten";

import TopBar from "@/features/products/components/TopBar.jsx";
import CategoryFilter from "@/features/products/components/CategoryFilter.jsx";
import ProductList from "@/features/products/components/ProductList.jsx";
import { itemService } from "@/features/products/services/item.service";
import axios from "axios";
import "@/infrastructure/css/form.css";
import "@/infrastructure/css/categoryFilter.css";
import "@/infrastructure/css/createItem.css";
import "@/infrastructure/css/dashboard.css";
import "@/infrastructure/css/productCard.css";
import "@/infrastructure/css/topbar.css";

const ID_SECCION = 1; // TODO: reemplazar con id_seccion real del usuario autenticado

export default function ProductsDashboard() {
  const { idSeccion, token } = useAuth();

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("Todos");

  // ── cargar items del backend al montar ───────────────────────────────────
  useEffect(() => {
    if (!idSeccion) return;

    const cargar = async () => {
      try {
        setCargando(true);
        const res = await axios.get(
          "http://localhost:3000/api/items/mis-items",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const normalized = res.data.map((item) => ({
          ...item,
          id: item.id_producto,
          name: item.nombre_producto,
          price: item.precio,
          image: item.imagen
            ? item.imagen.startsWith("http")
              ? item.imagen
              : `http://localhost:3000${item.imagen}`
            : null,
          type: item.tipo || "producto",
          category: item.categoria,
          visible: item.visible ?? true,
          descripcion: item.descripcion,
          duracion: item.duracion,
          es_alianza: !!item.seccion?.alianza,
          nombre_alianza: item.seccion?.alianza?.nombre || null,
        }));
        setItems(normalized);
      } catch (err) {
        setError("Error al cargar los items");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [idSeccion]);

  // ── eliminar (soft delete en backend) ────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await itemService.eliminar(id);

      setItems((prev) => prev.filter((item) => item.id !== Number(id)));
    } catch (err) {
      console.error("Error al eliminar:", err.response?.data || err.message);
    }
  };

  // ── ocultar / mostrar (actualiza estado_producto en backend) ─────────────
  const toggleVisibility = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      const res = await itemService.toggleVisible(id); // ⬅️ nuevo método
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, visible: res.visible } : i)),
      );
    } catch (err) {
      console.error("Error al cambiar visibilidad:", err);
    }
  };

  // ── categorías dinámicas ──────────────────────────────────────────────────
  const categories = ["Todos", ...new Set(items.map((i) => i.category))];

  // ── filtrado ──────────────────────────────────────────────────────────────
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

  // ── render ────────────────────────────────────────────────────────────────
  if (!idSeccion)
    return (
      <div className="layout">
        <main className="main-content">
          <p>Cargando sesión...</p>
        </main>
      </div>
    );
  if (cargando)
    return (
      <div className="layout">
        <main className="main-content">
          <p>Cargando...</p>
        </main>
      </div>
    );
  if (error)
    return (
      <div className="layout">
        <main className="main-content">
          <p>{error}</p>
        </main>
      </div>
    );

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
          categories={categories}
        />

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
