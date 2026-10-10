"use client"

import { useState, useEffect, useRef, useMemo } from "react"
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
  Edit,
  Video,
  Play,
  Film,
  Crop,
  Layers,
  Inbox,
  Send,
  X,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react"
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  resetSampleOrders,
  getAllProducts,
  getCustomProducts,
  addCustomProduct,
  updateProduct,
  deleteProduct,
  getStoreCategories,
  addStoreCategory,
  updateStoreCategory,
  deleteStoreCategory,
  getCategoryLabelFromStore,
  type CategoryItem,
  syncStoreWithCloud,
  uploadMediaToCloud,
  getEmails,
  sendNewsletterWelcomeEmail,
  sendOrderConfirmationEmail,
  getStoreSettings,
  saveStoreSettings,
  DEFAULT_SETTINGS,
  type StoreSettings,
  isAdminAuthenticated,
  adminLogout,
  adminLogin,
  DEFAULT_ADMIN,
  type Order,
  type OrderStatus,
  type EmailRecord,
} from "@/lib/store"
import { categoryLabels, getCategoryLabel, formatARS, type Product, type Category } from "@/lib/products"

const PRESET_IMAGES = [
  { label: "Bandolera Chica", path: "/images/products/bandolera-chica-1.jpg" },
  { label: "Bandolera Grande", path: "/images/products/bandolera-grande-1.jpg" },
  { label: "Mochila Negra", path: "/images/products/mochila-negra-1.jpg" },
  { label: "Mochila Roja Chica", path: "/images/products/mochila-roja-chica-1.jpg" },
  { label: "Mochila Roja y Negra", path: "/images/products/mochila-roja-negra-1.jpg" },
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
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "categories" | "emails" | "settings">("orders")

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [orderSearch, setOrderSearch] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)

  // Products State
  const [productsList, setProductsList] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  // Categories State
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [categoryFormLabel, setCategoryFormLabel] = useState("")
  const [categoryFormId, setCategoryFormId] = useState("")
  const [categoryFormError, setCategoryFormError] = useState("")
  const [isSavingCategory, setIsSavingCategory] = useState(false)

  // Delete Category Modal State
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null)
  const [reassignTargetCatId, setReassignTargetCatId] = useState("")
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  // Emails State
  const [emailsList, setEmailsList] = useState<EmailRecord[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null)

  // Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [minAmountInput, setMinAmountInput] = useState<string>("15000")
  const [leadTimeInput, setLeadTimeInput] = useState<string>("4 a 5 días hábiles desde el pago")
  const [bannerNoticeInput, setBannerNoticeInput] = useState<string>("")
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false)

  // Product Form State (Add / Edit)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const [newProductName, setNewProductName] = useState("")
  const [newProductCategory, setNewProductCategory] = useState<Category>("mochilas-y-bolsos")
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [newProductOptionLabel, setNewProductOptionLabel] = useState("Tamaño")
  const [newProductPrice, setNewProductPrice] = useState("25000")
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState("")
  const [newProductImages, setNewProductImages] = useState<string[]>([])
  const [newProductVideo, setNewProductVideo] = useState("")
  const [newProductImageFit, setNewProductImageFit] = useState<"contain" | "cover">("contain")
  const [newProductTagline, setNewProductTagline] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [newProductOptions, setNewProductOptions] = useState("Estándar")
  const [newProductBadge, setNewProductBadge] = useState("Nuevo")

  const availableCategories = useMemo(() => {
    if (categoriesList.length > 0) {
      return categoriesList.map((c) => c.id)
    }
    const base = ["almohadon", "poster", "taza", "bolso", "remera", "accesorio", "cuadro"]
    const fromProducts = productsList.map((p) => p.category?.toLowerCase()?.trim()).filter(Boolean)
    return Array.from(new Set([...base, ...fromProducts]))
  }, [categoriesList, productsList])

  const [isSyncing, setIsSyncing] = useState(false)

  // Check auth and sync state
  const syncStore = () => {
    setOrders(getOrders())
    setProductsList(getAllProducts())
    setEmailsList(getEmails())
    setCategoriesList(getStoreCategories())
    const curSettings = getStoreSettings()
    setStoreSettings(curSettings)
    setMinAmountInput(curSettings.minPurchaseAmount.toString())
    setLeadTimeInput(curSettings.customLeadTimeDays)
    setBannerNoticeInput(curSettings.bannerNotice || "")
  }

  const refreshFromCloud = async () => {
    setIsSyncing(true)
    try {
      await syncStoreWithCloud()
      syncStore()
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    const authed = isAdminAuthenticated()
    setIsAuthenticated(authed)
    if (authed) {
      syncStore()
      refreshFromCloud()
    }

    const handleUpdate = () => {
      syncStore()
    }
    window.addEventListener("acid_store_updated", handleUpdate)

    // Polling interval: automatically query Supabase every 15s for incoming orders
    const pollInterval = setInterval(() => {
      if (isAdminAuthenticated()) {
        syncStoreWithCloud().then(() => syncStore())
      }
    }, 15000)

    return () => {
      window.removeEventListener("acid_store_updated", handleUpdate)
      clearInterval(pollInterval)
    }
  }, [])

  const handleInlineLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    const ok = adminLogin(loginEmail, loginPassword)
    if (ok) {
      setIsAuthenticated(true)
      syncStore()
      syncStoreWithCloud().then(() => syncStore())
    } else {
      setLoginError("Credenciales incorrectas. Verificá tu usuario y contraseña.")
    }
  }

  const handleLogout = () => {
    adminLogout()
    setIsAuthenticated(false)
    router.push("/admin/login")
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    setSettingsSavedSuccess(false)
    const amount = parseInt(minAmountInput.replace(/[^0-9]/g, ""), 10) || 0
    const updated = await saveStoreSettings({
      minPurchaseAmount: amount,
      customLeadTimeDays: leadTimeInput.trim() || "4 a 5 días hábiles desde el pago",
      bannerNotice: bannerNoticeInput.trim() || (amount > 0 ? `Compra mínima: ${formatARS(amount)} · Envíos a todo el país` : ""),
    })
    setStoreSettings(updated)
    setIsSavingSettings(false)
    setSettingsSavedSuccess(true)
    setTimeout(() => setSettingsSavedSuccess(false), 4000)
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
    if (!order) return
    const customer = order.customer || { name: "", email: "", address: "" }
    const items = order.items || []
    const text = `PEDIDO #${order.id || ""}
Cliente: ${customer.name || ""}
Email: ${customer.email || ""}
Dirección: ${customer.address || ""} ${customer.city ? `(${customer.city})` : ""}
Teléfono: ${customer.phone || "No especificado"}
Notas: ${customer.notes || "Sin notas"}

Artículos:
${items.map((i) => `- ${i?.quantity || 1}x ${i?.name || "Producto"} (${i?.description || ""})`).join("\n")}
Total: ${formatARS(order.total)}`

    navigator.clipboard.writeText(text)
    setCopiedOrderId(order.id)
    setTimeout(() => setCopiedOrderId(null), 2500)
  }

  // Handle Image File Upload (supports single or multiple photos!)
  const handleImageFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    setUploadError("")
    setIsUploadingImage(true)

    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith("image/")) continue

      let fileUrl = ""
      // 1. Try Supabase Cloud Storage first!
      try {
        const cloudUrl = await uploadMediaToCloud(file)
        if (cloudUrl) {
          fileUrl = cloudUrl
        }
      } catch (err) {
        console.warn("Supabase Storage error:", err)
      }

      // 2. Try server upload API fallback
      if (!fileUrl) {
        try {
          const formData = new FormData()
          formData.append("file", file)
          const res = await fetch("/api/upload", { method: "POST", body: formData })
          if (res.ok) {
            const data = await res.json()
            if (data.url) fileUrl = data.url
          }
        } catch (err) {
          console.warn("Fallo /api/upload, usando fallback Base64:", err)
        }
      }

      // 3. Fallback FileReader
      if (!fileUrl) {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          fileUrl = base64
        } catch {
          continue
        }
      }

      if (fileUrl) {
        uploadedUrls.push(fileUrl)
      }
    }

    if (uploadedUrls.length > 0) {
      setNewProductImages((prev) => [...prev, ...uploadedUrls])
    } else {
      setUploadError("No se pudieron cargar las imágenes seleccionadas.")
    }
    setIsUploadingImage(false)
  }

  // Handle Video Upload
  const handleVideoFileUpload = async (file: File) => {
    if (!file) return
    setIsUploadingVideo(true)
    setUploadError("")

    // 1. Try Supabase Cloud Storage first!
    try {
      const cloudUrl = await uploadMediaToCloud(file)
      if (cloudUrl) {
        setNewProductVideo(cloudUrl)
        setIsUploadingVideo(false)
        return
      }
    } catch (err) {
      console.warn("Error subiendo video a Supabase:", err)
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          setNewProductVideo(data.url)
          setIsUploadingVideo(false)
          return
        }
      }
    } catch (err) {
      console.warn("Error subiendo video:", err)
    }

    // Fallback base64
    try {
      const reader = new FileReader()
      reader.onload = () => {
        setNewProductVideo(reader.result as string)
        setIsUploadingVideo(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setUploadError("Error al procesar el video.")
      setIsUploadingVideo(false)
    }
  }

  const handleOpenNewProduct = () => {
    setEditingProductId(null)
    setNewProductName("")
    setNewProductCategory("mochilas-y-bolsos")
    setIsCustomCategory(false)
    setNewProductOptionLabel("Tamaño")
    setNewProductPrice("25000")
    setNewProductOriginalPrice("")
    setNewProductTagline("")
    setNewProductDescription("")
    setNewProductImages([PRESET_IMAGES[0].path])
    setNewProductVideo("")
    setNewProductImageFit("contain")
    setNewProductOptions("Estándar")
    setNewProductBadge("Nuevo")
    setUploadError("")
    setIsAddProductOpen(true)
  }

  const handleStartEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setNewProductName(product.name)
    const cat = (product.category || "").trim().toLowerCase()
    setNewProductCategory(cat || "almohadon")
    setIsCustomCategory(!availableCategories.includes(cat))
    setNewProductOptionLabel(product.optionLabel || (cat === "taza" ? "Capacidad" : "Medida"))
    setNewProductPrice(product.price.toString())
    setNewProductOriginalPrice(product.originalPrice ? product.originalPrice.toString() : "")
    setNewProductTagline(product.tagline || "")
    setNewProductDescription(product.longDescription || product.description || "")
    const imgs = product.images && product.images.length > 0 ? product.images : [product.image]
    setNewProductImages(imgs)
    setNewProductVideo(product.video || "")
    setNewProductImageFit(product.imageFit || "contain")
    setNewProductOptions(product.options ? product.options.join(", ") : "40x40, 50x50")
    setNewProductBadge(product.badge || "")
    setUploadError("")
    setIsAddProductOpen(true)
  }

  const handleAddOrEditProductSubmit = (e: React.FormEvent) => {
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

    const primaryImg = newProductImages[0] || PRESET_IMAGES[0].path
    const finalCategory = newProductCategory.trim().toLowerCase() || "almohadon"
    const finalOptionLabel =
      newProductOptionLabel.trim() || (finalCategory === "taza" ? "Capacidad" : "Medida")

    const productPayload = {
      name: newProductName,
      category: finalCategory,
      price: priceNum,
      originalPrice: originalPriceNum,
      image: primaryImg,
      images: newProductImages.length > 0 ? newProductImages : [primaryImg],
      video: newProductVideo || undefined,
      imageFit: newProductImageFit,
      tagline: newProductTagline || "Diseño exclusivo Acid Blue",
      description: newProductDescription || "Diseño exclusivo estampado en Córdoba.",
      longDescription:
        newProductDescription ||
        "Producto estampado con materiales de alta calidad en Córdoba Capital.",
      badge: newProductBadge || null,
      options: optionsArray.length > 0 ? optionsArray : ["Único"],
      optionLabel: finalOptionLabel,
      details: "Estampa de alta durabilidad. Diseñado en Córdoba.",
      care: "Lavar a mano o en ciclo suave.",
      material: "Materiales premium seleccionados.",
      delivery: "Envíos a todo el país en 24/48 hs hábiles.",
    }

    if (editingProductId) {
      updateProduct(editingProductId, productPayload)
    } else {
      addCustomProduct(productPayload)
    }

    setIsAddProductOpen(false)
    syncStore()
  }

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`¿Seguro que querés eliminar el producto "${productName}" del catálogo?`)) {
      deleteProduct(productId)
      syncStore()
    }
  }

  // Category management handlers
  const handleOpenNewCategory = () => {
    setEditingCategory(null)
    setCategoryFormLabel("")
    setCategoryFormId("")
    setCategoryFormError("")
    setIsCategoryModalOpen(true)
  }

  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat)
    setCategoryFormLabel(cat.label)
    setCategoryFormId(cat.id)
    setCategoryFormError("")
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategoryFormError("")
    const labelTrimmed = categoryFormLabel.trim()
    const idTrimmed = (
      categoryFormId.trim() ||
      labelTrimmed
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    ).toLowerCase()

    if (!labelTrimmed) {
      setCategoryFormError("Ingresá un nombre para la categoría.")
      return
    }

    if (!idTrimmed) {
      setCategoryFormError("Ingresá un identificador o slug válido.")
      return
    }

    setIsSavingCategory(true)
    try {
      if (editingCategory) {
        await updateStoreCategory(editingCategory.id, {
          id: idTrimmed,
          label: labelTrimmed,
        })
      } else {
        await addStoreCategory({
          id: idTrimmed,
          label: labelTrimmed,
        })
      }
      setIsCategoryModalOpen(false)
      syncStore()
    } catch (err) {
      setCategoryFormError("Ocurrió un error al guardar la categoría.")
    } finally {
      setIsSavingCategory(false)
    }
  }

  const handleStartDeleteCategory = (cat: CategoryItem) => {
    setDeletingCategory(cat)
    const otherCats = categoriesList.filter((c) => c.id !== cat.id)
    setReassignTargetCatId(otherCats[0]?.id || "general")
  }

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return
    setIsDeletingCategory(true)
    try {
      const affected = productsList.filter(
        (p) => p.category?.toLowerCase()?.trim() === deletingCategory.id.toLowerCase().trim()
      )
      const target = affected.length > 0 ? reassignTargetCatId : undefined
      await deleteStoreCategory(deletingCategory.id, target)
      setDeletingCategory(null)
      syncStore()
    } finally {
      setIsDeletingCategory(false)
    }
  }

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (!order) return false
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter
    const term = (orderSearch || "").toLowerCase()
    if (!matchesStatus) return false
    if (!term) return true

    const id = String(order.id || "").toLowerCase()
    const name = String(order.customer?.name || "").toLowerCase()
    const email = String(order.customer?.email || "").toLowerCase()
    const address = String(order.customer?.address || "").toLowerCase()

    return id.includes(term) || name.includes(term) || email.includes(term) || address.includes(term)
  })

  // Filtered products
  const filteredProducts = productsList.filter((product) => {
    if (!product) return false
    const term = (productSearch || "").toLowerCase()
    if (!term) return true

    const name = String(product.name || "").toLowerCase()
    const category = String(product.category || "").toLowerCase()
    const tagline = String(product.tagline || "").toLowerCase()

    return name.includes(term) || category.includes(term) || tagline.includes(term)
  })

  // KPIs
  const totalRevenue = orders
    .filter((o) => o && o.status !== "cancelado")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const pendingOrdersCount = orders.filter((o) => o && o.status === "pendiente").length
  const shippedOrdersCount = orders.filter((o) => o && (o.status === "enviado" || o.status === "entregado")).length

  if (!isMounted) return null

  // If not authenticated, render login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-8 boty-shadow relative z-10 animate-scale-fade-in">
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
            <h1 className="font-sans text-2xl font-bold text-foreground">Acceso de Administrador</h1>
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
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/acid/brand-logo-sticker.png"
                alt="Acid Blue"
                width={120}
                height={40}
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-[11px] uppercase tracking-wider font-semibold text-primary/90 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </Link>

            {/* Tab switchers */}
            <div className="hidden sm:flex items-center gap-1.5 ml-6 bg-background/80 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("orders")
                  refreshFromCloud()
                }}
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
              <button
                type="button"
                onClick={() => setActiveTab("categories")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium boty-transition flex items-center gap-2 ${
                  activeTab === "categories"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                Categorías ({categoriesList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("emails")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium boty-transition flex items-center gap-2 ${
                  activeTab === "emails"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                Emails ({emailsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium boty-transition flex items-center gap-2 ${
                  activeTab === "settings"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Ajustes
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
        <div className="sm:hidden flex items-center gap-1.5 mt-3 pt-3 border-t border-border overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex-1 min-w-[70px] py-2 rounded-lg text-xs font-medium text-center ${
              activeTab === "orders" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            Órdenes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex-1 min-w-[75px] py-2 rounded-lg text-xs font-medium text-center ${
              activeTab === "products" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            Productos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex-1 min-w-[80px] py-2 rounded-lg text-xs font-medium text-center ${
              activeTab === "categories" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            Categorías
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("emails")}
            className={`flex-1 min-w-[65px] py-2 rounded-lg text-xs font-medium text-center ${
              activeTab === "emails" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            Emails
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex-1 min-w-[65px] py-2 rounded-lg text-xs font-medium text-center ${
              activeTab === "settings" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            Ajustes
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
                  disabled={isSyncing}
                  onClick={refreshFromCloud}
                  className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium boty-transition disabled:opacity-50 shadow-sm"
                  title="Sincronizar pedidos con la base de datos en Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Sincronizando..." : "Actualizar Pedidos"}
                </button>

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
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pendiente
                  const formattedDate = order.createdAt
                    ? (() => {
                        try {
                          return new Date(order.createdAt).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        } catch {
                          return String(order.createdAt)
                        }
                      })()
                    : "—"

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
                              value={order.status || "pendiente"}
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
                            {order.customer?.name || "Cliente"}
                          </p>
                          <a
                            href={`mailto:${order.customer?.email || ""}`}
                            className="text-xs text-primary hover:underline flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {order.customer?.email || "Sin email"}
                          </a>
                          <div className="text-xs text-muted-foreground flex items-start gap-1.5 pt-1">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0 mt-0.5" />
                            <span>
                              {order.customer?.address || "Sin dirección"}
                              {order.customer?.city ? ` · ${order.customer.city}` : ""}
                            </span>
                          </div>
                          {order.customer?.phone && (
                            <a
                              href={`https://wa.me/${String(order.customer.phone).replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 pt-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {order.customer.phone} (WhatsApp)
                            </a>
                          )}
                          {order.customer?.notes && (
                            <p className="text-xs bg-background/60 border border-border/60 rounded-lg p-2 text-muted-foreground mt-2 italic">
                              Nota: {order.customer.notes}
                            </p>
                          )}
                        </div>

                        {/* Items ordered */}
                        <div className="space-y-2 md:col-span-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Productos ({Array.isArray(order.items) ? order.items.reduce((s, i) => s + (Number(i?.quantity) || 0), 0) : 0})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {Array.isArray(order.items) && order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 bg-background/60 p-2.5 rounded-xl border border-border/60"
                              >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  <Image
                                    src={item?.image || "/placeholder.svg"}
                                    alt={item?.name || "Producto"}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {item?.name || "Producto"}
                                  </p>
                                  {item?.description && (
                                    <p className="text-[11px] text-muted-foreground truncate">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between text-xs mt-1">
                                    <span className="text-muted-foreground font-mono">
                                      Cant: <strong className="text-foreground">{item?.quantity || 1}</strong>
                                    </span>
                                    <span className="font-semibold text-primary">
                                      {formatARS((Number(item?.price) || 0) * (Number(item?.quantity) || 1))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total row */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/40 text-sm">
                            <span className="text-xs text-muted-foreground">
                              Envío: {order.shipping === 0 ? "Gratis" : formatARS(order.shipping || 0)}
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
                  {productsList.length} productos en total. Podés editarlos, eliminarlos o agregar nuevos con múltiples fotos y videos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className="bg-background border border-border hover:bg-muted text-foreground text-xs font-medium px-4 py-2.5 rounded-xl boty-transition flex items-center justify-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Gestionar Categorías ({categoriesList.length})
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewProduct}
                  className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 boty-transition flex items-center justify-center gap-2 text-sm boty-shadow"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Nuevo Producto
                </button>
              </div>
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
                const photosCount = (product.images && product.images.length > 0) ? product.images.length : 1

                return (
                  <div
                    key={product.id}
                    className="bg-card border border-border hover:border-primary/40 rounded-2xl overflow-hidden boty-shadow boty-transition flex flex-col group"
                  >
                    {/* Image Thumbnail */}
                    <div className="relative aspect-square bg-muted overflow-hidden flex items-center justify-center">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        unoptimized
                        className={product.imageFit === "contain" ? "object-contain p-2" : "object-cover group-hover:scale-105 boty-transition"}
                      />
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full z-10">
                          {product.badge}
                        </span>
                      )}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        {product.video && (
                          <span className="p-1 rounded-full bg-black/70 text-primary border border-primary/30" title="Tiene video">
                            <Film className="w-3 h-3" />
                          </span>
                        )}
                        {photosCount > 1 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-border font-mono text-primary flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            {photosCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border font-mono text-muted-foreground">
                            {getCategoryLabelFromStore(product.category)}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {product.imageFit === "contain" ? "100% Completa" : "Recortada 1:1"}
                          </span>
                        </div>
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

                        {/* Action buttons: Edit, View, Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditProduct(product)}
                            className="p-2 rounded-lg border border-border hover:bg-primary/20 text-muted-foreground hover:text-primary boty-transition"
                            title="Editar producto"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-primary boty-transition"
                            title="Ver en tienda"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive boty-transition"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: CATEGORÍAS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "categories" && (
          <section className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border boty-shadow">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2.5">
                  <Tag className="w-6 h-6 text-primary" />
                  Gestión de Categorías
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Creá, editá nombres o eliminá categorías. Los cambios se actualizan automáticamente en la tienda y en los filtros.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewCategory}
                className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 boty-transition flex items-center justify-center gap-2 text-sm boty-shadow"
              >
                <Plus className="w-4 h-4" />
                Nueva Categoría
              </button>
            </div>

            {/* Category Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-2xl border border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                  Categorías Totales
                </span>
                <span className="text-2xl font-serif font-bold text-foreground">
                  {categoriesList.length}
                </span>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                  Con Productos Activos
                </span>
                <span className="text-2xl font-serif font-bold text-primary">
                  {categoriesList.filter((c) => productsList.some((p) => p.category?.toLowerCase()?.trim() === c.id.toLowerCase().trim())).length}
                </span>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                  Sin Productos (Vacías)
                </span>
                <span className="text-2xl font-serif font-bold text-muted-foreground">
                  {categoriesList.filter((c) => !productsList.some((p) => p.category?.toLowerCase()?.trim() === c.id.toLowerCase().trim())).length}
                </span>
              </div>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesList.map((cat) => {
                const assignedProducts = productsList.filter(
                  (p) => p.category?.toLowerCase()?.trim() === cat.id.toLowerCase().trim()
                )
                const count = assignedProducts.length

                return (
                  <div
                    key={cat.id}
                    className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 boty-shadow boty-transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-primary/10 text-primary border border-primary/20">
                          {cat.id}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            count > 0
                              ? "bg-muted text-foreground"
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                          }`}
                        >
                          {count} {count === 1 ? "producto" : "productos"}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-foreground mb-1">
                        {cat.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {count > 0
                          ? `Asociada a ${count} ${count === 1 ? "producto" : "productos"} en catálogo.`
                          : "Categoría vacía. Podés asignarle productos o eliminarla."}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEditCategory(cat)}
                        className="p-2 rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border boty-transition flex items-center gap-1.5 text-xs px-3"
                        title="Editar nombre o slug de categoría"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartDeleteCategory(cat)}
                        className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 boty-transition flex items-center gap-1.5 text-xs px-3"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: EMAILS ENVIADOS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "emails" && (
          <section className="space-y-6">
            <div className="bg-card p-5 rounded-2xl border border-border boty-shadow">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Bandeja de Correos Enviados ({emailsList.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Registro automático de correos enviados al suscribirse al newsletter o al registrar un pedido.
              </p>
            </div>

            {emailsList.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-12 text-center boty-shadow">
                <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-serif text-lg text-foreground font-semibold mb-1">
                  Aún no hay correos registrados
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Cuando un cliente se suscriba al newsletter o complete una compra en el carrito, los correos quedarán registrados aquí automáticamente.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    sendNewsletterWelcomeEmail("demo@acidblue.com")
                    syncStore()
                  }}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 boty-transition"
                >
                  Enviar Email de Prueba
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailsList.map((em) => (
                  <div
                    key={em.id}
                    onClick={() => setSelectedEmail(em)}
                    className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 boty-shadow boty-transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-primary/10 text-primary border border-primary/20">
                        {em.type === "newsletter" ? "Newsletter" : "Pedido"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {em.sentAt
                          ? (() => {
                              try {
                                return new Date(em.sentAt).toLocaleString("es-AR")
                              } catch {
                                return String(em.sentAt)
                              }
                            })()
                          : ""}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-foreground mb-1">
                      {em.subject}
                    </h4>
                    <p className="text-xs text-primary mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Para: {em.to}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3 bg-background/50 p-3 rounded-xl border border-border/60 font-mono">
                      {em.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: STORE SETTINGS / CONFIGURACIÓN */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "settings" && (
          <section className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
                Ajustes de la Tienda
              </h2>
              <p className="text-sm text-muted-foreground">
                Configurá el monto de compra mínima, los plazos de entrega para diseños personalizados y mensajes clave para tus clientes.
              </p>
            </div>

            {settingsSavedSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">¡Ajustes guardados correctamente!</p>
                  <p className="text-xs text-emerald-400/80">Los cambios ya están activos en la tienda y sincronizados con Supabase.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Card 1: Compra Mínima */}
              <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 boty-shadow space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <DollarSign className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        Compra Mínima Obligatoria
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Monto mínimo en pesos requerido en el carrito para que el cliente pueda finalizar su pedido.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    Actual: {formatARS(storeSettings.minPurchaseAmount)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Monto en Pesos Argentinos ($ARS)
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={minAmountInput}
                      onChange={(e) => setMinAmountInput(e.target.value)}
                      placeholder="Ej: 15000"
                      className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3 text-foreground font-semibold text-base focus:outline-none focus:border-primary boty-transition"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Colocá <strong>0</strong> si no querés exigir un monto mínimo.
                  </p>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="block text-xs text-muted-foreground mb-2">Valores rápidos:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Sin mínimo ($0)", val: 0 },
                      { label: "$5.000", val: 5000 },
                      { label: "$10.000", val: 10000 },
                      { label: "$12.900", val: 12900 },
                      { label: "$15.000", val: 15000 },
                      { label: "$20.000", val: 20000 },
                      { label: "$25.000", val: 25000 },
                      { label: "$30.000", val: 30000 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setMinAmountInput(preset.val.toString())}
                        className={`text-xs px-3 py-1.5 rounded-full border boty-transition ${
                          minAmountInput === preset.val.toString()
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-background/60 border border-border/80 rounded-2xl p-4 text-xs text-muted-foreground flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Si el subtotal del cliente es menor a este importe, el botón del carrito indicará cuánto le falta para completar la compra y bloqueará el checkout.
                  </span>
                </div>
              </div>

              {/* Card 2: Demora en Diseños Personalizados */}
              <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 boty-shadow space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Demora de Diseños Personalizados
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Plazo estimado de elaboración a partir de la acreditación del pago.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Texto explicativo del plazo
                  </label>
                  <input
                    type="text"
                    value={leadTimeInput}
                    onChange={(e) => setLeadTimeInput(e.target.value)}
                    placeholder="Ej: 4 a 5 días hábiles desde el pago"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary boty-transition"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="block text-xs text-muted-foreground mb-2">Sugerencias rápidas:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "4 a 5 días hábiles desde el pago",
                      "3 a 5 días hábiles desde el pago",
                      "5 a 7 días hábiles desde el pago",
                      "24 a 48 hs hábiles desde el pago",
                      "A coordinar por WhatsApp",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLeadTimeInput(preset)}
                        className={`text-xs px-3 py-1.5 rounded-full border boty-transition ${
                          leadTimeInput === preset
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-2xl hover:bg-primary/90 text-sm boty-transition boty-shadow flex items-center gap-2"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando cambios...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar Configuración en la Nube
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EMAIL DETAIL VIEWER */}
      {/* ------------------------------------------------------------- */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 max-w-xl w-full boty-shadow relative animate-scale-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div>
                <span className="text-xs font-mono text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  {selectedEmail.type.toUpperCase()}
                </span>
                <h3 className="font-serif text-xl font-bold text-foreground mt-2">
                  {selectedEmail.subject}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Para: <strong>{selectedEmail.to}</strong> ·{" "}
                  {selectedEmail.sentAt
                    ? (() => {
                        try {
                          return new Date(selectedEmail.sentAt).toLocaleString("es-AR")
                        } catch {
                          return String(selectedEmail.sentAt)
                        }
                      })()
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="bg-background rounded-2xl p-4 border border-border whitespace-pre-wrap font-mono text-xs text-foreground/90 leading-relaxed">
              {selectedEmail.body}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: AGREGAR O EDITAR PRODUCTO */}
      {/* ------------------------------------------------------------- */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 max-w-2xl w-full boty-shadow relative my-8 animate-scale-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  {editingProductId ? "Editar Producto" : "Nuevo Producto"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Podés agregar múltiples fotos, un video demostrativo y elegir el encuadre.
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

            <form onSubmit={handleAddOrEditProductSubmit} className="space-y-5">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Categoría *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isCustomCategory
                        setIsCustomCategory(nextState)
                        if (nextState) {
                          setNewProductCategory("")
                        } else {
                          setNewProductCategory(availableCategories[0] || "almohadon")
                        }
                      }}
                      className="text-xs text-primary hover:underline font-mono"
                    >
                      {isCustomCategory ? "← Elegir existente" : "+ Crear nueva"}
                    </button>
                  </div>

                  {!isCustomCategory ? (
                    <select
                      value={newProductCategory}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomCategory(true)
                          setNewProductCategory("")
                        } else {
                          setNewProductCategory(e.target.value)
                        }
                      }}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {getCategoryLabelFromStore(cat)}
                        </option>
                      ))}
                      <option value="__custom__">➕ Crear nueva categoría...</option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        required
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value)}
                        placeholder="Ej: Remeras, Bolsos, Cuadros..."
                        className="w-full bg-background border border-primary rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary boty-transition"
                        autoFocus
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Escribí el nombre y se creará automáticamente en la tienda.
                      </p>
                    </div>
                  )}
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

              {/* MULTIPLE PHOTOS SECTION */}
              <div className="p-4 rounded-2xl bg-background/60 border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Fotos del Producto ({newProductImages.length})
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    La primera foto será la principal
                  </span>
                </div>

                {/* Hidden File Input for Multiple Images */}
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) handleImageFileUpload(e.target.files)
                  }}
                  className="hidden"
                />

                {/* Thumbnails of Added Images */}
                {newProductImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                    {newProductImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl overflow-hidden bg-muted border-2 group ${
                          idx === 0 ? "border-primary ring-2 ring-primary/30" : "border-border"
                        }`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Foto ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            Principal
                          </span>
                        )}
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 boty-transition flex flex-col items-center justify-center gap-1.5 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const reordered = [imgUrl, ...newProductImages.filter((_, i) => i !== idx)]
                                setNewProductImages(reordered)
                              }}
                              className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded font-medium"
                            >
                              Hacer principal
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setNewProductImages(newProductImages.filter((_, i) => i !== idx))
                            }}
                            className="text-[10px] bg-destructive text-white px-2 py-1 rounded font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-xl boty-transition flex items-center gap-2 font-medium"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {newProductImages.length === 0 ? "Subir fotos desde mi PC" : "Agregar más fotos"}
                  </button>

                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">
                      O elegir de diseños Acid Blue
                    </summary>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setNewProductImages((prev) => [...prev, preset.path])}
                          className="text-[10px] px-2 py-1 rounded bg-background border border-border hover:border-primary/50 text-foreground"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              </div>

              {/* VIDEO SECTION */}
              <div className="p-4 rounded-2xl bg-background/60 border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-primary" />
                    Video del Producto (Opcional)
                  </label>
                  {newProductVideo && (
                    <button
                      type="button"
                      onClick={() => setNewProductVideo("")}
                      className="text-xs text-destructive hover:underline"
                    >
                      Quitar video
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/mp4,video/webm,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVideoFileUpload(e.target.files[0])
                    }
                  }}
                  className="hidden"
                />

                {newProductVideo ? (
                  <div className="flex items-center gap-3 bg-background p-3 rounded-xl border border-primary/40">
                    <Film className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1 font-mono">
                      {newProductVideo.slice(0, 50)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="text-xs bg-muted px-2.5 py-1 rounded border border-border text-foreground hover:text-primary"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={isUploadingVideo}
                      className="text-xs bg-muted hover:bg-muted/80 text-foreground border border-border px-4 py-2.5 rounded-xl boty-transition flex items-center justify-center gap-2"
                    >
                      {isUploadingVideo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      Subir archivo de video (MP4)
                    </button>
                    <input
                      type="text"
                      value={newProductVideo}
                      onChange={(e) => setNewProductVideo(e.target.value)}
                      placeholder="o pegar link de YouTube / Vimeo / MP4"
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* IMAGE FIT / FRAMING CONTROL */}
              <div className="p-4 rounded-2xl bg-background/60 border border-border/80">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Crop className="w-4 h-4 text-primary" />
                  Encuadre en la Tienda (Cómo se muestra la foto)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer boty-transition ${
                      newProductImageFit === "contain"
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="imageFit"
                      checked={newProductImageFit === "contain"}
                      onChange={() => setNewProductImageFit("contain")}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-semibold text-xs block text-foreground">
                        Foto completa (Sin recortar)
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Recomendado: se ve el 100% de la foto con fondo oscuro limpio.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer boty-transition ${
                      newProductImageFit === "cover"
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="imageFit"
                      checked={newProductImageFit === "cover"}
                      onChange={() => setNewProductImageFit("cover")}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-semibold text-xs block text-foreground">
                        Llenar cuadro 1:1 (Recorta)
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Llena todo el cuadrado recortando los laterales si no es cuadrada.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Options & Variants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Tipo de Opción (Etiqueta)
                  </label>
                  <input
                    type="text"
                    value={newProductOptionLabel}
                    onChange={(e) => setNewProductOptionLabel(e.target.value)}
                    placeholder="Ej: Medida, Talle, Capacidad, Color"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Variantes (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={newProductOptions}
                    onChange={(e) => setNewProductOptions(e.target.value)}
                    placeholder="40x40, 50x50  o  S, M, L, XL"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                  />
                </div>
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

              {uploadError && (
                <p className="text-xs text-destructive">{uploadError}</p>
              )}

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
                  {editingProductId ? "Guardar Cambios" : "Guardar y Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREAR / EDITAR CATEGORÍA */}
      {/* ------------------------------------------------------------- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 boty-shadow relative animate-blur-in">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground boty-transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingCategory
                    ? "Modificá el nombre visible y el identificador."
                    : "Creá una categoría para clasificar productos en la tienda."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCategorySubmit} className="space-y-4">
              {categoryFormError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {categoryFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Nombre Visible *
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormLabel}
                  onChange={(e) => {
                    const val = e.target.value
                    setCategoryFormLabel(val)
                    if (!editingCategory) {
                      const autoSlug = val
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                      setCategoryFormId(autoSlug)
                    }
                  }}
                  placeholder="Ej: Remeras, Bolsos, Cuadros..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Identificador URL / Slug *
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormId}
                  onChange={(e) =>
                    setCategoryFormId(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]/g, "-")
                        .replace(/-+/g, "-")
                    )
                  }
                  placeholder="ej: remeras, bolsos, cuadros"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-primary boty-transition"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  En minúsculas, sin espacios ni tildes. Se usa internamente y en la URL.
                </p>
              </div>

              {editingCategory && (
                <p className="text-[11px] text-amber-500/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  ⚠️ Si cambiás el slug, todos los productos que usaban "{editingCategory.id}" se actualizarán automáticamente.
                </p>
              )}

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs boty-transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl hover:bg-primary/90 text-xs boty-transition boty-shadow flex items-center gap-1.5"
                >
                  {isSavingCategory && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ELIMINAR CATEGORÍA */}
      {/* ------------------------------------------------------------- */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-destructive/40 rounded-3xl max-w-md w-full p-6 boty-shadow relative animate-blur-in">
            <button
              type="button"
              onClick={() => setDeletingCategory(null)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground boty-transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Eliminar Categoría
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {deletingCategory.label} ({deletingCategory.id})
                </p>
              </div>
            </div>

            {(() => {
              const affectedProducts = productsList.filter(
                (p) => p.category?.toLowerCase()?.trim() === deletingCategory.id.toLowerCase().trim()
              )
              const count = affectedProducts.length
              const otherCategories = categoriesList.filter((c) => c.id !== deletingCategory.id)

              return (
                <div className="space-y-4">
                  {count === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-muted/50 border border-border text-xs text-foreground/80 space-y-1">
                      <p>
                        Esta categoría no tiene productos asignados actualmente.
                      </p>
                      <p className="text-muted-foreground">
                        Se eliminará permanentemente de la tienda y del panel.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                        <p className="font-semibold mb-1">
                          ⚠️ Hay {count} {count === 1 ? "producto asignado" : "productos asignados"} a esta categoría:
                        </p>
                        <p className="text-foreground/80 line-clamp-2">
                          {affectedProducts.map((p) => p.name).join(", ")}
                        </p>
                      </div>

                      {otherCategories.length > 0 ? (
                        <div>
                          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                            ¿A qué categoría querés mover estos productos? *
                          </label>
                          <select
                            value={reassignTargetCatId}
                            onChange={(e) => setReassignTargetCatId(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary boty-transition"
                          >
                            {otherCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label} ({c.id})
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Los {count} productos pasarán automáticamente a la categoría seleccionada para no perderse.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No quedan otras categorías para reasignar.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(null)}
                      className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs boty-transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingCategory}
                      onClick={handleConfirmDeleteCategory}
                      className="bg-destructive text-destructive-foreground font-semibold px-5 py-2 rounded-xl hover:bg-destructive/90 text-xs boty-transition boty-shadow flex items-center gap-1.5"
                    >
                      {isDeletingCategory && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {count > 0 ? "Mover Productos y Eliminar" : "Eliminar Categoría"}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
