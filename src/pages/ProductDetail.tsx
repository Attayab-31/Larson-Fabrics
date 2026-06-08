import { useEffect, useState } from "react";
import { getProductBySlug } from "@/src/lib/api/products";
import { Product, Swatch } from "@/src/types";
import {
  Section,
  Heading,
  Button,
  Badge,
} from "@/src/components/ui";
import { ReviewsSection } from "@/src/components/ui/ReviewsSection";
import { FabricViewer360 } from "@/src/components/three";
import { useTransition, usePathnameFallback } from "@/src/components/layout/TransitionProvider";
import { useCart } from "@/src/lib/cart";
import { Plus, Minus, ShoppingBag } from "lucide-react";

const DEFAULT_PRODUCT_IMAGE_URL = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800";

export function ProductDetail() {
  const { pathname, navigate } = useTransition();
  const fallbackPath = usePathnameFallback();
  
  // Extract slug from path. Path might be: /collections/:slug
  const path = pathname || fallbackPath;
  const slug = path.split("/").pop() || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Selector configs
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch | null>(null);
  const [selectedLength, setSelectedLength] = useState<number>(4.0);
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await getProductBySlug(slug);
        setProduct(data || null);
        if (data && data.swatches && data.swatches.length > 0) {
          setSelectedSwatch(data.swatches[0]);
        } else if (data) {
          setSelectedSwatch({ name: "Pure Loom shade", color: "#FDFCFA" });
        }

        // Try to synchronise active length selections directly from URL queries
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const lenParam = params.get("length");
          if (lenParam) {
            const parsedLen = parseFloat(lenParam);
            if (!isNaN(parsedLen) && parsedLen > 0) {
              setSelectedLength(parsedLen);
            }
          }
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <Section variant="light" className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse text-navy">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-xs uppercase tracking-widest">Loading fabric details...</p>
        </div>
      </Section>
    );
  }

  if (!product) {
    return (
      <Section variant="light" className="min-h-screen text-center flex flex-col justify-center items-center">
        <Heading level="h2" className="text-navy italic">Material not found</Heading>
        <p className="font-body text-sm text-navy-mid mt-2 mb-6">The requested fabric code or slug is not in current stock.</p>
        <Button variant="gold" onClick={() => navigate("/collections")}>
          Return to Showroom
        </Button>
      </Section>
    );
  }

  const specRows = [
    { label: "Fabric Material", value: product.material },
    { label: "Thread Density", value: product.specifications?.threadCount || "400 TC" },
    { label: "Loom Width", value: product.specifications?.width || "44 inches" },
    { label: "Weight / Density", value: product.specifications?.weight || "220 gsm" },
    { label: "Yarn Blend", value: product.specifications?.composition || "Hand-spun Blend" },
    { label: "Color Fixation", value: product.specifications?.dyeType || "VAT Dyeing" },
    { label: "Minimum Bolt", value: `${product.minOrder} meters` },
  ];
  const productImages = product.images.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE_URL];
  const activeImage = productImages[activeImageIdx] || productImages[0];

  return (
    <div className="relative w-full text-navy">
      {/* Editorial Title Header */}
      <Section variant="ivory" className="pb-10 pt-16">
        <button
          onClick={() => navigate("/collections")}
          className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-widest text-gold-dark hover:text-navy cursor-pointer mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to collections
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {product.isNew && <Badge variant="gold">NEW ARRIVAL</Badge>}
          <Badge variant="navy">{product.category}</Badge>
        </div>

        <Heading level="h1" className="italic mt-1 leading-none">{product.name}</Heading>
        <p className="font-body text-xs text-navy-mid uppercase tracking-widest mt-2">
          Origin: Lahore Loom Works
        </p>
      </Section>

      {/* Primary configuration columns */}
      <Section variant="light" className="pt-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Column 1: Custom Image slider and 360 controller */}
          <div className="space-y-8">
            <div className="relative rounded-sm overflow-hidden aspect-[4/5] bg-neutral-100 shadow-sm">
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnail loop */}
            {productImages.length > 1 && (
              <div className="flex gap-4">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    aria-label={`View ${product.name} image ${i + 1}`}
                    className={`relative w-20 h-24 rounded-sm overflow-hidden border-2 cursor-pointer ${
                      activeImageIdx === i ? "border-gold" : "border-navy/10"
                    }`}
                  >
                    <img src={img} alt={`View ${product.name} image ${i + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* 360 swatch section */}
            <div className="border-t border-navy/15 pt-8 space-y-4">
              <Heading level="eyebrow" className="text-navy font-bold">360° Material swatch inspect</Heading>
              <p className="font-body text-xs text-navy-mid leading-relaxed leading-snug">
                Rotate our virtual model below to verify drape weights, light sheen reflecting patterns, and thread luster.
              </p>
              
              <FabricViewer360
                fabricImage={activeImage}
                fabricColor={product.swatches?.[0]?.color || "#D4AF37"}
                swatches={product.swatches}
              />
            </div>
          </div>

          {/* Column 2: Specifications details & Contact fields */}
          <div className="space-y-8">
            <div>
              <Heading level="eyebrow" className="text-navy font-bold">Brand Description</Heading>
              <p className="font-body text-sm text-navy-mid leading-relaxed mt-3">
                {product.description}
              </p>
            </div>

            {/* Interactive fabric configurations */}
            <div className="border border-navy/10 bg-white p-5 sm:p-6 rounded-sm space-y-5">
              <div className="flex justify-between items-baseline border-b border-navy/5 pb-3">
                <span className="font-body text-[11px] uppercase tracking-wider text-navy-mid font-bold">Unstitched Price</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-gold-dark">
                  Rs. {product.priceRange.min.toLocaleString()} <span className="text-xs font-medium text-navy-mid font-body">/ meter</span>
                </span>
              </div>

              {/* Swatch Selector (Active) */}
              {product.swatches && product.swatches.length > 0 && (
                <div className="space-y-2">
                  <span className="block font-body text-xs uppercase tracking-wider text-navy font-bold">
                    Select Shade: <span className="text-gold-dark font-semibold capitalize ml-1">{selectedSwatch?.name}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.swatches.map((sw) => (
                      <button
                        key={sw.name}
                        onClick={() => setSelectedSwatch(sw)}
                        aria-label={`Select ${sw.name} shade`}
                        aria-pressed={selectedSwatch?.name === sw.name}
                        className={`relative w-8 h-8 rounded-full border cursor-pointer transition-all ${
                          selectedSwatch?.name === sw.name ? "ring-2 ring-gold scale-110 border-navy" : "border-navy/15 hover:scale-105"
                        }`}
                        style={{ backgroundColor: sw.color }}
                        title={sw.name}
                        type="button"
                      >
                        {selectedSwatch?.name === sw.name && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Length Selector */}
              <div className="space-y-2">
                <span className="block font-body text-xs uppercase tracking-wider text-navy font-bold">
                  Select Suit Cut Length:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Standard (4.0m)", value: 4.0, sub: "Standard Cut" },
                    { label: "Generous (4.5m)", value: 4.5, sub: "Tall Cut" },
                    { label: "Kurta (2.5m)", value: 2.5, sub: "Single Cut" }
                  ].map((lenOpt) => (
                    <button
                      key={lenOpt.value}
                      onClick={() => setSelectedLength(lenOpt.value)}
                      className={`p-2 border rounded-sm text-center cursor-pointer transition-all select-none ${
                        selectedLength === lenOpt.value
                          ? "border-navy bg-navy text-white font-bold"
                          : "border-navy/15 hover:border-navy bg-white text-navy"
                      }`}
                      type="button"
                    >
                      <p className="font-body text-xs">{lenOpt.label}</p>
                      <p className={`font-body text-[8px] tracking-wide mt-0.5 ${selectedLength === lenOpt.value ? "text-gold" : "text-navy-mid"}`}>
                        {lenOpt.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Add button */}
              <div className="flex gap-3 pt-2">
                <div className="flex items-center border border-navy/20 rounded-sm bg-neutral-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-navy-mid hover:text-navy cursor-pointer transition-colors"
                    aria-label="Decrease quantity"
                    type="button"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-body text-sm font-bold text-navy w-8 text-center select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-navy-mid hover:text-navy cursor-pointer transition-colors"
                    aria-label="Increase quantity"
                    type="button"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (selectedSwatch) addToCart(product, selectedSwatch, selectedLength, quantity);
                  }}
                  className="flex-grow py-3 bg-gold hover:bg-gold-dark text-navy font-body text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-sm flex items-center justify-center gap-2"
                  type="button"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Suit Drawer
                </button>
              </div>

              <div className="pt-2 border-t border-navy/5 flex justify-between items-center text-[11px] text-navy-mid">
                <span>Total Fabric Cost:</span>
                <span className="font-mono font-bold text-navy text-sm">
                  Rs. {(selectedLength * product.priceRange.min * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Spec Sheet Table */}
            <div>
              <Heading level="eyebrow" className="text-navy font-bold mb-4 font-bold">Loom Technical Specifications</Heading>
              <div className="border border-navy/10 rounded-sm overflow-hidden select-none">
                {specRows.map((srv, ri) => (
                  <div
                    key={srv.label}
                    className={`flex items-center justify-between px-4 py-3 text-xs ${
                      ri % 2 === 0 ? "bg-neutral-50" : "bg-white"
                    } border-b border-navy/5 last:border-b-0`}
                  >
                    <span className="font-body text-navy-mid uppercase tracking-wider font-semibold">{srv.label}</span>
                    <span className="font-body text-navy font-bold">{srv.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Instant Form block replaced by standard Cart flow description */}
            <div className="bg-neutral-50 border border-navy/10 p-6 rounded-sm text-center space-y-4">
              <Heading level="eyebrow" className="text-gold mb-1 font-bold">Loom Order Process</Heading>
              <h4 className="font-display text-lg italic text-navy">Acquire Unstitched Suit Cuts</h4>
              <p className="font-body text-xs text-navy-mid leading-relaxed">
                Use our interactive configuration controls above to specify your precise unstitched suit length, shade, and yardage. Once added to your <strong>Suit Drawer</strong>, you can quickly review purchase conditions, complete authentication, and track delivery status securely.
              </p>
              <div className="pt-2 border-t border-navy/5 flex items-center justify-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
                <span className="font-body text-[10px] text-navy uppercase tracking-wider font-bold">Heritage Weaves Direct from Bolt</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Product reviews block panel */}
      <Section variant="ivory" className="py-12 border-t border-navy/10">
        <div className="max-w-4xl mx-auto">
          <ReviewsSection product={product} />
        </div>
      </Section>
    </div>
  );
}
export default ProductDetail;
