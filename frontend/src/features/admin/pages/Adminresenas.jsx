import { ResenasModeracion } from "@/features/products/components/comentarios/ResenasModeracion"
import { getHeaders } from "@/features/admin/utils/utils"

export default function AdminResenas() {
  return (
    <ResenasModeracion
      titulo="Moderar Comentarios"
      subtitulo="Supervisa y modera las reseñas de la plataforma"
      endpointComentarios="/api/admin/comentarios"
      endpointReporte="/api/admin/reportes/retroalimentacion"
      headers={getHeaders()}
    />
  )
}