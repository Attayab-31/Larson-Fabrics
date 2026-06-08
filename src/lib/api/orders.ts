import { Order } from "@/src/types/cart";

export async function createOrderOnServer(orderData: {
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
}): Promise<Order> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error("Unable to save order on Larson's central server. Please check your connectivity.");
  }

  return response.json();
}
