import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CreateItemForm from "@/features/products/components/estructura/CreateItemForm";
import { itemService } from "@/features/products/services/item.service";


/**
 * EditItem — página unificada para editar productos y servicios.
 *
 * Rutas sugeridas:
 *   /dashboard/edit/product/:id
 *   /dashboard/edit/service/:id
 *
 * Props de ruta:
 *   - type : "product" | "service"  (se pasa desde el router)
 */
const EditItem = ({ type = "product" }) => {
  const { id } = useParams();
  const isProduct = type === "product";

  const [item, setItem]         = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

 useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true)
        const data = await itemService.obtenerPorId(Number(id))

        if (!data) {
          setError(`${isProduct ? "Producto" : "Servicio"} no encontrado`)
          return
        }

        // Normalizamos para que coincida con los campos del form
        setItem({
          ...data,
          nombre_producto: data.nombre_producto,
          descripcion:     data.descripcion,
          precio:          String(data.precio),
          categoria:       data.categoria,
          stock_minimo:    data.stock_minimo ?? "",
          imagen:          data.imagen ?? null,
          imagePreview:    data.imagen ?? null,
          duracion:        data.duracion ?? "",
        })
      } catch (err) {
        setError("Error al cargar el item")
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  if (cargando) return <p>Cargando...</p>
  if (error)    return <p>{error}</p>

  return (
    <CreateItemForm
      type={type}
      initialData={item}
      isEdit
    />
  );
};

export default EditItem;