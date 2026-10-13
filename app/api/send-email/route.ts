import { NextResponse } from "next/server"
import { sendEmailNotification } from "@/lib/email-service"
import { saveEmailToCloud } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await sendEmailNotification(data)

    // Persist email in Supabase Cloud Database!
    try {
      await saveEmailToCloud({
        id: data.id || `EML-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        type: data.type || "order",
        orderId: data.orderId || undefined,
        to: data.to,
        subject: data.subject,
        body: data.body,
        sentAt: data.sentAt || new Date().toISOString(),
      })
    } catch (saveErr) {
      console.warn("Could not persist email to Supabase:", saveErr)
    }

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
