// Límites definidos en la matriz de requisitos (RI-001)
export const LIMITES = { nombre: 60, email: 80, password: 40, telefono: 10 }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN = 8

/**
 * Valida los datos de un usuario creado/actualizado por el administrador.
 * - Creación: nombre, email y contraseña son obligatorios.
 * - Actualización ({ parcial: true }): solo se validan los campos enviados.
 * Devuelve un mensaje de error (string) o null si todo es válido.
 */
export function validarUsuario({ nombre, email, password, telefono }, { parcial = false } = {}) {
  if (!parcial || nombre !== undefined) {
    if (!nombre?.trim()) return "El nombre es obligatorio"
    if (nombre.length > LIMITES.nombre)
      return `El nombre no puede superar ${LIMITES.nombre} caracteres`
  }

  if (!parcial || email !== undefined) {
    if (!email?.trim()) return "El correo electrónico es obligatorio"
    if (email.length > LIMITES.email)
      return `El correo no puede superar ${LIMITES.email} caracteres`
    if (!EMAIL_REGEX.test(email.trim())) return "El formato del correo no es válido"
  }

  if (!parcial || (password !== undefined && password !== "")) {
    if (!password) return "La contraseña es obligatoria"
    if (password.length < PASSWORD_MIN)
      return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`
    if (password.length > LIMITES.password)
      return `La contraseña no puede superar ${LIMITES.password} caracteres`
  }

  if (telefono && telefono.length > LIMITES.telefono)
    return `El teléfono no puede superar ${LIMITES.telefono} caracteres`

  return null
}