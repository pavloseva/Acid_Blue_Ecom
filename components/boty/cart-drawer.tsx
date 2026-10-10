"use client"

import { Minus, Plus, Trash2, ShoppingBag, CheckCircle, AlertCircle, Clock } from "lucide-react"
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

  const isBelowMin = settings.minPurchaseAmount > 0 && subtotal < settings.minPurchaseAmount
  const remainingForMin = isBelowMin ? settings.minPurchaseAmount - subtotal : 0

  const shipping = 0
  const total = subtotal + shipping

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [confirmedOrderId, setConfirmedOrderId] = useState("")

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckout = () => {
    if (isBelowMin) return
    setCheckoutOpen(true)
  }

  const handleOrderComplete = async () => {
    if (!customerName || !customerEmail || !customerAddress) return
    setIsSubmitting(true)

    try {
      const newOrder = await saveOrder({
        customer: {
          name: customerName,
          email: customerEmail,
          address: customerAddress,
          phone: customerPhone,
        },
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        shipping,
        total,
      })

      setConfirmedOrderId(newOrder.id)
      setCheckoutOpen(false)
      clearCart()
      setIsOpen(false)
      setOrderSuccess(true)

      setCustomerName("")
      setCustomerEmail("")
      setCustomerAddress("")
      setCustomerPhone("")
    } catch (err) {
      console.error("Error al procesar el pedido:", err)
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
        <DrawerContent className="h-full w-full sm:max-w-[440px]">
          <DrawerHeader className="border-b border-border/50 p-6 py-2.5">
            <DrawerTitle className="font-serif text-2xl">Carrito</DrawerTitle>
            <DrawerDescription>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</DrawerDescription>
          </DrawerHeader>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Tu carrito está vacío</p>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="mt-4 text-primary hover:underline text-sm"
                  >
                    Seguir comprando
                  </button>
                </DrawerClose>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base text-foreground mb-1 font-semibold">{item.name}</h3>
                      <p className="text-muted-foreground mb-3 text-sm">{item.description}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-border rounded-full">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-muted boty-transition rounded-l-full"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-muted boty-transition rounded-r-full"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive boty-transition"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatARS(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <DrawerFooter className="border-t border-border/50 p-6 gap-4">
              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatARS(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : formatARS(shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-foreground pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span>{formatARS(total)}</span>
                </div>
              </div>

              {/* Minimum Purchase Progress / Alert */}
              {settings.minPurchaseAmount > 0 && (
                <div className="pt-2">
                  {isBelowMin ? (
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          Compra mínima: {formatARS(settings.minPurchaseAmount)}
                        </span>
                        <span>Faltan {formatARS(remainingForMin)}</span>
                      </div>
                      <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden">
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
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>¡Superaste la compra mínima requerida!</span>
                    </div>
                  )}
                </div>
              )}

              {!checkoutOpen ? (
                /* Checkout Button */
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isBelowMin}
                  className={`w-full py-4 rounded-full font-medium boty-transition ${
                    isBelowMin
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border opacity-70"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isBelowMin
                    ? `Faltan ${formatARS(remainingForMin)} para comprar`
                    : "Finalizar compra"}
                </button>
              ) : (
                /* Checkout Form */
                <form
                  className="space-y-4 pt-4 border-t border-border/50"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleOrderComplete()
                  }}
                >
                  <h3 className="font-serif text-xl text-foreground">Completa tu pedido</h3>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Nombre y Apellido
                      <span className="text-muted-foreground">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Sofía Pérez"
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Email
                      <span className="text-muted-foreground">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Dirección de entrega (con Ciudad)
                      <span className="text-muted-foreground">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Calle, altura, piso/depto, Ciudad"
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Teléfono / WhatsApp
                      <span className="text-muted-foreground text-xs ml-1">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+54 9 351 ..."
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary"
                    />
                  </div>

                  {/* Lead Time Notice */}
                  <div className="p-3 bg-muted/60 border border-border rounded-xl text-xs text-muted-foreground flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">Diseños personalizados:</strong> demora de producción de{" "}
                      <strong className="text-primary">{settings.customLeadTimeDays}</strong> a partir del pago.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-medium hover:bg-primary/90 boty-transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Procesando pedido...
                      </>
                    ) : (
                      "Confirmar pedido"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="w-full border border-border text-foreground py-3 rounded-full font-medium hover:bg-muted boty-transition"
                  >
                    Volver al carrito
                  </button>
                </form>
              )}

              {!checkoutOpen && (
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="w-full border border-border text-foreground py-4 rounded-full font-medium hover:bg-muted boty-transition"
                  >
                    Seguir comprando
                  </button>
                </DrawerClose>
              )}
            </DrawerFooter>
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
