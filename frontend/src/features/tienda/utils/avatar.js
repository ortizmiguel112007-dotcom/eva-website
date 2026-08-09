const AVATAR_COLORS = [
  ["#3b82f6", "#1d4ed8"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#7c3aed", "#5b21b6"],
  ["#ef4444", "#dc2626"],
  ["#0891b2", "#0e7490"],
]

export function getAvatarGradient(nombre) {
  if (!nombre) return AVATAR_COLORS[0]
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export function getInitials(nombre) {
  if (!nombre) return "?"
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}