import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Check } from "lucide-react";

export interface InquiryFormProps {
  productId: string;
  productName: string;
  minOrder: number;
}

export function InquiryForm({
  productId,
  productName,
  minOrder,
}: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    quantity: minOrder,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successMessageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [quantityError, setQuantityError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      const numVal = Number(value);
      setFormData((prev) => ({
        ...prev,
        quantity: value === "" ? "" as any : numVal,
      }));
      
      if (value !== "" && numVal < minOrder) {
        setQuantityError(`Quantity cannot be lower than the minimum required ${minOrder} meters.`);
      } else {
        setQuantityError(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity < minOrder) {
      setQuantityError(`Quantity cannot be lower than the minimum required ${minOrder} meters.`);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productId,
          productName,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit quote inquiry");
      }

      setIsSuccess(true);
      setFormData({
        name: "",
        phone: "",
        quantity: minOrder,
        message: "",
      });

      if (successMessageRef.current) {
        gsap.fromTo(
          successMessageRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.35 }
        );
      }
    } catch (err: any) {
      console.error("Inquiry form submission error:", err);
      setError(err?.message || "Failed to send inquiry. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {isSuccess && (
        <div
          ref={successMessageRef}
          className="mb-6 bg-green-50 border border-green-200 rounded-sm p-4 flex items-start gap-3"
        >
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-sm font-semibold text-green-800">Inquiry Sent Successfully!</p>
            <p className="font-body text-xs text-green-700 mt-1">Our customer experience agent in Azam Market will contact you via phone or WhatsApp shortly.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-sm p-4 flex items-center gap-3">
          <p className="font-body text-xs text-red-700 font-semibold">{error}</p>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-body text-xs uppercase tracking-[0.1em] text-navy-mid mb-2 font-medium">
            Contact Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your full name"
            className="w-full px-4 py-3 font-body text-sm border border-navy/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all bg-white text-navy"
          />
        </div>

        <div>
          <label className="block font-body text-xs uppercase tracking-[0.1em] text-navy-mid mb-2 font-medium">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="e.g. 03001234567"
            className="w-full px-4 py-3 font-body text-sm border border-navy/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all bg-white text-navy"
          />
        </div>

        <div>
          <label className="block font-body text-xs uppercase tracking-[0.1em] text-navy-mid mb-2 font-medium">
            Quantity (Minimum: {minOrder} meters)
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min={minOrder}
            step="0.5"
            required
            className={`w-full px-4 py-3 font-body text-sm border rounded-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all bg-white text-navy ${
              quantityError ? "border-red-500 ring-2 ring-red-500/20" : "border-navy/20"
            }`}
          />
          {quantityError && (
            <p className="mt-1.5 font-body text-[11px] text-red-500 font-semibold">{quantityError}</p>
          )}
        </div>

        <div>
          <label className="block font-body text-xs uppercase tracking-[0.1em] text-navy-mid mb-2 font-medium">
            Custom Requirements
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Type desired suit pack size (e.g. 4.0m or 4.5m), color shade choices, or specific unstitched menswear requirements..."
            rows={4}
            className="w-full px-4 py-3 font-body text-sm border border-navy/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all resize-none bg-white text-navy"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-body font-bold uppercase tracking-[0.15em] text-xs rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Sending..." : "Submit Quote Request"}
        </button>
      </form>
    </div>
  );
}

export default InquiryForm;
