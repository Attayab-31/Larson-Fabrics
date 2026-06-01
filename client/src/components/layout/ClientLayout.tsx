"use client";

import { type ReactNode } from "react";
import { Preloader } from "@/components/animations/Preloader";
import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <Preloader />
      <CustomCursor />
      <Navbar />
      <main className="flex flex-1 flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
