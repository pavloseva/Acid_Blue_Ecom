"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ShoppingBag, Search, User } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { useCart } from "./cart-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { setIsOpen, itemCount } = useCart()

  // Only show cart count after mount (avoids hydration mismatch)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav
        className="max-w-7xl mx-auto px-6 lg:px-8 backdrop-blur-md rounded-2xl py-0 my-0 animate-scale-fade-in bg-[rgba(18,22,31,0.7)] border border-[rgba(47,212,230,0.14)]"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.4) 0px 10px 40px' }}
      >
        <div className="flex items-center justify-between h-[68px]">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-foreground/80 hover:text-foreground boty-transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-sm tracking-wide text-foreground/70 hover:text-primary boty-transition"
            >
              Tienda
            </Link>
            <Link
              href="/#nosotros"
              className="text-sm tracking-wide text-foreground/70 hover:text-primary boty-transition"
            >
              Nosotros
            </Link>
            <Link
              href="/#envios"
              className="text-sm tracking-wide text-foreground/70 hover:text-primary boty-transition"
            >
              Envíos
            </Link>
          </div>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center group" aria-label="Acid Blue inicio">
            <Image
              src="/images/acid/brand-logo-horizontal.png"
              alt="Acid Blue"
              width={160}
              height={50}
              className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(94,213,255,0.25)]"
              priority
            />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 text-foreground/70 hover:text-primary boty-transition"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/admin"
              className="hidden sm:block p-2 text-foreground/70 hover:text-primary boty-transition"
              aria-label="Panel Administrador"
              title="Panel Administrador"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground/70 hover:text-primary boty-transition"
              aria-label="Carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {/* Only show cart count on client */}
              {isMounted && itemCount > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <CartDrawer />

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden boty-transition ${
            isMenuOpen ? "max-h-64 pb-6" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
            <Link href="/shop" className="text-sm tracking-wide text-foreground/70 hover:text-primary boty-transition">
              Tienda
            </Link>
            <Link href="/#nosotros" className="text-sm tracking-wide text-foreground/70 hover:text-primary boty-transition">
              Nosotros
            </Link>
            <Link href="/#envios" className="text-sm tracking-wide text-foreground/70 hover:text-primary boty-transition">
              Envíos
            </Link>
            <Link href="/admin" className="text-sm tracking-wide text-primary hover:underline boty-transition font-medium">
              Panel Administrador
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
