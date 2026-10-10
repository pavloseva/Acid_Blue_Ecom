"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Twitter } from "lucide-react"
import { getStoreCategories, type CategoryItem } from "@/lib/store"

export function Footer() {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: "mochilas-y-bolsos", label: "Mochilas y Bolsos" }
  ])

  useEffect(() => {
    const syncCategories = () => {
      const cats = getStoreCategories()
      if (cats && cats.length > 0) {
        setCategories(cats)
      }
    }
    syncCategories()
    window.addEventListener("acid_store_updated", syncCategories)
    return () => window.removeEventListener("acid_store_updated", syncCategories)
  }, [])

  return (
    <footer className="bg-card pt-20 pb-10 relative overflow-hidden">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="font-serif text-[200px] sm:text-[200px] md:text-[400px] lg:text-[400px] xl:text-[400px] font-bold text-white/5 whitespace-nowrap leading-none">
          Acid Blue
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-3">
              <Image
                src="/images/acid/brand-logo-sticker.png"
                alt="Acid Blue"
                width={150}
                height={55}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="font-script text-2xl text-primary mb-1">
              Cosas lindas, buena vibra
            </p>
            <p className="text-[11px] uppercase tracking-wider text-accent/80 font-medium mb-3">
              Mochilas • Bandoleras • Accesorios — PVC Cristal
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
              Diseños funcionales y de alta resistencia en PVC cristal. Mochilas y bandoleras pensadas para recitales, eventos y tu estilo diario.
            </p>
            <div className="flex gap-4">
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Tienda</h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                >
                  Ver todo el catálogo
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Información</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#envios"
                  className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                >
                  Envíos a todo el país
                </Link>
              </li>
              <li>
                <Link
                  href="/#envios"
                  className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                >
                  Tiempos y compra mínima
                </Link>
              </li>
              <li>
                <Link
                  href="/#envios"
                  className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                >
                  Medios de pago
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                >
                  Panel Administrador
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Acid Blue. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Catálogo
              </Link>
              <Link href="/#envios" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Envíos
              </Link>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
