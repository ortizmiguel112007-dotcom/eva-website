import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporte = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER2,
    pass: process.env.EMAIL_PASS2,
  },
});

const API_URL = process.env.VITE_API_URL || "http://localhost:5173";

// Correo a la emprendedora cuando su cuenta es aprobada
export const enviarAprobacion = async (destinatario, nombre) => {
  await transporte.sendMail({
    from: `"EVA Marketplace" <${process.env.EMAIL_USER2}>`,
    to: destinatario,
    subject: "Tu cuenta de emprendedora ha sido aprobada — EVA",
    html: `
    <div style="margin:0; padding:0; background-color:#eef2f7; font-family: 'Segoe UI', Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15,23,42,0.08);">
 
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(100deg, #2563eb, #1d4ed8); padding: 32px; text-align: center;">
                  <span style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">EVA Marketplace</span>
                  <p style="margin: 6px 0 0; font-size: 13.5px; color: rgba(255,255,255,0.85);">Solicitud de emprendedora</p>
                </td>
              </tr>
 
              <!-- Body -->
              <tr>
                <td style="padding: 32px 32px 8px;">
                  <p style="margin: 0 0 6px; font-size: 17px; font-weight: 800; color: #0f172a;">Felicitaciones, ${nombre}</p>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #64748b; line-height: 1.55;">
                    Tu solicitud como emprendedora en EVA Marketplace fue revisada y aprobada. Ya puedes iniciar sesión con tu correo y contraseña para acceder a tu panel.
                  </p>
                </td>
              </tr>
 
              <!-- Status box -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
                    <tr>
                      <td style="padding: 14px 18px;">
                        <p style="margin: 0 0 3px; font-size: 13px; font-weight: 700; color: #166534;">Cuenta aprobada</p>
                        <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
                          Tu perfil está activo. Ya puedes publicar productos o servicios y empezar a vender.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
 
              <!-- Botón -->
              <tr>
                <td style="padding: 0 32px 32px; text-align: center;">
                  <a href="${API_URL}/login"
                    style="display: inline-block; background: linear-gradient(100deg, #2563eb, #1d4ed8); color: #fff; padding: 13px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
                    Iniciar sesión
                  </a>
                </td>
              </tr>
 
              <!-- Divider -->
              <tr>
                <td style="padding: 0 32px;">
                  <div style="border-top: 1px solid #f1f5f9;"></div>
                </td>
              </tr>
 
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px 28px;">
                  <p style="margin: 0; font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.5;">
                    Si tienes alguna duda, responde este correo. Bienvenida a EVA.
                  </p>
                </td>
              </tr>
 
            </table>
          </td>
        </tr>
      </table>
    </div>
    `,
  })
}
 
// Correo al admin cuando llega una nueva solicitud
export const enviarSolicitudAdmin = async (
  nombreEmprendedora,
  emailEmprendedora,
) => {
  await transporte.sendMail({
    from: `"EVA Marketplace" <${process.env.EMAIL_USER2}>`,
    to: process.env.EMAIL_USER2,
    subject: "Nueva solicitud de emprendedora pendiente — EVA",
    html: `
    <div style="margin:0; padding:0; background-color:#eef2f7; font-family: 'Segoe UI', Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15,23,42,0.08);">
 
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(100deg, #2563eb, #1d4ed8); padding: 32px; text-align: center;">
                  <span style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">EVA Marketplace</span>
                  <p style="margin: 6px 0 0; font-size: 13.5px; color: rgba(255,255,255,0.85);">Panel de administración</p>
                </td>
              </tr>
 
              <!-- Body -->
              <tr>
                <td style="padding: 32px 32px 8px;">
                  <p style="margin: 0 0 6px; font-size: 17px; font-weight: 800; color: #0f172a;">Nueva solicitud pendiente</p>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #64748b; line-height: 1.55;">
                    Alguien se registró como emprendedora y está esperando tu revisión.
                  </p>
                </td>
              </tr>
 
              <!-- Info solicitante -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
                    <tr>
                      <td style="padding: 10px 18px; font-size: 13px; color: #64748b;">Nombre</td>
                      <td style="padding: 10px 18px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">${nombreEmprendedora}</td>
                    </tr>
                    <tr>
                      <td style="padding: 0 18px 14px; font-size: 13px; color: #64748b; border-top: 1px solid #dbeafe;">Correo</td>
                      <td style="padding: 0 18px 14px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px solid #dbeafe;">${emailEmprendedora}</td>
                    </tr>
                  </table>
                </td>
              </tr>
 
              <!-- Aviso -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;">
                    <tr>
                      <td style="padding: 14px 18px;">
                        <p style="margin: 0 0 3px; font-size: 13px; font-weight: 700; color: #92400e;">Acción requerida</p>
                        <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                          Revisa el documento adjunto en la solicitud antes de aprobar o rechazar la cuenta.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
 
              <!-- Botón -->
              <tr>
                <td style="padding: 0 32px 32px; text-align: center;">
                  <a href="${API_URL}/admin"
                    style="display: inline-block; background: linear-gradient(100deg, #2563eb, #1d4ed8); color: #fff; padding: 13px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
                    Revisar solicitud
                  </a>
                </td>
              </tr>
 
              <!-- Divider -->
              <tr>
                <td style="padding: 0 32px;">
                  <div style="border-top: 1px solid #f1f5f9;"></div>
                </td>
              </tr>
 
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px 28px;">
                  <p style="margin: 0; font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.5;">
                    Notificación automática del sistema de administración de EVA.
                  </p>
                </td>
              </tr>
 
            </table>
          </td>
        </tr>
      </table>
    </div>
    `,
  })
}

// Correo al cliente cuando confirma un pedido
export const enviarConfirmacionPedido = async (destinatario, nombre, pedido, contexto = "compra", adjunto = null) => {
  const formatPrecio = (p) => "$" + Number(p).toLocaleString("es-CO")
  const formatFecha  = (f) => new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric"
  })

  const esPago = contexto === "pago"
  const asunto = esPago
    ? `Pago confirmado — Pedido #${pedido.id_pedido} — EVA`
    : `Confirmación de pedido #${pedido.id_pedido} — EVA`
  const subtitulo = esPago
    ? "Tu pago fue confirmado"
    : "Confirmación de compra"
  const saludo = esPago
    ? "Confirmamos que recibimos tu pago. Aquí está el resumen de tu pedido:"
    : "Tu pedido ha sido registrado exitosamente. Aquí está el resumen:"

  const productosHTML =
    pedido.detalles
      ?.map(
        (d) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #1e293b;">
        ${d.producto?.nombre_producto}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13.5px; color: #1e293b;">
        ${d.cantidad}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 13.5px; color: #1e293b;">
        ${formatPrecio(d.precio_unit)}
      </td>
    </tr>
  `,
      )
      .join("") || ""

  // Bloque de instrucciones según método/contexto (sin emojis, colores como acento)
  let avisoTitulo, avisoTexto, avisoBg, avisoBorde, avisoColorTitulo
  if (esPago) {
    avisoTitulo = "Pago verificado"
    avisoTexto  = "Tu comprobante fue revisado y aprobado. Tu pedido ya está en proceso."
    avisoBg = "#f0fdf4"; avisoBorde = "#bbf7d0"; avisoColorTitulo = "#166534"
  } else if (pedido.metodo_pago !== "contraentrega") {
    avisoTitulo = "Falta un paso"
    avisoTexto  = `Debes subir tu comprobante de pago para que tu pedido sea procesado. Puedes hacerlo desde <a href="${API_URL}/mis-pedidos" style="color:#2563eb; font-weight:600;">Mis pedidos</a>.`
    avisoBg = "#fffbeb"; avisoBorde = "#fde68a"; avisoColorTitulo = "#92400e"
  } else {
    avisoTitulo = "Pago contra entrega"
    avisoTexto  = "Pagarás cuando recibas tu pedido. No necesitas subir ningún comprobante."
    avisoBg = "#f0fdf4"; avisoBorde = "#bbf7d0"; avisoColorTitulo = "#166534"
  }

  await transporte.sendMail({
    from: `"EVA Marketplace" <${process.env.EMAIL_USER2}>`,
    to: destinatario,
    subject: asunto,
    html: `
    <div style="margin:0; padding:0; background-color:#eef2f7; font-family: 'Segoe UI', Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15,23,42,0.08);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(100deg, #2563eb, #1d4ed8); padding: 32px; text-align: center;">
                  <span style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">EVA Marketplace</span>
                  <p style="margin: 6px 0 0; font-size: 13.5px; color: rgba(255,255,255,0.85);">${subtitulo}</p>
                </td>
              </tr>

              <!-- Saludo -->
              <tr>
                <td style="padding: 28px 32px 4px;">
                  <p style="margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #0f172a;">Hola, ${nombre}</p>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #64748b; line-height: 1.55;">${saludo}</p>
                </td>
              </tr>

              <!-- Info pedido (tabla, no flex) -->
              <tr>
                <td style="padding: 0 32px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
                    <tr>
                      <td style="padding: 10px 18px; font-size: 13px; color: #64748b;">Número de pedido</td>
                      <td style="padding: 10px 18px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">#${pedido.id_pedido}</td>
                    </tr>
                    <tr>
                      <td style="padding: 0 18px 10px; font-size: 13px; color: #64748b; border-top: 1px solid #dbeafe;">Fecha</td>
                      <td style="padding: 0 18px 10px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px solid #dbeafe;">${formatFecha(pedido.fecha)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 0 18px 14px; font-size: 13px; color: #64748b; border-top: 1px solid #dbeafe; text-transform: none;">Método de pago</td>
                      <td style="padding: 0 18px 14px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right; text-transform: capitalize; border-top: 1px solid #dbeafe;">${pedido.metodo_pago || "No especificado"}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Productos -->
              <tr>
                <td style="padding: 0 32px 20px;">
                  <p style="margin: 0 0 10px; font-size: 13.5px; font-weight: 700; color: #0f172a;">Productos adquiridos</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                    <tr style="background-color: #f8fafc;">
                      <th align="left"   style="padding: 10px 8px; font-size: 11.5px; font-weight: 700; color: #64748b;">Producto</th>
                      <th align="center" style="padding: 10px 8px; font-size: 11.5px; font-weight: 700; color: #64748b;">Cant.</th>
                      <th align="right"  style="padding: 10px 8px; font-size: 11.5px; font-weight: 700; color: #64748b;">Precio</th>
                    </tr>
                    ${productosHTML}
                    <tr>
                      <td colspan="2" style="padding: 14px 8px; font-size: 14px; font-weight: 700; color: #0f172a;">Total</td>
                      <td style="padding: 14px 8px; font-size: 16px; font-weight: 800; color: #2563eb; text-align: right;">${formatPrecio(pedido.total)}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Aviso según estado -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${avisoBg}; border: 1px solid ${avisoBorde}; border-radius: 10px;">
                    <tr>
                      <td style="padding: 14px 18px;">
                        <p style="margin: 0 0 3px; font-size: 13px; font-weight: 700; color: ${avisoColorTitulo};">${avisoTitulo}</p>
                        <p style="margin: 0; font-size: 13px; color: ${avisoColorTitulo}; line-height: 1.5;">${avisoTexto}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Botón -->
              <tr>
                <td style="padding: 0 32px 32px; text-align: center;">
                  <a href="${API_URL}/mis-pedidos"
                    style="display: inline-block; background: linear-gradient(100deg, #2563eb, #1d4ed8); color: #fff; padding: 13px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
                    Ver mis pedidos
                  </a>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 32px;">
                  <div style="border-top: 1px solid #f1f5f9;"></div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px 28px;">
                  <p style="margin: 0; font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.5;">
                    Este correo fue enviado automáticamente por EVA Marketplace.<br>
                    Si tienes dudas, contáctanos respondiendo este correo.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
    `,
    attachments: adjunto ? [
      { filename: adjunto.filename, content: adjunto.buffer, contentType: "application/pdf" }
    ] : [],
  })
}