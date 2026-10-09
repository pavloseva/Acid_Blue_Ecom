"use client"

import { products as baseProducts, type Product, type Category } from "./products"

export type OrderStatus = "pendiente" | "en_preparacion" | "enviado" | "entregado" | "cancelado"

export interface OrderCustomer {
  name: string
  email: string
  address: string
  city?: string
  phone?: string
  notes?: string
}

export interface OrderItem {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  createdAt: string
}

const ORDERS_KEY = "acid_blue_orders_v1"
const PRODUCTS_KEY = "acid_blue_custom_products_v1"
const AUTH_KEY = "acid_blue_admin_auth_v1"

// Initial sample orders so the admin view isn't empty upon first opening
const SAMPLE_ORDERS: Order[] = [
  {
    id: "ORD-2026-1042",
    customer: {
      name: "Valentina Gómez",
      email: "valen.gomez@gmail.com",
      address: "Av. Vélez Sársfield 1420, Nueva Córdoba",
      city: "Córdoba Capital",
      phone: "+54 9 351 688-2341",
      notes: "Dejar en conserjería si no respondo el timbre.",
    },
    items: [
      {
        id: "almohadon-azul-electrico",
        name: "Almohadón Azul Eléctrico",
        description: "Retrato ilustrado en tonos cian · 40x40",
        price: 12900,
        quantity: 2,
        image: "/images/acid/cushion-blue-portrait.png",
      },
      {
        id: "taza-acid",
        name: "Taza Acid",
        description: "Mármol líquido en negro · 350ml",
        price: 8900,
        quantity: 1,
        image: "/images/acid/mug-acid.png",
      },
    ],
    subtotal: 34700,
    shipping: 0,
    total: 34700,
    status: "en_preparacion",
    createdAt: "2026-10-07T18:45:00.000Z",
  },
  {
    id: "ORD-2026-1039",
    customer: {
      name: "Mateo Rossi",
      email: "mateo.rossi@outlook.com",
      address: "Belgrano 850, Piso 4 B",
      city: "Córdoba Capital",
      phone: "+54 9 351 455-9012",
    },
    items: [
      {
        id: "poster-sonrisa-acida",
        name: "Poster Sonrisa Ácida",
        description: "Diseño tipográfico experimental · 50x70",
        price: 15400,
        quantity: 1,
        image: "/images/acid/poster-abstract.png",
      },
    ],
    subtotal: 15400,
    shipping: 0,
    total: 15400,
    status: "pendiente",
    createdAt: "2026-10-08T14:20:00.000Z",
  },
]

function isClient(): boolean {
  return typeof window !== "undefined"
}

export function notifyStoreChange() {
  if (isClient()) {
    window.dispatchEvent(new Event("acid_store_updated"))
  }
}

// -------------------------------------------------------------
// ORDERS
// -------------------------------------------------------------

export function getOrders(): Order[] {
  if (!isClient()) return SAMPLE_ORDERS

  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(SAMPLE_ORDERS))
      return SAMPLE_ORDERS
    }
    return JSON.parse(raw) as Order[]
  } catch (err) {
    console.error("Error reading orders from localStorage:", err)
    return SAMPLE_ORDERS
  }
}

export function saveOrder(newOrderData: {
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
}): Order {
  const currentOrders = getOrders()
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const orderId = `ORD-2026-${randomSuffix}`

  const newOrder: Order = {
    id: orderId,
    customer: newOrderData.customer,
    items: newOrderData.items,
    subtotal: newOrderData.subtotal,
    shipping: newOrderData.shipping,
    total: newOrderData.total,
    status: "pendiente",
    createdAt: new Date().toISOString(),
  }

  const updatedOrders = [newOrder, ...currentOrders]

  if (isClient()) {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))
      notifyStoreChange()
    } catch (err) {
      console.error("Error saving order to localStorage:", err)
    }
  }

  return newOrder
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  const orders = getOrders()
  const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o))
  if (isClient()) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    notifyStoreChange()
  }
}

export function deleteOrder(orderId: string): void {
  const orders = getOrders()
  const updated = orders.filter((o) => o.id !== orderId)
  if (isClient()) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    notifyStoreChange()
  }
}

export function resetSampleOrders(): void {
  if (isClient()) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(SAMPLE_ORDERS))
    notifyStoreChange()
  }
}

// -------------------------------------------------------------
// PRODUCTS (Base + Custom Admin Products)
// -------------------------------------------------------------

export function getCustomProducts(): Product[] {
  if (!isClient()) return []

  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Product[]
  } catch (err) {
    console.error("Error reading custom products:", err)
    return []
  }
}

export function getAllProducts(): Product[] {
  const custom = getCustomProducts()
  return [...custom, ...baseProducts]
}

export function getProductById(id: string): Product | undefined {
  const all = getAllProducts()
  return all.find((p) => p.id === id)
}

export function addCustomProduct(newProduct: Omit<Product, "id"> & { id?: string }): Product {
  const custom = getCustomProducts()
  const generatedId =
    newProduct.id ||
    `${newProduct.category || "item"}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

  const productToSave: Product = {
    ...newProduct,
    id: generatedId,
  }

  const updated = [productToSave, ...custom]
  if (isClient()) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated))
    notifyStoreChange()
  }
  return productToSave
}

export function deleteCustomProduct(id: string): boolean {
  const custom = getCustomProducts()
  const updated = custom.filter((p) => p.id !== id)
  if (updated.length !== custom.length) {
    if (isClient()) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated))
      notifyStoreChange()
    }
    return true
  }
  return false
}

// -------------------------------------------------------------
// ADMIN AUTH
// -------------------------------------------------------------

export const DEFAULT_ADMIN = {
  email: "admin@acidblue.com",
  password: "acid2026",
}

export function isAdminAuthenticated(): boolean {
  if (!isClient()) return false
  return localStorage.getItem(AUTH_KEY) === "true"
}

export function adminLogin(userOrEmail: string, pass: string): boolean {
  const normalizedUser = userOrEmail.trim().toLowerCase()
  const isUserValid =
    normalizedUser === DEFAULT_ADMIN.email.toLowerCase() ||
    normalizedUser === "admin" ||
    normalizedUser === "pavloseva"

  if (isUserValid && pass === DEFAULT_ADMIN.password) {
    if (isClient()) {
      localStorage.setItem(AUTH_KEY, "true")
      notifyStoreChange()
    }
    return true
  }
  return false
}

export function adminLogout(): void {
  if (isClient()) {
    localStorage.removeItem(AUTH_KEY)
    notifyStoreChange()
  }
}
