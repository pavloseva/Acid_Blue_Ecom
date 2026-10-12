import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzpohmrcxcspvzacbwlw.supabase.co"
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cG9obXJjeGNzcHZ6YWNid2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MDg4NzUsImV4cCI6MjEwNzA4NDg3NX0.u6bgUJbUyvhaZ1tvZLmzr3rSibaPLwAB0WqP_hQfpag"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, paymentId, status } = body

    if (!orderId) {
      return NextResponse.json({ error: "orderId requerido" }, { status: 400 })
    }

    const isApproved = status === "approved"
    const newStatus = isApproved ? "en_preparacion" : status === "pending" ? "pendiente" : "cancelado"
    const paymentMethodLabel = paymentId
      ? `Mercado Pago (Operación #${paymentId})`
      : "Mercado Pago"

    // Update in Supabase orders table
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status: newStatus,
          payment_method: paymentMethodLabel,
        }),
      }
    )

    if (!updateRes.ok) {
      const errText = await updateRes.text()
      console.warn("Supabase update error:", errText)
      return NextResponse.json({ error: "Error al actualizar en base de datos", details: errText }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: newStatus,
      paymentMethod: paymentMethodLabel,
    })
  } catch (error: any) {
    console.error("Error in confirm-order route:", error)
    return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 })
  }
}
