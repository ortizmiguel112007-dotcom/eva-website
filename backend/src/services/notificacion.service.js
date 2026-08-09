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

// Correo a la emprendedora cuando su cuenta es aprobada
export const enviarAprobacion = async (destinatario, nombre) => {
  await transporte.sendMail({
    from: `"EVA Marketplace" <${process.env.EMAIL_USER2}>`,
    to: destinatario,
    subject: "Tu cuenta de emprendedora ha sido aprobada",
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
    `,
  });
};

// Correo al admin cuando llega una nueva solicitud
export const enviarSolicitudAdmin = async (
  nombreEmprendedora,
  emailEmprendedora,
) => {
  await transporte.sendMail({
    from: `"EVA Marketplace" <${process.env.EMAIL_USER2}>`,
    to: process.env.EMAIL_USER2,
    subject: "Nueva solicitud de emprendedora pendiente",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0f1f3a;">Nueva solicitud de emprendedora</h2>
        <p><strong>${nombreEmprendedora}</strong> (${emailEmprendedora}) se ha registrado como emprendedora y está esperando aprobación.</p>
        <a href="http://localhost:5173/admin"
          style="display:inline-block; background:#3b82f6; color:#fff; padding:0.75rem 1.5rem; border-radius:999px; text-decoration:none; font-weight:700; margin-top:1rem;">
          Revisar solicitud →
        </a>
      </div>
    `,
  });
};

// Correo al cliente cuando confirma un pedido
export const enviarConfirmacionPedido = async (destinatario, nombre, pedido, contexto = "compra", adjunto = null) => {
  const formatPrecio = (p) => "$" + Number(p).toLocaleString("es-CO")
  const formatFecha  = (f) => new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric"
  })

  const esPago = contexto === "pago"
  const asunto = esPago
    ? `✅ Pago confirmado — Pedido #${pedido.id_pedido} — EVA`
    : `✅ Confirmación de pedido #${pedido.id_pedido} — EVA`
  const subtitulo = esPago
    ? "Tu pago fue confirmado"
    : "Confirmación de compra";
  const saludo = esPago
    ? "Confirmamos que recibimos tu pago. Aquí está el resumen de tu pedido:"
    : "Tu pedido ha sido registrado exitosamente. Aquí está el resumen:";

  const productosHTML =
    pedido.detalles
      ?.map(
        (d) => `
    <tr>
      <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9;">
        ${d.producto?.nombre_producto}
      </td>
      <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9; text-align: center;">
        ${d.cantidad}
      </td>
      <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9; text-align: right;">
        ${formatPrecio(d.precio_unit)}
      </td>
    </tr>
  `,
      )
      .join("") || "";

  await transporte.sendMail({
    from: `"EVA Marketplace" <${process.env.EMAIL_USER2}>`,
    to: destinatario,
   subject: asunto,
    html: `
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; background: #f8fafc; padding: 2rem; border-radius: 1rem;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 0.75rem; padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
          <h1 style="color: #fff; margin: 0; font-size: 1.5rem;">EVA Marketplace</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 0.5rem 0 0; font-size: 0.9rem;">${subtitulo}</p>
        </div>

        <!-- Saludo -->
        <div style="background: #fff; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
          <h2 style="color: #0f172a; margin: 0 0 0.5rem;">¡Hola, ${nombre}! 🎉</h2>
          <p style="color: #64748b; margin: 0;">${saludo}</p>
        </div>

        <!-- Info pedido -->
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 0.75rem; padding: 1rem 1.5rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: #64748b; font-size: 0.85rem;">Número de pedido</span>
            <strong style="color: #1e293b;">#${pedido.id_pedido}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: #64748b; font-size: 0.85rem;">Fecha</span>
            <strong style="color: #1e293b;">${formatFecha(pedido.fecha)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b; font-size: 0.85rem;">Método de pago</span>
            <strong style="color: #1e293b; text-transform: capitalize;">${pedido.metodo_pago || "—"}</strong>
          </div>
        </div>

        <!-- Productos -->
        <div style="background: #fff; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
          <h3 style="color: #0f172a; margin: 0 0 1rem; font-size: 0.95rem;">Productos adquiridos</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 0.5rem; text-align: left; color: #64748b; font-weight: 600;">Producto</th>
                <th style="padding: 0.5rem; text-align: center; color: #64748b; font-weight: 600;">Cant.</th>
                <th style="padding: 0.5rem; text-align: right; color: #64748b; font-weight: 600;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
          </table>
          <div style="border-top: 2px solid #e5e7eb; margin-top: 1rem; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; color: #0f172a;">Total</span>
            <strong style="font-size: 1.15rem; color: #3b82f6;">${formatPrecio(pedido.total)}</strong>
          </div>
        </div>

         <!-- Instrucciones según método y contexto -->
        ${esPago ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 1rem 1.5rem; margin-bottom: 1rem;">
          <p style="margin: 0; color: #166534; font-size: 0.88rem;">
            ✅ <strong>Pago verificado:</strong> tu comprobante fue revisado y aprobado. Tu pedido ya está en proceso.
          </p>
        </div>
        ` : pedido.metodo_pago !== "contraentrega" ? `
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 0.75rem; padding: 1rem 1.5rem; margin-bottom: 1rem;">
          <p style="margin: 0; color: #92400e; font-size: 0.88rem;">
            ⚠️ <strong>Recuerda:</strong> debes subir tu comprobante de pago para que tu pedido sea procesado.
            Puedes hacerlo desde <a href="http://localhost:5173/mis-pedidos" style="color: #3b82f6;">Mis Pedidos</a>.
          </p>
        </div>
        ` : `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 1rem 1.5rem; margin-bottom: 1rem;">
          <p style="margin: 0; color: #166534; font-size: 0.88rem;">
            ✅ <strong>Pago contra entrega:</strong> pagarás cuando recibas tu pedido. No necesitas subir ningún comprobante.
          </p>
        </div>
        `}

        <!-- Botón -->
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <a href="http://localhost:5173/mis-pedidos"
            style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; padding: 0.85rem 2rem; border-radius: 0.65rem; text-decoration: none; font-weight: 700; font-size: 0.95rem;">
            Ver mis pedidos →
          </a>
        </div>

        <!-- Footer -->
        <p style="text-align: center; color: #94a3b8; font-size: 0.78rem; margin: 0;">
          Este correo fue enviado automáticamente por EVA Marketplace. Si tienes dudas, contáctanos.
        </p>
      </div>
    `,
     attachments: adjunto ? [
      { filename: adjunto.filename, content: adjunto.buffer, contentType: "application/pdf" }
    ] : [],
  });
};
