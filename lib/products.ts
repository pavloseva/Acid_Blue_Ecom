export type Category = "almohadon" | "poster" | "taza"

export interface Product {
  id: string
  name: string
  description: string
  tagline: string
  longDescription: string
  price: number
  originalPrice: number | null
  image: string
  badge: string | null
  category: Category
  options: string[]
  optionLabel: string
  details: string
  care: string
  material: string
  delivery: string
}

const DELIVERY =
  "Envíos a todo el país por correo. Despachamos en 24/48 hs hábiles una vez confirmado el pago. Retiro sin cargo en Córdoba Capital. Cambios dentro de los 7 días si el producto está sin uso."

export const products: Product[] = [
  // Almohadones
  {
    id: "almohadon-azul-electrico",
    name: "Almohadón Azul Eléctrico",
    description: "Retrato ilustrado en tonos cian",
    tagline: "El azul que ilumina tu espacio",
    longDescription:
      "Almohadón con estampa de retrato ilustrado en tonos azul eléctrico y cian. Impresión de alta definición por sublimación que no se despinta ni se agrieta con el uso.",
    price: 12900,
    originalPrice: null,
    image: "/images/acid/cushion-blue-portrait.png",
    badge: "Más vendido",
    category: "almohadon",
    options: ["40x40", "50x50"],
    optionLabel: "Medida",
    details:
      "Funda de poliéster suave con relleno de vellón siliconado incluido. Cierre invisible para lavar la funda cuando quieras. Estampa a doble faz opcional.",
    care: "Lavar la funda a mano o en ciclo delicado con agua fría. No usar lavandina. Secar a la sombra y planchar del reverso a temperatura baja.",
    material: "Funda 100% poliéster peach skin · Relleno de vellón siliconado hipoalergénico.",
    delivery: DELIVERY,
  },
  {
    id: "almohadon-nocturno",
    name: "Almohadón Nocturno",
    description: "Retrato cinematográfico oscuro",
    tagline: "Intensidad en cada detalle",
    longDescription:
      "Estampa de retrato moody con climas oscuros y destellos turquesa. Ideal para sumar carácter a un sillón o una cama con estética alternativa.",
    price: 12900,
    originalPrice: null,
    image: "/images/acid/cushion-dark-portrait.png",
    badge: null,
    category: "almohadon",
    options: ["40x40", "50x50"],
    optionLabel: "Medida",
    details:
      "Funda de poliéster suave con relleno de vellón siliconado incluido. Cierre invisible para lavar la funda cuando quieras. Estampa a doble faz opcional.",
    care: "Lavar la funda a mano o en ciclo delicado con agua fría. No usar lavandina. Secar a la sombra y planchar del reverso a temperatura baja.",
    material: "Funda 100% poliéster peach skin · Relleno de vellón siliconado hipoalergénico.",
    delivery: DELIVERY,
  },
  {
    id: "almohadon-acid-marble",
    name: "Almohadón Acid Marble",
    description: "Diseño líquido cian y magenta",
    tagline: "Puro color ácido",
    longDescription:
      "Diseño abstracto de mármol líquido con swirls en cian, magenta y naranja sobre negro. Un statement de color para cualquier ambiente.",
    price: 11900,
    originalPrice: null,
    image: "/images/acid/cushion-acid-marble.png",
    badge: "Nuevo",
    category: "almohadon",
    options: ["40x40", "50x50"],
    optionLabel: "Medida",
    details:
      "Funda de poliéster suave con relleno de vellón siliconado incluido. Cierre invisible para lavar la funda cuando quieras.",
    care: "Lavar la funda a mano o en ciclo delicado con agua fría. No usar lavandina. Secar a la sombra y planchar del reverso a temperatura baja.",
    material: "Funda 100% poliéster peach skin · Relleno de vellón siliconado hipoalergénico.",
    delivery: DELIVERY,
  },
  {
    id: "almohadon-idol-pastel",
    name: "Almohadón Idol Pastel",
    description: "Retrato idol en tonos pastel",
    tagline: "Tu bias, siempre cerca",
    longDescription:
      "Estampa de retrato estilo idol con paleta pastel de azules y rosas. El regalo perfecto para fans del k-pop y la cultura pop.",
    price: 12900,
    originalPrice: null,
    image: "/images/acid/cushion-kpop-pastel.png",
    badge: null,
    category: "almohadon",
    options: ["40x40", "50x50"],
    optionLabel: "Medida",
    details:
      "Funda de poliéster suave con relleno de vellón siliconado incluido. Cierre invisible para lavar la funda cuando quieras. Estampa a doble faz opcional.",
    care: "Lavar la funda a mano o en ciclo delicado con agua fría. No usar lavandina. Secar a la sombra y planchar del reverso a temperatura baja.",
    material: "Funda 100% poliéster peach skin · Relleno de vellón siliconado hipoalergénico.",
    delivery: DELIVERY,
  },
  {
    id: "almohadon-galaxia",
    name: "Almohadón Galaxia",
    description: "Nebulosa cian y magenta",
    tagline: "Un universo en tu sillón",
    longDescription:
      "Diseño de galaxia con nebulosas en cian y magenta y estrellas dispersas. Perfecto para ambientes con onda espacial.",
    price: 9900,
    originalPrice: 12900,
    image: "/images/acid/cushion-galaxy.png",
    badge: "Oferta",
    category: "almohadon",
    options: ["40x40", "50x50"],
    optionLabel: "Medida",
    details:
      "Funda de poliéster suave con relleno de vellón siliconado incluido. Cierre invisible para lavar la funda cuando quieras.",
    care: "Lavar la funda a mano o en ciclo delicado con agua fría. No usar lavandina. Secar a la sombra y planchar del reverso a temperatura baja.",
    material: "Funda 100% poliéster peach skin · Relleno de vellón siliconado hipoalergénico.",
    delivery: DELIVERY,
  },
  // Posters
  {
    id: "poster-retrato-acid",
    name: "Poster Retrato Acid",
    description: "Ilustración pop en cian",
    tagline: "Arte de pared con actitud",
    longDescription:
      "Poster con retrato ilustrado en estilo pop-art y acentos cian y magenta. Impresión sobre papel ilustración de alto gramaje.",
    price: 7900,
    originalPrice: null,
    image: "/images/acid/poster-portrait.png",
    badge: "Más vendido",
    category: "poster",
    options: ["A3", "A2"],
    optionLabel: "Formato",
    details:
      "Impresión de alta calidad sobre papel ilustración de 250g con acabado mate. Se entrega enrollado y protegido en tubo. Marco no incluido.",
    care: "Manipular con manos limpias. Evitar la exposición directa al sol para conservar los colores.",
    material: "Papel ilustración mate de 250g.",
    delivery: DELIVERY,
  },
  {
    id: "poster-abstracto",
    name: "Poster Abstracto",
    description: "Líquido ácido en negro",
    tagline: "Color que fluye",
    longDescription:
      "Poster con diseño líquido abstracto en cian, magenta y naranja sobre negro. Un golpe de color para tu pared.",
    price: 6900,
    originalPrice: null,
    image: "/images/acid/poster-abstract.png",
    badge: null,
    category: "poster",
    options: ["A3", "A2"],
    optionLabel: "Formato",
    details:
      "Impresión de alta calidad sobre papel ilustración de 250g con acabado mate. Se entrega enrollado y protegido en tubo. Marco no incluido.",
    care: "Manipular con manos limpias. Evitar la exposición directa al sol para conservar los colores.",
    material: "Papel ilustración mate de 250g.",
    delivery: DELIVERY,
  },
  // Tazas
  {
    id: "taza-retrato",
    name: "Taza Retrato",
    description: "Retrato ilustrado en cerámica",
    tagline: "Tu café con estilo",
    longDescription:
      "Taza de cerámica blanca con estampa de retrato ilustrado. Impresión resistente al lavado para acompañarte cada mañana.",
    price: 8900,
    originalPrice: null,
    image: "/images/acid/mug-portrait.png",
    badge: "Nuevo",
    category: "taza",
    options: ["350ml"],
    optionLabel: "Capacidad",
    details:
      "Taza de cerámica de 350ml apta para café, té o mate cocido. Estampa por sublimación de larga duración. Presentada en caja individual.",
    care: "Apta para lavavajillas y microondas. Para mayor durabilidad de la estampa, se recomienda lavado a mano.",
    material: "Cerámica esmaltada de primera calidad.",
    delivery: DELIVERY,
  },
  {
    id: "taza-acid",
    name: "Taza Acid",
    description: "Mármol líquido en negro",
    tagline: "Ácida por dentro y por fuera",
    longDescription:
      "Taza de cerámica negra brillante con estampa de mármol líquido cian y magenta. Un clásico Acid Blue.",
    price: 8900,
    originalPrice: null,
    image: "/images/acid/mug-acid.png",
    badge: null,
    category: "taza",
    options: ["350ml"],
    optionLabel: "Capacidad",
    details:
      "Taza de cerámica de 350ml apta para café, té o mate cocido. Estampa por sublimación de larga duración. Presentada en caja individual.",
    care: "Apta para lavavajillas y microondas. Para mayor durabilidad de la estampa, se recomienda lavado a mano.",
    material: "Cerámica esmaltada de primera calidad.",
    delivery: DELIVERY,
  },
]

export const categoryLabels: Record<Category, string> = {
  almohadon: "Almohadones",
  poster: "Posters",
  taza: "Tazas",
}

export function formatARS(value: number): string {
  return "$" + value.toLocaleString("es-AR")
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}
