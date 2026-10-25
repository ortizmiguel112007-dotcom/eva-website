import { FiMapPin, FiTruck, FiVideo } from "react-icons/fi";
import { ETIQUETA_MODALIDAD } from "../utils/agenda.utils";

export const ICONO_MODALIDAD = {
  virtual: FiVideo,
  presencial: FiMapPin,
  domicilio: FiTruck,
};

export default function ModalidadTag({ modalidad }) {
  const Icono = ICONO_MODALIDAD[modalidad] ?? FiMapPin;
  return (
    <span className="ag-tag">
      <Icono size={13} />
      {ETIQUETA_MODALIDAD[modalidad] ?? modalidad}
    </span>
  );
}