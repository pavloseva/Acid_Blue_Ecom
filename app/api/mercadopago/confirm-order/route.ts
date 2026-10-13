import { NextResponse } from "next/server"
import { sendEmailNotification } from "@/lib/email-service"

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

    // 1. Fetch current order from Supabase
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    )

    const existingRows = await checkRes.json()
    const order = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null

    // STRICT PROTECTION: If order is ALREADY en_preparacion, DO NOT SEND EMAIL OR UPDATE AGAIN!
    if (order && order.status === "en_preparacion") {
      console.log(`[CONFIRM ORDER] Pedido #${orderId} ya estaba confirmado. Omitiendo reenvío de correo.`)
      return NextResponse.json({
        success: true,
        orderId,
        status: "en_preparacion",
        alreadyProcessed: true,
      })
    }

    const isApproved = status === "approved"
    const newStatus = isApproved ? "en_preparacion" : status === "pending" ? "pendiente" : "cancelado"
    const paymentMethodLabel = paymentId
      ? `Mercado Pago (Operación #${paymentId})`
      : "Mercado Pago"

    // 2. Update order in Supabase
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

    // 3. Send customer confirmation email ONCE
    let emailSent = false
    const customerEmail = order?.customer_email || order?.customer?.email
    const customerName = order?.customer_name || order?.customer?.name || "Cliente"

    if (isApproved && customerEmail) {
      try {
        const itemsList = Array.isArray(order.items)
          ? order.items
              .map((i: any) => `• ${i.quantity || 1}x ${i.name || "Producto"} - $${Number(i.price || 0).toLocaleString("es-AR")}`)
              .join("\n")
          : ""

        const emailBody = `¡Hola ${customerName}!

¡Tu pago fue acreditado con éxito en Mercado Pago! Tu pedido #${orderId} ya está confirmado y en preparación en nuestro taller de diseño.

DATOS DEL PAGO:
------------------------------------------
• Método: Mercado Pago Oficial
• Código de Operación MP: #${paymentId || "Acreditado"}
• Estado: Pago Aprobado (En preparación)
------------------------------------------

DETALLE DEL PEDIDO:
------------------------------------------
${itemsList}
------------------------------------------
Total Abonado: $${Number(order.total || 0).toLocaleString("es-AR")}

DATOS DE ENTREGA:
Destinatario: ${customerName}
Dirección: ${order.customer_address || "A coordinar"}
Teléfono: ${order.customer_phone || "No especificado"}

TIEMPOS DE PRODUCCIÓN Y ENVÍO:
• Confección / Producción: 4 a 5 días hábiles a partir de la confirmación del pago.
• Envío: El costo y envío es a cargo del comprador y se coordina directamente con la tienda (o retiro sin cargo en Córdoba Capital). Te contactaremos a la brevedad para coordinar la entrega o despacho.

Si tenés alguna consulta, podés responder directamente a este correo o escribirnos por WhatsApp.

¡Gracias por elegir arte auténtico!
Equipo Acid Blue`

        const emailSubject = `Confirmación de pedido #${orderId} (Operación MP #${paymentId || ""}) · Acid Blue`
        const emailResult = await sendEmailNotification({
          to: customerEmail,
          subject: emailSubject,
          body: emailBody,
          type: "order",
          orderId,
        })

        emailSent = emailResult.success

        // Persist email record in Supabase Cloud Database!
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/emails`, {
            method: "POST",
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify({
              id: `EML-MP-${orderId}`,
              type: "order",
              recipient: customerEmail,
              subject: emailSubject,
              body: emailBody,
              order_id: orderId,
              status: emailSent ? "enviado" : "error",
            }),
          })
          console.log(`[CONFIRM ORDER] Email registrado en Supabase para #${orderId}`)
        } catch (saveEmailErr) {
          console.warn("Error guardando email en Supabase:", saveEmailErr)
        }
      } catch (emailErr) {
        console.error("Error al enviar email de confirmación MP:", emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: newStatus,
      paymentMethod: paymentMethodLabel,
      emailSent,
    })
  } catch (error: any) {
    console.error("Error in confirm-order route:", error)
    return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 })
  }
}
