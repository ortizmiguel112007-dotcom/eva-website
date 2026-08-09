export function getInitials(nombre) {
    if (!nombre) return "?"
    
    return nombre
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
}

export function formatPrecio(precio) {
    return "$" + Number(precio).toLocaleString("es-CO")
}

export function getAvatarColor(nombre, avatarColor) {
    if (!nombre) return avatarColor[0]

    const sum = nombre
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0)

    return avatarColor[sum % avatarColor.length]
}

export function formatFecha(f) {
  return new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  })
}