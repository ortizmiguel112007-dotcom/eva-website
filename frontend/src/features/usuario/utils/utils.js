// Genera ID visible de pedido: ORD-2024-001
export function formatId(id) {
  return `ORD-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`
}

// Estado del pedido → label + color + icono css
export const ESTADO_PEDIDO = {
  en_proceso: { label: "En proceso", clase: "en_proceso" },
  enviado:    { label: "Enviado",    clase: "enviado"    },
  entregado:  { label: "Entregado",  clase: "entregado"  },
  cancelado:  { label: "Cancelado",  clase: "cancelado"  },
}

// Cuenta pedidos por estado
export function contarPedidos(pedidos, estado) {
  return pedidos.filter(p => p.estado === estado).length
}