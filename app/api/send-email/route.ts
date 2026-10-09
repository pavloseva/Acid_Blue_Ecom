import { NextResponse } from "next/server"

function generateAcidEmailHtml({
  subject,
  body,
}: {
  subject: string
  body: string
}) {
  const formattedBody = body
    .split("\n")
    .map((line) => line.trim())
    .map((line) => {
      if (!line) return `<div style="height: 12px;"></div>`
      if (line.startsWith("•") || line.startsWith("-")) {
        return `<div style="padding: 4px 0; color: #cbd5e1; font-family: monospace; font-size: 13px;">${line}</div>`
      }
      if (line.includes("ACID10")) {
        return `
          <div style="background: rgba(47, 212, 230, 0.08); border: 1px dashed #2fd4e6; border-radius: 12px; padding: 18px; margin: 18px 0; text-align: center;">
            <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Cupón de bienvenida</div>
            <div style="color: #2fd4e6; font-size: 24px; font-weight: bold; letter-spacing: 4px; font-family: monospace; margin: 8px 0;">ACID10</div>
            <div style="color: #e2e8f0; font-size: 13px;">10% OFF en tu próxima compra</div>
          </div>
        `
      }
      return `<p style="margin: 0 0 10px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">${line}</p>`
    })
    .join("")

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #05070a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
    <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #1e293b;">
      <h1 style="margin: 0; font-size: 24px; letter-spacing: 6px; text-transform: uppercase; color: #2fd4e6; font-weight: 800;">ACID BLUE</h1>
      <p style="margin: 6px 0 0; color: #64748b; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Arte urbano & Estampas de Autor · Córdoba</p>
    </div>

    <div style="background-color: #0b0f17; border: 1px solid #1e293b; border-radius: 18px; padding: 28px 24px; margin-top: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 700;">
        ${subject}
      </h2>
      <div style="color: #cbd5e1;">
        ${formattedBody}
      </div>
    </div>

    <div style="text-align: center; margin-top: 32px; color: #64748b; font-size: 12px; line-height: 1.5;">
      <p style="margin: 0 0 6px;">Acid Blue Store · Todos los derechos reservados</p>
      <p style="margin: 0;">Córdoba Capital, Argentina</p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { to, subject, body, type, orderId } = data

    if (!to || !subject) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (destinatario o asunto)" },
        { status: 400 }
      )
    }

    console.log(`[EMAIL DISPATCH] Para: ${to} | Asunto: ${subject} | Tipo: ${type} | Pedido: ${orderId || "N/A"}`)

    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.EMAIL_FROM || "Acid Blue <onboarding@resend.dev>"

    // If Resend API Key is configured, send the real email!
    if (apiKey) {
      const html = generateAcidEmailHtml({ subject, body })

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject: subject,
          html: html,
          text: body,
        }),
      })

      const resendData = await resendRes.json()

      if (!resendRes.ok) {
        console.error("[RESEND ERROR]", resendData)
        return NextResponse.json(
          {
            error: resendData.message || "Error al enviar correo mediante Resend",
            details: resendData,
          },
          { status: resendRes.status }
        )
      }

      console.log("[RESEND SUCCESS] Email id:", resendData.id)
      return NextResponse.json({
        success: true,
        message: "Correo enviado exitosamente a tu casilla",
        id: resendData.id,
        recipient: to,
      })
    }

    // Fallback: Resend key not yet set in .env.local
    console.warn("[EMAIL SIMULATION] RESEND_API_KEY no configurada en .env.local. El correo fue simulado.")
    return NextResponse.json({
      success: true,
      simulation: true,
      message: "Correo registrado. Para envío real a tu casilla Gmail, agrega RESEND_API_KEY en .env.local",
      recipient: to,
    })
  } catch (error) {
    console.error("Error al procesar el envío de correo:", error)
    return NextResponse.json(
      { error: "Error en el servidor de correo" },
      { status: 500 }
    )
  }
}
