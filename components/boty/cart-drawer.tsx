"use client"

import { Minus, Plus, Trash2, ShoppingBag, CheckCircle } from "lucide-react"
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
import { useState } from "react"
import { formatARS } from "@/lib/products"

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, itemCount, subtotal, clearCart } = useCart()

  const shipping = 0
  const total = subtotal + shipping

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const handleCheckout = () => {
    setCheckoutOpen(true)
  }

  const handleOrderComplete = () => {
    setCheckoutOpen(false)
    clearCart()
    setIsOpen(false)
    setOrderSuccess(true)
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

              {!checkoutOpen ? (
                /* Checkout Button */
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium hover:bg-primary/90 boty-transition"
                >
                  Finalizar compra
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
                      Nombre
                      <span className="text-muted-foreground">*</span>
                    </label>
                    <input
                      type="text"
                      required
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
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Dirección
                      <span className="text-muted-foreground">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 boty-transition"
                  >
                    Realizar pedido
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
          <div className="bg-card rounded-3xl p-8 text-center border border-border boty-shadow max-w-sm mx-4">
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="font-serif text-2xl text-foreground mb-2">¡Gracias por tu pedido!</h3>
            <p className="text-muted-foreground mb-6">
              Tu pedido ha sido recibido. Te enviaremos un correo con los detalles pronto.
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
