import { useState, useEffect, lazy, Suspense } from "react";
import { getProducts } from "@/src/lib/api/products";
import { Product } from "@/src/types";
const RealisticClothHero = lazy(() => import("@/src/components/three/RealisticClothHero"));
import {
  Section,
  Heading,
  Button,
  ProductCard,
  GoldParticles,
  GoldLine,
  ScrollReveal,
  ProductCardSkeleton,
} from "@/src/components/ui";
import { ProductInquiryModal } from "@/src/components/features";
import { StaggerReveal } from "@/src/components/animations";
import { useTransition } from "@/src/components/layout/TransitionProvider";
import { BRAND } from "@/src/lib/constants";

export function Home() {
  const { navigate } = useTransition();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProducts(undefined, 3);
        setFeaturedProducts(data.filter(p => p.isFeatured).slice(0, 3));
      } catch (err) {
        console.error("Error loading products for homepage:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleInquireClicked = (product: Product) => {
    setSelectedProductForInquiry(product);
  };

  return (
    <div className="relative w-full">
      {/* 3D Realistic Cloth Hero */}
      <Suspense fallback={<div className="h-screen min-h-[600px] w-full bg-[#0A1F5C] flex items-center justify-center text-white/50 font-body text-xs tracking-widest uppercase">Larson Heritage...</div>}>
        <RealisticClothHero />
      </Suspense>

      {/* Decorative Gold Dividers */}
      <GoldLine fullWidth start="top 90%" />

      {/* Intro section */}
      <Section variant="light" className="relative">
        <GoldParticles opacity={0.3} />
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <ScrollReveal direction="up" className="space-y-6">
            <Heading level="eyebrow" className="text-gold">
              Generational Legacy
            </Heading>
            <Heading level="h2" className="text-navy">
              Woven for Exquisite Minds, Built on Decades of Perfect Weft
            </Heading>
            <div className="h-0.5 w-16 bg-gold" />
            <p className="font-body text-base text-navy-mid leading-relaxed">
              For over 70 years, Larson Fabrics has stood in Azam Market Lahore as the gold-standard source for luxury textiles. Starting as hands-on dye designers, our pedigree matches unmatched cotton lawn weaves with bespoke bridal silks used by prominent Pakistani houses.
            </p>
            <div className="pt-2">
              <Button variant="outline" onClick={() => navigate("/about")}>
                Our Journey
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" className="relative rounded-sm overflow-hidden aspect-square bg-[#0A1F5C]/10 max-w-md mx-auto">
            <img
              src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800"
              alt="Silk fabric fold"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-sm shadow-md transition-transform duration-500 hover:scale-105"
            />
          </ScrollReveal>
        </div>
      </Section>

      {/* Collections Preview / Bento Grid */}
      <Section variant="ivory">
        <div className="mb-12 sm:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Heading level="eyebrow">Luxury Materials</Heading>
            <Heading level="h2" className="text-navy mt-1">Our Elite Collections</Heading>
          </div>
          <Button variant="gold" onClick={() => navigate("/collections")}>
            View All Fabrics
          </Button>
        </div>

        <StaggerReveal className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Silk */}
          <button
            type="button"
            onClick={() => navigate("/collections?category=Silk")}
            className="group relative h-96 rounded-sm overflow-hidden bg-navy-dark cursor-pointer shadow-md text-left w-full block focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="View Bridal Silks collection"
          >
            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"
              alt="Bridal Silk swatches"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-2">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Category</span>
              <h3 className="font-display text-2xl italic">Bridal Silks</h3>
              <p className="font-body text-xs text-white/70 line-clamp-2">Exquisite dupioni, satin folds, and zari linings for bridal luxury.</p>
            </div>
          </button>

          {/* Card 2: Lawn */}
          <button
            type="button"
            onClick={() => navigate("/collections?category=Lawn")}
            className="group relative h-96 rounded-sm overflow-hidden bg-navy-dark cursor-pointer shadow-md text-left w-full block focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="View Cotton Lawn collection"
          >
            <img
              src="https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=800"
              alt="Cotton lawn material"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-2">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Category</span>
              <h3 className="font-display text-2xl italic">Cotton Lawn</h3>
              <p className="font-body text-xs text-white/70 line-clamp-2">High-density Egyptian yarn woven for ultimate breathability and skin comfort.</p>
            </div>
          </button>

          {/* Card 3: Karandi */}
          <button
            type="button"
            onClick={() => navigate("/collections?category=Karandi")}
            className="group relative h-96 rounded-sm overflow-hidden bg-navy-dark cursor-pointer shadow-md text-left w-full block focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="View Luxury Karandi collection"
          >
            <img
              src="https://images.unsplash.com/photo-1597484211029-f07dfdedaa2e?auto=format&fit=crop&q=80&w=800"
              alt="Bespoke Karandi fabric"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-2">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Category</span>
              <h3 className="font-display text-2xl italic">Luxury Karandi</h3>
              <p className="font-body text-xs text-white/70 line-clamp-2">Raw silk blended with coarse cotton, producing textured warmth for formal events.</p>
            </div>
          </button>
        </StaggerReveal>
      </Section>

      {/* Featured Products Showcase */}
      <Section variant="light" className="relative">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <Heading level="eyebrow" className="text-gold">Sought After Swatches</Heading>
          <Heading level="h2" className="text-navy mt-1">Featured Fabrics</Heading>
          <p className="font-body text-sm text-navy-mid mt-3">Timeless wefts and classic weaves curated for premium unstitched menswear suits, handpicked for modern gentlemen and festive celebrations.</p>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <ProductCardSkeleton count={3} />
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((prod, idx) => (
              <ProductCard
                key={`${prod._id || prod.slug || "featured"}-${idx}`}
                product={prod}
                onInquireClick={handleInquireClicked}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Quote Dialog Overlay (If inquiry is clicked) */}
      <ProductInquiryModal
        product={selectedProductForInquiry}
        onClose={() => setSelectedProductForInquiry(null)}
      />

      {/* Premium Styling Call to Action Banner */}
      <Section variant="dark" className="relative text-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0A1F5C]/80 mix-blend-multiply z-0" />
        <GoldParticles opacity={0.25} />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <Heading level="eyebrow" className="text-gold">Sartorial Menswear Styling</Heading>
          <Heading level="h1" className="text-white italic">
            Acquire Premium Unstitched Fabrics
          </Heading>
          <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed max-w-xl mx-auto">
            Experience our personal style advisory. We coordinate handpicked unstitched suit lengths (4.0m / 4.5m) or specific custom pre-cut volumes directly from our master bolts.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="gold" size="lg" onClick={() => navigate("/bespoke")}>
              Inquire Custom Lengths
            </Button>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs uppercase tracking-widest text-white hover:text-gold flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-[#25D366] fill-currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.557-5.338 11.897-12.001 11.897-2.006-.002-3.973-.517-5.699-1.488L0 24zm6.096-3.32c1.613.957 3.209 1.43 4.908 1.43a9.88 9.88 0 009.878-9.88c.002-2.64-1.026-5.123-2.892-6.99a9.851 9.851 0 00-6.983-2.899 9.88 9.88 0 00-9.877 9.883c-.001 1.733.46 3.42 1.332 4.937s.24 3.754-.236 5.513l5.87-1.484z" />
              </svg>
              Chat Instant Messenger
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
export default Home;
