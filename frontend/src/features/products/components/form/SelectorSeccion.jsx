import { FiShoppingBag, FiUsers } from "react-icons/fi"
import "@/infrastructure/css/products-emprend/form/SelectorSeccion.css"

export function SelectorSeccion({ secciones, seleccionada, onChange }) {
  if (!secciones.length) return null

  const OpcionItem = ({ id, label, icon: Icon, color }) => (
    <div
      onClick={() => onChange(id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.65rem 1rem",
        borderRadius: "0.6rem",
        cursor: "pointer",
        border: `1.5px solid ${seleccionada === id ? "#3b82f6" : "#e5e7eb"}`,
        background: seleccionada === id ? "#eff6ff" : "#fff",
      }}
    >
      <Icon size={16} color={color} />
      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}>
        {label}
      </span>
      {seleccionada === id && (
        <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#3b82f6", fontWeight: 700 }}>
          ✓ Seleccionada
        </span>
      )}
    </div>
  )

  return (
    <div className="form-group">
      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <FiUsers size={14} color="#3b82f6" /> ¿Dónde publicar?
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <OpcionItem id="propia" label="Mi tienda propia" icon={FiShoppingBag} color="#3b82f6" />
        {secciones.map(s => (
          <OpcionItem key={s.id_seccion} id={s.id_seccion} label={s.nombre_alianza} icon={FiUsers} color="#8b5cf6" />
        ))}
      </div>
      {seleccionada !== "propia" && (
        <p style={{ fontSize: "0.75rem", color: "#3b82f6", margin: "0.3rem 0 0", fontWeight: 500 }}>
          Este producto se publicará en la tienda conjunta de la alianza
        </p>
      )}
    </div>
  )
}