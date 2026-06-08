import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { FabricCard3D } from "@/src/components/ui/FabricCard3D";
import { Badge } from "@/src/components/ui/Badge";
import { Product } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { useTransition } from "@/src/components/layout/TransitionProvider";
import { apiUrl } from "@/src/lib/constants";

export interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: "grid" | "list";
  onInquireClick?: (product: Product) => void;
}

export function ProductCard({
  product,
  className,
  variant = "grid",
  onInquireClick,
}: ProductCardProps) {
  const { navigate } = useTransition();
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800";

  const [ratingInfo, setRatingInfo] = useState<{ count: number; average: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRating() {
      try {
        const id = product._id || product.slug;
        const res = await fetch(apiUrl(`/reviews/${id}`));
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const count = data.length;
            const average = count > 0 
              ? parseFloat((data.reduce((acc: number, r: any) => acc + r.rating, 0) / count).toFixed(1))
              : 5.0; // Standard 5.0 rating for new items
            setRatingInfo({ count, average });
          }
        }
      } catch (err) {
        console.error("Failed to query reviews for ProductCard:", err);
      }
    }
    fetchRating();
    return () => {
      isMounted = false;
    };
  }, [product._id, product.slug]);

  const handleDetailsClick = () => {
    let targetUrl = `/collections/${product.slug}`;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const len = params.get("length");
      if (len) {
        targetUrl += `?length=${len}`;
      }
    }
    navigate(targetUrl);
  };

  if (variant === "list") {
    return (
      <div className={cn("flex flex-col sm:flex-row gap-6 pb-6 border-b border-navy/10 last:border-b-0", className)}>
        {/* Image */}
        <div className="w-full sm:w-40 h-48 flex-shrink-0 relative rounded-sm overflow-hidden bg-navy-dark/10 shadow-sm">
          <FabricCard3D onClick={handleDetailsClick} className="w-full h-full">
            <img
              src={image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="lazy"
              width={160}
              height={192}
            />
          </FabricCard3D>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 gap-3">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.isNew && (
                <Badge variant="gold" size="sm">
                  NEW
                </Badge>
              )}
              <Badge variant="navy" size="sm">
                {product.category}
              </Badge>
            </div>
            <h3 className="font-display text-2xl italic text-navy leading-snug">
              {product.name}
            </h3>
            
            {/* Rating Stars Summary Row */}
            <div className="flex items-center gap-1.5 mt-1 select-none">
              <div className="flex text-gold">
                {[1, 2, 3, 4, 5].map((s) => {
                  const filled = ratingInfo ? s <= Math.round(ratingInfo.average) : s <= 5;
                  return (
                    <Star
                      key={s}
                      className={cn(
                        "w-3.5 h-3.5 fill-current",
                        filled ? "text-gold" : "text-neutral-200"
                      )}
                    />
                  );
                })}
              </div>
              <span className="font-mono text-xs font-bold text-navy">
                {ratingInfo ? ratingInfo.average.toFixed(1) : "5.0"}
              </span>
              <span className="font-body text-[11px] text-navy-mid font-medium">
                ({ratingInfo ? ratingInfo.count : 0} {ratingInfo?.count === 1 ? "review" : "reviews"})
              </span>
            </div>

            <p className="mt-2 font-body text-sm text-navy-mid line-clamp-3">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
            <div>
              <p className="font-body text-sm text-gold-dark font-semibold">
                Rs. {product.priceRange.min.toLocaleString()} / meter
              </p>
              <p className="font-body text-[11px] text-navy-mid uppercase tracking-wider mt-1">
                Min order: {product.minOrder}m
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInquireClick?.(product)}
              >
                Inquire
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleDetailsClick}
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className={cn("group flex flex-col bg-white border border-navy/5 p-4 rounded-sm shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <div className="relative">
        <FabricCard3D onClick={handleDetailsClick} className="w-full aspect-[3/4]">
          <img
            src={image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            width={320}
            height={427}
          />
        </FabricCard3D>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
          {product.isNew && (
            <Badge variant="gold" size="sm">
              NEW
            </Badge>
          )}
          <Badge variant="navy" size="sm">
            {product.category}
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <h3 className="font-display text-xl italic text-navy leading-snug">
            {product.name}
          </h3>
          
          {/* Rating Stars Summary Row */}
          <div className="flex items-center gap-1.5 mt-1.5 select-none">
            <div className="flex text-gold">
              {[1, 2, 3, 4, 5].map((s) => {
                const filled = ratingInfo ? s <= Math.round(ratingInfo.average) : s <= 5;
                return (
                  <Star
                    key={s}
                    className={cn(
                      "w-3 h-3 fill-current",
                      filled ? "text-gold" : "text-neutral-200"
                    )}
                  />
                );
              })}
            </div>
            <span className="font-mono text-xs font-bold text-navy">
              {ratingInfo ? ratingInfo.average.toFixed(1) : "5.0"}
            </span>
            <span className="font-body text-[11px] text-navy-mid font-medium">
              ({ratingInfo ? ratingInfo.count : 0} {ratingInfo?.count === 1 ? "review" : "reviews"})
            </span>
          </div>

          <p className="mt-1.5 font-body text-xs text-navy-mid line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-navy/5">
          <span className="font-body text-sm text-gold-dark font-semibold">
            Rs. {product.priceRange.min.toLocaleString()} / m
          </span>
          <span className="font-body text-[11px] text-navy-mid uppercase tracking-wider">
            Min: {product.minOrder}m
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onInquireClick?.(product)}
          >
            Inquire
          </Button>
          <Button
            variant="gold"
            size="sm"
            className="flex-1"
            onClick={handleDetailsClick}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
export default ProductCard;
