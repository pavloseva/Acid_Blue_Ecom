"use client"

import { useEffect, useRef, useState } from "react"
import { Truck, Clock, Palette, ShieldCheck, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getStoreSettings, DEFAULT_SETTINGS } from "@/lib/store"
import { formatARS } from "@/lib/products"

export function TrustBadges() {
  const [isVisible, setIsVisible] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sync = () => setSettings(getStoreSettings())
    sync()
    window.addEventListener("acid_store_updated", sync)
    return () => window.removeEventListener("acid_store_updated", sync)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const badges = [
    {
      icon: Truck,
      title: "Envíos a todo el país",
      description: "Despachamos a cada provincia"
    },
    {
      icon: Clock,
      title: "Atención 9 a 20:30",
      description: "Lunes a viernes, respondemos rápido"
    },
    {
      icon: Palette,
      title: "Diseños personalizados",
      description: `Demora: ${settings.customLeadTimeDays || "4 a 5 días hábiles desde el pago"}`
    },
    {
      icon: ShieldCheck,
      title: "Compra protegida",
      description: "Pagá seguro con Mercado Pago"
    }
  ]

  return (
    <section id="envios" className="py-20 bg-background scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={sectionRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className={`bg-card p-6 lg:p-8 text-center rounded-2xl border border-border transition-all duration-700 ease-out ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <span className="acid-ring inline-flex mb-4">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-card">
                  <badge.icon className="text-primary size-6" strokeWidth={1.5} />
                </span>
              </span>
              <h3 className="font-serif text-foreground mb-2 text-lg font-semibold">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Minimum Purchase & Custom Order Disclaimer Box */}
        {settings.minPurchaseAmount > 0 && (
          <div
            className={`mt-8 bg-card/80 backdrop-blur-md border border-primary/25 rounded-3xl p-6 sm:p-7 boty-shadow transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                    Compra mínima de la tienda:{" "}
                    <span className="text-primary font-black underline decoration-primary/40 underline-offset-4">
                      {formatARS(settings.minPurchaseAmount)}
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                    Aplica para todos los pedidos con envío o retiro. Recordá que los{" "}
                    <strong className="text-foreground">diseños personalizados</strong> tienen una demora de producción de{" "}
                    <strong className="text-primary">{settings.customLeadTimeDays}</strong>.
                  </p>
                </div>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 boty-transition whitespace-nowrap boty-shadow flex-shrink-0"
              >
                Explorar catálogo
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
