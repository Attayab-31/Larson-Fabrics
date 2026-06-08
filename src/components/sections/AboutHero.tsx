import { FloatingFabricRoll } from "@/src/components/three/FloatingFabricRoll";
import { SplitText } from "@/src/components/animations/SplitText";
import { Heading } from "@/src/components/ui/Heading";

export function AboutHero() {
  return (
    <section
      data-nav-dark
      className="relative isolate overflow-hidden bg-navy-dark px-6 py-24 text-white md:px-12 md:py-32 lg:px-20"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1C3B88] via-[#0A1F5C] to-[#040E2D] opacity-90" />
      
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-8">
        <div className="space-y-6">
          <Heading level="eyebrow" className="text-gold">
            Generations of Craft
          </Heading>
          
          <SplitText
            text="The Art of Larson"
            mode="words"
            className="font-display text-5xl leading-none italic md:text-6xl lg:text-7xl"
            as="h1"
          />
          
          <p className="font-body text-sm leading-relaxed text-white/70 md:text-base lg:text-lg max-w-lg">
            Tracing our lineage back to pioneering textile developers in Lahore. 
            We do not just dye threads — we craft masterpieces meant to transcend time.
          </p>
        </div>

        <div className="flex h-[280px] w-full items-center justify-center sm:h-[350px]">
          <FloatingFabricRoll />
        </div>
      </div>
    </section>
  );
}
export default AboutHero;
