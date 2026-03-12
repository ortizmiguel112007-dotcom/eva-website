import { useNavigate } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ProductCard({ item, onDelete, onToggleVisibility }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (item.type === "Producto") {
      navigate(`/editar/producto/${item.id}`);
    } else {
      navigate(`/editar/servicio/${item.id}`);
    }
  };
  return (
    <div className={`product-card ${!item.visible ? "hidden-card" : ""}`}>
      {item.image ? (
        <img src={item.image} alt={item.name} />
      ) : (
        <div className="no-image">Sin imagen</div>
      )}

      <span className={`type-badge ${item.type.toLowerCase()}`}>
        {item.type}
      </span>

      <h4>{item.name}</h4>
      <p className="category">{item.category}</p>

      <div className="price">
        {"$" + Number(item.price).toLocaleString("es-CO")}
      </div>

      {item.type === "producto" && item.stock <= 3 && (
        <span className="badge warning">Stock bajo</span>
      )}

      <div className="actions">
        {!item.visible && <span className="hidden-label">Oculto</span>}

        <button
          title={item.visible ? "Ocultar" : "Mostrar"}
          onClick={() => onToggleVisibility(item.id)}
        >
          <FiEye />
        </button>

        <button title="Editar" onClick={handleEdit}>
          <FiEdit2 />
        </button>

        <button title="Eliminar" onClick={() => onDelete(item.id)}>
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
