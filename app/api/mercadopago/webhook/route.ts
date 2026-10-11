import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzpohmrcxcspvzacbwlw.supabase.co"
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cG9obXJjeGNzcHZ6YWNid2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MDg4NzUsImV4cCI6MjEwNzA4NDg3NX0.u6bgUJbUyvhaZ1tvZLmzr3rSibaPLwAB0WqP_hQfpag"

export async function POST(req: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "No MP_ACCESS_TOKEN" }, { status: 500 })
    }

    const url = new URL(req.url)
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Body may be empty in some IPN pings
    }

    // Mercado Pago sends payment id in body or query params
    const paymentId =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id")

    const type = body?.type || url.searchParams.get("type") || url.searchParams.get("topic")

    // Only process if it is a payment notification
    if (!paymentId || (type && type !== "payment")) {
      return NextResponse.json({ received: true, ignored: true })
    }

    // Query payment status directly from Mercado Pago API
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!mpRes.ok) {
      console.warn(`Could not fetch payment ${paymentId} from Mercado Pago:`, mpRes.status)
      return NextResponse.json({ error: "Could not fetch payment" }, { status: 200 })
    }

    const paymentData = await mpRes.json()
    const externalReference = paymentData.external_reference // This is our orderId
    const status = paymentData.status // "approved", "pending", "in_process", "rejected"

    if (!externalReference) {
      return NextResponse.json({ received: true, no_external_reference: true })
    }

    // Determine new store order status
    let newOrderStatus = "pendiente"
    if (status === "approved") {
      newOrderStatus = "en_preparacion"
    } else if (status === "rejected" || status === "cancelled") {
      newOrderStatus = "cancelado"
    }

    // Update in Supabase
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(externalReference)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status: newOrderStatus,
          payment_method: `mercadopago (${paymentData.payment_method_id || "online"})`,
        }),
      }
    )

    return NextResponse.json({
      received: true,
      orderId: externalReference,
      paymentStatus: status,
      orderStatus: newOrderStatus,
      updatedInCloud: updateRes.ok,
    })
  } catch (error: any) {
    console.error("Error in Mercado Pago webhook:", error)
    // Return 200 so Mercado Pago does not endlessly retry failed notifications
    return NextResponse.json({ received: true, error: error?.message }, { status: 200 })
  }
}
