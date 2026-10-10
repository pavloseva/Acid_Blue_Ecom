"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "./cart-context"
import { products, categoryLabels, formatARS, type Category, type Product } from "@/lib/products"
import { getAllProducts, syncStoreWithCloud, getCategoryLabelFromStore } from "@/lib/store"

export function ProductGrid() {
  const [allProducts, setAllProducts] = useState<Product[]>(products)

  // Dynamically derive unique categories from the active products catalog
  const categories = useMemo(() => {
    const unique = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)))
    return unique.length > 0 ? unique : ["almohadon", "poster", "taza"]
  }, [allProducts])

  const [selectedCategory, setSelectedCategory] = useState<Category>("almohadon")

  // Ensure selectedCategory matches an available category
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0])
    }
  }, [categories, selectedCategory])

  const [isVisible, setIsVisible] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()

  useEffect(() => {
    const syncProducts = () => {
      setAllProducts(getAllProducts())
    }
    syncProducts()
    syncStoreWithCloud()
    window.addEventListener("acid_store_updated", syncProducts)
    return () => window.removeEventListener("acid_store_updated", syncProducts)
  }, [])

  const filteredProducts = allProducts.filter((product) => product.category === selectedCategory)

  const handleCategoryChange = (category: Category) => {
    if (category !== selectedCategory) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedCategory(category)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    }
  }

  // Preload all product images on mount
  useEffect(() => {
    products.forEach((product) => {
      const img = new window.Image()
      img.src = product.image
    })
  }, [])

  useEffect(() => {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      gridObserver.observe(gridRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (gridRef.current) {
        gridObserver.unobserve(gridRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section id="productos" className="py-24 bg-card scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span
            className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`}
            style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}
          >
            Nuestra colección
          </span>
          <h2
            className={`font-serif leading-tight text-foreground mb-4 text-balance text-5xl md:text-6xl font-semibold ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`}
            style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}
          >
            Lo más pedido
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-md mx-auto ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`}
            style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}
          >
            Almohadones, bolsos y accesorios hechos con tecnología DTF & Sublimación
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                  isSelected
                    ? "acid-gradient-bg text-primary-foreground border-transparent shadow-md font-semibold scale-105"
                    : "bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 border-border"
                }`}
              >
                {getCategoryLabelFromStore(cat)}
              </button>
            )
          })}
        </div>

        {/* Product Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <Link
              key={`${selectedCategory}-${product.id}`}
              href={`/product/${product.id}`}
              className={`group transition-all duration-500 ease-out ${
                isVisible && !isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms` }}
            >
              <div className="bg-background rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] group-hover:acid-glow border border-border">
                {/* Image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover boty-transition group-hover:scale-105"
                  />
                  {/* Badge */}
                  {product.badge && (
                    <span
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
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
                  {/* Quick add button */}
                  <button
                    type="button"
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addItem({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        image: product.image,
                      })
                    }}
                    aria-label="Agregar al carrito"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-serif text-lg text-foreground mb-1 font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{formatARS(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatARS(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:border-primary/50 hover:text-primary"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    </section>
  )
}
