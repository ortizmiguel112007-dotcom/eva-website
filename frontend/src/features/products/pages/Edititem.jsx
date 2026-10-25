import { useParams } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import { useState, useEffect } from "react"
import CreateItemForm from "@/features/products/components/form/CreateItemForm" // ← ruta actualizada
import { itemService } from "@/features/products/services/item.service"

import "@/infrastructure/css/products-emprend/form/CreateItemPage.css"

const EditItem = ({ type = "product" }) => {
  const { id }    = useParams()
  const { user }  = useAuth()
  const isProduct = type === "product"

  const [item, setItem]         = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    itemService.obtenerPorId(Number(id))
      .then(data => {
        if (!data) { setError(`${isProduct ? "Producto" : "Servicio"} no encontrado`); return }
        // RN-007 / RN-011: solo el creador puede editar su producto o servicio
        if (data.id_creador !== user?.id) {
          setError(`Acceso denegado: no tienes permiso para editar este ${isProduct ? "producto" : "servicio"}`)
          return
        }
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
      })
      .catch(() => setError("Error al cargar el item"))
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) return <p>Cargando...</p>
  if (error)    return <p>{error}</p>

  return <CreateItemForm type={type} initialData={item} isEdit />
}

export default EditItem