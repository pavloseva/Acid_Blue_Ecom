"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Clock, XCircle, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"

function ResultadoContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()

  const status = searchParams.get("status") || searchParams.get("collection_status") || "approved"
  const orderId = searchParams.get("order_id") || searchParams.get("external_reference") || ""
  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id") || ""

  const isApproved = status === "approved"
  const isPending = status === "pending" || status === "in_process"
  const isFailure = status === "failure" || status === "rejected"

  // If approved, ensure local cart is cleared
  useEffect(() => {
    if (isApproved) {
      clearCart()
    }
  }, [isApproved, clearCart])

  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="bg-card rounded-3xl p-8 sm:p-10 border border-border boty-shadow relative overflow-hidden">
        {/* Glow effect */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isApproved ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"
          }`}
        />

        {/* Icon & Title */}
        {isApproved && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-medium mb-3">
              Pago Aprobado con Mercado Pago
            </span>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Tu pago fue acreditado con éxito. Ya estamos preparando tus artículos de diseño exclusivos para despacharlos a la brevedad.
            </p>
          </>
        )}

        {isPending && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-mono font-medium mb-3">
              Pago en Proceso
            </span>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
              Pago pendiente de confirmación
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Mercado Pago está procesando la acreditación (o está pendiente de abono en efectivo). Te avisaremos por correo apenas se complete.
            </p>
          </>
        )}

        {isFailure && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-mono font-medium mb-3">
              Pago No Completado
            </span>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
              No pudimos procesar el pago
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              El pago fue rechazado o cancelado. Podés volver a intentarlo seleccionando otra tarjeta o mediante transferencia bancaria.
            </p>
          </>
        )}

        {/* Order Details Details */}
        {(orderId || paymentId) && (
          <div className="bg-background/60 border border-border/80 rounded-2xl p-4 text-xs space-y-1.5 text-left mb-6">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número de Pedido:</span>
                <span className="font-mono font-bold text-foreground">{orderId}</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operación Mercado Pago:</span>
                <span className="font-mono text-muted-foreground">#{paymentId}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-border/40 text-emerald-400 font-medium">
              <span>Estado:</span>
              <span>{isApproved ? "Aprobado (Listo para preparar)" : isPending ? "Pendiente" : "Rechazado"}</span>
            </div>
          </div>
        )}

        {/* Notice */}
        <div className="bg-muted/40 border border-border rounded-xl p-3 text-xs text-muted-foreground text-left mb-8 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <span>
            Enviamos el comprobante y seguimiento a tu correo desde <strong>holaacidblue@gmail.com</strong>. Si no lo ves, revisá la carpeta de promociones o spam.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 boty-transition text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Volver a la tienda
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-border text-foreground font-medium hover:bg-muted boty-transition text-sm"
          >
            Ir al inicio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutResultadoPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Header />
      <div className="pt-24 flex-1 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm font-mono">Cargando resultado del pago...</p>
            </div>
          }
        >
          <ResultadoContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
