// admin/utils/utils.js
import { formatPrecio as formatPrecioBase, formatFecha } from "@/features/tienda/utils/utils"

export const MESES     = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
export const BAR_COLORS = ["#3b82f6","#6366f1","#8b5cf6","#a855f7","#ec4899"]

// re-exportado de tienda — versión completa
export { formatFecha }

//  solo del admin — versión abreviada para KPIs
export function formatPrecioCorto(n) {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`
  if (n >= 1000)    return `$${(n/1000).toFixed(0)}k`
  return "$" + Number(n).toLocaleString("es-CO")
}

// re-exportado de tienda — versión completa
export function formatPrecio(n) {
  return "$" + Number(n).toLocaleString("es-CO")
}

export function formatPrecioFull(n) {
  return "$" + Number(n).toLocaleString("es-CO")
}

export function getSaludo() {
  const hora = new Date().getHours()
  return hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches"
}

export function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` }
}