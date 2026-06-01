import type { Express, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const isProduction = process.env.NODE_ENV === "production";

/** Standard security headers + API rate limiting */
export function applySecurityMiddleware(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isProduction ? 200 : 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests, please try again later." },
    })
  );

  app.disable("x-powered-by");
}

/** Hide stack traces from API clients in production */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err);
  res.status(500).json({
    error: isProduction ? "Internal server error" : err.message,
  });
}
