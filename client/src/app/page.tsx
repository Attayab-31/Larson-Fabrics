import { Button } from "@/components/ui";
import { BRAND } from "@/lib/constants";

export default function Home() {
  return (
    <>
      {/* Dark hero so transparent navbar (white type) reads clearly */}
      <section
        data-nav-dark
        className="flex min-h-[70vh] flex-col items-center justify-center bg-navy-dark px-6 pt-20 text-center"
      >
        <p className="label-caps mb-4 text-sm text-gold">{BRAND.location}</p>
        <h1 className="font-display text-5xl italic text-white md:text-7xl">
          {BRAND.name}
        </h1>
        <p className="mt-4 max-w-md font-body text-lg text-white/80">
          {BRAND.tagline}
        </p>
        <Button variant="gold" size="lg" className="mt-10">
          Explore Collection
        </Button>
      </section>

      <section className="flex flex-col items-center justify-center bg-ivory px-6 py-24 text-center">
        <p className="font-body text-navy-mid">
          Premium fabrics for discerning designers and wholesalers.
        </p>
      </section>
    </>
  );
}
