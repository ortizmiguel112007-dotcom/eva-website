import { useState, useEffect } from "react";
import axios from "axios";
import { tiendaService } from "@/features/tienda/services/tienda.service";

export function useDashboard(token) {
  const [destacados, setDestacados] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const dest = await tiendaService.getDestacados();
        setDestacados(dest);

        if (token) {
          const [resPedidos, resFavs] = await Promise.allSettled([
            axios.get("http://localhost:3000/api/cliente/pedidos", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:3000/api/favoritos", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (resPedidos.status === "fulfilled")
            setPedidos(resPedidos.value.data.slice(0, 3));

          if (resFavs.status === "fulfilled")
            setTotalFavoritos(
              Array.isArray(resFavs.value.data) ? resFavs.value.data.length : 0
            );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [token]);

  const activos = pedidos.filter(
    (p) => p.estado === "en_proceso" || p.estado === "enviado"
  ).length;
  const enCamino = pedidos.filter((p) => p.estado === "enviado").length;
  const completados = pedidos.filter((p) => p.estado === "entregado").length;

  return { destacados, pedidos, totalFavoritos, cargando, activos, enCamino, completados };
}