import { useNavigate } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ProductCard({ item, onDelete, onToggleVisibility }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (item.type === "producto") {
      navigate(`/editar/producto/${item.id}`);
    } else {
      navigate(`/editar/servicio/${item.id}`);
    }
  };

  const formatPrecio = (precio) => "$" + Number(precio).toLocaleString("es-CO");

  return (
    <div className={`product-card ${!item.visible ? "hidden-card" : ""}`}>
      {/* Imagen + badge + acciones */}
      <div className="product-card-img-wrapper">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="img-placeholder">📦</div>
        )}

        {/* Badge tipo */}
        <span className={`type-badge ${item.type}`}>
          {item.type === "producto" ? "Producto" : "Servicio"}
        </span>

        {/* Acciones overlay */}
        {/* Badge oculto — separado de las acciones */}
        {!item.visible && <span className="hidden-label">Oculto</span>}

        {/* Acciones overlay */}
        <div className="actions">
          <button
            title={item.visible ? "Ocultar" : "Mostrar"}
            onClick={() => onToggleVisibility(item.id)}
          >
            <FiEye />
          </button>
          <button title="Editar" onClick={handleEdit}>
            <FiEdit2 />
          </button>
          <button
            title="Eliminar"
            className="danger"
            onClick={() => onDelete(item.id)}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="product-card-body">
        <h4>{item.name}</h4>
        <p className="category">{item.category}</p>

        {/* Descripción */}
        {item.descripcion && <p className="description">{item.descripcion}</p>}

        {/* Duración solo para servicios */}
        {item.type === "servicio" && item.duracion && (
          <span className="duracion">⏱ {item.duracion}</span>
        )}

        {/* Footer: precio + estado */}
        <div className="product-card-footer">
          <div className="price-box">
            <span className="price-label">Precio</span>
            <span className="price">{formatPrecio(item.price)}</span>
          </div>
          <button
            className={`badge ${item.visible ? "activo" : "inactivo"}`}
            onClick={() => onToggleVisibility(item.id)}
            title={item.visible ? "Click para ocultar" : "Click para activar"}
            style={{ cursor: "pointer", border: "none" }}
          >
            {item.visible ? "Activo" : "Oculto"}
          </button>
        </div>
      </div>
    </div>
  );
}
