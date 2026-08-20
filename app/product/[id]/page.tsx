"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, Minus, Plus, ChevronDown, Truck, Palette, ShieldCheck, Star, Check } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { products, getProduct, formatARS } from "@/lib/products"

const benefits = [
  { icon: Truck, label: "Envío a todo el país" },
  { icon: Palette, label: "Estampa HD" },
  { icon: ShieldCheck, label: "Pago seguro" },
  { icon: Check, label: "Hecho en Córdoba" },
]

type AccordionSection = "details" | "care" | "material" | "delivery"

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const product = getProduct(productId) || products[0]

  const { addItem, setIsOpen } = useCart()
  const [selectedOption, setSelectedOption] = useState(product.options[0])
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setSelectedOption(product.options[0])
    setQuantity(1)
  }, [productId, product.options])

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const handleAddToCart = (openCart = false) => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        description: `${product.description} · ${selectedOption}`,
        price: product.price,
        image: product.image,
      })
    }
    if (openCart) {
      setIsOpen(true)
    } else {
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    }
  }

  const accordionItems: { key: AccordionSection; title: string; content: string }[] = [
    { key: "details", title: "Detalles", content: product.details },
    { key: "care", title: "Cuidados", content: product.care },
    { key: "material", title: "Material", content: product.material },
    { key: "delivery", title: "Envíos y cambios", content: product.delivery },
  ]

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary boty-transition mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow border border-border">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">
                  Acid Blue
                </span>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3 font-semibold">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground italic mb-4">{product.tagline}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(128 reseñas)</span>
                </div>

                <p className="text-foreground/80 leading-relaxed">{product.longDescription}</p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-medium text-foreground">{formatARS(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatARS(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Option Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">{product.optionLabel}</label>
                <div className="flex flex-wrap gap-3">
                  {product.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedOption(option)}
                      className={`px-6 py-3 rounded-full text-sm boty-transition border ${
                        selectedOption === option
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="text-sm font-medium text-foreground mb-3 block">Cantidad</label>
                <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-primary boty-transition"
                    aria-label="Restar cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-primary boty-transition"
                    aria-label="Sumar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-medium tracking-wide boty-transition ${
                    isAdded
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 acid-glow"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Agregado
                    </>
                  ) : (
                    "Agregar al carrito"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-border text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:border-primary/50 hover:text-primary"
                >
                  Comprar ahora
                </button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border"
                  >
                    <benefit.icon className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground text-center">{benefit.label}</span>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              <div className="border-t border-border">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="font-medium text-foreground">{item.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground boty-transition ${
                          openAccordion === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden boty-transition ${
                        openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-24">
              <h2 className="font-serif text-3xl text-foreground mb-8 font-semibold">También te puede gustar</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((item) => (
                  <Link key={item.id} href={`/product/${item.id}`} className="group">
                    <div className="bg-card rounded-3xl overflow-hidden border border-border boty-transition group-hover:acid-glow">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover boty-transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-base text-foreground mb-1 font-semibold">{item.name}</h3>
                        <span className="text-sm font-medium text-foreground">{formatARS(item.price)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
