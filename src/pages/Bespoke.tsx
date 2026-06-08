import { useState } from "react";
import {
  Section,
  Heading,
  Button,
  GoldParticles,
  Badge,
} from "@/src/components/ui";
import { apiUrl } from "@/src/lib/constants";

interface BespokeFormState {
  customerName: string;
  phone: string;
  suitLengthPref: string;
  fabricTypesOfInterest: string[];
  customRequirementMsg: string;
}

const FABRIC_OPTIONS = [
  "Premium Giza Egyptian Cotton",
  "Fine Crease-Resistant Wash & Wear",
  "Traditional Winter Karandi",
  "Luxurious Silk & Poly Blends",
  "Bespoke Woolen Shawls",
  "Structured Latha"
];

export function Bespoke() {
  const [formData, setFormData] = useState<BespokeFormState>({
    customerName: "",
    phone: "",
    suitLengthPref: "Unstitched Suit Length (4.0m)",
    fabricTypesOfInterest: [],
    customRequirementMsg: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData((prev) => {
      const current = prev.fabricTypesOfInterest;
      const updated = current.includes(option)
        ? current.filter((x) => x !== option)
        : [...current, option];
      return { ...prev, fabricTypesOfInterest: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorCode(null);

    try {
      const response = await fetch(apiUrl("/bespoke"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Unable to save consultation on Larson servers.");
      }

      setSuccess(true);
      setFormData({
        customerName: "",
        phone: "",
        suitLengthPref: "Unstitched Suit Length (4.0m)",
        fabricTypesOfInterest: [],
        customRequirementMsg: "",
      });
    } catch (err: any) {
      console.error(err);
      setErrorCode(err?.message || "Failed to send your request. Please try again or contact us directly on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Heavy Header banner */}
      <section
        data-nav-dark
        className="relative bg-neutral-950 text-white px-6 py-20 md:px-12 md:py-24 lg:px-20 overflow-hidden border-b border-gold/15"
      >
        <div className="absolute inset-0 bg-radial-gradient from-neutral-900 via-neutral-950 to-neutral-950 opacity-95 z-0" />
        <GoldParticles opacity={0.3} />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="gold" size="md">Personal Styling</Badge>
          <Heading level="h1" className="text-white italic leading-none">
            Bespoke Fabric Consulting
          </Heading>
          <p className="font-body text-sm sm:text-base text-white/70 max-w-lg mx-auto">
            Order customized unstitched suit lengths, coordinate premium matching thread coordination, or schedule a fabric selection consultation with our Lahore curators.
          </p>
        </div>
      </section>

      {/* Main interface content */}
      <Section variant="light">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* Column 1: Perks and details (Left 5 grid bounds) */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <Heading level="eyebrow" className="text-gold">Sartorial Perfection</Heading>
              <Heading level="h2" className="text-navy mt-1">Exceptional Unstitched Fabrics</Heading>
              <p className="font-body text-sm text-navy-mid leading-relaxed mt-3">
                Since inception, Larson has supplied discerning gentlemen in Lahore with premium unstitched fabric lengths. Our private consulting suite matches your exact height and shoulder frame to provide optimal unstitched suit lengths.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold-dark font-body font-bold text-xs">
                  1
                </span>
                <div>
                  <h4 className="font-body text-sm font-bold text-navy">Exact Suit Length Allocations</h4>
                  <p className="font-body text-xs text-navy-mid mt-1">Standard suits require 4.0 meters or 4.5 meters. Tell us your requirements or average measurements, and we slice standard bolts to eliminate surplus material waste.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold-dark font-body font-bold text-xs">
                  2
                </span>
                <div>
                  <h4 className="font-body text-sm font-bold text-navy font-semibold">Premium Weave Selection</h4>
                  <p className="font-body text-xs text-navy-mid mt-1">We specialize in premium Giza Egyptian cottons, Giza-Latha blends, winter Karandi weaves, and luxury wash & wear options designed specifically for masculine drape and comfortable fit.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold-dark font-body font-bold text-xs">
                  3
                </span>
                <div>
                  <h4 className="font-body text-sm font-bold text-navy font-semibold">Elegant Gift Packaging</h4>
                  <p className="font-body text-xs text-navy-mid mt-1">Shipped beautifully all across Pakistan. Your premium unstitched suit lengths are neatly pressed, folded, and packaged in signature gold-embossed Larson boxes, perfect for wedding wear or luxury gifts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Interactive Application form (Right 7 grid bounds) */}
          <div className="lg:col-span-7 bg-neutral-50 border border-navy/10 p-6 sm:p-8 rounded-sm shadow-sm">
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-sm p-6 flex items-start gap-4 animate-fade-in text-navy">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="space-y-1">
                  <h4 className="font-body text-sm font-bold text-green-800">Consultation Request Received!</h4>
                  <p className="font-body text-xs text-green-700 leading-relaxed">
                    Our master curator and style consultant will contact you via phone or WhatsApp within 12 business hours to verify suit length specifications, meters required, and unstitched swatch coordination.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-navy">
                <div className="border-b border-navy/10 pb-4">
                  <Heading level="h3" className="text-xl font-bold">Styling & Fabric Consultation</Heading>
                  <p className="font-body text-xs text-navy-mid mt-1">Submit your style preference and our team will get in touch with premium fabric swatches.</p>
                </div>

                {errorCode && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700 font-semibold leading-relaxed">
                    {errorCode}
                  </div>
                )}

                <div>
                  <label className="block font-body text-xs uppercase tracking-wider text-navy-mid mb-2 font-bold">Your Full Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Attayab"
                    className="w-full px-4 py-2.5 font-body text-xs border border-navy/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white text-navy"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs uppercase tracking-wider text-navy-mid mb-2 font-bold">Phone (WhatsApp preferred)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 03001234567"
                    className="w-full px-4 py-2.5 font-body text-xs border border-navy/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white text-navy"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs uppercase tracking-wider text-navy-mid mb-2 font-bold">Suit Length Preference</label>
                  <select
                    name="suitLengthPref"
                    value={formData.suitLengthPref}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 font-body text-xs border border-navy/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white text-navy cursor-pointer"
                  >
                    <option value="Unstitched Suit Length (4.0m)">Standard Unstitched Suit Length (4.0 meters)</option>
                    <option value="Unstitched Suit Length (4.5m)">Generous Unstitched Suit Length (4.5 meters)</option>
                    <option value="Fine Kurta Short Length (2.5m)">Kurta Unstitched Length (2.5 meters)</option>
                    <option value="Custom Yardage (Meters)">Custom Yardage (Specific meters by inquiry)</option>
                    <option value="Full Fabric Bolt">Full Fabric Bolt (Commercial/Master cut pack)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-body text-xs uppercase tracking-wider text-navy-mid mb-2 font-bold">Menswear Fabrics of Interest (Select multiples)</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FABRIC_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 font-body text-xs text-navy cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.fabricTypesOfInterest.includes(opt)}
                          onChange={() => handleCheckboxChange(opt)}
                          className="w-4 h-4 checked:bg-gold cursor-pointer"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs uppercase tracking-wider text-navy-mid mb-2 font-bold">Specific meters or any custom styling details</label>
                  <textarea
                    name="customRequirementMsg"
                    value={formData.customRequirementMsg}
                    onChange={handleInputChange}
                    placeholder="Let us know if you need specific fabric lengths, color shade references, or coordinates matching..."
                    rows={4}
                    className="w-full px-4 py-2.5 font-body text-xs border border-navy/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none bg-white text-navy"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-navy font-body font-bold uppercase tracking-[0.15em] text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer animate-pulse-subtle"
                >
                  {loading ? "Sending custom request..." : "Submit Styling Request"}
                </button>
              </form>
            )}
          </div>

        </div>
      </Section>
    </div>
  );
}
export default Bespoke;
