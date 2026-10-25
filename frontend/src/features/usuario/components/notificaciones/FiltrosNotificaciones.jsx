import "@/infrastructure/css/usuario/notificaciones/FiltrosNotificaciones.css"

const FILTROS_CLIENTE = [
  { key: "todas",     label: "Todas"       },
  { key: "no_leidas", label: "Sin leer"    },
  { key: "pedido",    label: "Pedidos"     },
  { key: "cupon",     label: "Cupones"     },
  { key: "solicitud", label: "Solicitudes" },
  { key: "cita",      label: "Citas"       },
]

const FILTROS_EMP = [
  { key: "todas",      label: "Todas"    },
  { key: "no_leidas",  label: "Sin leer" },
  { key: "pedido",     label: "Pedidos"  },
  { key: "pago",       label: "Pagos"    },
  { key: "comentario", label: "Reseñas"  },
  { key: "stock",      label: "Stock"    },
  { key: "solicitud",  label: "Alianzas" },
  { key: "cita",       label: "Citas"    },
]

export function FiltrosNotificaciones({ isEmprendedora, filtro, setFiltro, noLeidas }) {
  const filtros = isEmprendedora ? FILTROS_EMP : FILTROS_CLIENTE

  return (
    <div className="noti-filtros">
      {filtros.map(f => (
        <button key={f.key}
          className={`noti-filtro ${filtro === f.key ? "active" : ""}`}
          onClick={() => setFiltro(f.key)}
        >
          {f.key === "no_leidas" ? `Sin leer (${noLeidas})` : f.label}
        </button>
      ))}
    </div>
  )
}