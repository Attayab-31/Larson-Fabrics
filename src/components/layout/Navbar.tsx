import { useGSAP } from "@gsap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/src/lib/gsap";
import { BRAND } from "@/src/lib/constants";
import { NAV_ITEMS } from "@/src/lib/navigation";
import { cn } from "@/src/lib/utils";
import { WhatsAppIcon } from "@/src/components/ui/icons";
import { useTransition } from "./TransitionProvider";
import { useCart } from "@/src/lib/cart";
import { ShoppingBasket } from "lucide-react";

const NAV_HEIGHT_EXPANDED = 80;
const NAV_HEIGHT_SHRUNK = 60;

function isNavOverDarkBackground(navHeight: number): boolean {
  const darkZones = document.querySelectorAll("[data-nav-dark]");
  for (let i = 0; i < darkZones.length; i++) {
    const rect = darkZones[i].getBoundingClientRect();
    if (rect.top <= navHeight && rect.bottom >= 0) {
      return true;
    }
  }
  return false;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: any = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
  return debounced;
}

export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerLinksRef = useRef<HTMLDivElement>(null);

  const { pathname, navigate, isTransitioning } = useTransition();
  const { cartCount, setCartOpen } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaItem, setMegaItem] = useState<string | null>(null);
  const scrolledRef = useRef(false);
  const megaCloseTimerRef = useRef<number | null>(null);

  const lightText = overDark;

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
    const debouncedResize = debounce(updateNavState, 150);

    window.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("scroll", updateNavState);
      window.removeEventListener("resize", debouncedResize);
      debouncedResize.cancel();
    };
  }, [updateNavState, pathname, isTransitioning]);

  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        updateNavState();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, updateNavState]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    return () => {
      if (megaCloseTimerRef.current !== null) {
        window.clearTimeout(megaCloseTimerRef.current);
      }
    };
  }, []);

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
          ease: "power2.in1",
          onComplete: () => gsap.set(drawer, { display: "none" }),
        });
      }
    },
    { dependencies: [mobileOpen] }
  );

  const isLinkActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const cancelMegaClose = useCallback(() => {
    if (megaCloseTimerRef.current !== null) {
      window.clearTimeout(megaCloseTimerRef.current);
      megaCloseTimerRef.current = null;
    }
  }, []);

  const openMega = useCallback(
    (label: string) => {
      cancelMegaClose();
      setMegaItem(label);
      setMegaOpen(true);
    },
    [cancelMegaClose]
  );

  const closeMega = useCallback(() => {
    cancelMegaClose();
    setMegaOpen(false);
    setMegaItem(null);
  }, [cancelMegaClose]);

  const scheduleMegaClose = useCallback(() => {
    cancelMegaClose();
    megaCloseTimerRef.current = window.setTimeout(closeMega, 180);
  }, [cancelMegaClose, closeMega]);

  const activeMega = NAV_ITEMS.find((item) => item.label === megaItem);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 right-0 left-0 z-50 transition-colors duration-500",
          scrolled
            ? overDark
              ? "bg-navy/95 shadow-lg backdrop-blur-sm"
              : "bg-ivory/95 shadow-lg backdrop-blur-sm border-b border-navy/10"
            : lightText
              ? "bg-transparent"
              : "border-b border-navy/5 bg-ivory/90 backdrop-blur-sm"
        )}
        style={{ height: NAV_HEIGHT_EXPANDED }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-12 lg:px-20">
          <button
            onClick={() => {
              navigate("/");
              setMobileOpen(false);
            }}
            className={cn(
              "group flex shrink-0 items-baseline gap-1 transition-colors duration-300 cursor-pointer bg-transparent border-none outline-none",
              lightText ? "text-white" : "text-navy"
            )}
          >
            <span className="font-display text-2xl italic leading-none md:text-3xl">
              Larson
            </span>
            <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] md:text-sm">
              Fabrics
            </span>
          </button>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            <ul className="flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.href}
                  className="group relative"
                  onMouseEnter={() => {
                    if (item.mega) {
                      openMega(item.label);
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.mega) {
                      scheduleMegaClose();
                    }
                  }}
                >
                  <button
                    onClick={() => {
                      navigate(item.href);
                      closeMega();
                    }}
                    className={cn(
                      "group relative font-body text-xs font-semibold uppercase tracking-[1px] transition-colors duration-300 cursor-pointer bg-transparent py-2 border-none outline-none",
                      lightText
                        ? "text-white hover:text-gold"
                        : "text-navy hover:text-gold-dark",
                      isLinkActive(item.href) && (lightText ? "text-gold" : "text-gold-dark")
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-px w-full origin-left bg-gold transition-transform duration-300",
                        isLinkActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )}
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <button
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:text-gold cursor-pointer",
                lightText ? "text-white" : "text-navy"
              )}
              aria-label={cartCount > 0 ? `Open cart, ${cartCount} items` : "Open cart, empty"}
            >
              <ShoppingBasket className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-navy border border-navy/10 shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/bespoke")}
              className="inline-flex h-9 items-center justify-center bg-gold px-4 font-body text-xs font-semibold uppercase tracking-widest text-navy transition-colors hover:bg-gold-dark hover:text-white cursor-pointer rounded-sm"
            >
              Bespoke Fabrics
            </button>
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

          {/* Mobile Basket Button directly in the header */}
          <button
            onClick={() => setCartOpen(true)}
            className={cn(
              "relative flex h-10 w-15 items-center justify-center rounded-full transition-all hover:text-gold cursor-pointer lg:hidden ml-auto mr-1",
              lightText ? "text-white" : "text-navy"
            )}
            aria-label={cartCount > 0 ? `Open cart, ${cartCount} items` : "Open cart, empty"}
          >
            <ShoppingBasket className="h-5.5 w-5.5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-navy border border-navy/10 shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden cursor-pointer ml-1"
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
            "mega-menu-panel absolute top-full right-0 left-0 hidden border-t border-navy/5 bg-ivory shadow-2xl transition-all duration-300 lg:block",
            megaOpen && activeMega?.mega
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          )}
          onMouseEnter={cancelMegaClose}
          onMouseLeave={scheduleMegaClose}
        >
          {activeMega?.mega && (
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-10 px-6 py-10 md:px-12 lg:px-20">
              {activeMega.mega.map((column) => (
                <div key={column.title}>
                  <p className="label-caps mb-4 text-gold-dark font-semibold">{column.title}</p>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}>
                        <button
                          onClick={() => {
                            navigate(link.href);
                            closeMega();
                          }}
                          className="font-body text-sm text-navy transition-colors hover:text-gold-dark bg-transparent border-none outline-none cursor-pointer py-1 text-left"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-0 z-40 flex flex-col bg-navy-dark px-8 pt-28 lg:hidden"
        style={{ display: "none" }}
        aria-hidden={!mobileOpen}
      >
        <div ref={drawerLinksRef} className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} data-drawer-link>
              <button
                onClick={() => {
                  navigate(item.href);
                  setMobileOpen(false);
                }}
                className="font-display text-4xl italic text-white transition-colors hover:text-gold bg-transparent border-none text-left cursor-pointer"
              >
                {item.label}
              </button>
              {item.mega && (
                <ul className="mt-3 space-y-2 pl-2">
                  {item.mega.flatMap((col) =>
                    col.links.slice(0, 3).map((link) => (
                      <li key={`${col.title}-${link.label}`}>
                        <button
                          onClick={() => {
                            navigate(link.href);
                            setMobileOpen(false);
                          }}
                          className="font-body text-xs uppercase tracking-[0.15em] text-white/70 hover:text-gold bg-transparent border-none text-left cursor-pointer py-1"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          ))}

          <div data-drawer-link className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-8">
            <button
              onClick={() => {
                navigate("/bespoke");
                setMobileOpen(false);
              }}
              className="inline-flex h-11 w-full items-center justify-center bg-gold font-body text-sm font-semibold uppercase tracking-widest text-navy transition-colors hover:bg-gold-dark hover:text-white cursor-pointer rounded-sm"
            >
              Bespoke Fabrics
            </button>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 font-body text-xs uppercase tracking-widest text-white hover:text-gold"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp Client Direct
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
export default Navbar;
