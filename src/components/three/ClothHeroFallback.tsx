export function ClothHeroFallback({ subtle = false }: { subtle?: boolean }) {
  return (
    <div className="cloth-hero-fallback absolute inset-0 z-0" aria-hidden>
      <div className="cloth-hero-fallback__layer cloth-hero-fallback__layer--base" />
      {!subtle && (
        <>
          <div className="cloth-hero-fallback__layer cloth-hero-fallback__layer--fabric" />
          <div className="cloth-hero-fallback__layer cloth-hero-fallback__layer--wave" />
          <div className="cloth-hero-fallback__layer cloth-hero-fallback__layer--sheen" />
        </>
      )}
      <div className="cloth-hero-fallback__vignette" />
    </div>
  );
}
