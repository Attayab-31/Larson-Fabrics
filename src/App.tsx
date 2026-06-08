import { lazy, Suspense } from "react";
import { ClientLayout, useTransition } from "@/src/components/layout";

// Code splitting / Lazy-loaded components via named export dynamic resolution
const Home = lazy(() => import("@/src/pages/Home").then((m) => ({ default: m.Home })));
const About = lazy(() => import("@/src/pages/About").then((m) => ({ default: m.About })));
const Collections = lazy(() => import("@/src/pages/Collections").then((m) => ({ default: m.Collections })));
const ProductDetail = lazy(() => import("@/src/pages/ProductDetail").then((m) => ({ default: m.ProductDetail })));
const Bespoke = lazy(() => import("@/src/pages/Bespoke").then((m) => ({ default: m.Bespoke })));
const Track = lazy(() => import("@/src/pages/Track").then((m) => ({ default: m.Track })));
const Manager = lazy(() => import("@/src/pages/Manager").then((m) => ({ default: m.Manager })));

// Premium loading placeholder component aligned with brand styles
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-[#0A1F5C] select-none">
      <div className="w-8 h-8 rounded-full border-2 border-gold-dark border-t-transparent animate-spin mb-3" />
      <p className="font-body text-xs uppercase tracking-widest text-[#0A1F5C]/60 animate-pulse">Larson Fabrics Heritage...</p>
    </div>
  );
}

export type AppRoutePath =
  | "/"
  | "/about"
  | "/track"
  | "/manager"
  | "/bespoke"
  | "/collections"
  | "/collections/";

export interface RouteConfig {
  component: React.ComponentType;
  exact: boolean;
}

export const ROUTE_CONFIG: Record<AppRoutePath, RouteConfig> = {
  "/": { component: Home, exact: true },
  "/about": { component: About, exact: true },
  "/track": { component: Track, exact: true },
  "/manager": { component: Manager, exact: true },
  "/bespoke": { component: Bespoke, exact: true },
  "/collections": { component: Collections, exact: true },
  "/collections/": { component: ProductDetail, exact: false },
};

function RouteRenderer() {
  const { pathname } = useTransition();

  const matchedEntry = Object.entries(ROUTE_CONFIG).find(([path, config]) => {
    if (config.exact) {
      return pathname === path;
    } else {
      return pathname.startsWith(path);
    }
  });

  if (matchedEntry) {
    const Component = matchedEntry[1].component;
    return <Component />;
  }

  // Baseline 404 fallback
  return <Home />;
}

export default function App() {
  return (
    <ClientLayout>
      <Suspense fallback={<PageLoader />}>
        <RouteRenderer />
      </Suspense>
    </ClientLayout>
  );
}
