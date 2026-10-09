"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Package,
  ShoppingBag,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  LogOut,
  Store,
  DollarSign,
  Copy,
  Check,
  ChevronDown,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Tag,
  Eye,
  Upload,
  ImagePlus,
  Loader2,
  ImageIcon,
} from "lucide-react"
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  resetSampleOrders,
  getAllProducts,
  getCustomProducts,
  addCustomProduct,
  deleteCustomProduct,
  isAdminAuthenticated,
  adminLogout,
  adminLogin,
  DEFAULT_ADMIN,
  type Order,
  type OrderStatus,
} from "@/lib/store"
import { categoryLabels, formatARS, type Product, type Category } from "@/lib/products"

const PRESET_IMAGES = [
  { label: "Almohadón Azul", path: "/images/acid/cushion-blue-portrait.png" },
  { label: "Almohadón Oscuro", path: "/images/acid/cushion-dark-portrait.png" },
  { label: "Almohadón Mármol", path: "/images/acid/cushion-acid-marble.png" },
  { label: "Almohadón Galaxia", path: "/images/acid/cushion-galaxy.png" },
  { label: "Poster Abstracto", path: "/images/acid/poster-abstract.png" },
  { label: "Poster Retrato", path: "/images/acid/poster-portrait.png" },
  { label: "Taza Acid", path: "/images/acid/mug-acid.png" },
  { label: "Taza Retrato", path: "/images/acid/mug-portrait.png" },
]

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  pendiente: {
    label: "Pendiente",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: Clock,
  },
  en_preparacion: {
    label: "En preparación",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    icon: RefreshCw,
  },
  enviado: {
    label: "Enviado",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    icon: Truck,
  },
  entregado: {
    label: "Entregado",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCheck,
  },
  cancelado: {
    label: "Cancelado",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: XCircle,
  },
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Login form state (if not authenticated)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders")

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [orderSearch, setOrderSearch] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)

  // Products State
  const [productsList, setProductsList] = useState<Product[]>([])
  const [customProductsCount, setCustomProductsCount] = useState(0)
  const [productSearch, setProductSearch] = useState("")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)

  // Add Product Form State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const [newProductName, setNewProductName] = useState("")
  const [newProductCategory, setNewProductCategory] = useState<Category>("almohadon")
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState("")
  const [newProductImage, setNewProductImage] = useState(PRESET_IMAGES[0].path)
  const [newProductTagline, setNewProductTagline] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [newProductOptions, setNewProductOptions] = useState("40x40, 50x50")
  const [newProductBadge, setNewProductBadge] = useState("Nuevo")

  // Check auth and sync state
  const syncStore = () => {
    setOrders(getOrders())
    setProductsList(getAllProducts())
    setCustomProductsCount(getCustomProducts().length)
  }

  useEffect(() => {
    setIsMounted(true)
    const authed = isAdminAuthenticated()
    setIsAuthenticated(authed)
    if (authed) {
      syncStore()
    }

    const handleUpdate = () => {
      syncStore()
    }
    window.addEventListener("acid_store_updated", handleUpdate)
    return () => window.removeEventListener("acid_store_updated", handleUpdate)
  }, [])

  const handleInlineLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    const ok = adminLogin(loginEmail, loginPassword)
    if (ok) {
      setIsAuthenticated(true)
      syncStore()
    } else {
      setLoginError("Credenciales incorrectas. Verificá tu usuario y contraseña.")
    }
  }

  const handleLogout = () => {
    adminLogout()
    setIsAuthenticated(false)
    router.push("/admin/login")
  }

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
    syncStore()
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("¿Seguro que querés eliminar esta orden?")) {
      deleteOrder(orderId)
      syncStore()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null)
      }
    }
  }

  const handleCopyShippingDetails = (order: Order) => {
    const text = `PEDIDO #${order.id}
Cliente: ${order.customer.name}
Email: ${order.customer.email}
Dirección: ${order.customer.address} ${order.customer.city ? `(${order.customer.city})` : ""}
Teléfono: ${order.customer.phone || "No especificado"}
Notas: ${order.customer.notes || "Sin notas"}

Artículos:
${order.items.map((i) => `- ${i.quantity}x ${i.name} (${i.description || ""})`).join("\n")}
Total: ${formatARS(order.total)}`

    navigator.clipboard.writeText(text)
    setCopiedOrderId(order.id)
    setTimeout(() => setCopiedOrderId(null), 2500)
  }

  // Handle Image File Upload (via API route + fallback FileReader Base64)
  const handleImageFileUpload = async (file: File) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor seleccioná un archivo de imagen válido (JPG, PNG, WEBP, etc.)")
      return
    }
    setUploadError("")
    setIsUploadingImage(true)

    // Try server API upload
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          setNewProductImage(data.url)
          setIsUploadingImage(false)
          return
        }
      }
    } catch (err) {
      console.warn("Fallo en /api/upload, usando fallback local Base64:", err)
    }

    // Fallback to Base64 FileReader
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setNewProductImage(result)
        }
        setIsUploadingImage(false)
      }
      reader.onerror = () => {
        setUploadError("Error al leer la imagen seleccionada.")
        setIsUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setUploadError("No se pudo procesar la imagen.")
      setIsUploadingImage(false)
    }
  }

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductName || !newProductPrice) return

    const priceNum = parseInt(newProductPrice.replace(/[^0-9]/g, ""), 10) || 10000
    const originalPriceNum = newProductOriginalPrice
      ? parseInt(newProductOriginalPrice.replace(/[^0-9]/g, ""), 10)
      : null

    const optionsArray = newProductOptions
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean)

    addCustomProduct({
      name: newProductName,
      category: newProductCategory,
      price: priceNum,
      originalPrice: originalPriceNum,
      image: newProductImage || "/images/acid/cushion-blue-portrait.png",
      tagline: newProductTagline || "Nuevo diseño exclusivo",
      description: newProductDescription || "Diseño exclusivo Acid Blue.",
      longDescription:
        newProductDescription ||
        "Producto estampado con materiales de alta calidad en Córdoba Capital.",
      badge: newProductBadge || null,
      options: optionsArray.length > 0 ? optionsArray : ["Único"],
      optionLabel: newProductCategory === "taza" ? "Capacidad" : "Medida",
      details: "Estampa de alta durabilidad. Diseñado en Córdoba.",
      care: "Lavar a mano o en ciclo suave.",
      material: "Materiales premium seleccionados.",
      delivery: "Envíos a todo el país en 24/48 hs hábiles.",
    })

    // Reset form
    setNewProductName("")
    setNewProductPrice("")
    setNewProductOriginalPrice("")
    setNewProductTagline("")
    setNewProductDescription("")
    setNewProductImage(PRESET_IMAGES[0].path)
    setIsAddProductOpen(false)
    syncStore()
  }

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`¿Eliminar el producto "${productName}" del catálogo?`)) {
      const removed = deleteCustomProduct(productId)
      if (removed) {
        syncStore()
      } else {
        alert("Los productos base del catálogo inicial no pueden eliminarse, solo los productos agregados por el administrador.")
      }
    }
  }

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter
    const term = orderSearch.toLowerCase()
    const matchesSearch =
      !term ||
      order.id.toLowerCase().includes(term) ||
      order.customer.name.toLowerCase().includes(term) ||
      order.customer.email.toLowerCase().includes(term) ||
      (order.customer.address && order.customer.address.toLowerCase().includes(term))
    return matchesStatus && matchesSearch
  })

  // Filtered products
  const filteredProducts = productsList.filter((product) => {
    const term = productSearch.toLowerCase()
    return (
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      (product.tagline && product.tagline.toLowerCase().includes(term))
    )
  })

  // KPIs
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + o.total, 0)
  const pendingOrdersCount = orders.filter((o) => o.status === "pendiente").length
  const shippedOrdersCount = orders.filter((o) => o.status === "enviado" || o.status === "entregado").length

  if (!isMounted) return null

  // If not authenticated, render login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-8 boty-shadow relative z-10 animate-scale-fade-in">
          <div className="text-center mb-8">
            <div className="acid-ring inline-flex mb-4">
              <span className="rounded-full overflow-hidden bg-background block">
                <Image
                  src="/images/acid/Logo-Acid-Blue.png"
                  alt="Acid Blue"
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover"
                  priority
                />
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Acceso de Administrador</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresá tus credenciales para gestionar órdenes y catálogo
            </p>
          </div>

          <form onSubmit={handleInlineLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Usuario / Email</label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@acidblue.com"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90 boty-transition text-sm"
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginEmail(DEFAULT_ADMIN.email)
                setLoginPassword(DEFAULT_ADMIN.password)
                setLoginError("")
              }}
              className="w-full py-2 text-xs text-primary/80 hover:text-primary hover:underline text-center"
            >
              Autocompletar credenciales de prueba ({DEFAULT_ADMIN.email} / {DEFAULT_ADMIN.password})
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/60 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="acid-ring inline-flex">
                <span className="rounded-full overflow-hidden bg-background block">
                  <Image
                    src="/images/acid/Logo-Acid-Blue.png"
                    alt="Acid Blue"
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </span>
              </span>
              <div>
                <span className="font-serif text-lg font-bold text-foreground tracking-wide block leading-none">
                  Acid Blue
                </span>
                <span className="text-[11px] text-primary font-mono font-medium">
                  Panel de Control
                </span>
              </div>
            </Link>

            {/* Tab switchers */}
            <div className="hidden sm:flex items-center gap-1.5 ml-6 bg-background/80 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium boty-transition flex items-center gap-2 ${
                  activeTab === "orders"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Órdenes ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium boty-transition flex items-center gap-2 ${
                  activeTab === "products"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Productos ({productsList.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground/80 hover:text-foreground boty-transition"
            >
              <Store className="w-3.5 h-3.5 text-primary" />
              <span className="hidden md:inline">Ver Tienda</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 boty-transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium text-center ${
              activeTab === "orders" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            Órdenes ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium text-center ${
              activeTab === "products" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            Productos ({productsList.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-4 boty-shadow">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Órdenes Totales</span>
              <Package className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
              {orders.length}
            </p>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Registradas en el sistema
            </span>
          </div>

          <div className="bg-card border border-amber-500/20 rounded-2xl p-4 boty-shadow">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Pendientes</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="font-serif text-2xl lg:text-3xl font-bold text-amber-400">
              {pendingOrdersCount}
            </p>
            <span className="text-[11px] text-amber-400/80 mt-1 block">
              Requieren empaquetado
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 boty-shadow">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Despachadas</span>
              <Truck className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="font-serif text-2xl lg:text-3xl font-bold text-indigo-400">
              {shippedOrdersCount}
            </p>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Enviadas o entregadas
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 boty-shadow">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Facturación</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-serif text-2xl lg:text-3xl font-bold text-emerald-400">
              {formatARS(totalRevenue)}
            </p>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Total pedidos no cancelados
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: ÓRDENES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "orders" && (
          <section className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border boty-shadow">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Órdenes Recibidas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gestioná los envíos y estados de las compras realizadas por clientes
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("¿Restablecer órdenes de prueba demo?")) {
                      resetSampleOrders()
                      syncStore()
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground boty-transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Cargar Demo
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Buscar por cliente, orden #, email, ciudad..."
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary boty-transition"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {(["all", "pendiente", "en_preparacion", "enviado", "entregado", "cancelado"] as const).map(
                  (status) => {
                    const isSelected = orderStatusFilter === status
                    const count =
                      status === "all" ? orders.length : orders.filter((o) => o.status === status).length

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setOrderStatusFilter(status)}
                        className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap boty-transition font-medium flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {status === "all" ? "Todas" : STATUS_CONFIG[status].label}
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {count}
                        </span>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Orders Table / Cards */}
            {filteredOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-12 text-center boty-shadow">
                <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-serif text-lg text-foreground font-semibold mb-1">
                  No se encontraron órdenes
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  {orderSearch || orderStatusFilter !== "all"
                    ? "Probá cambiando los filtros o el término de búsqueda."
                    : "Aún no se han registrado compras. Podés generar una compra desde el carrito o cargar las órdenes de demostración."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetSampleOrders()
                    syncStore()
                  }}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 boty-transition"
                >
                  Cargar Órdenes Demo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status]
                  const formattedDate = new Date(order.createdAt).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <div
                      key={order.id}
                      className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 lg:p-6 boty-shadow boty-transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
                        {/* Order ID & Date */}
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-primary px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                            {order.id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formattedDate}
                          </span>
                        </div>

                        {/* Status selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground mr-1">Estado:</span>
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className={`text-xs font-medium px-3 py-1.5 pr-8 rounded-full border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary boty-transition ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                            >
                              <option value="pendiente" className="bg-card text-foreground">Pendiente</option>
                              <option value="en_preparacion" className="bg-card text-foreground">En preparación</option>
                              <option value="enviado" className="bg-card text-foreground">Enviado</option>
                              <option value="entregado" className="bg-card text-foreground">Entregado</option>
                              <option value="cancelado" className="bg-card text-foreground">Cancelado</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                          </div>

                          {/* Quick action: copy address */}
                          <button
                            type="button"
                            onClick={() => handleCopyShippingDetails(order)}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 boty-transition"
                            title="Copiar datos de envío para correo"
                          >
                            {copiedOrderId === order.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete order */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 boty-transition"
                            title="Eliminar orden"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Customer & Items Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        {/* Customer Info */}
                        <div className="space-y-1.5 text-sm">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Datos del Cliente
                          </span>
                          <p className="font-semibold text-foreground text-base">
                            {order.customer.name}
                          </p>
                          <a
                            href={`mailto:${order.customer.email}`}
                            className="text-xs text-primary hover:underline flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {order.customer.email}
                          </a>
                          <div className="text-xs text-muted-foreground flex items-start gap-1.5 pt-1">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0 mt-0.5" />
                            <span>
                              {order.customer.address}
                              {order.customer.city ? ` · ${order.customer.city}` : ""}
                            </span>
                          </div>
                          {order.customer.phone && (
                            <a
                              href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 pt-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {order.customer.phone} (WhatsApp)
                            </a>
                          )}
                          {order.customer.notes && (
                            <p className="text-xs bg-background/60 border border-border/60 rounded-lg p-2 text-muted-foreground mt-2 italic">
                              Nota: {order.customer.notes}
                            </p>
                          )}
                        </div>

                        {/* Items ordered */}
                        <div className="space-y-2 md:col-span-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Productos ({order.items.reduce((s, i) => s + i.quantity, 0)})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 bg-background/60 p-2.5 rounded-xl border border-border/60"
                              >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  <Image
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {item.name}
                                  </p>
                                  {item.description && (
                                    <p className="text-[11px] text-muted-foreground truncate">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between text-xs mt-1">
                                    <span className="text-muted-foreground font-mono">
                                      Cant: <strong className="text-foreground">{item.quantity}</strong>
                                    </span>
                                    <span className="font-semibold text-primary">
                                      {formatARS(item.price * item.quantity)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total row */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/40 text-sm">
                            <span className="text-xs text-muted-foreground">
                              Envío: {order.shipping === 0 ? "Gratis" : formatARS(order.shipping)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs uppercase font-medium">
                                Total Cobrado:
                              </span>
                              <span className="font-serif text-lg font-bold text-foreground">
                                {formatARS(order.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: PRODUCTOS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "products" && (
          <section className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border boty-shadow">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Catálogo de Productos
                </h2>
                <p className="text-sm text-muted-foreground">
                  {productsList.length} productos en total ({customProductsCount} creados desde este panel)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 boty-transition flex items-center justify-center gap-2 text-sm boty-shadow"
              >
                <Plus className="w-4 h-4" />
                Agregar Nuevo Producto
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar por nombre, categoría, etiqueta..."
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary boty-transition"
              />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => {
                const isCustom = !product.id.startsWith("almohadon-") &&
                  !product.id.startsWith("poster-") &&
                  !product.id.startsWith("taza-")

                return (
                  <div
                    key={product.id}
                    className="bg-card border border-border hover:border-primary/40 rounded-2xl overflow-hidden boty-shadow boty-transition flex flex-col group"
                  >
                    {/* Image Thumbnail */}
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 boty-transition"
                      />
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full">
                          {product.badge}
                        </span>
                      )}
                      <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border font-mono text-muted-foreground">
                        {categoryLabels[product.category] || product.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-foreground line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {product.tagline || product.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                        <div>
                          <span className="font-serif text-base font-bold text-foreground block">
                            {formatARS(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-muted-foreground line-through block">
                              {formatARS(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-primary boty-transition"
                            title="Ver en tienda"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive boty-transition"
                              title="Eliminar producto creado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: AGREGAR PRODUCTO */}
      {/* ------------------------------------------------------------- */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 max-w-xl w-full boty-shadow relative my-8 animate-scale-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Nuevo Producto
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Completá los datos y subí una foto de tu PC para publicar en Acid Blue
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted boty-transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ej: Remera Acid Toxic Oversize"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Categoría *
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as Category)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                  >
                    <option value="almohadon">Almohadones</option>
                    <option value="poster">Posters</option>
                    <option value="taza">Tazas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Etiqueta (Badge)
                  </label>
                  <input
                    type="text"
                    value={newProductBadge}
                    onChange={(e) => setNewProductBadge(e.target.value)}
                    placeholder="Ej: Nuevo, Más vendido, Oferta"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                  />
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Precio ($ ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="14500"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Precio Original (Tachado, opcional)
                  </label>
                  <input
                    type="number"
                    value={newProductOriginalPrice}
                    onChange={(e) => setNewProductOriginalPrice(e.target.value)}
                    placeholder="18000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Frase Destacada (Tagline)
                </label>
                <input
                  type="text"
                  value={newProductTagline}
                  onChange={(e) => setNewProductTagline(e.target.value)}
                  placeholder="Ej: Estética urbana alternativa"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                />
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Foto del Producto *</span>
                  {newProductImage && (
                    <span className="text-emerald-400 font-mono text-[11px] normal-case flex items-center gap-1">
                      <Check className="w-3 h-3" /> Imagen seleccionada
                    </span>
                  )}
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFileUpload(e.target.files[0])
                    }
                  }}
                  className="hidden"
                />

                {/* Upload Dropzone or Current Image Preview */}
                {newProductImage ? (
                  <div className="bg-background/90 border border-primary/40 rounded-2xl p-4 boty-shadow">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border flex-shrink-0">
                        <Image
                          src={newProductImage}
                          alt="Vista previa"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-foreground block truncate mb-1">
                          {newProductImage.startsWith("data:")
                            ? "Imagen cargada desde tu PC"
                            : newProductImage.split("/").pop()}
                        </span>
                        <span className="text-[11px] text-muted-foreground block mb-2">
                          Se mostrará en la tienda y en la ficha del producto
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-lg boty-transition flex items-center gap-1.5 font-medium"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Cambiar foto de mi PC
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewProductImage("")}
                            className="text-xs text-muted-foreground hover:text-destructive px-2 py-1.5 rounded-lg boty-transition"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleImageFileUpload(e.dataTransfer.files[0])
                      }
                    }}
                    className="border-2 border-dashed border-border hover:border-primary/60 bg-background/50 hover:bg-background rounded-2xl p-6 text-center cursor-pointer boty-transition group"
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <span className="text-sm font-medium text-foreground">Subiendo imagen...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 boty-transition">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          Hacé clic acá para seleccionar una foto de tu PC
                        </p>
                        <p className="text-xs text-muted-foreground">
                          o arrastrá la imagen acá (JPG, PNG, WEBP)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-destructive mt-1.5">{uploadError}</p>
                )}

                {/* Secondary options: URL or Acid Blue presets */}
                <div className="mt-3 pt-3 border-t border-border/40">
                  <details className="text-xs group">
                    <summary className="text-muted-foreground hover:text-primary cursor-pointer select-none">
                      ¿Preferís ingresar una URL manual o usar diseños del catálogo Acid Blue?
                    </summary>
                    <div className="pt-3 space-y-2">
                      <input
                        type="text"
                        value={newProductImage}
                        onChange={(e) => setNewProductImage(e.target.value)}
                        placeholder="https://... o /images/acid/..."
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => setNewProductImage(preset.path)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border boty-transition ${
                              newProductImage === preset.path
                                ? "bg-primary/20 text-primary border-primary"
                                : "bg-background text-muted-foreground border-border hover:text-foreground"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {/* Options / Sizes */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Opciones / Medidas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={newProductOptions}
                  onChange={(e) => setNewProductOptions(e.target.value)}
                  placeholder="40x40, 50x50  o  S, M, L, XL"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  placeholder="Descripción detallada del material, estampa y dimensiones..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary boty-transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-sm boty-transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 text-sm boty-transition boty-shadow"
                >
                  Guardar y Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
