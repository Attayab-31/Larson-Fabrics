import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { GoldLine } from "@/src/components/ui/GoldLine";
import { gsap } from "@/src/lib/gsap";
import { prefersReducedMotion } from "@/src/lib/motion";
import { BRAND } from "@/src/lib/constants";
import { FOOTER_QUICK_LINKS, SOCIAL_LINKS } from "@/src/lib/navigation";
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from "@/src/components/ui/icons";
import { useTransition } from "./TransitionProvider";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { navigate } = useTransition();
  const year = new Date().getFullYear();

  useGSAP(
    () => {
      const inner = innerRef.current;
      if (!inner) return;

      if (prefersReducedMotion()) {
        gsap.set(inner, { y: 0, opacity: 1 });
        return;
      }

      gsap.fromTo(
        inner,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            once: true,
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      className="bg-[#0A1F5C] text-white overflow-hidden mt-auto border-t border-white/5"
      style={{ clipPath: "inset(0)" }}
    >
      <div ref={innerRef} className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-20 lg:px-20">
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-baseline gap-1 bg-transparent border-none text-left cursor-pointer outline-none"
            >
              <span className="font-display text-3xl italic text-white">Larson</span>
              <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Fabrics
              </span>
            </button>
            <p className="max-w-xs font-body text-sm leading-relaxed text-white/70">
              {BRAND.tagline}. {BRAND.location}.
            </p>
            <div className="flex gap-4 pt-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold hover:text-gold"
                  aria-label={social.label}
                >
                  {social.icon === 'instagram' && <InstagramIcon className="h-5 w-5" />}
                  {social.icon === 'facebook' && <FacebookIcon className="h-5 w-5" />}
                  {social.icon === 'whatsapp' && <WhatsAppIcon className="h-5 w-5" />}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="label-caps mb-6 text-gold font-semibold">Quick Links</p>
            <ul className="space-y-3">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="font-body text-sm text-white/80 transition-colors hover:text-gold bg-transparent border-none text-left cursor-pointer outline-none py-1"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="label-caps mb-6 text-gold font-semibold">Contact</p>
            <address className="space-y-3 font-body text-sm not-italic text-white/80">
              <p>{BRAND.address}</p>
              <p>
                <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="hover:text-gold font-semibold text-white">
                  {BRAND.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${BRAND.email}`} className="hover:text-gold font-semibold text-white break-all">
                  {BRAND.email}
                </a>
              </p>
              <p className="pt-2 text-white/50">{BRAND.hours}</p>
            </address>
          </div>
        </div>

        <GoldLine className="my-10" start="top 95%" />

        <div className="flex flex-col items-center justify-between gap-4 font-body text-xs text-white/50 md:flex-row">
          <p>© {year} Larson Fabrics. All rights reserved.</p>
          <p className="uppercase tracking-widest text-[10px]">Azam Market · Lahore · Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
