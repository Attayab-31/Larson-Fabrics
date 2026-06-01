import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { getClientOrigins, validateEnv } from "./config/env";
import { applySecurityMiddleware, errorHandler } from "./middleware/security";

dotenv.config();

validateEnv();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const isProduction = process.env.NODE_ENV === "production";
const clientOrigins = getClientOrigins();

applySecurityMiddleware(app);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "larson-fabrics-api" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    if (isProduction) {
      throw new Error("MONGODB_URI is required in production");
    }
    console.warn("MONGODB_URI not set — skipping database connection");
    return;
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Larson Fabrics API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

export default app;
