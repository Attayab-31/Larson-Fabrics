import {
  AboutHero,
  AboutIntro,
  Timeline,
  ValuesSection,
  LocationSection,
} from "@/src/components/sections";

export function About() {
  return (
    <div className="relative w-full">
      <AboutHero />
      <AboutIntro />
      <Timeline />
      <ValuesSection />
      <LocationSection />
    </div>
  );
}
export default About;
