/**
 * Validates required environment variables at startup.
 * Fails fast in production so secrets are never missing silently.
 */

const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    if (isProduction) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return "";
  }
  return value;
}

function warnIfWeakJwtSecret(secret: string): void {
  if (!secret || secret.includes("change-in-production")) {
    console.warn(
      "[security] JWT_SECRET is unset or still a placeholder — set a long random value before production."
    );
    return;
  }
  if (secret.length < 32) {
    console.warn(
      "[security] JWT_SECRET should be at least 32 characters for production."
    );
  }
}

export function validateEnv(): void {
  if (isProduction) {
    requireEnv("MONGODB_URI");
    requireEnv("JWT_SECRET");
    requireEnv("CLIENT_URL");
  }

  const jwt = process.env.JWT_SECRET ?? "";
  warnIfWeakJwtSecret(jwt);

  if (isProduction && process.env.CLIENT_URL?.includes("localhost")) {
    console.warn(
      "[security] CLIENT_URL points to localhost in production — update CORS origin."
    );
  }
}

export function getClientOrigins(): string[] {
  const raw = process.env.CLIENT_URL ?? "http://localhost:3000";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}
