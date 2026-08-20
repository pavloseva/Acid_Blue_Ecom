"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-28 pb-16">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-accent/20 blur-[150px]" />

      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <span
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] mb-6 text-primary animate-blur-in opacity-0"
                style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
              >
                <MapPin className="w-3.5 h-3.5" />
                Córdoba Capital · Envíos a todo el país
              </span>
              <h1 className="font-serif text-5xl md:text-6xl xl:text-7xl leading-[1.05] mb-6 text-balance text-foreground">
                <span
                  className="block animate-blur-in opacity-0 font-semibold"
                  style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
                >
                  Tu arte favorito,
                </span>
                <span
                  className="block animate-blur-in opacity-0 font-bold acid-gradient-text"
                  style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
                >
                  impreso en todo.
                </span>
              </h1>
              <p
                className="text-lg leading-relaxed mb-10 max-w-md mx-auto lg:mx-0 text-muted-foreground animate-blur-in opacity-0"
                style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
              >
                Almohadones, posters y tazas con estampas únicas. Diseños de tus artistas
                e ídolos, hechos para acompañarte todos los días.
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-blur-in opacity-0"
                style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
              >
                <Link
                  href="/shop"
                  className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium tracking-wide boty-transition hover:bg-primary/90 acid-glow"
                >
                  Ver la tienda
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 boty-transition" />
                </Link>
                <Link
                  href="/#nosotros"
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:border-primary/50 hover:text-primary"
                >
                  Cómo comprar
                </Link>
              </div>
            </div>

            {/* Image */}
            <div
              className="relative animate-scale-fade-in"
            >
              <div className="acid-ring rounded-[2rem] p-[3px]">
                <div className="relative aspect-square rounded-[calc(2rem-3px)] overflow-hidden bg-card">
                  <Image
                    src="/images/acid/hero-cushions.png"
                    alt="Almohadones Acid Blue con estampas de arte"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-3 sm:left-6 bg-card/90 backdrop-blur-md border border-border rounded-2xl px-5 py-3 boty-shadow">
                <p className="font-serif text-2xl font-bold text-primary leading-none">+1.2k</p>
                <p className="text-xs text-muted-foreground mt-1">clientes felices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
