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
          { label: "Silk & Satin", href: "/collections/silk" },
          { label: "Cotton & Lawn", href: "/collections/cotton" },
          { label: "Velvet & Brocade", href: "/collections/velvet" },
          { label: "Linen & Blend", href: "/collections/linen" },
        ],
      },
      {
        title: "By Use",
        links: [
          { label: "Bridal & Formal", href: "/collections/bridal" },
          { label: "Ready-to-Stitch", href: "/collections/ready" },
          { label: "Home & Décor", href: "/collections/decor" },
          { label: "Wholesale Lots", href: "/collections/wholesale" },
        ],
      },
      {
        title: "Featured",
        links: [
          { label: "New Arrivals", href: "/collections/new" },
          { label: "Best Sellers", href: "/collections/bestsellers" },
          { label: "Limited Edition", href: "/collections/limited" },
          { label: "View All", href: "/collections" },
        ],
      },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_QUICK_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "About Us", href: "/about" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Contact", href: "/contact" },
  { label: "Wholesale Inquiry", href: "/wholesale#inquiry" },
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
    label: "WhatsApp",
    href: "https://wa.me/923001234567",
    icon: "whatsapp" as const,
  },
] as const;
