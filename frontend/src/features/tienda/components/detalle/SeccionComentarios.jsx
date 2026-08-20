import { useState } from "react"
import { FiStar, FiMessageSquare, FiLogIn } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { getAvatarGradient, getInitials } from "@/features/tienda/utils/avatar"
import { FormComentario } from "./FormComentario"

import "@/infrastructure/css/tienda/detalle/SeccionComentarios.css"

function Estrellas({ cal, size = 15 }) {
  return (
    <div className="dp-estrellas">
      {[1, 2, 3, 4, 5].map(i => (
        <FiStar key={i} size={size}
          fill={i <= cal ? "#f59e0b" : "none"}
          color={i <= cal ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </div>
  )
}

function formatFecha(f) {
  return new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric"
  })
}

export function SeccionComentarios({
  comentarios,
  promedio,
  // props opcionales — solo usuario las pasa
  token,
  pedidoEntregado,
  onSubmitComentario,
}) {
  const navigate = useNavigate()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [calForm, setCalForm]         = useState(0)
  const [textoForm, setTextoForm]     = useState("")
  const [errorCom, setErrorCom]       = useState("")
  const [enviandoCom, setEnviandoCom] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!calForm)          { setErrorCom("Selecciona una calificación"); return }
    if (!textoForm.trim()) { setErrorCom("Escribe un comentario"); return }
    setEnviandoCom(true)
    try {
      await onSubmitComentario({ calificacion: calForm, texto: textoForm })
      setTextoForm(""); setCalForm(0); setMostrarForm(false)
    } catch (err) {
      setErrorCom(err.response?.data?.error || err.message || "Error al enviar")
    } finally { setEnviandoCom(false) }
  }

  return (
    <div className="dp-seccion">
      <div className="dp-seccion-header">
        <h2 className="dp-seccion-titulo">
          <FiStar size={18} color="#f59e0b" /> Reseñas y Calificaciones
        </h2>

        {/* Botón acción — cambia según contexto */}
        {onSubmitComentario ? (
          // contexto usuario
          token && pedidoEntregado ? (
            <button className="dp-btn-resena" onClick={() => setMostrarForm(p => !p)}>
              <FiMessageSquare size={14} />
              {mostrarForm ? "Cancelar" : "Dejar reseña"}
            </button>
          ) : token && !pedidoEntregado ? (
            <span className="dp-resena-hint">Compra este producto para reseñarlo</span>
          ) : null
        ) : (
          // contexto tienda — solo login
          <button className="dp-btn-resena" onClick={() => navigate("/login")}>
            <FiLogIn size={14} /> Inicia sesión para reseñar
          </button>
        )}
      </div>

      {promedio && (
        <div className="dp-promedio">
          <span className="dp-promedio-num">{promedio}</span>
          <div>
            <Estrellas cal={Math.round(Number(promedio))} size={18} />
            <span className="dp-promedio-count">{comentarios.length} reseñas</span>
          </div>
        </div>
      )}

      {/* Formulario — solo si usuario lo habilitó */}
      {mostrarForm && onSubmitComentario && (
        <FormComentario
          calForm={calForm} setCalForm={setCalForm}
          textoForm={textoForm} setTextoForm={setTextoForm}
          errorCom={errorCom} setErrorCom={setErrorCom}
          enviandoCom={enviandoCom}
          onSubmit={handleSubmit}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {comentarios.length === 0 ? (
        <div className="dp-sin-comentarios">
          <FiMessageSquare size={36} color="#cbd5e1" />
          <p>Aún no hay reseñas</p>
          <span>
            {onSubmitComentario
              ? "Sé el primero en comentar después de tu compra"
              : "Inicia sesión y compra para comentar"}
          </span>
        </div>
      ) : (
        <div className="dp-comentarios-lista">
          {comentarios.map(c => {
            const [ca, cb] = getAvatarGradient(c.usuario?.nombre)
            return (
              <div key={c.id_comentario} className="dp-comentario">
                <div className="dp-comentario-header">
                  <div className="dp-comentario-usuario">
                    <div className="dp-comentario-avatar"
                      style={{ background: `linear-gradient(135deg, ${ca}, ${cb})` }}>
                      {getInitials(c.usuario?.nombre)}
                    </div>
                    <div>
                      <p className="dp-comentario-nombre">{c.usuario?.nombre}</p>
                      <Estrellas cal={c.calificacion} size={12} />
                    </div>
                  </div>
                  <span className="dp-comentario-fecha">{formatFecha(c.fecha)}</span>
                </div>
                <p className="dp-comentario-texto">"{c.texto}"</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}