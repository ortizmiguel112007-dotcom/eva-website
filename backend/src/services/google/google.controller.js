import {
  obtenerUrlAutorizacion,
  obtenerTokens,
} from './google.service.js'

// Inicia el proceso de autorización con Google
export const iniciarGoogleOAuth = (req, res) => {
  try {
    const url = obtenerUrlAutorizacion()

    return res.redirect(url)
  } catch (error) {
    console.error('Error iniciando OAuth de Google:', error)

    return res.status(500).json({
      error: 'No se pudo iniciar la autorización de Google',
    })
  }
}

// Google redirige aquí después de autorizar
export const googleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query

    if (!code) {
      return res.status(400).json({
        error: 'No se recibió el código de autorización de Google',
      })
    }

    const tokens = await obtenerTokens(code)

    /*
      IMPORTANTE:
      El refresh_token se obtiene normalmente solamente
      durante la primera autorización o cuando se fuerza
      nuevamente el consentimiento.

      Copia este valor y guárdalo en Render como:
      GOOGLE_REFRESH_TOKEN
    */

    // http://localhost:3000/auth/google
    console.log('======================================')
    console.log('GOOGLE REFRESH TOKEN:')
    console.log(tokens.refresh_token)
    console.log('======================================')

    return res.send(`
      <h1>Google autorizado correctamente</h1>
      <p>El refresh token fue generado.</p>
      <p>Revisa los logs del servidor y guárdalo en Render.</p>
    `)
  } catch (error) {
    console.error('Error en callback de Google:', error)

    return res.status(500).json({
      error: 'Error autorizando Google',
    })
  }
}