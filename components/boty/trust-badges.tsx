"use client"

import { useEffect, useRef, useState } from "react"
import { Truck, Clock, Palette, ShieldCheck } from "lucide-react"

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
    description: "Traé tu idea y la imprimimos"
  },
  {
    icon: ShieldCheck,
    title: "Compra protegida",
    description: "Pagá seguro con Mercado Pago"
  }
]

export function TrustBadges() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

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
      </div>
    </section>
  )
}
