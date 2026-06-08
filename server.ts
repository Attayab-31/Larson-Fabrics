import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { MongoClient, Db } from "mongodb";
import { MOCK_PRODUCTS } from "./src/data/products";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Define local persistent storage directories relative to the process root
const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");
const BESPOKE_FILE = path.join(DATA_DIR, "bespoke.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const DEFAULT_PRODUCT_IMAGE_URL = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800";
const PRODUCT_IMAGE_MAX_BYTES = 20 * 1024 * 1024;
const PRODUCT_IMAGE_UPLOAD_LIMIT = 10;

type ProductImageAsset = {
  url: string;
  publicId?: string;
};

// Cache for dynamic MongoDB client and active database connection
let mongoClientInstance: MongoClient | null = null;
let dbPromise: Promise<Db | null> | null = null;

// Return a valid MongoDB database hook, or null to trigger standard loom-file fallback
async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("username:password")) {
    return null;
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        console.log("[MongoDB Client] Initializing Atlas connection...");
        const client = new MongoClient(uri, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
        });
        await client.connect();
        mongoClientInstance = client;
        console.log("[MongoDB connected] Hooked successfully. Production database live.");
        return client.db("larson_fabrics");
      } catch (err) {
        console.warn("[MongoDB connection skipped/failed] Defaulting to JSON-backed Loom files. Error details:", err);
        return null;
      }
    })();
  }

  return dbPromise;
}

// Audit Logger for Store Actions
function logAuditAction(action: string, metadata: any) {
  try {
    const auditFile = path.join(DATA_DIR, "audit.json");
    const logs = fs.existsSync(auditFile) ? JSON.parse(fs.readFileSync(auditFile, "utf-8")) : [];
    logs.unshift({
      action,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    if (logs.length > 500) logs.length = 500; // Cap at 500 actions
    fs.writeFileSync(auditFile, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

// Privacy Guard Masking Utility Functions
function maskCustomerName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts.map(part => {
    if (part.length <= 2) return part[0] + "*";
    return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
  }).join(" ");
}

function maskPhone(phone: string): string {
  if (!phone) return "";
  const p = phone.trim();
  if (p.length < 7) return "***" + p.slice(-2);
  return p.slice(0, 4) + "*".repeat(p.length - 7) + p.slice(-3);
}

function maskAddress(addr: string): string {
  if (!addr) return "";
  const parts = addr.trim().split(/\s+/);
  if (parts.length <= 2) return addr.substring(0, Math.ceil(addr.length / 2)) + "...";
  return parts.map((p, i) => {
    if (i === 0) return p.substring(0, 2) + "*".repeat(Math.max(0, p.length - 2));
    if (i === parts.length - 1) return "*".repeat(Math.max(0, p.length - 2)) + p.slice(-2);
    return "***";
  }).join(" ");
}

// ═══════════════════════════════════════
// DB BACKED FILESYSTEM SEEDER
// ═══════════════════════════════════════
function initializeDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const uploadsDir = path.join(DATA_DIR, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const collections = [
      { path: PRODUCTS_FILE, default: MOCK_PRODUCTS },
      { path: INQUIRIES_FILE, default: [] },
      { path: BESPOKE_FILE, default: [] },
      { path: REVIEWS_FILE, default: [
        {
          _id: "rev-1",
          productId: "pure-premium-boski-6-pound", 
          productName: "Pure Premium Boski (6-Pound)",
          rating: 5,
          content: "Truly exceptional quality. The drape of this 6-pound pure Boski is perfect for unstitched traditional attire, and the luster is beautifully subtle. Prompt delivery to Lahore.",
          email: "kamran@gmail.com",
          displayName: "Kamran Shah",
          isAnonymous: false,
          status: "approved",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: "rev-2",
          productId: "giza-divine-latha",
          productName: "Giza Divine Latha",
          rating: 5,
          content: "Excellent thread count and stiffness. The white is ultra-vibrant, and after several washes, the crisp finish is still completely intact. Will buy again.",
          email: "ahmad.alvi@hotmail.com",
          displayName: "Dr. Ahmad Alvi",
          isAnonymous: false,
          status: "approved",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ] },
      { path: ORDERS_FILE, default: [
        {
          id: "LRS-84013",
          customerName: "Kamran Shah",
          phone: "03214567890",
          address: "Phase 6, DHA",
          city: "Lahore",
          shippingMethod: "Standard",
          paymentMethod: "Cash on Delivery",
          items: [
            {
              productName: "Pure Premium Boski (6-Pound)",
              swatchName: "Authentic Sand Gold",
              length: 4.0,
              quantity: 1,
              price: 9600
            }
          ],
          subtotal: 9600,
          shippingCost: 190,
          total: 9790,
          status: "Signature Packaging",
          trackingNumber: "TRS5462319PK",
          courierService: "Leopards Courier",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "LRS-91234",
          customerName: "Sarmad Alvi",
          phone: "03009876543",
          address: "Abid Road, Gulberg V",
          city: "Lahore",
          shippingMethod: "Express",
          paymentMethod: "Cash on Delivery",
          items: [
            {
              productName: "Giza Divine Latha",
              swatchName: "Super White",
              length: 4.5,
              quantity: 1,
              price: 5850
            }
          ],
          subtotal: 5850,
          shippingCost: 350,
          total: 6200,
          status: "Fabric Cutting",
          trackingNumber: "TRSTCS8831PK",
          courierService: "TCS Express",
          createdAt: new Date(Date.now() - 6 * 12 * 60 * 60 * 1000).toISOString()
        }
      ]}
    ];

    collections.forEach((col) => {
      if (!fs.existsSync(col.path)) {
        fs.writeFileSync(col.path, JSON.stringify(col.default, null, 2), "utf-8");
      }
    });

    console.log("[Loom Database] Baseline file models successfully verified.");
  } catch (err) {
    console.error("Loom DB Seeding Exception:", err);
  }
}

// Atomic collection utility helpers
function readCollection(filePath: string): any[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading database from ${filePath}:`, err);
    return [];
  }
}

function writeCollection(filePath: string, data: any[]) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing database to ${filePath}:`, err);
  }
}

function normalizeProductImages(input: unknown): string[] {
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];

  return Array.from(
    new Set(
      values
        .map((url) => String(url || "").trim())
        .filter((url) => url.length > 0)
    )
  );
}

function normalizeImagePublicIds(input: unknown, allowedUrls?: string[]): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const allowed = allowedUrls ? new Set(allowedUrls) : null;
  return Object.entries(input as Record<string, unknown>).reduce<Record<string, string>>((acc, [url, publicId]) => {
    const cleanUrl = String(url || "").trim();
    const cleanPublicId = String(publicId || "").trim();
    if (cleanUrl && cleanPublicId && (!allowed || allowed.has(cleanUrl))) {
      acc[cleanUrl] = cleanPublicId;
    }
    return acc;
  }, {});
}

function publicIdFromCloudinaryUrl(imageUrl: string): string {
  try {
    const parsed = new URL(imageUrl);
    const uploadMarker = "/image/upload/";
    const markerIndex = parsed.pathname.indexOf(uploadMarker);
    if (markerIndex === -1) {
      return "";
    }

    let publicPath = parsed.pathname.slice(markerIndex + uploadMarker.length);
    publicPath = publicPath.replace(/^v\d+\//, "");
    const extensionIndex = publicPath.lastIndexOf(".");
    if (extensionIndex > -1) {
      publicPath = publicPath.slice(0, extensionIndex);
    }

    return decodeURIComponent(publicPath).trim();
  } catch {
    return "";
  }
}

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
}

function uploadProductImageToCloudinary(file: Express.Multer.File): Promise<ProductImageAsset> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "larson_products",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url || !result?.public_id) {
          reject(error || new Error("Cloudinary did not return product image metadata."));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(file.buffer);
  });
}

async function destroyCloudinaryImage(publicId: string) {
  const cleanPublicId = String(publicId || "").trim();
  if (!cleanPublicId || !hasCloudinaryConfig()) {
    return;
  }

  const result = await cloudinary.uploader.destroy(cleanPublicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result?.result && !["ok", "not found"].includes(result.result)) {
    throw new Error(`Cloudinary image deletion failed: ${result.result}`);
  }
}

async function destroyProductCloudinaryImages(product: any) {
  const imageUrls = normalizeProductImages(product?.images);
  const imagePublicIds = normalizeImagePublicIds(product?.imagePublicIds, imageUrls);
  const publicIds = Array.from(
    new Set(
      imageUrls
        .map((url) => imagePublicIds[url] || publicIdFromCloudinaryUrl(url))
        .filter((publicId) => publicId.length > 0)
    )
  );

  await Promise.all(
    publicIds.map(async (publicId) => {
      try {
        await destroyCloudinaryImage(publicId);
      } catch (err) {
        console.warn(`[Cloudinary] Product image cleanup skipped for ${publicId}:`, err);
      }
    })
  );
}

async function startServer() {
  initializeDatabase();

  // Validate critical environments on startup gracefully
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[Config Warning] GEMINI_API_KEY environment variable is not set. AI features may fail.");
  }
  if (!process.env.MONGODB_URI) {
    console.log("[Config] MONGODB_URI is not set. Falling back to local JSON-backed filesystem persistence.");
  }

  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // ═══════════ SECURITY HEADERS & CORS ═══════════
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: process.env.APP_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }));

  // JSON size limit mitigation against DoS
  app.use(express.json({ limit: "150kb" }));
  app.use(express.urlencoded({ extended: true, limit: "150kb" }));

  // ═══════════ RATE LIMITERS ═══════════
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 15, // Limit 15 login attempts per 15 minutes
    message: { error: "Too many login/verification attempts. Please retry in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const publicWriteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit 20 submissions per hour
    message: { error: "Submission limit reached. Please wait a while before sending another request." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 150, // 150 requests per 15 mins
    message: { error: "Traffic limit exceeded. Please slow down your requests." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/", generalApiLimiter);

  const productImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: PRODUCT_IMAGE_MAX_BYTES,
      files: PRODUCT_IMAGE_UPLOAD_LIMIT,
    },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files can be uploaded for products."));
        return;
      }
      cb(null, true);
    },
  });

  const parseProductImages = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    productImageUpload.array("images", PRODUCT_IMAGE_UPLOAD_LIMIT)(req, res, (err) => {
      if (!err) {
        next();
        return;
      }

      if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
          ? "Each product image must be 20MB or smaller."
          : err.code === "LIMIT_FILE_COUNT"
            ? `Upload up to ${PRODUCT_IMAGE_UPLOAD_LIMIT} product images at once.`
            : err.message;
        return res.status(400).json({ error: message });
      }

      res.status(400).json({ error: err.message || "Invalid product image upload." });
    });
  };

  // ═══════════ SECURE AUTH MIDDLEWARE ═══════════
  const authCheck = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Access denied. Valid authorization token is missing." });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const actualSecret = (process.env.MANAGER_SECRET || "larsonshow123").trim();
    if (token !== actualSecret) {
      return res.status(401).json({ error: "Access denied. Invalid secure token matched." });
    }
    next();
  };

  // Verify showroom manager credentials (secure credential comparison check)
  app.post("/api/admin/verify", authLimiter, (req, res) => {
    const { passcode } = req.body;
    const actualSecret = (process.env.MANAGER_SECRET || "larsonshow123").trim();
    if (!passcode || String(passcode).trim() !== actualSecret) {
      return res.status(401).json({ error: "Access denied. Correct showroom manager passcode required." });
    }
    res.json({ success: true, token: String(passcode).trim() });
  });

  // ═══════════════════════════════════════
  // 1. PRODUCTS REGISTRY APIs (PIM CONTROLLER)
  // ═══════════════════════════════════════
  
  app.get("/api/products", async (req, res) => {
    try {
      const { category, limit, skip } = req.query;

      const db = await getDb();
      if (db) {
        const query: any = {};
        if (category && category !== "All") {
          query.category = { $regex: new RegExp(`^${category}$`, "i") };
        }

        let cursor = db.collection<any>("products").find(query);

        if (skip) {
          cursor = cursor.skip(parseInt(skip as string, 10));
        }
        if (limit) {
          cursor = cursor.limit(parseInt(limit as string, 10));
        }

        const list = await cursor.toArray();
        if (list.length === 0 && !category && !skip && !limit) {
          // If mongo collection is empty, seed it with initial heritage clothes list
          await db.collection<any>("products").insertMany(MOCK_PRODUCTS as any[]);
          return res.json(MOCK_PRODUCTS);
        }
        return res.json(list);
      } else {
        let list = readCollection(PRODUCTS_FILE);
        if (category && category !== "All") {
          list = list.filter(
            (p: any) => p.category?.toLowerCase() === (category as string).toLowerCase()
          );
        }
        const skipNum = skip ? parseInt(skip as string, 10) : 0;
        const limitNum = limit ? parseInt(limit as string, 10) : undefined;

        if (limitNum !== undefined) {
          list = list.slice(skipNum, skipNum + limitNum);
        } else if (skipNum > 0) {
          list = list.slice(skipNum);
        }
        res.json(list);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to dispatch products data store." });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const cleanSlug = String(slug).trim().toLowerCase();

      const db = await getDb();
      if (db) {
        const found = await db.collection<any>("products").findOne({ slug: cleanSlug });
        if (!found) {
          return res.status(404).json({ error: "Fabric product code not found in Catalog." });
        }
        return res.json(found);
      } else {
        const list = readCollection(PRODUCTS_FILE);
        const product = list.find((p) => p.slug === cleanSlug);
        if (!product) {
          return res.status(404).json({ error: "Fabric code not found in Lahori stock." });
        }
        res.json(product);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to pull specific fabric specifications." });
    }
  });

  app.post("/api/products", authCheck, async (req, res) => {
    try {
      const productData = req.body;
      if (!productData.name || !productData.category || !productData.slug) {
        return res.status(400).json({ error: "Product name, category and slug coordinates required." });
      }

      const formattedSlug = String(productData.slug).toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
      const imageUrls = normalizeProductImages(productData.images);
      const persistedImageUrls = imageUrls.length > 0 ? imageUrls : [DEFAULT_PRODUCT_IMAGE_URL];
      const imagePublicIds = normalizeImagePublicIds(productData.imagePublicIds, persistedImageUrls);

      const newProduct = {
        _id: String(productData._id || `p-${Date.now()}`),
        name: String(productData.name).trim(),
        category: String(productData.category).trim(),
        description: String(productData.description || "").trim(),
        images: persistedImageUrls,
        imagePublicIds,
        material: String(productData.material || "Premium Unstitched Weft").trim(),
        isNew: !!productData.isNew,
        isFeatured: !!productData.isFeatured,
        minOrder: Number(productData.minOrder) || 4,
        priceRange: {
          min: Number(productData.priceRange?.min) || 600,
          max: Number(productData.priceRange?.max) || 2000
        },
        slug: formattedSlug,
        createdAt: new Date().toISOString(),
        specifications: {
          threadCount: String(productData.specifications?.threadCount || "Standard Loom").trim(),
          width: String(productData.specifications?.width || "54 Inches").trim(),
          weight: String(productData.specifications?.weight || "Medium").trim(),
          composition: String(productData.specifications?.composition || "Selected Fiber Blend").trim(),
          dyeType: String(productData.specifications?.dyeType || "Standard").trim()
        },
        swatches: productData.swatches || [
          { name: "White", color: "#FFFFFF" }
        ]
      };

      const db = await getDb();
      if (db) {
        // Enforce unique slug checks
        const existing = await db.collection<any>("products").findOne({ slug: formattedSlug });
        if (existing) {
          return res.status(400).json({ error: "A product with this URL slug already exists. Please choose a unique name." });
        }
        await db.collection<any>("products").insertOne(newProduct as any);
      } else {
        const list = readCollection(PRODUCTS_FILE);
        if (list.some((p) => p.slug === formattedSlug)) {
          return res.status(400).json({ error: "A product with this URL slug already exists. Please choose a unique name." });
        }
        list.unshift(newProduct);
        writeCollection(PRODUCTS_FILE, list);
      }

      res.status(201).json(newProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load brand metadata to the catalogs." });
    }
  });

  app.put("/api/products/:id", authCheck, async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      const cleanId = String(id).trim();

      const updatedFields: any = {
        name: String(productData.name || "").trim(),
        category: String(productData.category || "").trim(),
        description: String(productData.description || "").trim(),
        material: String(productData.material || "").trim(),
        isNew: !!productData.isNew,
        isFeatured: !!productData.isFeatured,
        minOrder: Number(productData.minOrder) || 4,
        priceRange: {
          min: Number(productData.priceRange?.min) || 500,
          max: Number(productData.priceRange?.max) || 2000
        },
        specifications: {
          threadCount: String(productData.specifications?.threadCount || "").trim(),
          width: String(productData.specifications?.width || "").trim(),
          weight: String(productData.specifications?.weight || "").trim(),
          composition: String(productData.specifications?.composition || "").trim(),
          dyeType: String(productData.specifications?.dyeType || "").trim()
        },
        swatches: productData.swatches || []
      };

      if (Object.prototype.hasOwnProperty.call(productData, "images")) {
        const imageUrls = normalizeProductImages(productData.images);
        updatedFields.images = imageUrls;
        if (Object.prototype.hasOwnProperty.call(productData, "imagePublicIds")) {
          updatedFields.imagePublicIds = normalizeImagePublicIds(productData.imagePublicIds, imageUrls);
        }
      }
      if (productData.slug) {
        updatedFields.slug = String(productData.slug).toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
      }

      const db = await getDb();
      if (db) {
        const result = await db.collection<any>("products").findOneAndUpdate(
          { _id: cleanId as any },
          { $set: updatedFields } as any,
          { returnDocument: "after" } as any
        );
        if (!result) {
          return res.status(404).json({ error: "Product node not identified in Atlas cluster." });
        }
        res.json(result);
      } else {
        const list = readCollection(PRODUCTS_FILE);
        const idx = list.findIndex((p) => p._id === cleanId);
        if (idx === -1) {
          return res.status(404).json({ error: "Product key not matched in files lookup." });
        }
        list[idx] = { ...list[idx], ...updatedFields };
        writeCollection(PRODUCTS_FILE, list);
        res.json(list[idx]);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Critical update interruption in inventory registry." });
    }
  });

  app.post("/api/products/images/upload", authCheck, parseProductImages, async (req, res) => {
    const uploadedAssets: ProductImageAsset[] = [];

    try {
      if (!hasCloudinaryConfig()) {
        return res.status(500).json({ error: "Cloudinary product image upload is not configured." });
      }

      const files = ((req.files as Express.Multer.File[]) || []);
      if (files.length === 0) {
        return res.status(400).json({ error: "Select at least one product image to upload." });
      }

      for (const file of files) {
        uploadedAssets.push(await uploadProductImageToCloudinary(file));
      }

      const productId = String(req.body?.productId || "").trim();
      let updatedProduct: any = null;

      if (productId) {
        const db = await getDb();
        const uploadedUrls = uploadedAssets.map((asset) => asset.url);
        const uploadedPublicIds = uploadedAssets.reduce<Record<string, string>>((acc, asset) => {
          if (asset.publicId) acc[asset.url] = asset.publicId;
          return acc;
        }, {});

        if (db) {
          const existing = await db.collection<any>("products").findOne({ _id: productId as any });
          if (!existing) {
            await Promise.all(uploadedAssets.map((asset) => asset.publicId ? destroyCloudinaryImage(asset.publicId) : Promise.resolve()));
            return res.status(404).json({ error: "Product node not found while attaching uploaded images." });
          }

          const existingImages = normalizeProductImages(existing.images);
          const nextImages = [...existingImages, ...uploadedUrls.filter((url) => !existingImages.includes(url))];
          const nextPublicIds = {
            ...normalizeImagePublicIds(existing.imagePublicIds, existingImages),
            ...uploadedPublicIds,
          };

          updatedProduct = await db.collection<any>("products").findOneAndUpdate(
            { _id: productId as any },
            { $set: { images: nextImages, imagePublicIds: normalizeImagePublicIds(nextPublicIds, nextImages) } } as any,
            { returnDocument: "after" } as any
          );
        } else {
          const list = readCollection(PRODUCTS_FILE);
          const idx = list.findIndex((p) => p._id === productId);
          if (idx === -1) {
            await Promise.all(uploadedAssets.map((asset) => asset.publicId ? destroyCloudinaryImage(asset.publicId) : Promise.resolve()));
            return res.status(404).json({ error: "Product node not found while attaching uploaded images." });
          }

          const existingImages = normalizeProductImages(list[idx].images);
          const nextImages = [...existingImages, ...uploadedUrls.filter((url) => !existingImages.includes(url))];
          const nextPublicIds = {
            ...normalizeImagePublicIds(list[idx].imagePublicIds, existingImages),
            ...uploadedPublicIds,
          };

          list[idx] = {
            ...list[idx],
            images: nextImages,
            imagePublicIds: normalizeImagePublicIds(nextPublicIds, nextImages),
          };
          writeCollection(PRODUCTS_FILE, list);
          updatedProduct = list[idx];
        }
      }

      logAuditAction("PRODUCT_IMAGE_UPLOAD", {
        productId: productId || "draft",
        count: uploadedAssets.length,
      });

      res.status(201).json({
        images: uploadedAssets,
        product: updatedProduct,
      });
    } catch (err) {
      await Promise.all(uploadedAssets.map((asset) => asset.publicId ? destroyCloudinaryImage(asset.publicId).catch(() => undefined) : Promise.resolve()));
      console.error("[Product Image Upload Error]:", err);
      res.status(500).json({ error: "Failed to upload product images to Cloudinary." });
    }
  });

  app.delete("/api/products/images/cloudinary", authCheck, async (req, res) => {
    try {
      const publicId = String(req.body?.publicId || "").trim();
      if (!publicId) {
        return res.status(400).json({ error: "Cloudinary public ID is required for image cleanup." });
      }

      await destroyCloudinaryImage(publicId);
      logAuditAction("PRODUCT_DRAFT_IMAGE_DELETE", { publicId });
      res.json({ success: true });
    } catch (err) {
      console.error("[Product Draft Image Delete Error]:", err);
      res.status(500).json({ error: "Failed to delete product image from Cloudinary." });
    }
  });

  app.delete("/api/products/:id/images", authCheck, async (req, res) => {
    try {
      const cleanId = String(req.params.id || "").trim();
      const imageUrl = String(req.body?.url || "").trim();
      const requestedPublicId = String(req.body?.publicId || "").trim();

      if (!imageUrl) {
        return res.status(400).json({ error: "Product image URL is required for deletion." });
      }

      const db = await getDb();
      let updatedProduct: any = null;
      let product: any = null;

      if (db) {
        product = await db.collection<any>("products").findOne({ _id: cleanId as any });
      } else {
        product = readCollection(PRODUCTS_FILE).find((p) => p._id === cleanId);
      }

      if (!product) {
        return res.status(404).json({ error: "Product node not found while deleting image." });
      }

      const currentImages = normalizeProductImages(product.images);
      if (!currentImages.includes(imageUrl)) {
        return res.status(404).json({ error: "Image URL is not attached to this product." });
      }

      const currentPublicIds = normalizeImagePublicIds(product.imagePublicIds, currentImages);
      const publicId = requestedPublicId || currentPublicIds[imageUrl] || publicIdFromCloudinaryUrl(imageUrl);
      if (publicId) {
        await destroyCloudinaryImage(publicId);
      }

      const nextImages = currentImages.filter((url) => url !== imageUrl);
      const nextPublicIds = { ...currentPublicIds };
      delete nextPublicIds[imageUrl];

      if (db) {
        updatedProduct = await db.collection<any>("products").findOneAndUpdate(
          { _id: cleanId as any },
          { $set: { images: nextImages, imagePublicIds: normalizeImagePublicIds(nextPublicIds, nextImages) } } as any,
          { returnDocument: "after" } as any
        );
      } else {
        const list = readCollection(PRODUCTS_FILE);
        const idx = list.findIndex((p) => p._id === cleanId);
        if (idx === -1) {
          return res.status(404).json({ error: "Product node not found while deleting image." });
        }
        list[idx] = {
          ...list[idx],
          images: nextImages,
          imagePublicIds: normalizeImagePublicIds(nextPublicIds, nextImages),
        };
        writeCollection(PRODUCTS_FILE, list);
        updatedProduct = list[idx];
      }

      logAuditAction("PRODUCT_IMAGE_DELETE", { id: cleanId, imageUrl, publicId: publicId || undefined });
      res.json({ success: true, product: updatedProduct });
    } catch (err) {
      console.error("[Product Image Delete Error]:", err);
      res.status(500).json({ error: "Failed to synchronize product image deletion." });
    }
  });

  app.delete("/api/products/:id", authCheck, async (req, res) => {
    try {
      const { id } = req.params;
      const cleanId = String(id).trim();

      const db = await getDb();
      if (db) {
        const existing = await db.collection<any>("products").findOne({ _id: cleanId as any });
        if (!existing) {
          return res.status(404).json({ error: "Product node not found in Atlas." });
        }
        await destroyProductCloudinaryImages(existing);
        const result = await db.collection<any>("products").deleteOne({ _id: cleanId as any });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Product node not found in Atlas." });
        }
      } else {
        const list = readCollection(PRODUCTS_FILE);
        const existing = list.find((p) => p._id === cleanId);
        if (!existing) {
          return res.status(404).json({ error: "Product node not found in Local Storage." });
        }
        await destroyProductCloudinaryImages(existing);
        const filtered = list.filter((p) => p._id !== cleanId);
        if (filtered.length === list.length) {
          return res.status(404).json({ error: "Product node not found in Local Storage." });
        }
        writeCollection(PRODUCTS_FILE, filtered);
      }
      res.json({ success: true, message: "Fabric product node successfully deleted." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Critical delete interruption in inventory registry." });
    }
  });

  // ═══════════════════════════════════════
  // 2. FABRIC ORDERS AND DISPATCH APIs
  // ═══════════════════════════════════════

  app.get("/api/orders", authCheck, async (req, res) => {
    try {
      const db = await getDb();
      if (db) {
        // Safe cap of 200 registers to avoid Memory Leak DoS
        const list = await db.collection("orders").find({}).sort({ createdAt: -1 }).limit(200).toArray();
        res.json(list);
      } else {
        const list = readCollection(ORDERS_FILE);
        res.json(list.slice(0, 200));
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to pull unstitched order logs." });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const targetQuery = String(req.params.id).trim().toUpperCase();
      const cleanTargetPhone = targetQuery.replace(/[^0-9]/g, "");

      // Check if request is authenticated as admin
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "").trim();
        const actualSecret = (process.env.MANAGER_SECRET || "larsonshow123").trim();
        if (token === actualSecret) {
          isAdmin = true;
        }
      }

      const db = await getDb();
      let found: any = null;

      if (db) {
        // Query Atlas orders collection
        const orders = await db.collection("orders").find({}).toArray();
        found = orders.find((o) => {
          const idMatch = o.id.toUpperCase() === targetQuery || o.id.toUpperCase() === `LRS-${targetQuery}`;
          const cleanOrderPhone = o.phone ? o.phone.replace(/[^0-9]/g, "") : "";
          const phoneMatch = cleanTargetPhone.length > 5 && cleanOrderPhone.endsWith(cleanTargetPhone);
          return idMatch || phoneMatch;
        });
      } else {
        const orders = readCollection(ORDERS_FILE);
        found = orders.find((o) => {
          const idMatch = o.id.toUpperCase() === targetQuery || o.id.toUpperCase() === `LRS-${targetQuery}`;
          const cleanOrderPhone = o.phone ? o.phone.replace(/[^0-9]/g, "") : "";
          const phoneMatch = cleanTargetPhone.length > 5 && cleanOrderPhone.endsWith(cleanTargetPhone);
          return idMatch || phoneMatch;
        });
      }

      if (!found) {
        return res.status(404).json({ error: "Order reference or phone number not recognized." });
      }

      if (isAdmin) {
        res.json(found);
      } else {
        // Enforce privacy-safe masked fields for public order lookup (Do not leak PII)
        const maskedOrder = {
          ...found,
          customerName: maskCustomerName(found.customerName),
          phone: maskPhone(found.phone),
          address: maskAddress(found.address)
        };
        res.json(maskedOrder);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to dispatch active tracking details." });
    }
  });

  app.post("/api/orders", publicWriteLimiter, async (req, res) => {
    try {
      const { customerName, phone, address, city, shippingMethod, paymentMethod, items, subtotal, shippingCost, total } = req.body;

      if (!customerName || !phone || !address || !items || items.length === 0) {
        return res.status(400).json({ error: "Invalid clothing booking. Customer metadata and sliced items lists are empty." });
      }

      const cName = String(customerName).trim();
      const cPhone = String(phone).trim();
      const cAddress = String(address).trim();
      const cCity = String(city || "Lahore").trim();

      // Input size limits validation
      if (cName.length > 80) return res.status(400).json({ error: "Customer name is too long." });
      if (cPhone.length > 25) return res.status(400).json({ error: "Phone number is too long." });
      if (cAddress.length > 250) return res.status(400).json({ error: "Shipping address is too long." });
      if (cCity.length > 50) return res.status(400).json({ error: "City is too long." });

      // Read orders to prevent generating duplicate order numbers
      let ordersList: any[] = [];
      const db = await getDb();

      if (db) {
        ordersList = await db.collection("orders").find({}).toArray();
      } else {
        ordersList = readCollection(ORDERS_FILE);
      }

      // Cryptographically secure random integer between 10000 and 99999
      let orderId = `LRS-${crypto.randomInt(10000, 99999)}`;
      while (ordersList.some((o) => o.id === orderId)) {
        orderId = `LRS-${crypto.randomInt(10000, 99999)}`;
      }

      const cleanOrder = {
        id: orderId,
        customerName: cName,
        phone: cPhone,
        address: cAddress,
        city: cCity,
        shippingMethod: String(shippingMethod || "Standard").trim().substring(0, 30),
        paymentMethod: String(paymentMethod || "Cash on Delivery").trim().substring(0, 30),
        items: items.map((it: any) => ({
          productName: String(it.productName || "Fabric Product").trim().substring(0, 100),
          swatchName: String(it.swatchName || "Color Sample").trim().substring(0, 50),
          length: Number(it.length) || 4.0,
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 1200
        })),
        subtotal: parseFloat(subtotal) || 0,
        shippingCost: parseFloat(shippingCost) || 190,
        total: parseFloat(total) || 0,
        status: "Order Placed",
        // Secure tracking ID
        trackingNumber: `TRS${crypto.randomInt(1000000, 9999999)}PK`,
        courierService: shippingMethod === "Express" ? "TCS Express" : "Leopards Courier",
        createdAt: new Date().toISOString()
      };

      if (db) {
        await db.collection("orders").insertOne(cleanOrder);
      } else {
        ordersList.unshift(cleanOrder);
        writeCollection(ORDERS_FILE, ordersList);
      }

      console.log(`[Loom Dispatch LOG] Fabric billing order registered successfully: ID=${orderId} Client=Masked`);
      res.status(201).json(cleanOrder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to route unstitched order details." });
    }
  });

  app.put("/api/orders/:id", authCheck, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, trackingNumber, courierService } = req.body;
      const cleanId = String(id).toUpperCase().trim();

      const updateFields: any = {};
      if (status) updateFields.status = String(status).trim().substring(0, 50);
      if (trackingNumber !== undefined) updateFields.trackingNumber = String(trackingNumber).trim().substring(0, 30);
      if (courierService !== undefined) updateFields.courierService = String(courierService).trim().substring(0, 50);

      const db = await getDb();
      let updatedOrder: any = null;

      if (db) {
        const result = await db.collection("orders").findOneAndUpdate(
          { id: cleanId },
          { $set: updateFields },
          { returnDocument: "after" }
        );
        if (!result) {
          return res.status(404).json({ error: "Booking ID not present on Atlas." });
        }
        updatedOrder = result;
      } else {
        const list = readCollection(ORDERS_FILE);
        const idx = list.findIndex((o) => o.id.toUpperCase() === cleanId);
        if (idx === -1) {
          return res.status(404).json({ error: "Active shipping records do not include this item." });
        }
        list[idx] = { ...list[idx], ...updateFields };
        writeCollection(ORDERS_FILE, list);
        updatedOrder = list[idx];
      }

      // Log secure audit trail
      logAuditAction("ORDER_UPDATE", { id: cleanId, updateFields });

      res.json(updatedOrder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to amend logistic parameters." });
    }
  });

  // ═══════════════════════════════════════
  // 3. CONTACT, CONSULTATION & WHOLESALE APIs
  // ═══════════════════════════════════════

  app.post("/api/inquiries", publicWriteLimiter, async (req, res) => {
    try {
      const { name, phone, quantity, message, productId, productName } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ error: "Client name and telephone properties required." });
      }

      const cName = String(name).trim();
      const cPhone = String(phone).trim();
      const cMsg = String(message || "No specific details").trim();
      if (cName.length > 80) return res.status(400).json({ error: "Name is too long." });
      if (cPhone.length > 25) return res.status(400).json({ error: "Phone is too long." });
      if (cMsg.length > 500) return res.status(400).json({ error: "Message is too long." });

      const newInquiry = {
        id: `INQ-${crypto.randomInt(100000, 999999)}`,
        name: cName,
        phone: cPhone,
        quantity: parseFloat(quantity) || 4.0,
        message: cMsg,
        productId: String(productId || "").trim().substring(0, 50),
        productName: String(productName || "Direct Enquiries").trim().substring(0, 100),
        createdAt: new Date().toISOString()
      };

      const db = await getDb();
      if (db) {
        await db.collection("inquiries").insertOne(newInquiry);
      } else {
        const list = readCollection(INQUIRIES_FILE);
        list.unshift(newInquiry);
        writeCollection(INQUIRIES_FILE, list);
      }

      res.status(200).json({
        success: true,
        message: "Fabric specifications ledger logged securely.",
        referenceId: newInquiry.id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to log catalog inquiries page." });
    }
  });

  app.get("/api/inquiries", authCheck, async (req, res) => {
    try {
      const db = await getDb();
      if (db) {
        const list = await db.collection("inquiries").find({}).sort({ createdAt: -1 }).limit(200).toArray();
        res.json(list);
      } else {
        const list = readCollection(INQUIRIES_FILE);
        res.json(list.slice(0, 200));
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to pull active inquiries registry." });
    }
  });

  app.post("/api/bespoke", publicWriteLimiter, async (req, res) => {
    try {
      const { customerName, phone, suitLengthPref, fabricTypesOfInterest, customRequirementMsg } = req.body;

      if (!customerName || !phone) {
        return res.status(400).json({ error: "Client contact name and mobile sequence required." });
      }

      const cName = String(customerName).trim();
      const cPhone = String(phone).trim();
      const cMsg = String(customRequirementMsg || "").trim();
      if (cName.length > 80) return res.status(400).json({ error: "Name is too long." });
      if (cPhone.length > 25) return res.status(400).json({ error: "Phone is too long." });
      if (cMsg.length > 500) return res.status(400).json({ error: "Message is too long." });

      const entry = {
        id: `BC-${crypto.randomInt(1000, 9999)}`,
        customerName: cName,
        phone: cPhone,
        suitLengthPref: String(suitLengthPref || "Unstitched Suit Length (4.0m)").trim().substring(0, 100),
        fabricTypesOfInterest: (fabricTypesOfInterest || []).map((f: any) => String(f).substring(0, 50)),
        customRequirementMsg: cMsg,
        createdAt: new Date().toISOString()
      };

      const db = await getDb();
      if (db) {
        await db.collection("bespoke").insertOne(entry);
      } else {
        const list = readCollection(BESPOKE_FILE);
        list.unshift(entry);
        writeCollection(BESPOKE_FILE, list);
      }

      res.status(200).json({ success: true, referenceId: entry.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to lodge luxury consulting leads." });
    }
  });

  app.get("/api/bespoke", authCheck, async (req, res) => {
    try {
      const db = await getDb();
      if (db) {
        const list = await db.collection("bespoke").find({}).sort({ createdAt: -1 }).limit(200).toArray();
        res.json(list);
      } else {
        const list = readCollection(BESPOKE_FILE);
        res.json(list.slice(0, 200));
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch consultation records." });
    }
  });

  // Serve static uploaded assets
  app.use("/uploads", express.static(path.join(process.cwd(), "data", "uploads")));

  // Configure Cloudinary explicitly if specified in environment
  if (process.env.CLOUDINARY_URL) {
    console.log("[Cloudinary] Initialized naturally via CLOUDINARY_URL.");
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
      api_key: process.env.CLOUDINARY_API_KEY || "",
      api_secret: process.env.CLOUDINARY_API_SECRET || ""
    });
  }

  // ═══════════════════════════════════════
  // 3.5. CUSTOM RATINGS & PRODUCT REVIEWS APIs
  // ═══════════════════════════════════════

  // Upload an image backer for a customer review
  app.post("/api/reviews/upload", publicWriteLimiter, async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Empty image payload structure received." });
      }

      // Check if Cloudinary configurations are active
      if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const uploadRes = await cloudinary.uploader.upload(image, {
            folder: "larson_reviews"
          });
          return res.json({ url: uploadRes.secure_url });
        } catch (cloudinaryError) {
          console.warn("[Cloudinary] Upload failed, falling back to local files system:", cloudinaryError);
        }
      }

      // Fallback local filesystem image decoder
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Unknown image payload structure. Expect data URI base64." });
      }

      const ext = matches[1].split("/")[1] || "jpg";
      const buffer = Buffer.from(matches[2], "base64");
      const filename = `review_img_${Date.now()}_${crypto.randomInt(100, 999)}.${ext}`;
      const localFilePath = path.join(process.cwd(), "data", "uploads", filename);

      fs.writeFileSync(localFilePath, buffer);
      return res.json({ url: `/uploads/${filename}` });
    } catch (err) {
      console.error("[Upload Ledger Error]:", err);
      res.status(500).json({ error: "Failed to compile uploaded image to data logs." });
    }
  });

  // Get approved reviews for a given product
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const cleanProdId = String(productId).trim().toLowerCase();

      const db = await getDb();
      if (db) {
        const approved = await db.collection("reviews")
          .find({ productId: cleanProdId, status: "approved" })
          .sort({ createdAt: -1 })
          .toArray();
        return res.json(approved);
      } else {
        const list = readCollection(REVIEWS_FILE);
        const filtered = list.filter(r => r.productId === cleanProdId && r.status === "approved");
        return res.json(filtered);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to dispatch approved fabric reviews." });
    }
  });

  // Post a brand review (By default reviews are "pending" until admin moderates them)
  app.post("/api/reviews", publicWriteLimiter, async (req, res) => {
    try {
      const { productId, productName, rating, content, email, displayName, isAnonymous, imageUrl } = req.body;

      if (!productId || !productName || !rating || !content || !email || !displayName) {
        return res.status(400).json({ error: "Missing required properties to publish reviews." });
      }

      const score = Number(rating);
      if (isNaN(score) || score < 1 || score > 5) {
        return res.status(400).json({ error: "Ratings must reside between 1 and 5 stars." });
      }

      const cEmail = String(email).trim();
      const cName = String(displayName).trim();
      const cContent = String(content).trim();

      if (cEmail.length > 100 || cName.length > 80 || cContent.length > 1000) {
        return res.status(400).json({ error: "Inputs scale is higher than security parameters permit." });
      }

      const newReview = {
        _id: `rev-${Date.now()}-${crypto.randomInt(100, 999)}`,
        productId: String(productId).trim().toLowerCase(),
        productName: String(productName).trim(),
        rating: score,
        content: cContent,
        email: cEmail,
        displayName: cName,
        isAnonymous: !!isAnonymous,
        imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      const db = await getDb();
      if (db) {
        await (db.collection("reviews") as any).insertOne(newReview);
      } else {
        const list = readCollection(REVIEWS_FILE);
        list.unshift(newReview);
        writeCollection(REVIEWS_FILE, list);
      }

      logAuditAction("NEW_REVIEW_SUBMITTED", { id: newReview._id, productId: newReview.productId });
      res.status(201).json({ success: true, message: "Review lodged for moderation.", data: newReview });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to lodge product review." });
    }
  });

  // Admin: Get all reviews
  app.get("/api/admin/reviews", authCheck, async (req, res) => {
    try {
      const db = await getDb();
      if (db) {
        const list = await db.collection("reviews").find({}).sort({ createdAt: -1 }).toArray();
        res.json(list);
      } else {
        const list = readCollection(REVIEWS_FILE);
        res.json(list);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to dispatch review moderation registries." });
    }
  });

  // Admin: Approve or Reject a review
  app.put("/api/admin/reviews/:id", authCheck, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const cleanId = String(id).trim();

      if (!status || !["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ error: "A valid status property (approved/rejected/pending) is required." });
      }

      const db = await getDb();
      let updatedReview: any = null;

      if (db) {
        const result = await (db.collection("reviews") as any).findOneAndUpdate(
          { _id: cleanId },
          { $set: { status } },
          { returnDocument: "after" }
        );
        if (!result) {
          return res.status(404).json({ error: "Review ID not present on Atlas cluster." });
        }
        updatedReview = result;
      } else {
        const list = readCollection(REVIEWS_FILE);
        const idx = list.findIndex(r => r._id === cleanId);
        if (idx === -1) {
          return res.status(404).json({ error: "Review ID not recognized in local ledger." });
        }
        list[idx].status = status;
        writeCollection(REVIEWS_FILE, list);
        updatedReview = list[idx];
      }

      logAuditAction("REVIEW_MODERATION", { id: cleanId, status });
      res.json(updatedReview);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to moderate target review status." });
    }
  });




  // 4. VITE DEVSERVER / PRODUCTION BINDINGS
  // ═══════════════════════════════════════

  if (process.env.NODE_ENV !== "production") {
    console.log("Spinning up Vite connection layer...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving pre-built assets from distribution directory...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Larson Fabrics server successfully active on port: ${PORT}`);
  });

  // ═══════════════════════════════════════
  // Graceful Shutdown Mechanics
  // ═══════════════════════════════════════
  const shutdown = async () => {
    console.log("[Shutdown] Closing server connection gracefully...");
    server.close(async () => {
      if (mongoClientInstance) {
        try {
          await mongoClientInstance.close();
          console.log("[Shutdown] MongoDB connection safely closed.");
        } catch (err) {
          console.error("[Shutdown Error] Failed to release MongoDB resources:", err);
        }
      }
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();
