"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Leaf, Flower2, Globe } from "lucide-react"

export function CTABanner() {
  const [isVisible, setIsVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bannerRef.current) {
      observer.observe(bannerRef.current)
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div 
          ref={bannerRef}
          className={`rounded-3xl p-12 md:p-16 flex flex-col justify-center relative overflow-hidden min-h-[380px] bg-card border border-border boty-shadow transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Ambient glow accent */}
          <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/15 blur-[100px]" />
          
          <div className="relative z-10 text-left max-w-2xl">
            <span className="font-script text-3xl sm:text-4xl text-primary mb-3 block">
              Cute things, big vibes ✦
            </span>
            <h3 className="font-sans text-3xl md:text-5xl font-bold text-foreground mb-3">
              100% Personalizado
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg">
              Almohadones, bolsos y accesorios con estampas de alta durabilidad en DTF & Sublimación. Hechos para acompañarte todos los días.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2.5 text-foreground/90 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Calidad DTF Premium</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground/90 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Diseños únicos</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground/90 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Envíos a todo el país</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
