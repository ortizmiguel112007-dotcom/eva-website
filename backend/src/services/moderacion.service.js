import { Filter } from "bad-words"

const filtro = new Filter()

const palabrasEspanol = [
  // Originales
  "idiota", "estupido", "estúpido", "imbecil", "imbécil", "pendejo",
  "mierda", "puta", "puto", "maricon", "maricón", "cabron", "cabrón",
  "basura", "gilipollas", "verga", "coño", "joder", "carajo",
  "hijueputa", "hijo de puta", "malparido", "marica",
  // Abreviaciones previas
  "hpta", "hp", "mrd", "pt", "pta", "pende", "pndjo",
  "imbcl", "estpd", "mrct", "mrc", "mrk", "mk",
  "vga", "cbrn", "mlprd", "malpar", "prra", "ptas",
  "qlo", "qlero", "vrg", "cj", "jdr",
  // Nuevas adiciones hasta completar 100
  "zorra", "zra", "putita", "putito", "putazos", "mierdero", "mrdto",
  "estupideces", "estupidez", "imbecilidad", "pendejada", "pendejadas",
  "maricadas", "mariconada", "cabronada", "culero", "culera", "culo",
  "culazos", "vergoña", "vergaso", "vergazo", "verguda", "coñaso",
  "coñazo", "jodido", "jodida", "jodidos", "jodidas", "carajito",
  "carajita", "malparida", "malparidos", "hijueputas", "hijos de puta",
  "soplagaitas", "gilipollas", "boludo", "boluda", "boludito", "pelotudo",
  "pelotuda", "pelotudeces", "conchudo", "conchuda", "chinga", "chingada",
  "chingado", "chingaderas", "chingón", "pichurria", "pichurria", "gonorrea",
  "gnrr", "careverga", "carivega", "chuchas", "chucha", "culiao", "culiada",
  "culiado", "culiaos", "culia", "mamaguevo", "mamahuevo", "mmgvo", "mmgv",
  "chupa", "chupapija", "pija", "pijas", "pichula", "pichulas", "pirobo",
  "prbo", "sapo", "sapa", "chismoso", "chismosa", "careculo", "guache",
  "chimbo", "chimba", "chimbo", "chimbita", "chimbas", "loca", "perrazo"
];
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