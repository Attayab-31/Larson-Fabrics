import { Heading } from "@/src/components/ui/Heading";
import { Section } from "@/src/components/ui/Section";
import { BRAND } from "@/src/lib/constants";
import { WhatsAppIcon } from "@/src/components/ui/icons";

export function LocationSection() {
  return (
    <Section variant="ivory" className="relative">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        {/* Info Detail */}
        <div className="space-y-6">
          <Heading level="eyebrow" className="text-gold">Lahore Headquarters</Heading>
          <Heading level="h2" className="text-navy">
            Visit Us in the Heart of Azam Market
          </Heading>
          <p className="font-body text-base leading-relaxed text-navy-mid">
            Located in the legendary Azam Cloth Market, Lahore—the center of South Asian textile distribution. 
            We invite premium gentlemen, fabric enthusiasts, and discerning designers to inspect our fabric drapes, verify unstitched suit lengths under studio lighting, and secure custom cut lengths.
          </p>

          <div className="space-y-4 pt-4 border-t border-navy/10">
            <div>
              <p className="font-body text-xs uppercase tracking-widest text-gold-dark font-bold">Showroom Address</p>
              <p className="font-body text-sm text-navy mt-1">{BRAND.address}</p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-widest text-gold-dark font-bold">Studio Working Hours</p>
              <p className="font-body text-sm text-navy mt-1">{BRAND.hours}</p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-widest text-gold-dark font-bold">Contact Hotline</p>
              <p className="font-body text-sm font-semibold text-navy mt-1">
                <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="hover:text-gold-dark">
                  {BRAND.phone}
                </a>
              </p>
            </div>
          </div>

          <div className="pt-4">
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 bg-[#25D366] px-6 font-body text-xs font-bold uppercase tracking-wider text-white hover:bg-[#20ba5a] transition-colors rounded-sm cursor-pointer shadow-sm"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Visual Map Mockup / Photo Frame */}
        <div className="relative rounded-sm overflow-hidden bg-navy-dark shadow-xl aspect-video sm:aspect-[4/3] group cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=1200"
            alt="Lahore Azam Market textile bazaar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/40 to-transparent flex flex-col justify-end p-8">
            <p className="font-display text-2xl italic text-white">Azam Market Lahore</p>
            <p className="font-body text-xs text-gold uppercase tracking-[1.5px] mt-1 font-semibold">Pakistan's Commercial Fabrics Center</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
export default LocationSection;
