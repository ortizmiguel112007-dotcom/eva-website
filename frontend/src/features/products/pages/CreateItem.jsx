import { useNavigate } from "react-router-dom";
import { FiBox, FiBriefcase } from "react-icons/fi";

// import { useAuth } from "../context/AuthContext";

const CreateItem = () => {
  // const { user } = useAuth();
  // if (!user || user.role !== "emprendedora") {
  //   return (
  //     <div className="no-permission">
  //       No tienes permisos para crear productos o servicios.
  //     </div>
  //   );
  // }

  const navigate = useNavigate();

  return (
    <div className="create-container">
      <div className="card">
        <h1>¿Qué deseas crear?</h1>

        <p className="subtitle">
          Selecciona el tipo de publicación que quieres agregar
        </p>

        <div className="option-grid">
          <div
            className="option-card"
            onClick={() => navigate("/crear-producto")}
          >
            <div className="icon product">
              <FiBox size={34} />
            </div>
            <h3>Producto</h3>
            <p>Vende artículos físicos con stock disponible</p>
          </div>

          <div
            className="option-card"
            onClick={() => navigate("/crear-servicio")}
          >
            <div className="icon service">
              <FiBriefcase size={34} />
            </div>
            <h3>Servicio</h3>
            <p>Ofrece servicios con duración y precio</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateItem;