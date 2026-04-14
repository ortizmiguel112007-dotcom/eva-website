import { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"

const CarritoContext = createContext()
const BASE = "http://localhost:3000/api/carrito"

export const CarritoProvider = ({ children }) => {
  const [items, setItems]               = useState([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [cargando, setCargando]         = useState(false)

  const getToken = () => localStorage.getItem("token")
  const headers  = () => ({ Authorization: `Bearer ${getToken()}` })

  const normalizar = (item) => ({
    id_item:         item.id_item,
    id_producto:     item.id_producto,
    nombre_producto: item.producto?.nombre_producto,
    precio:          item.producto?.precio,
    imagen:          item.producto?.imagen,
    categoria:       item.producto?.categoria,
    cantidad:        item.cantidad,
    stock:           item.producto?.inventario?.cantidad ?? 99,
    emprendedora:    item.producto?.seccion?.emprendedora?.usuario?.nombre || "EVA",
  })

  const cargarCarrito = useCallback(async () => {
    const token = getToken()
    if (!token) {
      try {
        const saved = localStorage.getItem("carrito_local")
        setItems(saved ? JSON.parse(saved) : [])
      } catch { setItems([]) }
      return
    }
    setCargando(true)
    try {
      const res = await axios.get(BASE, { headers: headers() })
      setItems(res.data.items.map(normalizar))
    } catch (err) {
      console.error("Error al cargar carrito:", err)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarCarrito() }, [cargarCarrito])

  useEffect(() => {
    if (!getToken()) localStorage.setItem("carrito_local", JSON.stringify(items))
  }, [items])

  const agregar = async (producto, cantidad = 1) => {
    const token = getToken()
    if (token) {
      try {
        await axios.post(`${BASE}/items`, { id_producto: producto.id_producto, cantidad }, { headers: headers() })
        await cargarCarrito()
      } catch (err) { console.error("Error al agregar:", err) }
    } else {
      setItems(prev => {
        const existe = prev.find(i => i.id_producto === producto.id_producto)
        if (existe) return prev.map(i => i.id_producto === producto.id_producto ? { ...i, cantidad: i.cantidad + cantidad } : i)
        return [...prev, { ...producto, cantidad }]
      })
    }
    setCarritoAbierto(true)
  }

  const agregarAlCarrito = agregar

  const quitar = async (id_producto) => {
    const token = getToken()
    if (token) {
      const item = items.find(i => i.id_producto === id_producto)
      if (!item?.id_item) return
      try {
        await axios.delete(`${BASE}/items/${item.id_item}`, { headers: headers() })
        setItems(prev => prev.filter(i => i.id_producto !== id_producto))
      } catch (err) { console.error("Error al quitar:", err) }
    } else {
      setItems(prev => prev.filter(i => i.id_producto !== id_producto))
    }
  }

  const quitarDelCarrito = quitar

  const cambiarCantidad = async (id_producto, cantidad) => {
    if (cantidad <= 0) return quitar(id_producto)
    const token = getToken()
    if (token) {
      const item = items.find(i => i.id_producto === id_producto)
      if (!item?.id_item) return
      try {
        await axios.put(`${BASE}/items/${item.id_item}`, { cantidad }, { headers: headers() })
        setItems(prev => prev.map(i => i.id_producto === id_producto ? { ...i, cantidad } : i))
      } catch (err) { console.error("Error al cambiar cantidad:", err) }
    } else {
      setItems(prev => prev.map(i => i.id_producto === id_producto ? { ...i, cantidad } : i))
    }
  }

  const vaciar = async () => {
    const token = getToken()
    if (token) {
      try { await axios.delete(BASE, { headers: headers() }) }
      catch (err) { console.error("Error al vaciar:", err) }
    }
    setItems([])
    localStorage.removeItem("carrito_local")
  }

  const vaciarCarrito = vaciar
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)
  const total      = items.reduce((acc, i) => acc + Number(i.precio) * i.cantidad, 0)
  const totalPrecio = total

  return (
    <CarritoContext.Provider value={{
      items, carrito: items, carritoAbierto, setCarritoAbierto, cargando, cargarCarrito,
      agregar, agregarAlCarrito, quitar, quitarDelCarrito, cambiarCantidad,
      vaciar, vaciarCarrito, totalItems, total, totalPrecio,
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export const useCarrito = () => useContext(CarritoContext)