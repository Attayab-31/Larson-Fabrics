import { apiFetch } from "@/src/lib/api";
import { Product } from "@/src/types";
import { MOCK_PRODUCTS } from "@/src/data/products";

export async function getProducts(
  category?: string,
  limit?: number,
  skip?: number
): Promise<Product[]> {
  try {
    let url = "/products";
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (limit !== undefined) params.append("limit", limit.toString());
    if (skip !== undefined) params.append("skip", skip.toString());
    
    const queryStr = params.toString();
    if (queryStr) url += `?${queryStr}`;

    return await apiFetch<Product[]>(url);
  } catch (error) {
    console.warn("API products fetch failed, falling back to local static store:", error);
    
    let filtered = MOCK_PRODUCTS;
    if (category && category !== "All") {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    const skipNum = skip !== undefined ? skip : 0;
    if (limit !== undefined) {
      filtered = filtered.slice(skipNum, skipNum + limit);
    } else if (skipNum > 0) {
      filtered = filtered.slice(skipNum);
    }
    return filtered;
  }
}

export function getAllCategories(): string[] {
  const list: string[] = ["All"];
  MOCK_PRODUCTS.forEach((p) => {
    if (p.category) {
      const trimmed = p.category.trim();
      if (trimmed && !list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
        list.push(trimmed);
      }
    }
  });
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${slug}`);
  } catch (error) {
    console.warn(`API fetch for slug "${slug}" failed, falling back to local mock:`, error);
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}
