"use client"

import { products as baseProducts, type Product, type Category, getCategoryLabel } from "./products"
import {
  fetchProductsFromCloud,
  saveProductToCloud,
  updateProductInCloud,
  deleteProductFromCloud,
  fetchOrdersFromCloud,
  saveOrderToCloud,
  updateOrderStatusInCloud,
  deleteOrderFromCloud,
  uploadMediaToCloud,
  fetchStoreSettingsFromCloud,
  saveStoreSettingsToCloud,
  fetchEmailsFromCloud,
  saveEmailToCloud,
  deleteEmailFromCloud,
} from "./supabase"

export { uploadMediaToCloud }

export interface CategoryItem {
  id: string
  label: string
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "mochilas-y-bolsos", label: "Mochilas y Bolsos" },
  { id: "almohadones", label: "Almohadones" },
]

export interface StoreSettings {
  minPurchaseAmount: number
  customLeadTimeDays: string
  bannerNotice?: string
  categories?: CategoryItem[]
  freeShippingThreshold?: number | null
}

export const DEFAULT_SETTINGS: StoreSettings = {
  minPurchaseAmount: 15000,
  customLeadTimeDays: "4 a 5 días hábiles desde el pago",
  bannerNotice: "Compra mínima: $15.000 · Envíos a todo el país",
  categories: DEFAULT_CATEGORIES,
  freeShippingThreshold: null,
}

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
  paymentMethod?: string
  createdAt: string
}

export interface EmailRecord {
  id: string
  type: "newsletter" | "order"
  to: string
  subject: string
  body: string
  orderId?: string
  sentAt: string
}

const ORDERS_KEY = "acid_blue_orders_v1"
const PRODUCTS_KEY = "acid_blue_custom_products_v2"
const MODIFIED_PRODUCTS_KEY = "acid_blue_modified_products_v2"
const DELETED_PRODUCTS_KEY = "acid_blue_deleted_products_v2"
const EMAILS_KEY = "acid_blue_emails_v1"
const AUTH_KEY = "acid_blue_admin_auth_v1"
const SETTINGS_KEY = "acid_blue_settings_v2"

// Orders start empty for a clean production state
const SAMPLE_ORDERS: Order[] = []

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
  if (!isClient()) return []

  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([]))
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((o: any) => {
      const total = Number(o?.total) || 0
      const shipping = Number(o?.shipping) || 0
      const subtotal = Number(o?.subtotal) || (total - shipping > 0 ? total - shipping : total)
      return {
        ...o,
        id: String(o?.id || `ORD-${Date.now()}`),
        customer: {
          name: o?.customer?.name || "Cliente",
          email: o?.customer?.email || "",
          phone: o?.customer?.phone || "",
          address: o?.customer?.address || "",
          city: o?.customer?.city || "",
          notes: o?.customer?.notes || undefined,
        },
        items: Array.isArray(o?.items)
          ? o.items.map((i: any) => ({
              id: i?.id || "item",
              name: i?.name || "Producto",
              description: i?.description || "",
              price: Number(i?.price) || 0,
              quantity: Number(i?.quantity) || 1,
              image: i?.image || "/placeholder.svg",
            }))
          : [],
        subtotal,
        shipping,
        total,
        status: (o?.status as OrderStatus) || "pendiente",
        createdAt: o?.createdAt || new Date().toISOString(),
      }
    })
  } catch (err) {
    console.error("Error reading orders from localStorage:", err)
    return []
  }
}

export async function saveOrder(newOrderData: {
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  paymentMethod?: string
}): Promise<Order> {
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
    paymentMethod: newOrderData.paymentMethod || "transferencia",
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

  // Persist to Supabase Cloud Database!
  try {
    await saveOrderToCloud(newOrder)
  } catch (err) {
    console.warn("Error saving order to Supabase:", err)
  }

  // Automatically trigger customer order email for non-MercadoPago orders (e.g. transferencia).
  // For Mercado Pago orders, the email is dispatched upon payment approval with the MP operation code.
  if (newOrderData.paymentMethod !== "mercadopago") {
    sendOrderConfirmationEmail(newOrder)
  }

  return newOrder
}

export function updateOrderStatus(orderId: string, status: OrderStatus, paymentMethod?: string): void {
  const orders = getOrders()
  const updated = orders.map((o) =>
    o.id === orderId ? { ...o, status, ...(paymentMethod ? { paymentMethod } : {}) } : o
  )
  if (isClient()) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    notifyStoreChange()
  }
  updateOrderStatusInCloud(orderId, status, paymentMethod).catch((err) =>
    console.warn("Error updating order in Supabase:", err)
  )
}

export function getStoreSettings(): StoreSettings {
  if (!isClient()) return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      minPurchaseAmount:
        typeof parsed.minPurchaseAmount === "number"
          ? parsed.minPurchaseAmount
          : DEFAULT_SETTINGS.minPurchaseAmount,
      freeShippingThreshold:
        typeof parsed.freeShippingThreshold === "number"
          ? parsed.freeShippingThreshold
          : (parsed.freeShippingThreshold === null ? null : DEFAULT_SETTINGS.freeShippingThreshold),
      categories:
        Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : DEFAULT_CATEGORIES,
    }
  } catch (err) {
    console.error("Error reading store settings from localStorage:", err)
    return DEFAULT_SETTINGS
  }
}

export async function saveStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = getStoreSettings()
  const updated: StoreSettings = {
    ...current,
    ...settings,
    minPurchaseAmount:
      settings.minPurchaseAmount !== undefined
        ? Number(settings.minPurchaseAmount)
        : current.minPurchaseAmount,
    freeShippingThreshold:
      settings.freeShippingThreshold !== undefined
        ? (settings.freeShippingThreshold ? Number(settings.freeShippingThreshold) : null)
        : current.freeShippingThreshold,
  }

  if (isClient()) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    notifyStoreChange()
  }

  saveStoreSettingsToCloud(updated).catch((err) =>
    console.warn("Error updating store settings in Supabase:", err)
  )

  return updated
}

export async function syncStoreWithCloud(): Promise<void> {
  if (!isClient()) return
  try {
    const [cloudProducts, cloudOrders, cloudSettings, cloudEmails] = await Promise.all([
      fetchProductsFromCloud(),
      fetchOrdersFromCloud(),
      fetchStoreSettingsFromCloud(),
      fetchEmailsFromCloud(),
    ])
    if (cloudProducts && cloudProducts.length > 0) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(cloudProducts))
    }
    if (Array.isArray(cloudOrders)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(cloudOrders))
    }
    if (cloudSettings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloudSettings))
    }
    if (Array.isArray(cloudEmails)) {
      localStorage.setItem(EMAILS_KEY, JSON.stringify(cloudEmails))
    }
    notifyStoreChange()
  } catch (err) {
    console.warn("Error syncing store with cloud:", err)
  }
}

export function deleteOrder(orderId: string): void {
  const orders = getOrders()
  const updated = orders.filter((o) => o.id !== orderId)
  if (isClient()) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    notifyStoreChange()
  }
  deleteOrderFromCloud(orderId).catch((err) =>
    console.warn("Error deleting order from Supabase:", err)
  )
}

export function resetSampleOrders(): void {
  if (isClient()) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]))
    notifyStoreChange()
  }
}

// -------------------------------------------------------------
// PRODUCTS (Base + Custom Admin Products + Edits & Deletions)
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

function getModifiedProductsMap(): Record<string, Partial<Product>> {
  if (!isClient()) return {}
  try {
    const raw = localStorage.getItem(MODIFIED_PRODUCTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function getDeletedProductIds(): string[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getAllProducts(): Product[] {
  const custom = getCustomProducts()
  const deletedIds = new Set(getDeletedProductIds())
  const modifiedMap = getModifiedProductsMap()

  // Base products filtered and modified
  const effectiveBaseProducts = baseProducts
    .filter((p) => !deletedIds.has(p.id))
    .map((p) => {
      if (modifiedMap[p.id]) {
        return { ...p, ...modifiedMap[p.id] } as Product
      }
      return p
    })

  const seenIds = new Set<string>()
  const result: Product[] = []

  for (const p of custom) {
    if (p && p.id && !deletedIds.has(p.id) && !seenIds.has(p.id)) {
      seenIds.add(p.id)
      result.push(p)
    }
  }

  for (const p of effectiveBaseProducts) {
    if (p && p.id && !seenIds.has(p.id)) {
      seenIds.add(p.id)
      result.push(p)
    }
  }

  return result
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
    images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : [newProduct.image],
  }

    const updated = [productToSave, ...custom]
  if (isClient()) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated))
    notifyStoreChange()
  }
  saveProductToCloud(productToSave).catch((err) =>
    console.warn("Error saving product to Supabase:", err)
  )
  return productToSave
}

export function updateProduct(id: string, updatedFields: Partial<Product>): Product | null {
  if (!isClient()) return null

  // Update in cloud
  updateProductInCloud(id, updatedFields).catch((err) =>
    console.warn("Error updating product in Supabase:", err)
  )

  const custom = getCustomProducts()
  const customIndex = custom.findIndex((p) => p.id === id)

  if (customIndex >= 0) {
    // Update in custom products
    const updatedProduct = { ...custom[customIndex], ...updatedFields }
    if (updatedFields.image && (!updatedProduct.images || updatedProduct.images.length === 0)) {
      updatedProduct.images = [updatedFields.image]
    }
    custom[customIndex] = updatedProduct
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(custom))
    notifyStoreChange()
    return updatedProduct
  }

  // Otherwise, it's a base product
  const baseProduct = baseProducts.find((p) => p.id === id)
  if (baseProduct) {
    const modifiedMap = getModifiedProductsMap()
    modifiedMap[id] = { ...(modifiedMap[id] || {}), ...updatedFields }
    localStorage.setItem(MODIFIED_PRODUCTS_KEY, JSON.stringify(modifiedMap))
    notifyStoreChange()
    return { ...baseProduct, ...modifiedMap[id] } as Product
  }

  return null
}

export function deleteProduct(id: string): boolean {
  if (!isClient()) return false

  // Delete from cloud
  deleteProductFromCloud(id).catch((err) =>
    console.warn("Error deleting product from Supabase:", err)
  )

  // Check if it's a custom product
  const custom = getCustomProducts()
  const updatedCustom = custom.filter((p) => p.id !== id)
  if (updatedCustom.length !== custom.length) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedCustom))
    notifyStoreChange()
    return true
  }

  // It's a base product - add to deleted products list
  const deletedIds = getDeletedProductIds()
  if (!deletedIds.includes(id)) {
    deletedIds.push(id)
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deletedIds))
    notifyStoreChange()
    return true
  }

  return false
}

// -------------------------------------------------------------
// CATEGORIES MANAGEMENT
// -------------------------------------------------------------

export function getStoreCategories(): CategoryItem[] {
  const settings = getStoreSettings()
  const rawList: CategoryItem[] =
    Array.isArray(settings.categories) && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_CATEGORIES

  const seen = new Set<string>()
  const result: CategoryItem[] = []

  for (const item of rawList) {
    if (!item || !item.id) continue
    const normId = item.id.toLowerCase().trim()
    if (!seen.has(normId)) {
      seen.add(normId)
      result.push({
        id: normId,
        label: item.label ? item.label.trim() : getCategoryLabel(normId),
      })
    }
  }

  // Also include any categories that exist on active products in the store
  const allProds = getAllProducts()
  for (const p of allProds) {
    if (p.category) {
      const normId = p.category.toLowerCase().trim()
      if (!seen.has(normId)) {
        seen.add(normId)
        result.push({
          id: normId,
          label: getCategoryLabel(normId),
        })
      }
    }
  }

  return result
}

export function getCategoryLabelFromStore(categoryId: string): string {
  if (!categoryId) return ""
  const norm = categoryId.toLowerCase().trim()
  const categories = getStoreCategories()
  const found = categories.find((c) => c.id === norm)
  if (found) return found.label
  return getCategoryLabel(categoryId)
}

export async function addStoreCategory(category: CategoryItem): Promise<CategoryItem[]> {
  const current = getStoreCategories()
  const normId = category.id
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
  const normLabel = category.label.trim()

  if (!normId || !normLabel) return current

  const filtered = current.filter((c) => c.id !== normId)
  const updated = [...filtered, { id: normId, label: normLabel }]

  await saveStoreSettings({ categories: updated })
  return updated
}

export async function updateStoreCategory(
  oldId: string,
  newCategory: CategoryItem
): Promise<CategoryItem[]> {
  const current = getStoreCategories()
  const oldNorm = oldId.toLowerCase().trim()
  const newNormId = newCategory.id
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
  const newNormLabel = newCategory.label.trim()

  if (!newNormId || !newNormLabel) return current

  // If the category ID/slug changed, update all products using the old ID
  if (oldNorm !== newNormId) {
    const allProds = getAllProducts()
    for (const p of allProds) {
      if (p.category?.toLowerCase()?.trim() === oldNorm) {
        updateProduct(p.id, { category: newNormId })
      }
    }
  }

  const updated = current.map((c) => {
    if (c.id === oldNorm) {
      return { id: newNormId, label: newNormLabel }
    }
    return c
  })

  await saveStoreSettings({ categories: updated })
  return updated
}

export async function deleteStoreCategory(
  id: string,
  reassignToId?: string
): Promise<{ success: boolean; affectedCount: number }> {
  const normId = id.toLowerCase().trim()
  const allProds = getAllProducts()
  const affected = allProds.filter((p) => p.category?.toLowerCase()?.trim() === normId)

  if (reassignToId) {
    const targetNorm = reassignToId.toLowerCase().trim()
    for (const p of affected) {
      updateProduct(p.id, { category: targetNorm })
    }
  }

  const current = getStoreCategories()
  const updated = current.filter((c) => c.id !== normId)

  await saveStoreSettings({ categories: updated })
  return { success: true, affectedCount: affected.length }
}

// -------------------------------------------------------------
// EMAILS & NOTIFICATIONS
// -------------------------------------------------------------

export function getEmails(): EmailRecord[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(EMAILS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function recordEmail(emailData: Omit<EmailRecord, "id" | "sentAt">): EmailRecord {
  const emails = getEmails()
  const newEmail: EmailRecord = {
    ...emailData,
    id: `EML-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    sentAt: new Date().toISOString(),
  }

  const updated = [newEmail, ...emails]
  if (isClient()) {
    try {
      localStorage.setItem(EMAILS_KEY, JSON.stringify(updated))
      notifyStoreChange()
    } catch (err) {
      console.error("Error saving email record:", err)
    }
  }

  // Persist to Supabase Cloud Database!
  saveEmailToCloud(newEmail).catch((err) =>
    console.warn("Error saving email to Supabase:", err)
  )

  // Try optional server route to dispatch real email via SMTP / Resend
  try {
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmail),
    }).catch(() => {})
  } catch {}

  return newEmail
}

export function deleteEmail(emailId: string): void {
  const emails = getEmails()
  const updated = emails.filter((e) => e.id !== emailId)
  if (isClient()) {
    localStorage.setItem(EMAILS_KEY, JSON.stringify(updated))
    notifyStoreChange()
  }
  deleteEmailFromCloud(emailId).catch((err) =>
    console.warn("Error deleting email from Supabase:", err)
  )
}

export function sendNewsletterWelcomeEmail(email: string): EmailRecord {
  return recordEmail({
    type: "newsletter",
    to: email,
    subject: "¡Bienvenido al newsletter de Acid Blue!",
    body: `¡Hola!

Te damos la bienvenida a la comunidad Acid Blue.
Nos alegra sumar tu estilo alternativo a nuestro espacio de arte urbano y estampado de autor desde Córdoba Capital.

Como bienvenida, te dejamos un cupón exclusivo del 10% OFF en tu próxima compra:
Código: ACID10

Explorá nuestra colección de almohadones, posters y tazas en:
https://acidblue.com/shop

¡Que tengas un día ácido!
Equipo Acid Blue`,
  })
}

export function sendOrderConfirmationEmail(order: Order, paymentId?: string): EmailRecord {
  const itemsText = (order.items || [])
    .map((i) => `• ${i.quantity || 1}x ${i.name || "Producto"} (${i.description || ""}) - $${Number(i.price || 0).toLocaleString("es-AR")}`)
    .join("\n")

  const subtotal = Number(order.subtotal) || 0
  const shipping = Number(order.shipping) || 0
  const total = Number(order.total) || 0

  const mpCode =
    paymentId ||
    (order.paymentMethod?.includes("#")
      ? order.paymentMethod.replace(/[^0-9]/g, "")
      : null)

  const paymentSection = mpCode
    ? `DATOS DEL PAGO:
------------------------------------------
• Método: Mercado Pago Oficial
• Código de Operación MP: #${mpCode}
• Estado: Pago Aprobado (En preparación)
------------------------------------------`
    : order.paymentMethod?.toLowerCase().includes("mercado")
    ? `DATOS DEL PAGO:
------------------------------------------
• Método: Mercado Pago Oficial
• Estado: En preparación
------------------------------------------`
    : `DATOS DEL PAGO:
------------------------------------------
• Método: Transferencia Bancaria
• Estado: Pendiente de comprobante
------------------------------------------`

  const settings = getStoreSettings()
  const isFreeShipping =
    typeof settings.freeShippingThreshold === "number" &&
    settings.freeShippingThreshold > 0 &&
    subtotal >= settings.freeShippingThreshold

  const shippingText = isFreeShipping
    ? "Gratis (beneficio aplicado)"
    : "A coordinar con la tienda (a cargo del cliente)"

  return recordEmail({
    type: "order",
    orderId: order.id,
    to: order.customer?.email || "",
    subject: mpCode
      ? `Confirmación de pedido #${order.id} (Operación MP #${mpCode}) · Acid Blue`
      : `Confirmación de pedido #${order.id} · Acid Blue`,
    body: `¡Hola ${order.customer?.name || "Cliente"}!

¡Gracias por tu compra en Acid Blue! Tu pedido #${order.id} ha sido registrado con éxito y ya lo estamos preparando en nuestro taller.

${paymentSection}

DETALLE DEL PEDIDO:
------------------------------------------
${itemsText}
------------------------------------------
Subtotal: $${subtotal.toLocaleString("es-AR")}
Envío: ${shippingText}
Total Productos: $${total.toLocaleString("es-AR")}

DATOS DE ENTREGA:
Destinatario: ${order.customer.name}
Dirección: ${order.customer.address} ${order.customer.city ? `(${order.customer.city})` : ""}
Teléfono: ${order.customer.phone || "No especificado"}

TIEMPOS DE PRODUCCIÓN Y ENVÍO:
• Confección / Producción: 4 a 5 días hábiles a partir de la confirmación del pago.
• Envío: El costo y despacho del envío se coordina directamente con la tienda tras la compra (a cargo del comprador). Te contactaremos a la brevedad para coordinar la entrega o retiro en Córdoba Capital.

Si tenés alguna consulta, respondé a este correo o escribinos por WhatsApp.

¡Gracias por elegir arte auténtico!
Equipo Acid Blue`,
  })
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
