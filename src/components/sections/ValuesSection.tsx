import { StaggerReveal } from "@/src/components/animations/StaggerReveal";
import { Heading } from "@/src/components/ui/Heading";
import { Section } from "@/src/components/ui/Section";

interface ValueItem {
  no: string;
  title: string;
  description: string;
}

const VALUES: ValueItem[] = [
  {
    no: "01",
    title: "Authentic Weft Integrity",
    description: "Every fabric passes certified warp/weft checks. We strictly inspect thread counts and warp consistency under magnifying monitors prior to dye dips.",
  },
  {
    no: "02",
    title: "Eco-Grade Color Fastness",
    description: "Our dye houses implement state-of-the-art organic salts to anchor shades, preventing bleeding across multiple harsh detergent washes.",
  },
  {
    no: "03",
    title: "Bespoke Suit Length Dispatch",
    description: "We represent leading loom agreements. Shipments of premium unstitched lengths go out directly from Azam Market hubs, ensuring mill-direct authenticity for modern gentlemen.",
  },
  {
    no: "04",
    title: "Sartorial Customization",
    description: "Custom pre-cut lengths and continuous yardage requests are supported. We accommodate specific meter length cuts directly from our master bolts.",
  },
];

export function ValuesSection() {
  return (
    <Section variant="light" className="relative">
      <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
        <Heading level="eyebrow" className="text-gold">Manufacturing Integrity</Heading>
        <Heading level="h2" className="text-navy mt-2">Our Operating Pillars</Heading>
        <div className="mx-auto mt-4 h-0.5 w-16 bg-gold" />
      </div>

      <StaggerReveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((col) => (
          <div
            key={col.no}
            className="flex flex-col gap-4 p-6 border border-navy/10 rounded-sm bg-neutral-50 hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <span className="font-display text-4xl italic font-bold text-gold/60">
              {col.no}
            </span>
            <h3 className="font-body text-base font-bold text-navy uppercase tracking-wider">
              {col.title}
            </h3>
            <p className="font-body text-xs text-navy-mid leading-relaxed mt-1">
              {col.description}
            </p>
          </div>
        ))}
      </StaggerReveal>
    </Section>
  );
}
export default ValuesSection;
