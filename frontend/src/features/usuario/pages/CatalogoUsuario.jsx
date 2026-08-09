// usuario/pages/CatalogoUsuario.jsx
import { useState } from "react";
import { useCarrito } from "@/core/context/CarritoContext";
import Catalogo from "@/features/tienda/pages/Catalogo";
import { useFavoritos } from "../hooks/catalogo/useFavoritos";
import { CatalogoGrid } from "../components/catalogo/CatalogoGrid";
import "@/infrastructure/css/usuario/catalogo/CatalogoUsuario.css";
import "@/infrastructure/css/usuario/catalogo/CatalogoHero.css";

export default function CatalogoUsuario() {
  const { agregarAlCarrito } = useCarrito();
  const favoritos = useFavoritos();
  const [agregados, setAgregados] = useState({});

  const handleAgregar = (e, p) => {
    e.stopPropagation();
    agregarAlCarrito({
      id_producto: p.id_producto,
      nombre_producto: p.nombre_producto,
      precio:          p.descuento ? p.descuento.precio_con_descuento : p.precio,
      imagen: p.imagen,
      categoria: p.categoria,
    });
    setAgregados((prev) => ({ ...prev, [p.id_producto]: true }));
    setTimeout(
      () => setAgregados((prev) => ({ ...prev, [p.id_producto]: false })),
      2000,
    );
  };

  return (
    <Catalogo
      titulo="Explorar Catálogo"
      placeholder="Buscar productos, servicios, emprendedoras..."
      GridComponent={CatalogoGrid}
      gridProps={{
        agregados,
        onAgregar: handleAgregar,
        favoritos,
      }}
    />
  );
}
