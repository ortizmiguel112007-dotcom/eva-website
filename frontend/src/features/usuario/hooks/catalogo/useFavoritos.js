import { useState } from "react";

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favoritos") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavorito = (e, id) => {
    e.stopPropagation();
    setFavoritos((prev) => {
      const nuevo = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem("favoritos", JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const esFavorito = (id) => favoritos.includes(id);

  return { toggleFavorito, esFavorito };
}