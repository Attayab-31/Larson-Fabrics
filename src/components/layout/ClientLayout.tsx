import { type ReactNode } from "react";
import { Preloader } from "@/src/components/animations/Preloader";
import { SmoothScrollProvider } from "@/src/components/animations/SmoothScrollProvider";
import { CustomCursor } from "@/src/components/ui/CustomCursor";
import { TransitionProvider } from "./TransitionProvider";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";
import { CartProvider } from "@/src/lib/cart";
import { CartDrawer } from "./CartDrawer";

function LayoutContent({ children }: { children: ReactNode }) {
  return (
    <div data-site-shell className="flex min-h-screen flex-col bg-ivory">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2.5 focus:bg-gold focus:text-navy focus:font-body focus:text-xs focus:font-bold focus:uppercase focus:tracking-wider focus:rounded-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-navy"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col pt-[80px]">
        <PageTransition>{children}</PageTransition>
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
}

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <TransitionProvider>
      <CartProvider>
        <SmoothScrollProvider>
          <Preloader />
          <CustomCursor />
          <LayoutContent>{children}</LayoutContent>
        </SmoothScrollProvider>
      </CartProvider>
    </TransitionProvider>
  );
}
export default ClientLayout;
