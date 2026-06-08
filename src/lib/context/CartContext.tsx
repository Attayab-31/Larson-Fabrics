import React, { createContext, useState, useEffect } from "react";
import { Product, Swatch } from "@/src/types";
import { CartItem, Order } from "@/src/types/cart";
import { BRAND } from "@/src/lib/constants";
import { createOrderOnServer } from "@/src/lib/api/orders";

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, swatch: Swatch, length: number, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateLength: (id: string, length: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  placeOrder: (customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    shippingMethod: string;
    paymentMethod: string;
  }, method: "website" | "whatsapp") => Promise<Order>;
  orders: Order[];
  getLatestOrder: () => Order | null;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("larson_cart_items");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      const storedOrders = localStorage.getItem("larson_orders");
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (e) {
      console.error("Failed to parse cart/orders from localStorage:", e);
    }
  }, []);

  // Save cart to localStorage on changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("larson_cart_items", JSON.stringify(items));
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem("larson_orders", JSON.stringify(newOrders));
  };

  const addToCart = (product: Product, swatch: Swatch, length: number, quantity: number) => {
    const itemId = `${product._id}_${swatch.name}_${length}`;
    const existingIndex = cartItems.findIndex((item) => item.id === itemId);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...cartItems, {
        id: itemId,
        product,
        selectedSwatch: swatch,
        selectedLength: length,
        quantity
      }]);
    }
    // Automatically open cart drawer to reward user action
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    saveCart(cartItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(updated);
  };

  const updateLength = (id: string, length: number) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        // Re-generate ID if length changes
        const newId = `${item.product._id}_${item.selectedSwatch.name}_${length}`;
        return { ...item, id: newId, selectedLength: length };
      }
      return item;
    });
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Price works out to: meters * price-per-meter * quantity
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const pricePerMeter = item.product.priceRange.min;
    return acc + (item.selectedLength * pricePerMeter * item.quantity);
  }, 0);

  const placeOrder = async (customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    shippingMethod: string;
    paymentMethod: string;
  }, method: "website" | "whatsapp"): Promise<Order> => {
    const shippingCost = customer.shippingMethod === "Express" ? 350 : 190;
    
    const itemsList = cartItems.map((item) => {
      const itemPrice = item.selectedLength * item.product.priceRange.min * item.quantity;
      return {
        productName: item.product.name,
        swatchName: item.selectedSwatch.name,
        length: item.selectedLength,
        quantity: item.quantity,
        price: itemPrice
      };
    });

    const sub = cartSubtotal;
    const tot = sub + shippingCost;

    const savedOrder = await createOrderOnServer({
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      shippingMethod: customer.shippingMethod,
      paymentMethod: customer.paymentMethod,
      items: itemsList,
      subtotal: sub,
      shippingCost,
      total: tot
    });

    const updatedOrders = [savedOrder, ...orders];
    saveOrders(updatedOrders);

    if (method === "whatsapp") {
      // Create a beautifully structured WhatsApp message text
      let text = `*NEW UNSTITCHED ORDER [${savedOrder.id}]*\n\n`;
      text += `*Customer:* ${customer.name}\n`;
      text += `*Phone:* ${customer.phone}\n`;
      text += `*Shipping Address:* ${customer.address}, ${customer.city}\n`;
      text += `*Payment:* ${customer.paymentMethod} (COD)\n\n`;
      text += `*Items Ordered:*\n`;
      
      cartItems.forEach((item, idx) => {
        text += `${idx + 1}. *${item.product.name}*\n`;
        text += `   - Swatch: ${item.selectedSwatch.name}\n`;
        text += `   - Length: ${item.selectedLength} Meters\n`;
        text += `   - Quantity: ${item.quantity} Pack(s)\n`;
        text += `   - Price: Rs. ${(item.selectedLength * item.product.priceRange.min * item.quantity).toLocaleString()}\n\n`;
      });

      text += `*Subtotal:* Rs. ${sub.toLocaleString()}\n`;
      text += `*Shipping:* Rs. ${shippingCost.toLocaleString()}\n`;
      text += `*Grand Total:* Rs. ${tot.toLocaleString()}\n\n`;
      text += `Please verify this unstitched fabric order layout from Azam Market. Thank you!`;

      // Open in broad WhatsApp redirect
      const whatsappUrl = `${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank");
    }

    clearCart();
    return savedOrder;
  };

  const getLatestOrder = () => {
    return orders.length > 0 ? orders[0] : null;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateLength,
        clearCart,
        cartCount,
        cartSubtotal,
        cartOpen,
        setCartOpen,
        placeOrder,
        orders,
        getLatestOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
