export interface MegaMenuColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface NavItem {
  label: string;
  href: string;
  mega?: MegaMenuColumn[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Collections",
    href: "/collections",
    mega: [
      {
        title: "By Fabric",
        links: [
          { label: "Premium Giza Cotton", href: "/collections?category=Cotton" },
          { label: "Fine Wash & Wear", href: "/collections?category=Wash %20%26%20Wear" },
          { label: "Traditional Karandi", href: "/collections?category=Karandi" },
          { label: "Heritage Pure Boski", href: "/collections?category=Boski" },
          { label: "Cashmere & Winter Wool", href: "/collections?category=Winter%20Wool" },
        ],
      },
      {
        title: "Suit Length Packs",
        links: [
          { label: "Standard Lengths (4.0 Meters)", href: "/collections" },
          { label: "Polished Kurta Cuts (2.5 Meters)", href: "/collections" },
          { label: "Generous Tall Cuts (4.5 Meters)", href: "/collections" },
          { label: "Master Loom Bolts", href: "/bespoke" },
        ],
      },
      {
        title: "Style & Heritage",
        links: [
          { label: "New Season Arrivals", href: "/collections" },
          { label: "Luxury Gift Chests", href: "/bespoke" },
          { label: "Bespoke Consulting", href: "/bespoke" },
        ],
      },
    ],
  },
  { label: "Bespoke Fabrics", href: "/bespoke" },
  { label: "About Our Heritage", href: "/about" },
  { label: "Track Order", href: "/track" },
];

export const FOOTER_QUICK_LINKS = [
  { label: "Menswear Collections", href: "/collections" },
  { label: "Premium Unstitched Fabrics", href: "/collections" },
  { label: "Our 70-Year Heritage", href: "/about" },
  { label: "Track Your Order", href: "/track" },
  { label: "Bespoke Consulting", href: "/bespoke" },
] as const;

export const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: "instagram" as const,
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: "facebook" as const,
  },
  {
    label: "WhatsApp Direct",
    href: "https://wa.me/923001234567",
    icon: "whatsapp" as const,
  },
] as const;
