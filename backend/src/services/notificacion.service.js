import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporte = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER2,
    pass: process.env.EMAIL_PASS2,
  },
})

// Correo a la emprendedora cuando su cuenta es aprobada
export const enviarAprobacion = async (destinatario, nombre) => {
  await transporte.sendMail({
    from: `"EVA Marketplace" <${process.env.EMAIL_USER2}>`,
    to: destinatario,
    subject: 'Tu cuenta de emprendedora ha sido aprobada',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0f1f3a;">¡Felicitaciones, ${nombre}! 🎉</h2>
        <p>Tu solicitud como emprendedora en <strong>EVA Marketplace</strong> ha sido <strong style="color: #059669;">aprobada</strong>.</p>
        <p>Ya puedes iniciar sesión con tu correo y contraseña para acceder a tu panel de emprendedora.</p>
        <a href="http://localhost:5173/login"
          style="display:inline-block; background:#3b82f6; color:#fff; padding:0.75rem 1.5rem; border-radius:999px; text-decoration:none; font-weight:700; margin-top:1rem;">
          Iniciar sesión →
        </a>
        <p style="margin-top:1.5rem; color:#64748b; font-size:0.85rem;">Si tienes alguna duda escríbenos. ¡Bienvenida a EVA!</p>
      </div>
    `
  })
}

// Correo al admin cuando llega una nueva solicitud
export const enviarSolicitudAdmin = async (nombreEmprendedora, emailEmprendedora) => {
  await transporte.sendMail({
    from: `"EVA Marketplace" <${process.env.EMAIL_USER2}>`,
    to: process.env.EMAIL_USER2,
    subject: 'Nueva solicitud de emprendedora pendiente',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0f1f3a;">Nueva solicitud de emprendedora</h2>
        <p><strong>${nombreEmprendedora}</strong> (${emailEmprendedora}) se ha registrado como emprendedora y está esperando aprobación.</p>
        <a href="http://localhost:5173/admin"
          style="display:inline-block; background:#3b82f6; color:#fff; padding:0.75rem 1.5rem; border-radius:999px; text-decoration:none; font-weight:700; margin-top:1rem;">
          Revisar solicitud →
        </a>
      </div>
    `
  })
}