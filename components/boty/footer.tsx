"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Twitter } from "lucide-react"

const footerLinks = {
  shop: [
    { name: "Almohadones", href: "/shop" },
    { name: "Posters", href: "/shop" },
    { name: "Tazas", href: "/shop" },
    { name: "Novedades", href: "/shop" },
    { name: "Regalos", href: "/shop" }
  ],
  about: [
    { name: "Cómo Comprar", href: "/#envios" },
    { name: "Envíos a todo el país", href: "/#envios" },
    { name: "Catálogo completo", href: "/shop" },
    { name: "Atención al cliente", href: "/#envios" }
  ],
  support: [
    { name: "Preguntas Frecuentes", href: "/#envios" },
    { name: "Medios de Pago", href: "/#envios" },
    { name: "Garantía de Compra", href: "/#envios" },
    { name: "Panel Administrador", href: "/admin" }
  ]
}

export function Footer() {
  return (
    <footer className="bg-card pt-20 pb-10 relative overflow-hidden">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="font-serif text-[200px] sm:text-[200px] md:text-[400px] lg:text-[400px] xl:text-[400px] font-bold text-white/5 whitespace-nowrap leading-none">
          Acid Blue
        </span>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
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
              Almohadones • Bolsos • Accesorios — DTF & Sublimación
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Cosas funcionales con personalidad. Hechas para alegrar tu día a día. Lindas, cómodas y con un toque único.
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
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Información</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Ayuda</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Acid Blue. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Política de Privacidad
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Términos del Servicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
