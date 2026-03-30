import { createContext, useContext, useState, useEffect } from "react"

const CarritoContext = createContext()

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem("carrito")
    return saved ? JSON.parse(saved) : []
  })

  const [carritoAbierto, setCarritoAbierto] = useState(false)

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito))
  }, [carrito])

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id_producto === producto.id_producto)
      if (existe) {
        return prev.map(i =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
    setCarritoAbierto(true)
  }

  const quitarDelCarrito = (id_producto) => {
    setCarrito(prev => prev.filter(i => i.id_producto !== id_producto))
  }

  const cambiarCantidad = (id_producto, cantidad) => {
    if (cantidad <= 0) return quitarDelCarrito(id_producto)
    setCarrito(prev =>
      prev.map(i => i.id_producto === id_producto ? { ...i, cantidad } : i)
    )
  }

  const vaciarCarrito = () => setCarrito([])

  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0)
  const totalPrecio = carrito.reduce((acc, i) => acc + Number(i.precio) * i.cantidad, 0)

  return (
    <CarritoContext.Provider value={{
      carrito, carritoAbierto, setCarritoAbierto,
      agregarAlCarrito, quitarDelCarrito, cambiarCantidad,
      vaciarCarrito, totalItems, totalPrecio
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export const useCarrito = () => useContext(CarritoContext)