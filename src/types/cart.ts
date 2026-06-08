import { Product, Swatch } from "@/src/types";

export interface CartItem {
  id: string; // combination of productId_swatchName_meters
  product: Product;
  selectedSwatch: Swatch;
  selectedLength: number; // in meters, e.g., 4.0, 4.5, 2.5
  quantity: number;
}

export interface Order {
  id: string; // e.g. LRS-10294
  customerName: string;
  phone: string;
  address: string;
  city: string;
  shippingMethod: string;
  paymentMethod: string;
  items: {
    productName: string;
    swatchName: string;
    length: number;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: "Order Placed" | "Fabric Cutting" | "Quality Check" | "Signature Packaging" | "Dispatched" | "Delivered";
  trackingNumber?: string;
  courierService?: string;
  createdAt: string;
}
