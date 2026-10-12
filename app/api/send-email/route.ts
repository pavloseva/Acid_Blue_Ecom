import { NextResponse } from "next/server"
import { sendEmailNotification } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await sendEmailNotification(data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al enviar el correo" },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error al procesar el envío de correo:", error)
    return NextResponse.json(
      { error: error?.message || "Error en el servidor de correo" },
      { status: 500 }
    )
  }
}
