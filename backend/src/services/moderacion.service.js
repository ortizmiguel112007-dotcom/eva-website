import { Filter } from "bad-words"

const filtro = new Filter()

const palabrasEspanol = [
  "idiota", "estupido", "estúpido", "imbecil", "imbécil", "pendejo",
  "mierda", "puta", "puto", "maricon", "maricón", "cabron", "cabrón",
  "basura", "gilipollas", "verga", "coño", "joder", "carajo",
  "hijueputa", "hijo de puta", "malparido", "marica",
]
filtro.addWords(...palabrasEspanol)

export const moderarTexto = async (texto) => {
  try {
    const textoLower = texto.toLowerCase()
    const contienePalabraProhibida = palabrasEspanol.some((palabra) =>
      textoLower.includes(palabra)
    )
    const flagged = filtro.isProfane(texto) || contienePalabraProhibida

    return {
      flagged,
      categorias: flagged ? ["lenguaje_ofensivo"] : [],
      error: false,
    }
  } catch (err) {
    console.error("Error al moderar texto:", err)
    return { flagged: false, categorias: [], error: true }
  }
}