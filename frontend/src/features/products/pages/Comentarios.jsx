import { useAuth } from "@/core/context/AuthConten"
import { ResenasModeracion } from "@/features/products/components/comentarios/ResenasModeracion"

export default function Comentarios() {
  const { token } = useAuth()

  return (
    <ResenasModeracion
      titulo="Comentarios y Calificaciones"
      subtitulo="Reseñas de tus clientes sobre tus productos y servicios."
      endpointComentarios="/api/comentarios"
      endpointReporte="/api/emprendedora/reportes/retroalimentacion"
      headers={{ Authorization: `Bearer ${token}` }}
    />
  )
}