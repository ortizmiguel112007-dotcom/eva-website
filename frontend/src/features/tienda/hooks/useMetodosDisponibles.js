import { useState, useEffect } from "react"
import axios from "axios"

const BASE = "http://localhost:3000"

// RN-052: métodos de pago habilitados a nivel plataforma (configurados por el admin),
// ya no se consulta por emprendedora porque el pago ahora es centralizado hacia EVA.
export function useMetodosDisponibles(token) {
  const [metodosDisponibles, setMetodosDisponibles] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    axios.get(`${BASE}/api/metodos-pago/eva`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(({ data }) => {
        setMetodosDisponibles({
          nequi:         !!data.nequi_numero,
          bancolombia:   !!data.bancolombia_numero,
          contraentrega: data.acepta_contraentrega !== false,
        })
      })
      .catch(() => setMetodosDisponibles(null))
      .finally(() => setCargando(false))
  }, [token])

  return { metodosDisponibles, cargando }
}