import { useParams } from "react-router-dom";
import { useState } from "react";
import CreateServiceForm from "@/features/products/components/estructura/CreateServiceForm";

const fakeServices = [
  {
    id: "1",
    name: "Asesoría contable",
    description: "Asesoría para emprendedores",
    price: 80000,
    duration: "1 hora",
    category: "consultoria",
    ownerId: "123",
  },
];

const EditService = () => {
  const { id } = useParams();

  const serviceToEdit = fakeServices.find((s) => s.id === id);

  if (!serviceToEdit) return <p>Servicio no encontrado</p>;

  const [service, setService] = useState(serviceToEdit);

  const handleUpdate = (updatedData) => {
    setService(updatedData);
    console.log("Servicio actualizado:", updatedData);
  };

  return (
    <CreateServiceForm initialData={service} onSubmit={handleUpdate} isEdit />
  );
};

export default EditService;
