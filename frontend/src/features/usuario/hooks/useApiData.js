import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useApiData(endpoint, token, deps = []) {
  const [data, setData]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!token) { setCargando(false); return }
    setCargando(true)
    axios.get(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(Array.isArray(res.data) ? res.data : res.data))
      .catch(err => setError(err))
      .finally(() => setCargando(false))
  }, [token, ...deps])

  return { data, cargando, error, setData }
}