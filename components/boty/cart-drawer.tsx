"use client"

import { Minus, Plus, Trash2, ShoppingBag, CheckCircle, AlertCircle, Clock, Truck, X, ChevronLeft, ArrowRight, CreditCard, Building2 } from "lucide-react"
import Image from "next/image"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useCart } from "./cart-context"
import { useState, useEffect } from "react"
import { formatARS } from "@/lib/products"
import { saveOrder, getStoreSettings, DEFAULT_SETTINGS } from "@/lib/store"

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, itemCount, subtotal, clearCart } = useCart()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    const sync = () => setSettings(getStoreSettings())
    sync()
    window.addEventListener("acid_store_updated", sync)
    return () => window.removeEventListener("acid_store_updated", sync)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setCheckoutOpen(false)
    }
  }, [isOpen])

  const isBelowMin = settings.minPurchaseAmount > 0 && subtotal < settings.minPurchaseAmount
  const remainingForMin = isBelowMin ? settings.minPurchaseAmount - subtotal : 0

  const hasFreeShippingConfig = typeof settings.freeShippingThreshold === "number" && settings.freeShippingThreshold > 0
  const isFreeShipping = hasFreeShippingConfig && subtotal >= (settings.freeShippingThreshold || 0)
  const remainingForFreeShipping = hasFreeShippingConfig && !isFreeShipping ? (settings.freeShippingThreshold! - subtotal) : 0

  const shipping = 0
  const total = subtotal + shipping

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [confirmedOrderId, setConfirmedOrderId] = useState("")

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "transferencia">("mercadopago")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleCheckout = () => {
    if (isBelowMin) return
    setCheckoutOpen(true)
  }

  const handleOrderComplete = async () => {
    if (!customerName || !customerEmail || !customerAddress) return
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const orderItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      const customerData = {
        name: customerName,
        email: customerEmail,
        address: customerAddress,
        phone: customerPhone,
      }

      const newOrder = await saveOrder({
        customer: customerData,
        items: orderItems,
        subtotal,
        shipping,
        total,
        paymentMethod,
      })

      // ========================================================
      // 1. FLUJO MERCADO PAGO (Checkout Pro Oficial)
      // ========================================================
      if (paymentMethod === "mercadopago") {
        const res = await fetch("/api/mercadopago/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: newOrder.id,
            items: orderItems,
            customer: customerData,
            total,
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.checkout_url) {
          throw new Error(data.error || "No se pudo generar el enlace de pago de Mercado Pago")
        }

        // Redirigir directamente al Checkout oficial de Mercado Pago
        clearCart()
        window.location.href = data.checkout_url
        return
      }

      // ========================================================
      // 2. FLUJO TRANSFERENCIA BANCARIA
      // ========================================================
      setConfirmedOrderId(newOrder.id)
      setCheckoutOpen(false)
      clearCart()
      setIsOpen(false)
      setOrderSuccess(true)

      setCustomerName("")
      setCustomerEmail("")
      setCustomerAddress("")
      setCustomerPhone("")
    } catch (err: any) {
      console.error("Error al procesar el pedido:", err)
      setErrorMessage(err?.message || "Ocurrió un error al procesar el pedido. Por favor intentá nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    setOrderSuccess(false)
  }

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerContent className="h-[100dvh] max-h-[100dvh] w-full data-[vaul-drawer-direction=right]:w-full sm:data-[vaul-drawer-direction=right]:max-w-[460px] flex flex-col bg-background border-l border-border/80">
          {!checkoutOpen ? (
            /* ======================================================== */
            /* VIEW 1: CARRITO                                          */
            /* ======================================================== */
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border/50 flex-shrink-0">
                <div>
                  <DrawerTitle className="font-serif text-2xl font-bold text-foreground">Carrito</DrawerTitle>
                  <DrawerDescription className="text-xs text-muted-foreground mt-0.5">
                    {itemCount} {itemCount === 1 ? "producto" : "productos"}
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground boty-transition"
                    aria-label="Cerrar carrito"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </DrawerClose>
              </div>

              {/* Cart Items List */}
              <div
                data-vaul-no-drag
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain"
                style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
              >
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground font-medium">Tu carrito está vacío</p>
                    <DrawerClose asChild>
                      <button
                        type="button"
                        className="mt-4 text-primary hover:underline text-sm font-medium"
                      >
                        Seguir comprando
                      </button>
                    </DrawerClose>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-card border border-border/70"
                      >
                        {/* Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif text-sm sm:text-base text-foreground font-semibold line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-muted-foreground text-xs line-clamp-2 mt-0.5">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-border rounded-full bg-background">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-muted boty-transition rounded-l-full text-muted-foreground hover:text-foreground"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-muted boty-transition rounded-r-full text-muted-foreground hover:text-foreground"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Price & Delete */}
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">
                                {formatARS(item.price * item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-muted-foreground hover:text-destructive boty-transition"
                                aria-label="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {items.length > 0 && (
                <div className="flex-shrink-0 border-t border-border/60 p-4 sm:p-5 space-y-3 bg-card/40">
                  {/* Summary */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
                      <span>Subtotal</span>
                      <span>{formatARS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs sm:text-sm items-center">
                      <span>Envío</span>
                      <span className={`text-xs font-medium ${isFreeShipping ? "text-emerald-400 font-semibold" : "text-amber-400/90 text-right"}`}>
                        {isFreeShipping ? "Gratis" : "A coordinar con la tienda"}
                      </span>
                    </div>
                    {!isFreeShipping && (
                      <div className="text-[11px] text-muted-foreground/80 text-right">
                        (A cargo del cliente)
                      </div>
                    )}
                    {hasFreeShippingConfig && !isFreeShipping && (
                      <div className="text-[11px] text-emerald-400/80 text-right">
                        Envío gratis a partir de {formatARS(settings.freeShippingThreshold!)} (faltan {formatARS(remainingForFreeShipping)})
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border/50">
                      <span>Total</span>
                      <span>{formatARS(total)}</span>
                    </div>
                  </div>

                  {/* Minimum Purchase Progress / Alert (only shown when below minimum) */}
                  {settings.minPurchaseAmount > 0 && isBelowMin && (
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          Compra mínima: {formatARS(settings.minPurchaseAmount)}
                        </span>
                        <span>Faltan {formatARS(remainingForMin)}</span>
                      </div>
                      <div className="w-full bg-background/50 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((subtotal / settings.minPurchaseAmount) * 100))}%`,
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Agregá más productos para alcanzar el mínimo y completar tu compra.
                      </p>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isBelowMin}
                    className={`w-full py-3.5 rounded-full font-semibold boty-transition flex items-center justify-center gap-2 ${
                      isBelowMin
                        ? "bg-muted text-muted-foreground cursor-not-allowed border border-border opacity-70"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10"
                    }`}
                  >
                    {isBelowMin ? (
                      `Faltan ${formatARS(remainingForMin)} para comprar`
                    ) : (
                      <>
                        Finalizar compra
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="w-full border border-border text-foreground/80 py-2.5 rounded-full text-xs font-medium hover:bg-muted boty-transition"
                    >
                      Seguir comprando
                    </button>
                  </DrawerClose>
                </div>
              )}
            </>
          ) : (
            /* ======================================================== */
            /* VIEW 2: FINALIZAR COMPRA / CHECKOUT                      */
            /* ======================================================== */
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground boty-transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver al carrito</span>
                </button>
                <DrawerTitle className="font-serif text-lg font-bold text-foreground">
                  Finalizar compra
                </DrawerTitle>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground boty-transition"
                    aria-label="Cerrar checkout"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </DrawerClose>
              </div>

              {/* Scrollable Form Body */}
              <div
                data-vaul-no-drag
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 overscroll-contain"
                style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
              >
                {/* Resumen Compacto */}
                <div className="bg-card/70 border border-border/60 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Resumen del pedido
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {formatARS(total)}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border/40">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-0.5">
                        <span className="truncate pr-2">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium text-foreground flex-shrink-0">
                          {formatARS(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 font-medium text-xs items-center">
                      <span>Envío</span>
                      <span className={isFreeShipping ? "text-emerald-400 font-semibold" : "text-amber-400/90 text-right"}>
                        {isFreeShipping ? "Gratis" : "A coordinar con la tienda (a cargo del cliente)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleOrderComplete()
                  }}
                >
                  <div>
                    <h3 className="font-serif text-lg text-foreground font-semibold">
                      Datos para la entrega
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isFreeShipping
                        ? "Ingresá tus datos para que coordinemos el despacho gratuito de tu pedido."
                        : "Ingresá tus datos para la entrega. El costo y despacho del envío es a cargo del comprador y se acuerda directamente con la tienda tras la compra."}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Nombre y Apellido <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Sofía Pérez"
                      className="block w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Email de contacto <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="block w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Dirección de entrega y Ciudad <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Calle, altura, depto, Ciudad, Provincia"
                      className="block w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Teléfono / WhatsApp <span className="text-muted-foreground text-[11px]">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+54 9 351 ..."
                      className="block w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground block">
                      Medio de Pago <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Mercado Pago Option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("mercadopago")}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 boty-transition ${
                          paymentMethod === "mercadopago"
                            ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-sm"
                            : "bg-card border-border/80 text-muted-foreground hover:border-border"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === "mercadopago"
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/60"
                          }`}
                        >
                          {paymentMethod === "mercadopago" && (
                            <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            Mercado Pago
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">
                              Oficial
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                            Tarjetas de crédito, débito, dinero en cuenta y cuotas
                          </p>
                        </div>
                      </button>

                      {/* Transferencia Bancaria Option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("transferencia")}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 boty-transition ${
                          paymentMethod === "transferencia"
                            ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-sm"
                            : "bg-card border-border/80 text-muted-foreground hover:border-border"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === "transferencia"
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/60"
                          }`}
                        >
                          {paymentMethod === "transferencia" && (
                            <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            Transferencia
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                            CBU / Alias bancario directo sin intermediarios
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Lead Time & Delivery Notice */}
                  <div className="p-3.5 bg-muted/60 border border-border rounded-2xl text-xs text-muted-foreground space-y-2">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">Confección y producción:</strong> demora de{" "}
                        <strong className="text-primary">{settings.customLeadTimeDays || "4 a 5 días hábiles"}</strong> desde el pago.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">Envío:</strong>{" "}
                        {isFreeShipping
                          ? "Envío gratis aplicado."
                          : "A cargo del comprador. Se coordina directamente con la tienda tras la compra (o retiro sin cargo en Córdoba Capital)."}
                      </span>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {errorMessage && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2 pb-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold hover:bg-primary/90 boty-transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          {paymentMethod === "mercadopago"
                            ? "Conectando con Mercado Pago..."
                            : "Procesando pedido..."}
                        </>
                      ) : paymentMethod === "mercadopago" ? (
                        `Pagar con Mercado Pago · ${formatARS(total)}`
                      ) : (
                        `Confirmar pedido · ${formatARS(total)}`
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutOpen(false)}
                      className="w-full border border-border text-muted-foreground hover:text-foreground py-3 rounded-full text-xs font-medium hover:bg-muted boty-transition"
                    >
                      Volver a revisar productos
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Order Success Modal - OUTSIDE the drawer so fixed positioning works */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-3xl p-8 text-center border border-border boty-shadow max-w-sm mx-4 animate-scale-fade-in">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
            {confirmedOrderId && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-mono font-medium mb-3">
                {confirmedOrderId}
              </span>
            )}
            <h3 className="font-serif text-2xl text-foreground mb-2">¡Gracias por tu pedido!</h3>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Tu orden quedó registrada con éxito y te enviamos un correo con los detalles de tu compra. Ya la estamos preparando y te avisaremos cuando sea despachada.
            </p>
            <p className="text-xs text-muted-foreground bg-muted/60 p-3 rounded-2xl border border-border mb-6 text-left">
              📩 <strong>Aviso:</strong> Enviamos el comprobante desde <strong>holaacidblue@gmail.com</strong>. Si no lo ves en tu bandeja principal, chequeá la pestaña de <em>Promociones</em> o <em>Spam</em>.
            </p>
            <button
              type="button"
              onClick={handleCloseSuccess}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-sm boty-transition hover:bg-primary/90"
            >
              Continuar comprando
            </button>
          </div>
        </div>
      )}
    </>
  )
}
