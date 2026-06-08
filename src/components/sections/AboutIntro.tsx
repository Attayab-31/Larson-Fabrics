import { CounterAnim } from "@/src/components/animations/CounterAnim";
import { StaggerReveal } from "@/src/components/animations/StaggerReveal";
import { Heading } from "@/src/components/ui/Heading";
import { Section } from "@/src/components/ui/Section";

interface StatItem {
  end: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

const STATS: StatItem[] = [
  { end: 70, suffix: "+", label: "Years of Family Heritage" },
  { end: 10, prefix: "Rs. ", suffix: "M+", label: "Luxury Suits Handcrafted" },
  { end: 12, suffix: "M+", label: "Meters of Fabric Hand-Cut" },
  { end: 14, suffix: "k+", label: "Premium Gentlemen Styled" },
];

export function AboutIntro() {
  return (
    <Section variant="light" className="relative">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-6 lg:col-span-5">
          <Heading level="eyebrow">Our Origin Story</Heading>
          <Heading level="h2" className="text-navy">
            Bridging Traditional Weft with Lahore's Modern Couture
          </Heading>
          <div className="h-[2px] w-16 bg-gold" />
        </div>

        <div className="lg:col-span-7">
          <p className="font-body text-base leading-relaxed text-navy-mid">
            In 1956, our founder started as a master dyer in Azam Market Lahore, matching complex crimson and cobalt pigmentation by eye. Today, Larson Fabrics spans international looms, weaving silk brocades and luxury cotton yarn that boutiques rely on for wedding couture and formal attire. We blend century-old manual check-prints with computerized tension-spinning to exceed thread-count standards.
          </p>
        </div>
      </div>

      <div className="mt-16 sm:mt-24">
        <StaggerReveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between border-t border-navy/10 pt-8"
            >
              <CounterAnim
                end={stat.end}
                prefix={stat.prefix}
                suffix={stat.suffix}
                label={stat.label}
                valueClassName="text-navy"
                labelClassName="font-medium text-gold-dark text-base"
              />
            </div>
          ))}
        </StaggerReveal>
      </div>
    </Section>
  );
}
export default AboutIntro;
