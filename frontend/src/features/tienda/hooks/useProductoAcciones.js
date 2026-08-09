import { useState } from "react";
import { useCarrito } from "@/core/context/CarritoContext";

export function useProductoAcciones() {
  const { agregarAlCarrito } = useCarrito();
  const [agregados, setAgregados] = useState({});
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favoritos") || "[]");
    } catch {
      return [];
    }
  });

  const handleAgregar = (e, p) => {
    e.stopPropagation();
    const descuento = p.descuento;
    const precioFinal = descuento ? descuento.precio_con_descuento : p.precio;

    agregarAlCarrito({
      id_producto: p.id_producto,
      nombre_producto: p.nombre_producto,
      precio: precioFinal, 
      imagen: p.imagen,
      categoria: p.categoria,
    });
    setAgregados((prev) => ({ ...prev, [p.id_producto]: true }));
    setTimeout(
      () => setAgregados((prev) => ({ ...prev, [p.id_producto]: false })),
      2000,
    );
  };

  const toggleFav = (e, id) => {
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
  const yaAgregado = (id) => agregados[id] || false;

  return { handleAgregar, toggleFav, esFavorito, yaAgregado };
}
