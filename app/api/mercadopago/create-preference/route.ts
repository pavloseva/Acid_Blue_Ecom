import { NextResponse } from "next/server"

interface PreferenceItem {
  id: string
  title: string
  description?: string
  picture_url?: string
  quantity: number
  unit_price: number
  currency_id: string
}

export async function POST(req: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN no está configurado en las variables de entorno" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { orderId, items, customer, total } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron artículos para el pedido" },
        { status: 400 }
      )
    }

    // Determine the host / origin for return URLs
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://acid-blue-ecom.vercel.app"

    // Separate first and last name if possible
    const nameParts = (customer?.name || "Cliente").trim().split(" ")
    const firstName = nameParts[0] || "Cliente"
    const lastName = nameParts.slice(1).join(" ") || "Acid Blue"

    // Build Mercado Pago items list
    const preferenceItems: PreferenceItem[] = items.map((item: any) => {
      // Ensure absolute image URL if available
      let pictureUrl = item.image
      if (pictureUrl && pictureUrl.startsWith("/")) {
        pictureUrl = `${origin}${pictureUrl}`
      }

      return {
        id: String(item.id || "item"),
        title: String(item.name || "Producto Acid Blue").slice(0, 255),
        description: String(item.description || "Diseño Acid Blue").slice(0, 255),
        picture_url: pictureUrl || undefined,
        quantity: Math.max(1, Number(item.quantity) || 1),
        unit_price: Number(item.price) || 0,
        currency_id: "ARS",
      }
    })

    // Back URLs for customer redirect after payment
    // IMPORTANT: Mercado Pago requires clean URLs without query parameters.
    // Mercado Pago automatically appends: collection_id, collection_status, payment_id, status, external_reference, etc.
    const backUrls = {
      success: `${origin}/checkout/resultado`,
      failure: `${origin}/checkout/resultado`,
      pending: `${origin}/checkout/resultado`,
    }

    const preferencePayload: Record<string, any> = {
      items: preferenceItems,
      payer: {
        name: firstName,
        surname: lastName,
        email: customer?.email || "comprador@acidblue.com",
        phone: customer?.phone
          ? {
              number: String(customer.phone).replace(/\D/g, ""),
            }
          : undefined,
        address: customer?.address
          ? {
              street_name: String(customer.address).slice(0, 255),
            }
          : undefined,
      },
      back_urls: backUrls,
      auto_return: "approved",
      external_reference: String(orderId || `ORD-${Date.now()}`),
      statement_descriptor: "ACID BLUE",
      payment_methods: {
        installments: 12,
      },
    }

    // Only set notification_url if not localhost
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      preferencePayload.notification_url = `${origin}/api/mercadopago/webhook`
    }

    // Call Mercado Pago API directly (Clean REST API, zero edge/turbopack conflicts)
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    })

    const mpData = await mpRes.json()

    if (!mpRes.ok) {
      console.error("Mercado Pago error response:", mpData)
      return NextResponse.json(
        {
          error: mpData.message || "Error al generar la preferencia en Mercado Pago",
          details: mpData,
        },
        { status: mpRes.status }
      )
    }

    // Return preference ID and redirect links (init_point works for both live and test accounts)
    return NextResponse.json({
      id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      checkout_url: mpData.init_point || mpData.sandbox_init_point,
    })
  } catch (error: any) {
    console.error("Error creating Mercado Pago preference:", error)
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
