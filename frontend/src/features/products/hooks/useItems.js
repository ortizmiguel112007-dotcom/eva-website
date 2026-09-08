import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import { itemService } from "@/features/products/services/item.service"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export function useItems() {
  const { idSeccion, token } = useAuth()
  const [items, setItems]     = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!idSeccion) return
    axios.get(`${API_URL}/api/items/mis-items`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setItems(res.data.map(item => ({
        ...item,
        id:            item.id_producto,
        name:          item.nombre_producto,
        price:         item.precio,
        descuento:      item.descuento || null,          
        precioFinal:    item.descuento,                   
        image:         item.imagen
          ? item.imagen.startsWith("http") ? item.imagen : `${API_URL}${item.imagen}`
          : null,
        type:          item.tipo || "producto",
        category:      item.categoria,
        visible:       item.visible ?? true,
        descripcion:   item.descripcion,
        duracion:      item.duracion,
        es_alianza:    !!item.seccion?.alianza,
        nombre_alianza: item.seccion?.alianza?.nombre || null,
      }))))
      .catch(() => setError("Error al cargar los items"))
      .finally(() => setCargando(false))
  }, [idSeccion])

  const handleDelete = async (id) => {
    try {
      await itemService.eliminar(id)
      setItems(prev => prev.filter(item => item.id !== Number(id)))
    } catch (err) {
      console.error("Error al eliminar:", err.response?.data || err.message)
    }
  }

  const toggleVisibility = async (id) => {
    try {
      const res = await itemService.toggleVisible(id)
      setItems(prev => prev.map(i => i.id === id ? { ...i, visible: res.visible } : i))
    } catch (err) {
      console.error("Error al cambiar visibilidad:", err)
    }
  }

  return { items, cargando, error, idSeccion: !!idSeccion, handleDelete, toggleVisibility }
}