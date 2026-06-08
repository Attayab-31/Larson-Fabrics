import type { Product } from "@/src/types";

export const MOCK_PRODUCTS = [
  {
    _id: "pure-premium-boski-6-pound",
    name: "Pure Premium Boski (6-Pound)",
    category: "Cotton",
    description:
      "A dense, lustrous Boski suit fabric with a refined fall, woven for formal unstitched menswear and premium seasonal gifting.",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80&w=1200",
    ],
    material: "Mercerized Boski Cotton",
    isNew: true,
    isFeatured: true,
    minOrder: 4,
    priceRange: {
      min: 2400,
      max: 3200,
    },
    slug: "pure-premium-boski-6-pound",
    createdAt: "2026-01-05T10:00:00.000Z",
    specifications: {
      threadCount: "120s Double-Ply",
      width: "54 Inches",
      weight: "6-Pound Suit Cut",
      composition: "Premium Long-Staple Cotton",
      dyeType: "Reactive Soft Finish",
    },
    swatches: [
      { name: "Authentic Sand Gold", color: "#D8C084" },
      { name: "Pearl Cream", color: "#F5E9CC" },
      { name: "Classic Ivory", color: "#FFF8EA" },
    ],
  },
  {
    _id: "giza-divine-latha",
    name: "Giza Divine Latha",
    category: "Lawn",
    description:
      "Crisp white Giza latha with a polished hand feel, built for breathable summer suits, kurta cuts, and ceremonial white wear.",
    images: [
      "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200",
    ],
    material: "Giza Cotton Latha",
    isNew: false,
    isFeatured: true,
    minOrder: 4,
    priceRange: {
      min: 1300,
      max: 1800,
    },
    slug: "giza-divine-latha",
    createdAt: "2026-01-08T10:00:00.000Z",
    specifications: {
      threadCount: "100s Compact Yarn",
      width: "54 Inches",
      weight: "145 GSM",
      composition: "Egyptian Giza Cotton",
      dyeType: "Vat Dyed Super White",
    },
    swatches: [
      { name: "Super White", color: "#FFFFFF" },
      { name: "Off White", color: "#FDFCFA" },
      { name: "Mist Cream", color: "#F3EEDB" },
    ],
  },
  {
    _id: "prestige-wash-and-wear-ivory",
    name: "Prestige Wash & Wear Ivory",
    category: "Wash & Wear",
    description:
      "A crease-resistant everyday luxury fabric with a smooth surface, subtle sheen, and dependable drape for office and formal wear.",
    images: [
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=1200",
    ],
    material: "Premium Wash & Wear Blend",
    isNew: true,
    isFeatured: true,
    minOrder: 4,
    priceRange: {
      min: 1550,
      max: 2100,
    },
    slug: "prestige-wash-and-wear-ivory",
    createdAt: "2026-01-12T10:00:00.000Z",
    specifications: {
      threadCount: "Fine Twill Weave",
      width: "56 Inches",
      weight: "Medium Fall",
      composition: "Poly Viscose Premium Blend",
      dyeType: "Anti-Fade Soft Dye",
    },
    swatches: [
      { name: "Ivory", color: "#F8F1DE" },
      { name: "Stone Grey", color: "#C8C5BE" },
      { name: "Deep Navy", color: "#0A1F5C" },
    ],
  },
  {
    _id: "royal-karandi-raw-silk",
    name: "Royal Karandi Raw Silk",
    category: "Karandi",
    description:
      "A textured winter Karandi with raw silk character, made for structured unstitched suit lengths and cooler evening wear.",
    images: [
      "https://images.unsplash.com/photo-1597484211029-f07dfdedaa2e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200",
    ],
    material: "Raw Silk Karandi Blend",
    isNew: false,
    isFeatured: false,
    minOrder: 4,
    priceRange: {
      min: 2100,
      max: 2900,
    },
    slug: "royal-karandi-raw-silk",
    createdAt: "2026-01-18T10:00:00.000Z",
    specifications: {
      threadCount: "Textured Slub Yarn",
      width: "54 Inches",
      weight: "Warm Winter Fall",
      composition: "Cotton Raw Silk Blend",
      dyeType: "Piece Dyed",
    },
    swatches: [
      { name: "Walnut Brown", color: "#6D5137" },
      { name: "Charcoal", color: "#35383B" },
      { name: "Desert Olive", color: "#898060" },
    ],
  },
  {
    _id: "imperial-silk-blend",
    name: "Imperial Silk Blend",
    category: "Silk",
    description:
      "A formal silk-blend fabric with a refined sheen, selected for wedding season waistcoats, premium kurtas, and statement suit details.",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=1200",
    ],
    material: "Silk Poly Jacquard Blend",
    isNew: true,
    isFeatured: false,
    minOrder: 2.5,
    priceRange: {
      min: 2800,
      max: 4200,
    },
    slug: "imperial-silk-blend",
    createdAt: "2026-01-22T10:00:00.000Z",
    specifications: {
      threadCount: "Fine Jacquard",
      width: "44 Inches",
      weight: "Formal Medium",
      composition: "Silk Poly Blend",
      dyeType: "Luster Lock Finish",
    },
    swatches: [
      { name: "Antique Gold", color: "#B6924A" },
      { name: "Midnight Black", color: "#101114" },
      { name: "Maroon Wine", color: "#6B1F2A" },
    ],
  },
  {
    _id: "classic-cotton-lawn-soft-blue",
    name: "Classic Cotton Lawn Soft Blue",
    category: "Lawn",
    description:
      "Lightweight cotton lawn with a cool touch and airy structure, ideal for warm-weather unstitched suits and everyday kurta cuts.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1605518128080-dcf04e85a6b3?auto=format&fit=crop&q=80&w=1200",
    ],
    material: "Fine Cotton Lawn",
    isNew: false,
    isFeatured: false,
    minOrder: 4,
    priceRange: {
      min: 1150,
      max: 1600,
    },
    slug: "classic-cotton-lawn-soft-blue",
    createdAt: "2026-01-26T10:00:00.000Z",
    specifications: {
      threadCount: "80s Lawn Yarn",
      width: "54 Inches",
      weight: "Light Summer",
      composition: "Combed Cotton",
      dyeType: "Reactive Dyed",
    },
    swatches: [
      { name: "Soft Blue", color: "#BFD4E8" },
      { name: "Pale Mint", color: "#C7DFC9" },
      { name: "Cloud White", color: "#F8FAFC" },
    ],
  },
] satisfies Product[];
