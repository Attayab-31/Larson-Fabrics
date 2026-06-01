export const BRAND = {
  name: "Larson Fabrics",
  tagline: "Premium Luxury Fabrics",
  location: "Azam Market, Lahore, Pakistan",
  address: "Shop 42, Azam Cloth Market, Lahore, Pakistan",
  phone: "+92 300 1234567",
  email: "hello@larsonfabrics.com",
  hours: "Mon–Sat: 10:00 AM – 8:00 PM · Sun: Closed",
  whatsapp: "https://wa.me/923001234567",
} as const;

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const COLORS = {
  navy: "#082567",
  navyDark: "#0A1F5C",
  navyMid: "#1A3A8F",
  gold: "#D4AF37",
  goldDark: "#8B7536",
  ivory: "#F5F3EE",
  white: "#FFFFFF",
} as const;
