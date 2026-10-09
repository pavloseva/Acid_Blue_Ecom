import { NextResponse } from "next/server"

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

    console.log(`[EMAIL DISPATCH] To: ${to} | Subject: ${subject} | Type: ${type} | Order: ${orderId || "N/A"}`)
    console.log(`[EMAIL BODY]:\n${body}\n-----------------------------------`)

    // In a production setup with SMTP or Resend credentials, real SMTP dispatch can be called here.
    return NextResponse.json({
      success: true,
      message: "Correo enviado correctamente",
      recipient: to,
      subject,
    })
  } catch (error) {
    console.error("Error al procesar el envío de correo:", error)
    return NextResponse.json(
      { error: "Error en el servidor de correo" },
      { status: 500 }
    )
  }
}
