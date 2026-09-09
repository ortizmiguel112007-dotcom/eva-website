import 'dotenv/config'
import { google } from 'googleapis'

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
  EMAIL_USER,
} = process.env

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
)

export const obtenerUrlAutorizacion = () => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  })
}

export const obtenerTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code)

  return tokens
}

export const obtenerClienteGmail = () => {
  if (!GOOGLE_REFRESH_TOKEN) {
    throw new Error(
      'Falta GOOGLE_REFRESH_TOKEN en las variables de entorno'
    )
  }

  oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN,
  })

  return google.gmail({
    version: 'v1',
    auth: oauth2Client,
  })
}

export const obtenerPlantilla = async (nombreArchivo) => {
  const modulo = await import(`./emails/${nombreArchivo}.js`)

  if (modulo.default) {
    return modulo.default
  }

  const plantilla = Object.values(modulo).find(
    (valor) => typeof valor === 'function'
  )

  if (!plantilla) {
    throw new Error(
      `El archivo ${nombreArchivo}.js no contiene una plantilla válida`
    )
  }

  return plantilla
}

const convertirBase64Url = (texto) => {
  return Buffer.from(texto, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const codificarAsunto = (asunto) => {
  return `=?UTF-8?B?${Buffer.from(asunto, 'utf8').toString('base64')}?=`
}

const crearMensaje = ({
  destinatario,
  asunto,
  html,
}) => {
  const mensaje = [
    `From: EVA <${EMAIL_USER}>`,
    `To: ${destinatario}`,
    `Subject: ${codificarAsunto(asunto)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    html,
  ].join('\r\n')

  return convertirBase64Url(mensaje)
}

export const enviarCorreo = async (
  destinatario,
  asunto,
  nombrePlantilla,
  datos = []
) => {
  const gmail = obtenerClienteGmail()
  const plantilla = await obtenerPlantilla(nombrePlantilla)
  const html = plantilla(...datos)
  const raw = crearMensaje({
    destinatario,
    asunto,
    html,
  })

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
    },
  })

  console.log(`Correo enviado a ${destinatario}`)
}