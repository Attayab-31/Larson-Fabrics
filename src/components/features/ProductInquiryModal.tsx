import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Heading } from "@/src/components/ui/Heading";
import { InquiryForm } from "@/src/components/features/InquiryForm";
import { Product } from "@/src/types";

interface ProductInquiryModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductInquiryModal({ product, onClose }: ProductInquiryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (product) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      const el = dialogRef.current;
      if (el && !el.open) {
        el.showModal();
      }
    } else {
      const el = dialogRef.current;
      if (el && el.open) {
        el.close();
      }
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
    }
  }, [product]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    el.addEventListener("cancel", handleCancel);
    return () => {
      el.removeEventListener("cancel", handleCancel);
    };
  }, [onClose]);

  if (!product) return null;

  return (
    <dialog
      ref={dialogRef}
      className="m-auto rounded-sm w-full max-w-lg p-0 shadow-2xl text-navy overflow-hidden bg-transparent border-0 outline-none backdrop:bg-navy-dark/85 backdrop:backdrop-blur-sm z-[60]"
    >
      <div className="relative bg-white p-6 sm:p-8 max-h-[90vh] overflow-y-auto w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-navy hover:text-gold cursor-pointer transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>

        <Heading level="eyebrow" className="text-gold">Catalog Inquiry</Heading>
        <h3 className="font-display text-2xl italic mt-1 text-navy mb-4">
          Quote: {product.name}
        </h3>
        
        <p className="font-body text-xs text-navy-mid mb-6 leading-relaxed">
          We sell premium unstitched fabrics exclusively. The minimum order length is <strong className="text-navy">{product.minOrder} meters</strong>. Please fill in your personal couture or trade request details below.
        </p>

        <InquiryForm
          productId={product._id}
          productName={product.name}
          minOrder={product.minOrder}
        />
      </div>
    </dialog>
  );
}

export default ProductInquiryModal;
