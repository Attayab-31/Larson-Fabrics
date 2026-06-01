"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, initGsap } from "@/lib/gsap";
import { BRAND } from "@/lib/constants";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

initGsap();

const NAV_HEIGHT_EXPANDED = 80;
const NAV_HEIGHT_SHRUNK = 60;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function NavLink({
  href,
  label,
  active,
  lightText,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  lightText: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative font-body text-sm uppercase tracking-[1px] transition-colors duration-300",
        lightText
          ? "text-white hover:text-gold"
          : "text-navy hover:text-gold-dark",
        active && (lightText ? "text-gold" : "text-gold-dark")
      )}
    >
      {label}
      <span
        className={cn(
          "absolute -bottom-1 left-0 h-px w-full origin-left bg-gold transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )}
        aria-hidden
      />
    </Link>
  );
}

/** True when a dark hero/section still sits behind the fixed nav bar */
function isNavOverDarkBackground(navHeight: number): boolean {
  const darkZone = document.querySelector("[data-nav-dark]");
  if (!darkZone) return false;
  const { bottom } = darkZone.getBoundingClientRect();
  return bottom > navHeight + 4;
}

export function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerLinksRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaItem, setMegaItem] = useState<string | null>(null);
  const scrolledRef = useRef(false);

  /** White type on navy bar or dark hero; navy type on ivory/light sections */
  const lightText = scrolled || overDark;

  const updateNavState = useCallback(() => {
    const header = headerRef.current;
    if (!header) return;

    const navHeight = header.offsetHeight;
    const isScrolled = window.scrollY > 24;
    const onDark = isNavOverDarkBackground(navHeight);

    setOverDark(onDark);

    if (isScrolled !== scrolledRef.current) {
      scrolledRef.current = isScrolled;
      setScrolled(isScrolled);
      gsap.to(header, {
        height: isScrolled ? NAV_HEIGHT_SHRUNK : NAV_HEIGHT_EXPANDED,
        duration: 0.45,
        ease: "power2.out",
      });
    }
  }, []);

  useEffect(() => {
    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", updateNavState);
    return () => {
      window.removeEventListener("scroll", updateNavState);
      window.removeEventListener("resize", updateNavState);
    };
  }, [updateNavState, pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useGSAP(
    () => {
      const drawer = drawerRef.current;
      const links = drawerLinksRef.current?.querySelectorAll("[data-drawer-link]");
      if (!drawer || !links?.length) return;

      if (mobileOpen) {
        gsap.set(drawer, { display: "flex" });
        gsap.fromTo(
          drawer,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "power2.out" }
        );
        gsap.fromTo(
          links,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.07,
            ease: "power3.out",
            delay: 0.1,
          }
        );
      } else {
        gsap.to(drawer, {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => gsap.set(drawer, { display: "none" }),
        });
      }
    },
    { dependencies: [mobileOpen] }
  );

  const isLinkActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const activeMega = NAV_ITEMS.find((item) => item.label === megaItem);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 right-0 left-0 z-50 transition-colors duration-500",
          scrolled
            ? "bg-navy/95 shadow-lg backdrop-blur-sm"
            : lightText
              ? "bg-transparent"
              : "border-b border-navy/5 bg-ivory/90 backdrop-blur-sm"
        )}
        style={{ height: NAV_HEIGHT_EXPANDED }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-12 lg:px-20">
          <Link
            href="/"
            className={cn(
              "group flex shrink-0 items-baseline gap-1 transition-colors duration-300",
              lightText ? "text-white" : "text-navy"
            )}
          >
            <span className="font-display text-2xl italic leading-none md:text-3xl">
              Larson
            </span>
            <span className="font-body text-sm font-light uppercase tracking-[0.2em] md:text-base">
              Fabrics
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            <ul className="flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.href}
                  className="group relative"
                  onMouseEnter={() => {
                    if (item.mega) {
                      setMegaItem(item.label);
                      setMegaOpen(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.mega) {
                      setMegaOpen(false);
                      setMegaItem(null);
                    }
                  }}
                >
                  <NavLink
                    href={item.href}
                    label={item.label}
                    active={isLinkActive(item.href)}
                    lightText={lightText}
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/wholesale#inquiry"
              className="inline-flex h-9 items-center justify-center bg-gold px-4 font-body text-xs font-medium uppercase tracking-widest text-navy transition-colors hover:bg-gold-dark hover:text-white"
            >
              Wholesale Inquiry
            </Link>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:text-gold",
                lightText ? "text-white" : "text-navy"
              )}
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </div>

          <button
            type="button"
            className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={cn(
                "block h-px w-6 transition-all duration-300",
                lightText ? "bg-white" : "bg-navy",
                mobileOpen && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-px w-6 transition-all duration-300",
                lightText ? "bg-white" : "bg-navy",
                mobileOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-px w-6 transition-all duration-300",
                lightText ? "bg-white" : "bg-navy",
                mobileOpen && "-translate-y-[7px] -rotate-45"
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            "absolute top-full right-0 left-0 hidden border-t border-white/10 bg-ivory shadow-2xl transition-all duration-300 lg:block",
            megaOpen && activeMega?.mega
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          )}
          onMouseEnter={() => megaItem && setMegaOpen(true)}
          onMouseLeave={() => {
            setMegaOpen(false);
            setMegaItem(null);
          }}
        >
          {activeMega?.mega && (
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-10 px-6 py-10 md:px-12 lg:px-20">
              {activeMega.mega.map((column) => (
                <div key={column.title}>
                  <p className="label-caps mb-4 text-gold-dark">{column.title}</p>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="font-body text-sm text-navy transition-colors hover:text-gold-dark"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div
        ref={drawerRef}
        className="fixed inset-0 z-40 flex flex-col bg-navy-dark px-8 pt-28 lg:hidden"
        style={{ display: "none" }}
        aria-hidden={!mobileOpen}
      >
        <div ref={drawerLinksRef} className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} data-drawer-link>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-display text-4xl italic text-white transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
              {item.mega && (
                <ul className="mt-3 space-y-2 pl-2">
                  {item.mega.flatMap((col) =>
                    col.links.slice(0, 2).map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="font-body text-xs uppercase tracking-[0.15em] text-white/70 hover:text-gold"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          ))}

          <div data-drawer-link className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-8">
            <Link
              href="/wholesale#inquiry"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center bg-gold font-body text-sm font-medium uppercase tracking-widest text-navy transition-colors hover:bg-gold-dark hover:text-white"
            >
              Wholesale Inquiry
            </Link>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 font-body text-sm uppercase tracking-widest text-white hover:text-gold"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
