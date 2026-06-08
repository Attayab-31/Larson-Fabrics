import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Heading } from "@/src/components/ui/Heading";
import { Section } from "@/src/components/ui/Section";
import { gsap } from "@/src/lib/gsap";
import { prefersReducedMotion } from "@/src/lib/motion";

interface Milestone {
  year: string;
  title: string;
  description: string;
}

const MILESTONES: Milestone[] = [
  {
    year: "1956",
    title: "The Vision Born",
    description: "Our founder opens the first custom manual hand-dying shop in Azam Market Lahore, catering to local wedding crafters.",
  },
  {
    year: "1982",
    title: "Entering Thread Weft",
    description: "Larson installs motorized weaving machinery, pioneering cotton lawn production that survives rigorous Lahore monsoons.",
  },
  {
    year: "2012",
    title: "Curated Silk Brocades",
    description: "Launch of our premium luxury brand division, crafting bridal satin swatches distributed to luxury boutiques across Karachi and Lahore.",
  },
  {
    year: "2026",
    title: "Interactive Weaving Systems",
    description: "Combining generational handloom practices with 3D product inspection swatches and custom quote pipelines for international designers.",
  },
];

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bar = progressBarRef.current;
      const container = containerRef.current;
      if (!bar || !container || prefersReducedMotion()) return;

      gsap.fromTo(
        bar,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top 70%",
            end: "bottom 80%",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <Section variant="ivory" className="relative">
      <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
        <Heading level="eyebrow" className="text-gold">Heritage Chronicles</Heading>
        <Heading level="h2" className="text-navy mt-2">Historic Landmarks</Heading>
      </div>

      <div ref={containerRef} className="relative mx-auto max-w-4xl">
        {/* Progress Line */}
        <div
          className="absolute top-0 bottom-0 left-4 w-[2px] bg-navy/10 md:left-1/2 md:-ml-[1px]"
          aria-hidden
        >
          <div
            ref={progressBarRef}
            className="h-full w-full bg-gold origin-top"
          />
        </div>

        {/* Milestones list */}
        <div className="space-y-12 md:space-y-16">
          {MILESTONES.map((milestone, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={milestone.year}
                className={`relative flex flex-col md:flex-row items-stretch ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Visual marker dot */}
                <div
                  className="absolute left-4 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-gold md:left-1/2 md:-ml-2 z-10"
                  aria-hidden
                />

                {/* Info block */}
                <div className="w-full pl-12 md:w-1/2 md:pl-0 md:px-8">
                  <div className={`p-6 bg-white border border-navy/5 shadow-sm rounded-sm ${
                    isEven ? "text-left" : "text-left md:text-right"
                  }`}>
                    <span className="font-display text-3xl italic font-bold text-gold-dark">
                      {milestone.year}
                    </span>
                    <h3 className="font-body text-lg font-bold text-navy mt-1">
                      {milestone.title}
                    </h3>
                    <p className="font-body text-sm text-navy-mid mt-2 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Empty column on desktop for balanced alignment */}
                <div className="hidden md:block md:w-1/2" aria-hidden />
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
export default Timeline;
