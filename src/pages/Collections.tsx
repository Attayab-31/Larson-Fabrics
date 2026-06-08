import { useEffect, useState, useMemo } from "react";
import { getProducts } from "@/src/lib/api/products";
import { Product } from "@/src/types";
import { Search, LayoutGrid, List } from "lucide-react";
import {
  Section,
  Heading,
  Button,
  ProductCard,
  GoldParticles,
  Badge,
  ProductCardSkeleton,
} from "@/src/components/ui";
import { ProductInquiryModal } from "@/src/components/features";
import { useLenis } from "@/src/components/animations";

type CategoryFilter = string;

export function Collections() {
  const lenis = useLenis();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [lengthFilter, setLengthFilter] = useState<string>("All");
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);

  // Derive categories dynamically from inventory catalog
  const categoriesList = useMemo(() => {
    const list: string[] = ["All"];
    products.forEach((p) => {
      if (p.category) {
        const trimmed = p.category.trim();
        if (trimmed && !list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
          list.push(trimmed);
        }
      }
    });
    return list;
  }, [products]);

  // Sync category and length options on url queries mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam) {
        setCategory(catParam as CategoryFilter);
      }
      const lenParam = params.get("length");
      if (lenParam) {
        setLengthFilter(lenParam);
      }
    }
  }, []);

  // Proactively sync active filter state back to custom URL queries
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (category && category !== "All") {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      
      if (lengthFilter && lengthFilter !== "All") {
        params.set("length", lengthFilter);
      } else {
        params.delete("length");
      }

      const qString = params.toString();
      const updatedUrl = `${window.location.pathname}${qString ? "?" + qString : ""}`;
      window.history.replaceState(null, "", updatedUrl);
    }
  }, [category, lengthFilter]);

  useEffect(() => {
    async function loadAllProducts() {
      try {
        setLoading(true);
        const data = await getProducts(category === "All" ? undefined : category);
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllProducts();
  }, [category]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = category === "All" || p.category.toLowerCase().trim() === category.toLowerCase().trim();
      
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, category]);

  const handleInquireClicked = (product: Product) => {
    setSelectedProductForInquiry(product);
  };

  const handleCategorySelect = (cat: CategoryFilter) => {
    setCategory(cat);
    // Smooth scroll back to top of filter list
    lenis?.scrollTo(".collections-mount", { offset: -120 });
  };

  return (
    <div className="relative w-full collections-mount">
      {/* Editorial Header */}
      <section
        data-nav-dark
        className="relative bg-neutral-950 text-white px-6 py-24 md:px-12 md:py-32 lg:px-20 overflow-hidden border-b border-gold/15"
      >
        {/* Live background fabric image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1600"
            alt="Exquisite Black Gold Jacquard Weave"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-65 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-neutral-950/85 to-neutral-950" />
        </div>
        <GoldParticles opacity={0.35} />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <Heading level="eyebrow" className="text-gold">Catalog Showcase</Heading>
          <Heading level="h1" className="text-white italic leading-none">
            Exquisite Weaves
          </Heading>
          <p className="font-body text-sm sm:text-base text-white/70 max-w-lg mx-auto">
            Browse our Lahore stock of premium Giza Egyptian cotton, crease-free wash & wear, and structured heavy Karandi suit lengths. Crafted for high-end bespoke menswear.
          </p>
        </div>
      </section>

      {/* Main filterable grid */}
      <Section variant="light">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Sidebar filters (Desktop) */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-neutral-50 border border-navy/10 p-5 rounded-sm">
              <Heading level="eyebrow" className="text-navy mb-4 font-bold">Search Weaves</Heading>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Silk, lawn, twill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 font-body text-xs border border-navy/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white text-navy focus:border-transparent transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-mid/60">
                  <Search className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="bg-neutral-50 border border-navy/10 p-5 rounded-sm space-y-4">
              <Heading level="eyebrow" className="text-navy font-bold">Categories</Heading>
              <div className="flex flex-row flex-wrap lg:flex-col gap-2">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    aria-pressed={category === cat}
                    className={`px-4 py-2 font-body text-xs font-semibold uppercase tracking-[1px] rounded-sm text-left transition-all flex items-center justify-between cursor-pointer ${
                      category === cat
                        ? "bg-navy text-white"
                        : "bg-white text-navy hover:bg-neutral-100 border border-navy/5"
                    }`}
                  >
                    <span>{cat === "All" ? "All Fabrics" : cat}</span>
                    {category === cat && (
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Catalog grid or list results */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between border-b border-navy/15 pb-4">
              <p className="font-body text-xs tracking-wider text-navy-mid uppercase font-semibold">
                Showing {filteredProducts.length} materials
              </p>

               {/* Layout Mode Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLayoutMode("grid")}
                  aria-pressed={layoutMode === "grid"}
                  className={`p-2 rounded-sm transition-all border cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-navy hover:bg-neutral-100 border-navy/10"
                  }`}
                  aria-label="Grid layout"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode("list")}
                  aria-pressed={layoutMode === "list"}
                  className={`p-2 rounded-sm transition-all border cursor-pointer ${
                    layoutMode === "list"
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-navy hover:bg-neutral-100 border-navy/10"
                  }`}
                  aria-label="List layout"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {lengthFilter !== "All" && (
              <div className="bg-navy/5 border border-navy/10 px-4 py-2.5 rounded-sm flex items-center justify-between text-[11px] text-navy">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-dark" />
                  <span>
                    Selected Cut Profile: <strong>{lengthFilter} Meters</strong> ({lengthFilter === "2.5" ? "Polished Kurta Cut" : lengthFilter === "4.5" ? "Generous Tall Cut" : "Standard Full Length"}). This cut will be auto-selected for you on details page.
                  </span>
                </div>
                <button 
                  onClick={() => setLengthFilter("All")}
                  className="uppercase font-bold text-[10px] text-gold-dark hover:text-navy transition-all px-2 py-1 bg-white border border-navy/10 rounded-sm cursor-pointer"
                >
                  Clear Cut Filter
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid gap-8 sm:grid-cols-2">
                <ProductCardSkeleton count={4} />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-neutral-50 rounded-sm border border-navy/5">
                <p className="font-display text-2xl italic text-navy/60">No materials found</p>
                <p className="font-body text-xs text-navy-mid mt-2">Adjust your category selection or filter tags.</p>
                <button
                  onClick={() => {
                    setCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-4 px-4 py-2 bg-navy text-white font-body text-xs uppercase tracking-widest cursor-pointer rounded-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={layoutMode === "grid" ? "grid gap-6 sm:grid-cols-2" : "flex flex-col gap-8"}>
                {filteredProducts.map((p, idx) => (
                  <ProductCard
                    key={`${p._id || p.slug || "product"}-${idx}`}
                    product={p}
                    variant={layoutMode}
                    onInquireClick={handleInquireClicked}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Product Inquiry Popup Dialog */}
      <ProductInquiryModal
        product={selectedProductForInquiry}
        onClose={() => setSelectedProductForInquiry(null)}
      />
    </div>
  );
}
export default Collections;
