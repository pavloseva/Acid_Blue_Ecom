import { NextResponse } from "next/server"
import tls from "tls"

function sendViaGmailSmtp({
  user,
  pass,
  to,
  subject,
  html,
  text,
}: {
  user: string
  pass: string
  to: string
  subject: string
  html: string
  text?: string
}): Promise<{ success: boolean; messageId: string }> {
  return new Promise((resolve, reject) => {
    const cleanPass = pass.replace(/\s+/g, "")
    const socket = tls.connect(465, "smtp.gmail.com", { rejectUnauthorized: true })

    let step = 0
    let buffer = ""

    socket.setEncoding("utf8")

    socket.on("data", (chunk) => {
      buffer += chunk
      const lines = buffer.trim().split("\r\n")
      const lastLine = lines[lines.length - 1]

      if (!/^\d{3}\s/.test(lastLine)) {
        return
      }

      const code = parseInt(lastLine.slice(0, 3), 10)
      buffer = ""

      try {
        if (step === 0 && code === 220) {
          step = 1
          socket.write("EHLO localhost\r\n")
        } else if (step === 1 && code === 250) {
          step = 2
          socket.write("AUTH LOGIN\r\n")
        } else if (step === 2 && code === 334) {
          step = 3
          socket.write(Buffer.from(user).toString("base64") + "\r\n")
        } else if (step === 3 && code === 334) {
          step = 4
          socket.write(Buffer.from(cleanPass).toString("base64") + "\r\n")
        } else if (step === 4 && code === 235) {
          step = 5
          socket.write(`MAIL FROM:<${user}>\r\n`)
        } else if (step === 5 && code === 250) {
          step = 6
          socket.write(`RCPT TO:<${to}>\r\n`)
        } else if (step === 6 && code === 250) {
          step = 7
          socket.write("DATA\r\n")
        } else if (step === 7 && code === 354) {
          step = 8
          const boundary = `acid_alt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
          const dateStr = new Date().toUTCString()
          const messageId = `<acid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@gmail.com>`
          const textBody = text || html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

          const emailMessage = [
            `From: Acid Blue <${user}>`,
            `To: <${to}>`,
            `Reply-To: Acid Blue <${user}>`,
            `Date: ${dateStr}`,
            `Message-ID: ${messageId}`,
            `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
            "MIME-Version: 1.0",
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            "",
            `--${boundary}`,
            "Content-Type: text/plain; charset=UTF-8",
            "Content-Transfer-Encoding: base64",
            "",
            Buffer.from(textBody).toString("base64"),
            "",
            `--${boundary}`,
            "Content-Type: text/html; charset=UTF-8",
            "Content-Transfer-Encoding: base64",
            "",
            Buffer.from(html).toString("base64"),
            "",
            `--${boundary}--`,
            "",
            ".\r\n",
          ].join("\r\n")

          socket.write(emailMessage)
        } else if (step === 8 && code === 250) {
          step = 9
          socket.write("QUIT\r\n")
          resolve({ success: true, messageId: lastLine })
        } else if (code >= 400) {
          socket.destroy()
          reject(new Error(`Gmail SMTP Error [${code}]: ${lastLine}`))
        }
      } catch (err) {
        socket.destroy()
        reject(err)
      }
    })

    socket.on("error", (err) => {
      reject(err)
    })

    socket.setTimeout(12000, () => {
      socket.destroy()
      reject(new Error("Tiempo de espera agotado al conectar con Gmail SMTP"))
    })
  })
}

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

    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    // 1. If Gmail SMTP credentials are provided, send directly from official Gmail to ANY client!
    if (gmailUser && gmailPass) {
      try {
        const html = generateAcidEmailHtml({ subject, body })
        const smtpRes = await sendViaGmailSmtp({
          user: gmailUser,
          pass: gmailPass,
          to,
          subject,
          html,
          text: body,
        })
        console.log("[GMAIL SMTP SUCCESS] Para:", to, "MessageId:", smtpRes.messageId)
        return NextResponse.json({
          success: true,
          provider: "gmail",
          message: `Correo enviado exitosamente a ${to} desde ${gmailUser}`,
          messageId: smtpRes.messageId,
          recipient: to,
        })
      } catch (smtpErr) {
        console.error("[GMAIL SMTP ERROR]", smtpErr)
        // If SMTP fails, fallback to Resend below if configured
      }
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.EMAIL_FROM || "Acid Blue <onboarding@resend.dev>"

    // 2. If Resend API Key is configured, send via Resend
    if (apiKey) {
      const html = generateAcidEmailHtml({ subject, body })

      let resendRes = await fetch("https://api.resend.com/emails", {
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

      let resendData = await resendRes.json()

      // If Resend onboarding test mode restricts sending to other emails, route test copy to registered owner!
      if (!resendRes.ok && resendData?.message?.includes("sv.pablo@gmail.com")) {
        console.warn(`[RESEND TEST MODE] Redirigiendo correo de prueba a sv.pablo@gmail.com (destinatario original: ${to})`)
        resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: ["sv.pablo@gmail.com"],
            subject: `[Prueba para: ${to}] ${subject}`,
            html: html,
            text: `(Destinado originalmente a: ${to})\n\n` + body,
          }),
        })
        resendData = await resendRes.json()
      }

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
        provider: "resend",
        message: "Correo enviado exitosamente a tu casilla",
        id: resendData.id,
        recipient: to,
      })
    }

    // 3. Fallback: Neither Gmail nor Resend configured
    console.warn("[EMAIL SIMULATION] Ni GMAIL_APP_PASSWORD ni RESEND_API_KEY configuradas. Correo simulado.")
    return NextResponse.json({
      success: true,
      simulation: true,
      message: "Correo registrado en modo simulación.",
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
