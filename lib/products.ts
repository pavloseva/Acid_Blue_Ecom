export type Category = string

export interface Product {
  id: string
  name: string
  description: string
  tagline: string
  longDescription: string
  price: number
  originalPrice: number | null
  image: string
  images?: string[]
  video?: string
  imageFit?: "cover" | "contain"
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
  "Producción y confección: 4 a 5 días hábiles una vez confirmado el pago. El envío es a cargo del comprador y se coordina directamente con la tienda (o retiro sin cargo en Córdoba Capital). Cambios dentro de los 7 días si el producto está sin uso."

export const products: Product[] = [
  {
    id: "almohadon-chico",
    name: "Almohadón Chico",
    description: "Almohadón compacto estampado con figuras y personajes",
    tagline: "Diseño compacto ideal para decorar y coleccionar",
    longDescription:
      "Almohadón chico confeccionado en tela suave al tacto con estampa sublimada de alta definición. Relleno con vellón siliconado hipoalergénico. Varios modelos disponibles de anime, gaming y cultura pop.",
    price: 3000,
    originalPrice: null,
    image: "/images/products/almohadon-chico.jpg",
    images: ["/images/products/almohadon-chico.jpg"],
    imageFit: "cover",
    badge: "Popular",
    category: "almohadones",
    options: ["Diseño Surtido", "Personalizado"],
    optionLabel: "Modelo",
    details:
      "Medidas aprox: 20x20 cm según figura. Tela suave y estampa duradera que no destiñe con los lavados.",
    care: "Lavar a mano con agua fría y jabón neutro. Secar a la sombra. No planchar directo sobre la estampa.",
    material: "Microfibra suave sublimada y relleno de vellón siliconado hipoalergénico.",
    delivery: DELIVERY,
  },
  {
    id: "almohadon-grande",
    name: "Almohadón Grande",
    description: "Almohadón grande premium con estampas exclusivas de alta definición",
    tagline: "Máximo tamaño y confort con estampas fotográficas nítidas",
    longDescription:
      "Almohadón grande premium confeccionado en tela suave de alta resistencia con estampa frontal nítida en alta resolución. Relleno super mullido de vellón siliconado indeformable. Diseños disponibles: Jungkook (BTS), Felix (Stray Kids), Ni-ki (Enhypen) o diseño personalizado a pedido.",
    price: 10000,
    originalPrice: null,
    image: "/images/products/almohadon-jungkook-bts.jpg",
    images: [
      "/images/products/almohadon-jungkook-bts.jpg",
      "/images/products/almohadon-felix-straykids.jpg",
      "/images/products/almohadon-niki-enhypen.jpg",
    ],
    imageFit: "cover",
    badge: "Más pedido",
    category: "almohadones",
    options: ["Jungkook (BTS)", "Felix (Stray Kids)", "Ni-ki (Enhypen)", "Personalizado"],
    optionLabel: "Diseño / Idol",
    details:
      "Medidas aprox: 40x40 cm. Estampa frontal fotográfica de alta resolución, dorso suave y relleno mullido de vellón siliconado.",
    care: "Apto para lavarropas en ciclo delicado con agua fría. Secar al aire libre. No usar lavandina.",
    material: "Tela microfibra premium con estampa HD y relleno hipoalergénico indeformable.",
    delivery: DELIVERY,
  },
  {
    id: "totebag",
    name: "Totebag",
    description: "Bolso Tote Bag de diseño con cierre y estampas exclusivas",
    tagline: "Práctica, espaciosa y con cierre para llevar todo seguro",
    longDescription:
      "Bolso Tote Bag de hombro con cierre superior reforzado y manijas anchas. Confeccionada con materiales resistentes y estampas fotográficas nítidas de alta durabilidad. Modelos disponibles: Jungkook (BTS), Agust D / Suga (BTS), RM / Namjoon (Indigo) o diseño personalizado.",
    price: 20000,
    originalPrice: null,
    image: "/images/products/tote-bag-jungkook-leather.jpg",
    images: [
      "/images/products/tote-bag-jungkook-leather.jpg",
      "/images/products/tote-bag-agust-d-suga.jpg",
      "/images/products/tote-bag-rm-namjoon-indigo.jpg",
    ],
    imageFit: "cover",
    badge: "Nuevo",
    category: "mochilas-y-bolsos",
    options: ["Jungkook (BTS)", "Agust D / Suga", "RM (Indigo)", "Personalizada"],
    optionLabel: "Modelo",
    details:
      "Medidas: 40x35 cm aprox. Incluye cierre superior reforzado y manijas reforzadas de 60 cm para llevar al hombro cómodamente.",
    care: "Lavar a mano o en ciclo suave con agua fría. Secar a la sombra. Planchar del revés a temperatura baja.",
    material: "Lona / poliéster premium resistente con cierre cremallera y estampa HD.",
    delivery: DELIVERY,
  },
  {
    id: "bandolera-chica-transparente",
    name: "Bandolera Chica Transparente",
    description: "Bandolera compacta en PVC cristal con estampa BTS",
    tagline: "Ideal para recitales, estadios y salidas urbanas",
    longDescription:
      "Bandolera compacta confeccionada en PVC cristal de alta resistencia con detalles y correa regulable en negro. Cumple con las medidas reglamentarias para el ingreso a estadios y recitales. Incluye estampa exclusiva BTS y cierre reforzado.",
    price: 25000,
    originalPrice: null,
    image: "/images/products/bandolera-chica-1.jpg",
    images: [
      "/images/products/bandolera-chica-1.jpg",
      "/images/products/bandolera-chica-2.jpg",
    ],
    imageFit: "contain",
    badge: "Más pedido",
    category: "mochilas-y-bolsos",
    options: ["Chica (18x14x6 cm)"],
    optionLabel: "Tamaño",
    details:
      "Material PVC cristal transparente impermeable de 500 micrones. Correa de cinta hilada reforzada y regulable hasta 120 cm. Cierre frontal y compartimento principal con deslizadores metálicos.",
    care: "Limpiar con paño húmedo y jabón neutro. No exponer al sol directo prolongado. No doblar con peso encima.",
    material: "PVC cristal premium impermeable y herrajes metálicos niquelados.",
    delivery: DELIVERY,
  },
  {
    id: "bandolera-grande-transparente",
    name: "Bandolera Grande Transparente",
    description: "Bandolera espaciosa en PVC cristal con estampa BTS",
    tagline: "Máxima capacidad sin perder el estilo transparente",
    longDescription:
      "Bandolera espaciosa de PVC cristal diseñada para llevar todo lo necesario a conciertos, eventos y el día a día. Estampa BTS frontal, vivos negros reforzados y correa ancha ajustable para mayor comodidad.",
    price: 25000,
    originalPrice: null,
    image: "/images/products/bandolera-grande-1.jpg",
    images: [
      "/images/products/bandolera-grande-1.jpg",
      "/images/products/bandolera-grande-2.jpg",
    ],
    imageFit: "contain",
    badge: "Nuevo",
    category: "mochilas-y-bolsos",
    options: ["Grande (24x18x8 cm)"],
    optionLabel: "Tamaño",
    details:
      "PVC cristal grueso de alta durabilidad. Correa cruzada regulable y desmontable con mosquetones metálicos. Bolsillo frontal organizador con cierre.",
    care: "Limpieza sencilla con paño suave o toalla húmeda. No utilizar alcohol directo sobre la estampa.",
    material: "PVC cristal de alta densidad y poliéster reforzado.",
    delivery: DELIVERY,
  },
  {
    id: "mochila-negra-transparente",
    name: "Mochila Negra Transparente",
    description: "Mochila urbana de PVC cristal con ribetes negros",
    tagline: "Estética alternativa y funcional para recitales",
    longDescription:
      "Mochila transparente con detalles, manija y correas en negro intenso. Diseño de domo curvo apto para seguridad en eventos masivos y festivales. Perfecta para lucir pins, llaveros e ita-bag accessories.",
    price: 25000,
    originalPrice: null,
    image: "/images/products/mochila-negra-1.jpg",
    images: [
      "/images/products/mochila-negra-1.jpg",
      "/images/products/mochila-negra-2.jpg",
    ],
    imageFit: "contain",
    badge: "Destacado",
    category: "mochilas-y-bolsos",
    options: ["Estándar (28x22x10 cm)"],
    optionLabel: "Tamaño",
    details:
      "Cuerpo íntegramente de PVC cristal transparente con vivos reforzados. Correas ajustables para hombros y anillas metálicas frontales y superiores.",
    care: "Limpiar con paño húmedo. Guardar a temperatura ambiente protegida de roces cortantes.",
    material: "PVC cristal resistente al agua y cinta reforzada de alta resistencia.",
    delivery: DELIVERY,
  },
  {
    id: "mochila-roja-chica-transparente",
    name: "Mochila Roja Chica Transparente",
    description: "Mochila compacta transparente con vivos en rojo fuego",
    tagline: "El contraste justo de color y transparencia",
    longDescription:
      "Mochila compacta en PVC cristal con llamativos ribetes en color rojo. Tamaño ideal para recitales y festivales, liviana, resistente y con cierre de apertura completa.",
    price: 25000,
    originalPrice: null,
    image: "/images/products/mochila-roja-chica-1.jpg",
    images: [
      "/images/products/mochila-roja-chica-1.jpg",
      "/images/products/mochila-roja-chica-2.jpg",
    ],
    imageFit: "contain",
    badge: "Edición Limitada",
    category: "mochilas-y-bolsos",
    options: ["Chica (22x18x8 cm)"],
    optionLabel: "Tamaño",
    details:
      "Bordes con ribete vinílico rojo reforzado. Cierre perimetral con deslizador metálico y correas regulables de polipropileno negro.",
    care: "Limpiar con agua tibia y paño suave. No lavar en lavarropas.",
    material: "PVC cristal 500 micrones y ribetes vinílicos color rojo.",
    delivery: DELIVERY,
  },
  {
    id: "mochila-roja-negra-transparente",
    name: "Mochila Roja y Negra Transparente",
    description: "Mochila bicolor en PVC cristal con detalles en rojo y negro",
    tagline: "Diseño bicolor audaz con estructura reforzada",
    longDescription:
      "Mochila transparente con combinación bicolor: ribetes rojos frontales y laterales/correas en negro. Estructura firme con herrajes niquelados y agarre superior reforzado.",
    price: 25000,
    originalPrice: null,
    image: "/images/products/mochila-roja-negra-1.jpg",
    images: [
      "/images/products/mochila-roja-negra-1.jpg",
      "/images/products/mochila-roja-negra-2.jpg",
    ],
    imageFit: "contain",
    badge: "Popular",
    category: "mochilas-y-bolsos",
    options: ["Mediana (26x20x10 cm)"],
    optionLabel: "Tamaño",
    details:
      "Diseño híbrido con vivos rojos en el frente y refuerzos en tela cordura/cinta negra en base y laterales. Doble anilla frontal para colgar accesorios.",
    care: "Limpieza superficial con paño húmedo. Secar a la sombra.",
    material: "PVC cristal transparente, ribetes vinílicos rojos y refuerzos en poliéster negro.",
    delivery: DELIVERY,
  },
]

export const categoryLabels: Record<string, string> = {
  "mochilas-y-bolsos": "Mochilas y Bolsos",
  almohadones: "Almohadones",
  almohadon: "Almohadones",
  poster: "Posters",
  taza: "Tazas",
  bolso: "Bolsos",
  remera: "Remeras",
  accesorio: "Accesorios",
  cuadro: "Cuadros",
}

export function getCategoryLabel(category: string): string {
  if (!category) return ""
  const normalized = category.toLowerCase().trim()
  if (categoryLabels[normalized]) {
    return categoryLabels[normalized]
  }
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function formatARS(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "$0"
  }
  return "$" + Number(value).toLocaleString("es-AR")
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}
