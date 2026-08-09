import { useNavigate } from "react-router-dom"
import { FiPackage, FiBriefcase, FiArrowRight, FiPlus, FiUsers, FiStar, FiTag, FiBarChart2 } from "react-icons/fi"
import "@/infrastructure/css/products-emprend/form/CreateItemPage.css"

export default function CreateItem() {
  const navigate = useNavigate()

  const opciones = [
    {
      tipo:    "producto",
      ruta:    "/crear-producto",
      titulo:  "Producto físico",
      desc:    "Artículos con stock, variantes e inventario",
      icon:    <FiPackage size={22} />,
      cls:     "ci-icon--producto",
    },
    {
      tipo:    "servicio",
      ruta:    "/crear-servicio",
      titulo:  "Servicio",
      desc:    "Consultoría, diseño, asesoría con precio y duración",
      icon:    <FiBriefcase size={22} />,
      cls:     "ci-icon--servicio",
    },
  ]

  const tags = [
    { icon: <FiUsers size={12} />,    label: "Alianzas"   },
    { icon: <FiStar size={12} />,     label: "Destacados" },
    { icon: <FiTag size={12} />,      label: "Cupones"    },
    { icon: <FiBarChart2 size={12} />,label: "Métricas"   },
  ]

  return (
    <div className="ci-wrap">
      <div className="ci-card">

        <div className="ci-eyebrow">
          <FiPlus size={12} />
          Nueva publicación
        </div>

        <h1 className="ci-title">¿Qué deseas crear?</h1>
        <p className="ci-sub">
          Selecciona el tipo de publicación que quieres agregar a tu tienda.
        </p>

        <div className="ci-options">
          {opciones.map((op, i) => (
            <div
              key={op.tipo}
              className="ci-option"
              onClick={() => navigate(op.ruta)}
              style={{ animationDelay: `${0.08 + i * 0.06}s` }}
            >
              <div className={`ci-icon ${op.cls}`}>
                {op.icon}
              </div>
              <div className="ci-text">
                <p className="ci-opt-title">{op.titulo}</p>
                <p className="ci-opt-desc">{op.desc}</p>
              </div>
              <FiArrowRight className="ci-arrow" size={16} />
            </div>
          ))}
        </div>

        <div className="ci-divider">disponible en ambos</div>

        <div className="ci-tag-row">
          {tags.map(t => (
            <span key={t.label} className="ci-tag">
              {t.icon}
              {t.label}
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}