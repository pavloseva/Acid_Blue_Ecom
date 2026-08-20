"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Truck, Palette, Sparkles, Package } from "lucide-react"

const features = [
  {
    icon: Palette,
    title: "Diseños personalizados",
    description: "Mandanos tu imagen y la estampamos"
  },
  {
    icon: Sparkles,
    title: "Estampa HD",
    description: "Colores vivos que no se despintan"
  },
  {
    icon: Package,
    title: "Relleno incluido",
    description: "Almohadones listos para usar"
  },
  {
    icon: Truck,
    title: "Envíos a todo el país",
    description: "Desde Córdoba a tu casa"
  }
]

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMediaVisible, setIsMediaVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const bentoRef = useRef<HTMLDivElement>(null)
  const mediaSectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    )
    const mediaObserver = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsMediaVisible(true),
      { threshold: 0.1 }
    )
    const headerObserver = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setHeaderVisible(true),
      { threshold: 0.1 }
    )

    if (bentoRef.current) observer.observe(bentoRef.current)
    if (mediaSectionRef.current) mediaObserver.observe(mediaSectionRef.current)
    if (headerRef.current) headerObserver.observe(headerRef.current)

    return () => {
      observer.disconnect()
      mediaObserver.disconnect()
      headerObserver.disconnect()
    }
  }, [])

  return (
    <section id="nosotros" className="py-24 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Bento Grid */}
        <div
          ref={bentoRef}
          className="grid md:grid-cols-4 mb-20 md:grid-rows-[300px_300px] gap-6"
        >
          {/* Left Large Block */}
          <div
            className={`relative rounded-3xl overflow-hidden h-[500px] md:h-auto md:col-span-2 md:row-span-2 border border-border transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <Image
              src="/images/acid/hero-cushions.png"
              alt="Almohadones Acid Blue"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 bg-card/80 backdrop-blur-md border border-border p-6 rounded-2xl">
              <h3 className="text-xl text-foreground mb-2 font-serif font-semibold">
                Hecho en <span className="acid-gradient-text font-bold">Córdoba Capital</span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Producimos cada pieza a mano y despachamos a todo el país. Stay.
              </p>
            </div>
          </div>

          {/* Top Right */}
          <div
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-end md:col-span-2 relative overflow-hidden border border-border transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <Image
              src="/images/acid/cushion-acid-marble.png"
              alt="Estampa acid marble"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl text-foreground font-serif font-semibold mb-1">
                Color que no se despinta
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Impresión por sublimación de larga duración.
              </p>
            </div>
          </div>

          {/* Bottom Right */}
          <div
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-end relative overflow-hidden md:col-span-2 border border-border transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <Image
              src="/images/acid/poster-portrait.png"
              alt="Poster personalizado"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl text-foreground font-serif font-semibold mb-1">
                Tu diseño, tu regla
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Personalizamos posters y almohadones con la imagen que quieras.
              </p>
            </div>
          </div>
        </div>

        <div
          ref={mediaSectionRef}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-8"
        >
          {/* Image */}
          <div
            className={`relative aspect-[4/5] rounded-3xl overflow-hidden border border-border transition-all duration-700 ease-out ${
              isMediaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <Image
              src="/images/acid/cushion-kpop-pastel.png"
              alt="Almohadón con estampa idol"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div
            ref={headerRef}
            className={`transition-all duration-700 ease-out ${
              isMediaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <span
              className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`}
              style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}
            >
              Por qué Acid Blue
            </span>
            <h2
              className={`font-serif text-4xl leading-tight text-foreground mb-6 text-balance md:text-6xl font-semibold ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`}
              style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}
            >
              Arte que te representa.
            </h2>
            <p
              className={`text-lg text-muted-foreground leading-relaxed mb-10 max-w-md ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`}
              style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}
            >
              Somos un estudio de impresión con onda pop. Convertimos a tus artistas,
              series e ídolos favoritos en objetos que usás todos los días.
            </p>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-5 boty-transition hover:scale-[1.02] rounded-2xl bg-card border border-border"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 group-hover:bg-primary/20 boty-transition bg-secondary">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
