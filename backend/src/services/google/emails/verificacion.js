const verificacion = (codigo) => `
<div style="margin:0; padding:0; background-color:#0b1120; font-family:'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="max-width:480px; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.35);"
        >

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(100deg,#29b1ff,#6366f1); padding:36px 32px; text-align:center;">
              
              <div style="width:52px; height:52px; background:rgba(255,255,255,0.18); border-radius:14px; margin:0 auto 14px; line-height:52px; text-align:center;">
                <span style="font-size:24px;">🔐</span>
              </div>

              <span style="font-size:20px; font-weight:800; color:#ffffff; letter-spacing:0.5px;">
                EVA
              </span>

              <p style="margin:4px 0 0; font-size:13px; color:rgba(255,255,255,0.85);">
                Verificación de cuenta
              </p>

            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 8px;">

              <p style="margin:0 0 8px; font-size:15px; color:#0f172a; font-weight:600;">
                Hola,
              </p>

              <p style="margin:0 0 28px; font-size:14.5px; color:#64748b; line-height:1.6;">
                Usa el siguiente código para verificar tu cuenta y continuar.
                Este código es de un solo uso.
              </p>

              <!-- Code box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td
                    align="center"
                    style="background:linear-gradient(135deg,#eff8ff,#eef2ff); border:1.5px solid #bfe3ff; border-radius:14px; padding:24px;"
                  >

                    <span
                      style="display:block; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#6b7db8; margin-bottom:10px;"
                    >
                      Código de verificación
                    </span>

                    <span
                      style="font-size:34px; font-weight:800; letter-spacing:10px; color:#0f172a;"
                    >
                      ${codigo}
                    </span>

                  </td>
                </tr>
              </table>

              <div style="text-align:center; margin:20px 0 4px;">
                <span style="font-size:12.5px; color:#94a3b8;">
                  ⏱ Expira en 10 minutos
                </span>
              </div>

            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:20px 32px 0;">

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="background-color:#f8fafc; border-radius:10px;"
              >
                <tr>
                  <td style="padding:14px 16px; font-size:12.5px; color:#64748b; line-height:1.5;">
                    🛡️ Si no solicitaste este código, ignora este correo.
                    Nadie de EVA te pedirá compartir este código por ningún
                    otro medio.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px;">

              <p
                style="margin:0; font-size:11.5px; color:#cbd5e1; line-height:1.5; text-align:center;"
              >
                © ${new Date().getFullYear()} EVA · Marketplace de emprendedoras
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</div>
`

export default verificacion