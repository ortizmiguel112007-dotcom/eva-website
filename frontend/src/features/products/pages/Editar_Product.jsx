import { useParams } from "react-router-dom";
import { useState } from "react";

import CreateProductForm from "@/features/products/components/estructura/CreateProductForm.jsx";

const fakeProducts = [
  {
    id: "1",
    name: "Audífonos Bluetooth",
    description: "Alta calidad",
    price: 120000,
    stock: 5,
    category: "tecnologia",
    ownerId: "123",
    image: "https://via.placeholder.com/300",
  },
];

const EditProduct = () => {
  const { id } = useParams();

  const productToEdit = fakeProducts.find(p => p.id === id);

  if (!productToEdit) return <p>Producto no encontrado</p>;

  const [product, setProduct] = useState(productToEdit);

  const handleUpdate = (updatedData) => {
    setProduct(updatedData);
    console.log("Producto actualizado:", updatedData);
  };

  return (
    <CreateProductForm
      initialData={product}
      onSubmit={handleUpdate}
      isEdit
    />
  );
};

export default EditProduct;