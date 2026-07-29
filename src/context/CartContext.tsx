/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem } from "../types";

interface WhatsAppNotification {
  show: boolean;
  message: string;
  waUrl: string;
  orderSummary?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  lastAddedProduct: Product | null;
  whatsappNotification: WhatsAppNotification | null;
  setWhatsappNotification: (notif: WhatsAppNotification | null) => void;
  buyNowProduct: (product: Product) => Promise<void>;
  checkoutCartWhatsApp: () => Promise<void>;
  confirmWhatsAppRedirect: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "bright_n_bliss_cart";
const WHATSAPP_NUMBER = "919864074004";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const [whatsappNotification, setWhatsappNotification] = useState<WhatsAppNotification | null>(null);

  // Sync to localStorage whenever cart updates
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity }];
      }
    });

    // Trigger toast notification feedback
    setLastAddedProduct(product);
    setTimeout(() => {
      setLastAddedProduct(null);
    }, 3000);
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce((total, item) => {
    const numericPrice = parseFloat(String(item.product.price).replace(/[^0-9.]/g, "")) || 0;
    return total + numericPrice * item.quantity;
  }, 0);

  // WhatsApp helper
  const handleWhatsAppOrder = async (items: { name: string; price: string; quantity: number }[], totalFormatted: string) => {
    let orderText = `🌸 *New Order Request - Bright 'n Bliss* 🌸\n\n*Order Details:*\n`;
    items.forEach((item) => {
      orderText += `• ${item.quantity}x ${item.name} (${item.price})\n`;
    });
    orderText += `\n*Total Amount:* ${totalFormatted}\n`;
    orderText += `--------------------------------\n`;
    orderText += `I would like to place this order! Please confirm availability and delivery details.`;

    // Copy to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(orderText);
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }

    const encodedText = encodeURIComponent(orderText);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    const summaryStr = items.map(i => `${i.quantity}x ${i.name}`).join(", ");

    // Show Notification Dialog Alert
    setWhatsappNotification({
      show: true,
      message: "Order details copied to clipboard!",
      waUrl,
      orderSummary: summaryStr,
    });
  };

  const confirmWhatsAppRedirect = () => {
    if (whatsappNotification && whatsappNotification.waUrl) {
      window.open(whatsappNotification.waUrl, "_blank");
    }
    setWhatsappNotification(null);
  };

  // Buy single product directly
  const buyNowProduct = async (product: Product) => {
    const items = [{ name: product.name, price: String(product.price), quantity: 1 }];
    await handleWhatsAppOrder(items, String(product.price));
  };

  // Checkout full cart via WhatsApp
  const checkoutCartWhatsApp = async () => {
    if (cart.length === 0) return;
    const items = cart.map((item) => ({
      name: item.product.name,
      price: String(item.product.price),
      quantity: item.quantity,
    }));
    const totalFormatted = `₹${cartSubtotal.toLocaleString("en-IN")}`;
    await handleWhatsAppOrder(items, totalFormatted);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        lastAddedProduct,
        whatsappNotification,
        setWhatsappNotification,
        buyNowProduct,
        checkoutCartWhatsApp,
        confirmWhatsAppRedirect,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
