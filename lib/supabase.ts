import { type Product, products as fallbackProducts } from "@/lib/products"
import { type Order, type OrderStatus } from "@/lib/store"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzpohmrcxcspvzacbwlw.supabase.co"
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cG9obXJjeGNzcHZ6YWNid2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MDg4NzUsImV4cCI6MjEwNzA4NDg3NX0.u6bgUJbUyvhaZ1tvZLmzr3rSibaPLwAB0WqP_hQfpag"

function getHeaders(extraHeaders: Record<string, string> = {}) {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    ...extraHeaders,
  }
}

// -------------------------------------------------------------
// PRODUCT MAPPERS
// -------------------------------------------------------------
function mapDbToProduct(row: any): Product {
  const image = row.image || "/placeholder.svg"
  return {
    id: String(row.id || ""),
    name: row.name || "Producto",
    description: row.description || "",
    tagline: row.tagline || "",
    longDescription: row.long_description || "",
    price: Number(row.price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : null,
    image,
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [image],
    video: row.video || undefined,
    imageFit: (row.image_fit as "contain" | "cover") || "contain",
    badge: row.badge || null,
    category: row.category || "almohadon",
    options: Array.isArray(row.options) && row.options.length > 0 ? row.options : ["Único"],
    optionLabel: row.option_label || "Medida",
    details: row.details || "",
    care: row.care || "",
    material: row.material || "",
    delivery: row.delivery || "",
  }
}

function mapProductToDb(p: Partial<Product> & { id: string }) {
  const row: Record<string, any> = {}
  if (p.id !== undefined) row.id = p.id
  if (p.name !== undefined) row.name = p.name
  if (p.description !== undefined) row.description = p.description
  if (p.tagline !== undefined) row.tagline = p.tagline
  if (p.longDescription !== undefined) row.long_description = p.longDescription
  if (p.price !== undefined) row.price = p.price
  if (p.originalPrice !== undefined) row.original_price = p.originalPrice
  if (p.image !== undefined) row.image = p.image
  if (p.images !== undefined) row.images = p.images
  if (p.video !== undefined) row.video = p.video
  if (p.imageFit !== undefined) row.image_fit = p.imageFit
  if (p.badge !== undefined) row.badge = p.badge
  if (p.category !== undefined) row.category = p.category
  if (p.options !== undefined) row.options = p.options
  if (p.optionLabel !== undefined) row.option_label = p.optionLabel
  if (p.details !== undefined) row.details = p.details
  if (p.care !== undefined) row.care = p.care
  if (p.material !== undefined) row.material = p.material
  if (p.delivery !== undefined) row.delivery = p.delivery
  return row
}

// -------------------------------------------------------------
// ORDER MAPPERS
// -------------------------------------------------------------
function mapDbToOrder(row: any): Order {
  const total = Number(row.total) || 0
  const shipping = Number(row.shipping) || 0
  const subtotal = Number(row.subtotal) || (total - shipping > 0 ? total - shipping : total)
  return {
    id: String(row.id || `ORD-${Date.now()}`),
    createdAt: row.created_at || new Date().toISOString(),
    customer: {
      name: row.customer_name || "Cliente",
      email: row.customer_email || "",
      phone: row.customer_phone || "",
      address: row.customer_address || "",
      city: row.customer_city || "",
      notes: row.customer_notes || undefined,
    },
    items: Array.isArray(row.items)
      ? row.items.map((i: any) => ({
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
    status: (row.status as OrderStatus) || "pendiente",
    paymentMethod: row.payment_method || "transferencia",
  }
}

function mapOrderToDb(o: Order) {
  return {
    id: o.id,
    customer_name: o.customer?.name || "",
    customer_email: o.customer?.email || "",
    customer_phone: o.customer?.phone || null,
    customer_address: o.customer?.address || "",
    customer_notes: o.customer?.notes || null,
    items: o.items || [],
    subtotal: o.subtotal || 0,
    shipping: o.shipping || 0,
    total: o.total || 0,
    status: o.status || "pendiente",
    payment_method: (o as any).paymentMethod || "transferencia",
  }
}

// -------------------------------------------------------------
// SUPABASE API METHODS
// -------------------------------------------------------------

export async function fetchProductsFromCloud(): Promise<Product[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.asc`, {
      headers: getHeaders(),
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapDbToProduct)
    }
    return fallbackProducts
  } catch (err) {
    console.warn("Could not load products from Supabase, using local fallback:", err)
    return fallbackProducts
  }
}

export async function saveProductToCloud(product: Product): Promise<boolean> {
  try {
    const dbRow = mapProductToDb(product)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: getHeaders({
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      }),
      body: JSON.stringify(dbRow),
    })
    return res.ok
  } catch (err) {
    console.error("Error saving product to Supabase:", err)
    return false
  }
}

export async function updateProductInCloud(id: string, updates: Partial<Product>): Promise<boolean> {
  try {
    const dbRow = mapProductToDb({ id, ...updates })
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: getHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(dbRow),
    })
    return res.ok
  } catch (err) {
    console.error("Error updating product in Supabase:", err)
    return false
  }
}

export async function deleteProductFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getHeaders(),
    })
    return res.ok
  } catch (err) {
    console.error("Error deleting product from Supabase:", err)
    return false
  }
}

export async function fetchOrdersFromCloud(): Promise<Order[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers: getHeaders(),
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const rows = await res.json()
    if (Array.isArray(rows)) {
      return rows.map(mapDbToOrder)
    }
    return []
  } catch (err) {
    console.warn("Could not load orders from Supabase:", err)
    return []
  }
}

export async function saveOrderToCloud(order: Order): Promise<boolean> {
  try {
    const dbRow = mapOrderToDb(order)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: getHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(dbRow),
    })
    return res.ok
  } catch (err) {
    console.error("Error saving order to Supabase:", err)
    return false
  }
}

export async function updateOrderStatusInCloud(id: string, status: OrderStatus): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: getHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ status }),
    })
    return res.ok
  } catch (err) {
    console.error("Error updating order in Supabase:", err)
    return false
  }
}

// -------------------------------------------------------------
// SUPABASE STORAGE (PHOTOS & VIDEOS)
// -------------------------------------------------------------
export async function uploadMediaToCloud(file: File): Promise<string | null> {
  try {
    const ext = file.name.split(".").pop() || "png"
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/product-media/${safeName}`, {
      method: "POST",
      headers: getHeaders({
        "Content-Type": file.type || "application/octet-stream",
      }),
      body: file,
    })

    if (!res.ok) {
      const errData = await res.json()
      console.error("Supabase Storage Upload failed:", errData)
      return null
    }

    // Permanent public URL
    return `${SUPABASE_URL}/storage/v1/object/public/product-media/${safeName}`
  } catch (err) {
    console.error("Error uploading file to Supabase Storage:", err)
    return null
  }
}
