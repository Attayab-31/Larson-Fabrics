let patched = false;

export function suppressThreeClockDeprecationWarning(): void {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (
      typeof first === "string" &&
      first.includes("THREE.Clock") &&
      first.includes("deprecated")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}
