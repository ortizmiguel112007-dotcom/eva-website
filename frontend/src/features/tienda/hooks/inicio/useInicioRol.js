import { useEffect, useState } from "react";
import axios from "axios";
import { agendaService } from "@/features/agenda/services/agenda.service";
import { pedidoService } from "@/features/products/services/pedido.service";
import { adminService } from "@/features/admin/services/admin.service";
import {
  esFutura,
  tieneCambioPendiente,
} from "@/features/agenda/utils/agenda.utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const lista = (r) =>
  r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [];

const get = (url, token) =>
  axios
    .get(`${API_URL}${url}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

const contar = (arr, estados) =>
  arr.filter((p) => estados.includes(p.estado)).length;

/**
 * Datos del inicio según el rol de la persona autenticada.
 * Si falla alguna petición, esa cifra queda en 0 y el inicio sigue funcionando.
 */
export function useInicioRol(user, token) {
  const rol = user?.rol ?? null;
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(Boolean(rol));

  useEffect(() => {
    if (!rol || !token) {
      setResumen(null);
      setCargando(false);
      return undefined;
    }

    let activo = true;
    setCargando(true);

    (async () => {
      let datos = {};

      if (rol === "usuario") {
        const [pedidos, favs, citas] = await Promise.allSettled([
          get("/api/cliente/pedidos", token),
          get("/api/favoritos", token),
          agendaService.obtenerMisCitas(),
        ]);
        const ped = lista(pedidos);
        const ci = lista(citas);

        datos = {
          pedidosActivos: contar(ped, ["pago_enviado", "en_proceso", "enviado"]),
          pagosPendientes: contar(ped, ["pendiente_pago", "pago_rechazado"]),
          favoritos: lista(favs).length,
          citasProximas: ci.filter(
            (c) => c.estado === "CONFIRMADA" && esFutura(c.fecha_fin),
          ).length,
          citasPendientes: ci.filter((c) => c.estado === "PENDIENTE").length,
        };
      }

      if (rol === "emprendedora") {
        const [pedidos, items, citas] = await Promise.allSettled([
          pedidoService.listar(),
          get("/api/items/mis-items", token),
          agendaService.obtenerCitasRecibidas(),
        ]);
        const ci = lista(citas);

        datos = {
          pedidosPorAtender: contar(lista(pedidos), ["pago_enviado", "en_proceso"]),
          productos: lista(items).length,
          citasPorResponder: ci.filter(
            (c) =>
              (c.estado === "PENDIENTE" && esFutura(c.fecha_inicio)) ||
              (c.estado === "CONFIRMADA" && tieneCambioPendiente(c)),
          ).length,
          citasProximas: ci.filter(
            (c) => c.estado === "CONFIRMADA" && esFutura(c.fecha_fin),
          ).length,
        };
      }

      if (rol === "admin") {
        const [usuarios, pedidos, productos] = await Promise.allSettled([
          adminService.listarUsuarios(),
          get("/api/admin/pedidos", token),
          get("/api/items/admin/todos", token),
        ]);

        datos = {
          usuarios: lista(usuarios).length,
          pedidos: lista(pedidos).length,
          productos: lista(productos).length,
        };
      }

      if (activo) {
        setResumen(datos);
        setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [rol, token]);

  return { rol, resumen, cargando };
}