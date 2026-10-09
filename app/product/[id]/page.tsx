"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ChevronDown,
  Truck,
  Palette,
  ShieldCheck,
  Star,
  Check,
  Maximize2,
  X,
  Play,
  Film,
  Scan,
} from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { products, getProduct, formatARS, type Product } from "@/lib/products"
import { getProductById, syncStoreWithCloud } from "@/lib/store"

const benefits = [
  { icon: Truck, label: "Envío a todo el país" },
  { icon: Palette, label: "Estampa HD" },
  { icon: ShieldCheck, label: "Pago seguro" },
  { icon: Check, label: "Hecho en Córdoba" },
]

type AccordionSection = "details" | "care" | "material" | "delivery"

type MediaItem = { type: "image"; url: string } | { type: "video"; url: string }

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const baseProd = getProduct(productId)
  const [product, setProduct] = useState<Product | null>(baseProd || null)
  const [isMounted, setIsMounted] = useState(false)

  const { addItem, setIsOpen } = useCart()
  const [selectedOption, setSelectedOption] = useState(() => baseProd?.options?.[0] || "Único")
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)

  // Media Gallery State
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [isFitContain, setIsFitContain] = useState(() => (baseProd ? baseProd.imageFit !== "cover" : true))
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Sync with client-side store after mount and on updates
  useEffect(() => {
    setIsMounted(true)
    const sync = () => {
      const found = getProductById(productId) || getProduct(productId)
      if (found) {
        setProduct(found)
      }
    }
    sync()
    syncStoreWithCloud()
    window.addEventListener("acid_store_updated", sync)
    return () => window.removeEventListener("acid_store_updated", sync)
  }, [productId])

  useEffect(() => {
    if (product) {
      if (product.options && product.options.length > 0 && !product.options.includes(selectedOption)) {
        setSelectedOption(product.options[0])
      }
      setIsFitContain(product.imageFit !== "cover")
    }
  }, [product])

  useEffect(() => {
    window.scrollTo(0, 0)
    setActiveMediaIndex(0)
    setQuantity(1)
  }, [productId])

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const handleAddToCart = (openCart = false) => {
    if (!product) return
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

  const isYouTube = (url: string) => url.includes("youtube.com") || url.includes("youtu.be")
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes("embed/")) return url
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url
  }

  if (!product) {
    if (!isMounted) {
      return (
        <main className="min-h-screen">
          <Header />
          <div className="pt-36 pb-24 max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground text-sm font-mono tracking-wider">Cargando producto...</p>
          </div>
          <Footer />
        </main>
      )
    }
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-36 pb-24 max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-8 text-sm">El producto que buscas no existe o fue eliminado.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 boty-transition"
          >
            Volver a la tienda
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  // Build Media Items List (Images + Video)
  const imagesList = Array.from(
    new Set([product.image, ...(product.images || [])].filter(Boolean))
  )
  const mediaItems: MediaItem[] = [
    ...imagesList.map((url) => ({ type: "image" as const, url })),
    ...(product.video ? [{ type: "video" as const, url: product.video }] : []),
  ]

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0] || { type: "image", url: product.image }

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
            {/* ------------------------------------------------------------- */}
            {/* PRODUCT MEDIA GALLERY */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col gap-4">
              {/* Main Media Display */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow border border-border group select-none flex items-center justify-center">
                {/* Badge Overlay */}
                {product.badge && (
                  <span
                    suppressHydrationWarning
                    className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
                      product.badge === "Oferta"
                        ? "bg-accent text-accent-foreground"
                        : product.badge === "Nuevo"
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground text-background"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}

                {/* Top Right Tool Buttons */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  {currentMedia.type === "image" && (
                    <button
                      type="button"
                      onClick={() => setIsFitContain(!isFitContain)}
                      className="px-2.5 py-1.5 rounded-full bg-background/80 hover:bg-background text-foreground/80 hover:text-primary backdrop-blur-md border border-border text-xs flex items-center gap-1.5 boty-transition"
                      title={isFitContain ? "Llenar cuadro (recorta)" : "Ver completa (sin recortar)"}
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {isFitContain ? "Completa (100%)" : "Llenar"}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-2 rounded-full bg-background/80 hover:bg-background text-foreground/80 hover:text-primary backdrop-blur-md border border-border boty-transition"
                    title="Ampliar pantalla completa"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Media Content */}
                {currentMedia.type === "video" ? (
                  isYouTube(currentMedia.url) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(currentMedia.url)}
                      title={product.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-3xl"
                    />
                  ) : (
                    <video
                      src={currentMedia.url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain rounded-3xl bg-black/90"
                    />
                  )
                ) : (
                  <div
                    className="relative w-full h-full cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <Image
                      src={currentMedia.url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      unoptimized
                      className={`boty-transition ${
                        isFitContain ? "object-contain p-4" : "object-cover"
                      }`}
                      priority
                    />
                  </div>
                )}

                {/* Prev / Next Arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMediaIndex(
                          (prev) => (prev - 1 + mediaItems.length) % mediaItems.length
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/70 hover:bg-background backdrop-blur-md border border-border text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 boty-transition"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMediaIndex((prev) => (prev + 1) % mediaItems.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/70 hover:bg-background backdrop-blur-md border border-border text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 boty-transition"
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Strip */}
              {mediaItems.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                  {mediaItems.map((item, index) => {
                    const isActive = index === activeMediaIndex

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveMediaIndex(index)}
                        className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 flex-shrink-0 boty-transition ${
                          isActive
                            ? "border-primary acid-glow scale-105"
                            : "border-border/80 opacity-70 hover:opacity-100"
                        }`}
                      >
                        {item.type === "video" ? (
                          <div className="w-full h-full bg-black/80 flex flex-col items-center justify-center text-primary">
                            <Play className="w-6 h-6 fill-primary" />
                            <span className="text-[10px] font-mono mt-0.5 text-foreground/80">Video</span>
                          </div>
                        ) : (
                          <Image
                            src={item.url || "/placeholder.svg"}
                            alt={`Miniatura ${index + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* PRODUCT INFO */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">
                  Acid Blue
                </span>
                <h1 suppressHydrationWarning className="font-serif text-4xl md:text-5xl text-foreground mb-3 font-semibold">
                  {product.name}
                </h1>
                <p suppressHydrationWarning className="text-lg text-muted-foreground italic mb-4">{product.tagline}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(128 reseñas)</span>
                </div>

                <p suppressHydrationWarning className="text-foreground/80 leading-relaxed">{product.longDescription}</p>
              </div>

              {/* Price */}
              <div suppressHydrationWarning className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-medium text-foreground">{formatARS(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatARS(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Option Selector */}
              <div className="mb-8">
                <span className="text-sm font-medium text-foreground mb-3 block">
                  {product.optionLabel}: <span className="text-muted-foreground">{selectedOption}</span>
                </span>
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

              {/* Quantity */}
              <div className="mb-8">
                <span className="text-sm font-medium text-foreground mb-3 block">Cantidad</span>
                <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted boty-transition text-foreground"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-medium min-w-[2ch] text-center text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted boty-transition text-foreground"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className={`flex-1 py-4 px-8 rounded-full text-sm tracking-wide font-medium boty-transition ${
                    isAdded
                      ? "bg-emerald-500 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isAdded ? "¡Agregado al carrito!" : "Agregar al carrito"}
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
              <div className="grid grid-cols-2 gap-4 mb-10 pb-10 border-b border-border">
                {benefits.map((benefit, i) => {
                  const Icon = benefit.icon
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-xs text-muted-foreground text-center font-medium">
                        {benefit.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Accordion */}
              <div className="border-t border-border">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full py-4 flex items-center justify-between text-left group"
                    >
                      <span className="font-serif text-lg text-foreground group-hover:text-primary boty-transition">
                        {item.title}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground group-hover:text-foreground boty-transition ${
                          openAccordion === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openAccordion === item.key && (
                      <div className="pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                        {item.content}
                      </div>
                    )}
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
                          unoptimized
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

      {/* ------------------------------------------------------------- */}
      {/* LIGHTBOX MODAL (ZOOM / FULLSCREEN) */}
      {/* ------------------------------------------------------------- */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-3 rounded-full bg-card border border-border text-foreground hover:text-primary boty-transition"
              aria-label="Cerrar vista completa"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative w-full max-w-4xl h-[75vh] flex items-center justify-center">
            {currentMedia.type === "video" ? (
              isYouTube(currentMedia.url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(currentMedia.url)}
                  title={product.name}
                  allowFullScreen
                  className="w-full h-full rounded-2xl"
                />
              ) : (
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain rounded-2xl bg-black"
                />
              )
            ) : (
              <Image
                src={currentMedia.url || "/placeholder.svg"}
                alt={product.name}
                fill
                unoptimized
                className="object-contain"
              />
            )}
          </div>

          {/* Caption */}
          <div className="mt-4 text-center">
            <p className="font-serif text-lg font-bold text-foreground">{product.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMedia.type === "video" ? "Video demostrativo" : `Foto ${activeMediaIndex + 1} de ${mediaItems.length}`}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
