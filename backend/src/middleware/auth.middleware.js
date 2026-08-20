import jwt from 'jsonwebtoken'

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const tokenHeader = authHeader?.split(' ')[1]  // Bearer <token>
  const tokenQuery = req.query.token             // fallback para links de descarga directa (ej. exportar PDF/Excel)

  const token = tokenHeader || tokenQuery

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // { id, email, rol, nombre }
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}