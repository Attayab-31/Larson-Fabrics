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

type ViteEnv = {
  VITE_API_URL?: string;
};

const configuredApiUrl = (import.meta as ImportMeta & { env?: ViteEnv }).env?.VITE_API_URL?.trim();

export const API_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, "")
  : "/api";

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}
