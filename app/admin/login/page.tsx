"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Lock, Mail, ArrowRight, ShieldCheck, ShoppingBag, Eye, EyeOff } from "lucide-react"
import { adminLogin, isAdminAuthenticated, DEFAULT_ADMIN } from "@/lib/store"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.push("/admin")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      const ok = adminLogin(email, password)
      if (ok) {
        router.push("/admin")
      } else {
        setError("Credenciales incorrectas. Verificá tu usuario y contraseña.")
        setIsLoading(false)
      }
    }, 400)
  }

  const handleAutofill = () => {
    setEmail(DEFAULT_ADMIN.email)
    setPassword(DEFAULT_ADMIN.password)
    setError("")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header link back to store */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary boty-transition"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Volver a la tienda
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
          Admin Portal
        </span>
      </div>

      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-8 boty-shadow relative z-10 animate-scale-fade-in">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4">
            <Image
              src="/images/acid/brand-logo-sticker.png"
              alt="Acid Blue"
              width={160}
              height={60}
              className="h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(94,213,255,0.3)]"
              priority
            />
          </div>
          <h1 className="font-sans text-2xl font-bold text-foreground tracking-wide">
            Panel de Administración
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de pedidos, catálogo y stock
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Usuario o Correo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@acidblue.com"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary boty-transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-11 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary boty-transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground boty-transition"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-medium py-3.5 rounded-xl hover:bg-primary/90 boty-transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isLoading ? "Ingresando..." : "Ingresar al Panel"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo credentials hint box */}
        <div className="mt-8 pt-6 border-t border-border/60">
          <div className="bg-background/80 border border-border rounded-2xl p-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Credenciales de Acceso:
              </span>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-primary hover:underline font-medium"
              >
                Autocompletar
              </button>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-foreground/80">
              <p>Usuario: <span className="text-primary">{DEFAULT_ADMIN.email}</span> (o <span className="text-primary">admin</span>)</p>
              <p>Clave: <span className="text-primary">{DEFAULT_ADMIN.password}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
